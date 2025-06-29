import { BoardBuilder } from './board-builder';
import { clearActiveFrame, registerFrame } from './frame-utils';
import { UndoableProcessor } from '../core/graph/undoable-processor';
import { CardData, cardLoader } from '../core/utils/cards';
import { calculateGrid } from './grid-layout';
import type { Card, CardStyle, Frame, Tag } from '@mirohq/websdk-types';

export interface CardProcessOptions {
  createFrame?: boolean;
  frameTitle?: string;
  /**
   * Desired number of cards per row. When omitted a square-like grid is
   * computed automatically.
   */
  columns?: number;
}

/**
 * Helper that places cards from a data set onto the board.
 */
export class CardProcessor extends UndoableProcessor<Card | Frame> {
  /** Metadata key used to store card identifiers. */
  private static readonly META_KEY = 'app.miro.cards';
  /** Default width used for card widgets. */
  private static readonly CARD_WIDTH = 320;
  /** Default height used for card widgets. */
  private static readonly CARD_HEIGHT = 88;
  /** Spacing margin applied around cards and frames. */
  private static readonly CARD_MARGIN = 50;
  /** Gap between cards when arranged in a grid. */
  private static readonly CARD_GAP = 24;
  /** Cached board cards when processing updates. */
  private cardsCache: Card[] | undefined;
  /** Cached map from card identifier to card widget. */
  private cardMap: Map<string, Card> | undefined;
  /** Cached board tags when processing updates. */
  private tagsCache: Tag[] | undefined;

  constructor(builder: BoardBuilder = new BoardBuilder()) {
    super(builder);
  }

  /** Load cards from a file and create them on the board. */
  public async processFile(
    file: File,
    options: CardProcessOptions = {},
  ): Promise<void> {
    const cards = await cardLoader.loadCards(file);
    await this.processCards(cards, options);
  }

  /**
   * Create cards on the board according to the provided definitions.
   */
  public async processCards(
    cards: CardData[],
    options: CardProcessOptions = {},
  ): Promise<void> {
    if (!Array.isArray(cards)) {
      throw new Error('Invalid cards');
    }
    this.lastCreated = [];
    // Reset per-run caches to ensure fresh board state
    this.cardsCache = undefined;
    this.cardMap = undefined;
    this.tagsCache = undefined;

    const boardTags = await this.getBoardTags();
    const tagMap = new Map(boardTags.map((t) => [t.title, t]));

    const map = await this.loadCardMap();

    const { toCreate, toUpdate } = this.partitionCards(cards, map);

    const updated = await Promise.all(
      toUpdate.map((item) =>
        this.updateCardWidget(item.card, item.def, tagMap),
      ),
    );

    let created: Card[] = [];
    let frame: Frame | undefined;
    if (toCreate.length > 0) {
      const { spot, startX, startY, columns, totalWidth, totalHeight } =
        await this.calculateLayoutArea(toCreate.length, options.columns);

      if (options.createFrame !== false) {
        frame = await registerFrame(
          this.builder,
          this.lastCreated,
          totalWidth,
          totalHeight,
          spot,
          options.frameTitle,
        );
      } else {
        clearActiveFrame(this.builder);
      }

      created = await Promise.all(
        toCreate.map((def, i) =>
          this.createCardWidget(
            def,
            startX +
              (i % columns) *
                (CardProcessor.CARD_WIDTH + CardProcessor.CARD_GAP),
            startY +
              Math.floor(i / columns) *
                (CardProcessor.CARD_HEIGHT + CardProcessor.CARD_GAP),
            tagMap,
          ),
        ),
      );
      created.forEach((c) => frame?.add(c));
    } else {
      clearActiveFrame(this.builder);
    }

    await this.syncOrUndo([...created, ...updated]);

    this.registerCreated(created);
    if (frame) this.registerCreated(frame);

    const target: Frame | Card[] = frame ?? [...created, ...updated];
    if (created.length || updated.length) {
      await this.builder.zoomTo(target);
    }
  }

  // undoLast inherited from UndoableProcessor

  /**
   * Retrieve all tags on the board. Uses nullish assignment to cache
   * results so multiple calls during a run hit the board only once.
   */
  private async getBoardTags(): Promise<Tag[]> {
    this.tagsCache ??= (await miro.board.get({ type: 'tag' })) as Tag[];
    return this.tagsCache;
  }

  /**
   * Retrieve all cards on the board. Like {@link getBoardTags} this
   * caches the promise result so subsequent calls avoid extra lookups.
   */
  private async getBoardCards(): Promise<Card[]> {
    this.cardsCache ??= (await miro.board.get({ type: 'card' })) as Card[];
    return this.cardsCache;
  }

  /** Build a map from identifier to card for quick lookup. */
  private async loadCardMap(): Promise<Map<string, Card>> {
    if (!this.cardMap) {
      const cards = await this.getBoardCards();
      const metas = await Promise.all(
        cards.map((c) => c.getMetadata(CardProcessor.META_KEY)),
      );
      this.cardMap = new Map();
      for (let i = 0; i < cards.length; i++) {
        const meta = metas[i] as Record<string, unknown> | undefined;
        const id = typeof meta?.id === 'string' ? meta.id : undefined;
        if (id) {
          this.cardMap.set(id, cards[i]);
        }
      }
    }
    return this.cardMap;
  }

  /**
   * Separate card definitions into create and update lists
   * based on board state.
   */
  private partitionCards(
    cards: CardData[],
    map: Map<string, Card>,
  ): { toCreate: CardData[]; toUpdate: Array<{ card: Card; def: CardData }> } {
    const toCreate: CardData[] = [];
    const toUpdate: Array<{ card: Card; def: CardData }> = [];

    for (const def of cards) {
      if (def.id) {
        const existing = map.get(def.id);
        if (existing) {
          toUpdate.push({ card: existing, def });
          continue;
        }
      }
      toCreate.push(def);
    }

    return { toCreate, toUpdate };
  }

  /**
   * Resolve tag names to IDs. Existing tags are reused and duplicate
   * names are collapsed to avoid creating multiple identical tags.
   */
  private async ensureTagIds(
    names: string[] | undefined,
    tagMap: Map<string, Tag>,
  ): Promise<string[]> {
    const ids: string[] = [];
    const uniqueNames = new Set(names ?? []);
    for (const name of uniqueNames) {
      let tag = tagMap.get(name);
      if (!tag) {
        tag = await miro.board.createTag({ title: name });
        tagMap.set(name, tag);
      }
      if (tag.id) {
        ids.push(tag.id);
      }
    }
    return ids;
  }

  private async createCardWidget(
    def: CardData,
    x: number,
    y: number,
    tagMap: Map<string, Tag>,
  ): Promise<Card> {
    const tagIds = await this.ensureTagIds(def.tags, tagMap);
    const createOpts: Record<string, unknown> = {
      title: def.title,
      description: def.description ?? '',
      tagIds,
      style: def.style as CardStyle,
      taskStatus: def.taskStatus,
      x,
      y,
    };
    if (def.fields) createOpts.fields = def.fields;
    const card = await miro.board.createCard(createOpts);
    if (def.id) {
      await card.setMetadata(CardProcessor.META_KEY, { id: def.id });
    }
    this.registerCreated(card);
    return card;
  }

  /** Update an existing card with data from the definition. */
  private async updateCardWidget(
    card: Card,
    def: CardData,
    tagMap: Map<string, Tag>,
  ): Promise<Card> {
    const tagIds = await this.ensureTagIds(def.tags, tagMap);
    card.title = def.title;
    card.description = def.description ?? '';
    card.tagIds = tagIds;
    if (def.fields) card.fields = def.fields;
    card.style = def.style as CardStyle;
    if (def.taskStatus) card.taskStatus = def.taskStatus;
    if (def.id) {
      await card.setMetadata(CardProcessor.META_KEY, { id: def.id });
    }
    return card;
  }

  /**
   * Compute layout information and placement coordinates for a set of cards.
   */
  private async calculateLayoutArea(
    count: number,
    columns?: number,
  ): Promise<{
    spot: { x: number; y: number };
    startX: number;
    startY: number;
    columns: number;
    totalWidth: number;
    totalHeight: number;
  }> {
    const autoCols = columns ?? Math.ceil(Math.sqrt(count));
    const cols = Math.max(1, Math.min(autoCols, count));
    const grid = calculateGrid(
      count,
      { cols, padding: CardProcessor.CARD_GAP },
      CardProcessor.CARD_WIDTH,
      CardProcessor.CARD_HEIGHT,
    );
    const maxX = grid.reduce((m, p) => Math.max(m, p.x), 0);
    const maxY = grid.reduce((m, p) => Math.max(m, p.y), 0);
    const totalWidth =
      maxX + CardProcessor.CARD_WIDTH + CardProcessor.CARD_MARGIN * 2;
    const totalHeight =
      maxY + CardProcessor.CARD_HEIGHT + CardProcessor.CARD_MARGIN * 2;
    const spot = await this.builder.findSpace(totalWidth, totalHeight);
    const startX = this.computeStartCoordinate(
      spot.x,
      totalWidth,
      CardProcessor.CARD_WIDTH,
    );
    const startY = this.computeStartCoordinate(
      spot.y,
      totalHeight,
      CardProcessor.CARD_HEIGHT,
    );
    return { spot, startX, startY, columns: cols, totalWidth, totalHeight };
  }

  /**
   * Derive the starting coordinate for card placement.
   */
  private computeStartCoordinate(
    center: number,
    total: number,
    itemSize: number,
  ): number {
    return center - total / 2 + CardProcessor.CARD_MARGIN + itemSize / 2;
  }
}
