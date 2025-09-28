import type { Card, CardStyle, Frame } from '@mirohq/websdk-types'
import { LRUCache } from 'lru-cache'

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
  private static readonly ID_REGEX = /ID:\s*(\S+)/
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
  private readonly cardsCache = new LRUCache<string, Card[]>({ max: 1 })
  /** Cached map from card identifier to card widget. */
  private readonly cardMapCache = new LRUCache<string, Map<string, Card>>({ max: 1 })
  /** Cached board tags when processing updates. */
  private readonly tagsCache = new LRUCache<string, TagLike[]>({ max: 1 })
  private readonly tagClient: TagClient

  constructor(builder: BoardBuilder = new BoardBuilder(), tagClient: TagClient = new TagClient()) {
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
      throw new TypeError('Invalid cards')
    }
    this.lastCreated = []
    // Reset per-run caches to ensure fresh board state
    this.cardsCache.clear()
    this.cardMapCache.clear()
    this.tagsCache.clear()

    const boardTags = await this.getBoardTags()
    const tagMap = new Map(boardTags.map((t) => [t.title, t]))

    const map = await this.loadCardMap()

    const { toCreate, toUpdate } = this.partitionCards(cards, map)

    const updated = await Promise.all(
      toUpdate.map((item) => this.updateCardWidget(item.card, item.definition, tagMap)),
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
    if (created.length > 0 || updated.length > 0) {
      await this.builder.zoomTo(target)
    }
  }

  // undoLast inherited from UndoableProcessor

  /**
   * Retrieve all tags on the board. Uses nullish assignment to cache
   * results so multiple calls during a run hit the board only once.
   */
  private async getBoardTags(): Promise<TagLike[]> {
    const key = 'tags'
    const cached = this.tagsCache.get(key)
    if (cached) {
      return cached
    }
    const tags = await this.tagClient.getTags()
    this.tagsCache.set(key, [...tags])
    return tags
  }

  /**
   * Retrieve all cards on the board. Like {@link getBoardTags} this
   * caches the promise result so subsequent calls avoid extra lookups.
   */
  private async getBoardCards(): Promise<Card[]> {
    const key = 'cards'
    const cached = this.cardsCache.get(key)
    if (cached) {
      return cached
    }
    const cards = (await miro.board.get({ type: 'card' })) as Card[]
    this.cardsCache.set(key, [...cards])
    return cards
  }

  private static isCardWidget(widget: unknown): widget is Card {
    return (widget as { type?: unknown }).type === 'card'
  }

  /** Build a map from identifier to card for quick lookup. */
  private async loadCardMap(): Promise<Map<string, Card>> {
    const key = 'cardMap'
    let map = this.cardMapCache.get(key)
    if (!map) {
      const cards = await this.getBoardCards()
      map = new Map<string, Card>()
      for (const c of cards) {
        const id = this.extractId(c.description)
        if (id) {
          map.set(id, c)
        }
      }
      this.cardMapCache.set(key, map)
    }
    return map
  }

  /**
   * Separate card definitions into create and update lists
   * based on board state.
   */
  private partitionCards(
    cards: CardData[],
    map: Map<string, Card>,
  ): { toCreate: CardData[]; toUpdate: Array<{ card: Card; definition: CardData }> } {
    const toCreate: CardData[] = []
    const toUpdate: Array<{ card: Card; definition: CardData }> = []

    for (const definition of cards) {
      if (definition.id) {
        const existing = map.get(definition.id)
        if (existing) {
          toUpdate.push({ card: existing, definition })
          continue
        }
      }
      toCreate.push(definition)
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
          const cached = this.tagsCache.get('tags') ?? []
          this.tagsCache.set('tags', [...cached, tag])
        }
      }
      if (tag?.id) {
        ids.push(tag.id)
      }
    }
    return ids
  }

  private async createCardWidget(
    definition: CardData,
    x: number,
    y: number,
    tagMap: Map<string, TagLike>,
  ): Promise<Card> {
    const tagIds = await this.ensureTagIds(definition.tags, tagMap)
    const createOptions: Record<string, unknown> = {
      title: definition.title,
      description: this.encodeDescription(definition.description, definition.id),
      tagIds,
      style: definition.style as CardStyle,
      taskStatus: definition.taskStatus,
      x,
      y,
    }
    if (definition.fields) {
      createOptions.fields = definition.fields
    }
    const card = await miro.board.createCard(createOptions)
    if (definition.id) {
      const mapKey = 'cardMap'
      const existing = this.cardMapCache.get(mapKey)
      if (existing) {
        existing.set(definition.id, card)
      } else {
        this.cardMapCache.set(mapKey, new Map([[definition.id, card]]))
      }
    }
    const cardsKey = 'cards'
    const cached = this.cardsCache.get(cardsKey)
    if (cached) {
      this.cardsCache.set(cardsKey, [...cached, card])
    } else {
      this.cardsCache.set(cardsKey, [card])
    }
    return card
  }

  /** Update an existing card with data from the definition. */
  private async updateCardWidget(
    card: Card,
    definition: CardData,
    tagMap: Map<string, TagLike>,
  ): Promise<Card> {
    const tagIds = await this.ensureTagIds(definition.tags, tagMap)
    card.title = definition.title
    card.description = this.encodeDescription(definition.description, definition.id)
    card.tagIds = tagIds
    if (definition.fields) {
      card.fields = definition.fields
    }
    card.style = definition.style as CardStyle
    if (definition.taskStatus) {
      card.taskStatus = definition.taskStatus
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
    let maxX = 0
    let maxY = 0
    for (const point of grid) {
      if (point.x > maxX) maxX = point.x
      if (point.y > maxY) maxY = point.y
    }
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
      defs.map((definition, index) =>
        this.createCardWidget(
          definition,
          layout.startX +
            (index % layout.columns) * (CardProcessor.CARD_WIDTH + CardProcessor.CARD_GAP),
          layout.startY +
            Math.floor(index / layout.columns) *
              (CardProcessor.CARD_HEIGHT + CardProcessor.CARD_GAP),
          tagMap,
        ),
      ),
    )
    for (const card of cards) {
      frame?.add(card)
    }
    return cards
  }
}
