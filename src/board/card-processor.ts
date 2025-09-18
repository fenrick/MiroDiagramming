import type { Card, CardStyle, Frame } from '@mirohq/websdk-types'

import { UndoableProcessor } from '../core/graph/undoable-processor'
import { type CardData, cardLoader } from '../core/utils/cards'
import { TagClient } from '../core/utils/tag-client'

interface TagLike {
  id: string
  title: string
  color?: string
}

import { BoardBuilder } from './board-builder'
import { clearActiveFrame, registerFrame } from './frame-utils'
import { calculateGrid } from './grid-layout'

export interface CardProcessOptions {
  createFrame?: boolean
  frameTitle?: string
  /**
   * Desired number of cards per row. When omitted a square-like grid is
   * computed automatically.
   */
  columns?: number
}

/**
 * Helper that places cards from a data set onto the board.
 */
export class CardProcessor extends UndoableProcessor<Card | Frame> {
  /** Prefix used to embed identifiers in descriptions. */
  private static readonly ID_PREFIX = 'ID:'
  /** Regex capturing an embedded identifier. */
  private static readonly ID_REGEX = /ID:(\s+)/
  /** Regex removing any embedded identifier from text. */
  private static readonly ID_REMOVE_REGEX = /\n?ID:[^\n]*/
  /** Default width used for card widgets. */
  private static readonly CARD_WIDTH = 320
  /** Default height used for card widgets. */
  private static readonly CARD_HEIGHT = 88
  /** Spacing margin applied around cards and frames. */
  private static readonly CARD_MARGIN = 50
  /** Gap between cards when arranged in a grid. */
  private static readonly CARD_GAP = 24
  /** Cached board cards when processing updates. */
  private cardsCache: Card[] | undefined
  /** Cached map from card identifier to card widget. */
  private cardMap: Map<string, Card> | undefined
  /** Cached board tags when processing updates. */
  private tagsCache: TagLike[] | undefined
  private readonly tagClient: TagClient

  constructor(
    builder: BoardBuilder = new BoardBuilder(),
    tagClient: TagClient = new TagClient(),
  ) {
    super(builder)
    this.tagClient = tagClient
  }

  /** Load cards from a file and create them on the board. */
  public async processFile(file: File, options: CardProcessOptions = {}): Promise<void> {
    const cards = await cardLoader.loadCards(file)
    await this.processCards(cards, options)
  }

  /**
   * Create cards on the board according to the provided definitions.
   */
  public async processCards(cards: CardData[], options: CardProcessOptions = {}): Promise<void> {
    if (!Array.isArray(cards)) {
      throw new Error('Invalid cards')
    }
    this.lastCreated = []
    // Reset per-run caches to ensure fresh board state
    this.cardsCache = undefined
    this.cardMap = undefined
    this.tagsCache = undefined

    const boardTags = await this.getBoardTags()
    const tagMap = new Map(boardTags.map((t) => [t.title, t]))

    const map = await this.loadCardMap()

    const { toCreate, toUpdate } = this.partitionCards(cards, map)

    const updated = await Promise.all(
      toUpdate.map((item) => this.updateCardWidget(item.card, item.def, tagMap)),
    )

    let created: Card[] = []
    let frame: Frame | undefined
    if (toCreate.length > 0) {
      const layout = await this.calculateLayoutArea(toCreate.length, options.columns)
      frame = await this.createFrame(options, layout)
      created = await this.createCardWidgets(toCreate, layout, tagMap, frame)
    } else {
      clearActiveFrame(this.builder)
    }

    await this.syncOrUndo([...created, ...updated])

    this.registerCreated(created)
    if (frame) {
      this.registerCreated(frame)
    }

    const target: Frame | Card[] = frame ?? [...created, ...updated]
    if (created.length || updated.length) {
      await this.builder.zoomTo(target)
    }
  }

  // undoLast inherited from UndoableProcessor

  /**
   * Retrieve all tags on the board. Uses nullish assignment to cache
   * results so multiple calls during a run hit the board only once.
   */
  private async getBoardTags(): Promise<TagLike[]> {
    if (!this.tagsCache) {
      this.tagsCache = await this.tagClient.getTags()
    }
    return this.tagsCache
  }

  /**
   * Retrieve all cards on the board. Like {@link getBoardTags} this
   * caches the promise result so subsequent calls avoid extra lookups.
   */
  private async getBoardCards(): Promise<Card[]> {
    // TODO use cached backend lookup instead of board.get to reduce API cost
    this.cardsCache ??= (await miro.board.get({ type: 'card' })) as Card[]
    return this.cardsCache
  }

  /** Build a map from identifier to card for quick lookup. */
  private async loadCardMap(): Promise<Map<string, Card>> {
    if (!this.cardMap) {
      const cards = await this.getBoardCards()
      this.cardMap = new Map()
      for (const c of cards) {
        const id = this.extractId(c.description)
        if (id) {
          this.cardMap.set(id, c)
        }
      }
    }
    return this.cardMap
  }

  /**
   * Separate card definitions into create and update lists
   * based on board state.
   */
  private partitionCards(
    cards: CardData[],
    map: Map<string, Card>,
  ): { toCreate: CardData[]; toUpdate: Array<{ card: Card; def: CardData }> } {
    const toCreate: CardData[] = []
    const toUpdate: Array<{ card: Card; def: CardData }> = []

    for (const def of cards) {
      if (def.id) {
        const existing = map.get(def.id)
        if (existing) {
          toUpdate.push({ card: existing, def })
          continue
        }
      }
      toCreate.push(def)
    }

    return { toCreate, toUpdate }
  }

  /**
   * Resolve tag names to IDs. Existing tags are reused and duplicate
   * names are collapsed to avoid creating multiple identical tags.
   */
  private async ensureTagIds(
    names: string[] | undefined,
    tagMap: Map<string, TagLike>,
  ): Promise<string[]> {
    const ids: string[] = []
    const uniqueNames = new Set(names ?? [])
    for (const name of uniqueNames) {
      let tag = tagMap.get(name)
      if (!tag) {
        tag = await this.tagClient.createTag(name)
        if (tag) {
          tagMap.set(name, tag)
          this.tagsCache?.push(tag)
        }
      }
      if (tag?.id) {
        ids.push(tag.id)
      }
    }
    return ids
  }

  private async createCardWidget(
    def: CardData,
    x: number,
    y: number,
    tagMap: Map<string, TagLike>,
  ): Promise<Card> {
    const tagIds = await this.ensureTagIds(def.tags, tagMap)
    const createOpts: Record<string, unknown> = {
      title: def.title,
      description: this.encodeDescription(def.description, def.id),
      tagIds,
      style: def.style as CardStyle,
      taskStatus: def.taskStatus,
      x,
      y,
    }
    if (def.fields) {
      createOpts.fields = def.fields
    }
    const card = await miro.board.createCard(createOpts)
    this.registerCreated(card)
    return card
  }

  /** Update an existing card with data from the definition. */
  private async updateCardWidget(
    card: Card,
    def: CardData,
    tagMap: Map<string, TagLike>,
  ): Promise<Card> {
    const tagIds = await this.ensureTagIds(def.tags, tagMap)
    card.title = def.title
    card.description = this.encodeDescription(def.description, def.id)
    card.tagIds = tagIds
    if (def.fields) {
      card.fields = def.fields
    }
    card.style = def.style as CardStyle
    if (def.taskStatus) {
      card.taskStatus = def.taskStatus
    }
    return card
  }

  /**
   * Compute layout information and placement coordinates for a set of cards.
   */
  private async calculateLayoutArea(
    count: number,
    columns?: number,
  ): Promise<{
    spot: { x: number; y: number }
    startX: number
    startY: number
    columns: number
    totalWidth: number
    totalHeight: number
  }> {
    const autoCols = columns ?? Math.ceil(Math.sqrt(count))
    const cols = Math.max(1, Math.min(autoCols, count))
    const grid = calculateGrid(
      count,
      { cols, padding: CardProcessor.CARD_GAP },
      CardProcessor.CARD_WIDTH,
      CardProcessor.CARD_HEIGHT,
    )
    const maxX = grid.reduce((m, p) => Math.max(m, p.x), 0)
    const maxY = grid.reduce((m, p) => Math.max(m, p.y), 0)
    const totalWidth = maxX + CardProcessor.CARD_WIDTH + CardProcessor.CARD_MARGIN * 2
    const totalHeight = maxY + CardProcessor.CARD_HEIGHT + CardProcessor.CARD_MARGIN * 2
    const spot = await this.builder.findSpace(totalWidth, totalHeight)
    const startX = this.computeStartCoordinate(spot.x, totalWidth, CardProcessor.CARD_WIDTH)
    const startY = this.computeStartCoordinate(spot.y, totalHeight, CardProcessor.CARD_HEIGHT)
    return { spot, startX, startY, columns: cols, totalWidth, totalHeight }
  }

  /**
   * Derive the starting coordinate for card placement.
   */
  private computeStartCoordinate(center: number, total: number, itemSize: number): number {
    return center - total / 2 + CardProcessor.CARD_MARGIN + itemSize / 2
  }

  /** Extract identifier from the description text. */
  private extractId(desc: string | undefined): string | undefined {
    const match = desc?.match(CardProcessor.ID_REGEX)
    return match ? match[1] : undefined
  }

  /** Embed the identifier inside the description. */
  private encodeDescription(desc: string | undefined, id?: string): string {
    const base = (desc ?? '').replace(CardProcessor.ID_REMOVE_REGEX, '')
    if (!id) {
      return base.trim()
    }
    const trimmed = base.trimEnd()
    return `${trimmed}${trimmed ? '\n' : ''}${CardProcessor.ID_PREFIX}${id}`
  }

  /**
   * Create a frame to contain newly created cards when requested.
   */
  private async createFrame(
    options: CardProcessOptions,
    layout: {
      totalWidth: number
      totalHeight: number
      spot: { x: number; y: number }
    },
  ): Promise<Frame | undefined> {
    if (options.createFrame === false) {
      clearActiveFrame(this.builder)
      return undefined
    }
    return registerFrame(
      this.builder,
      this.lastCreated,
      layout.totalWidth,
      layout.totalHeight,
      layout.spot,
      options.frameTitle,
    )
  }

  /**
   * Create card widgets and optionally add them to a frame.
   */
  private async createCardWidgets(
    defs: CardData[],
    layout: { startX: number; startY: number; columns: number },
    tagMap: Map<string, TagLike>,
    frame?: Frame,
  ): Promise<Card[]> {
    const cards = await Promise.all(
      defs.map((def, i) =>
        this.createCardWidget(
          def,
          layout.startX +
            (i % layout.columns) * (CardProcessor.CARD_WIDTH + CardProcessor.CARD_GAP),
          layout.startY +
            Math.floor(i / layout.columns) * (CardProcessor.CARD_HEIGHT + CardProcessor.CARD_GAP),
          tagMap,
        ),
      ),
    )
    cards.forEach((c) => frame?.add(c))
    return cards
  }
}
