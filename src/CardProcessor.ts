import { BoardBuilder } from './BoardBuilder';
import { cardLoader, CardData } from './cards';
import type { Frame, Tag, Card, CardStyle } from '@mirohq/websdk-types';

export interface CardProcessOptions {
  createFrame?: boolean;
  frameTitle?: string;
  /** Maximum number of cards per row when creating new cards. */
  columns?: number;
}

/**
 * Helper that places cards from a data set onto the board.
 */
export class CardProcessor {
  private lastCreated: Array<Card | Frame> = [];
  constructor(private builder: BoardBuilder = new BoardBuilder()) {}

  /** Metadata key used to store card identifiers. */
  private static readonly META_KEY = 'app.miro.cards';

  /** Cached board cards when processing updates. */
  private cardsCache: Card[] | undefined;

  /** Cached map from card identifier to card widget. */
  private cardMap: Map<string, Card> | undefined;

  /** Default width used for card widgets. */
  private static readonly CARD_WIDTH = 300;

  /** Default height used for card widgets. */
  private static readonly CARD_HEIGHT = 200;

  /** Spacing margin applied around cards and frames. */
  private static readonly CARD_MARGIN = 50;

  private async getBoardTags(): Promise<Tag[]> {
    return (await miro.board.get({ type: 'tag' })) as Tag[];
  }

  /** Retrieve all cards on the board, cached for the current run. */
  private async getBoardCards(): Promise<Card[]> {
    if (!this.cardsCache) {
      this.cardsCache = (await miro.board.get({ type: 'card' })) as Card[];
    }
    return this.cardsCache;
  }

  /** Build a map from identifier to card for quick lookup. */
  private async loadCardMap(): Promise<Map<string, Card>> {
    if (!this.cardMap) {
      const cards = await this.getBoardCards();
      const metas = await Promise.all(
        cards.map(c => (c as any).getMetadata(CardProcessor.META_KEY)),
      );
      this.cardMap = new Map();
      for (let i = 0; i < cards.length; i++) {
        const id = metas[i]?.id as string | undefined;
        if (id) {
          this.cardMap.set(id, cards[i]);
        }
      }
    }
    return this.cardMap;
  }

  /**
   * Separate card definitions into create and update lists based on board state.
   */
  private partitionCards(
    cards: CardData[],
    map: Map<string, Card>,
  ): {
    toCreate: CardData[];
    toUpdate: Array<{ card: Card; def: CardData }>;
  } {
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
   * Resolve tag names to IDs, creating any missing tags on the board.
   */
  private async ensureTagIds(
    names: string[] | undefined,
    tagMap: Map<string, Tag>,
  ): Promise<string[]> {
    const ids: string[] = [];
    for (const name of names ?? []) {
      let tag = tagMap.get(name);
      if (!tag) {
        tag = (await miro.board.createTag({ title: name })) as Tag;
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
    const card = (await miro.board.createCard({
      title: def.title,
      description: def.description ?? '',
      tagIds,
      fields: def.fields,
      style: def.style as CardStyle,
      taskStatus: def.taskStatus,
      x,
      y,
    })) as Card;
    if (def.id) {
      await (card as any).setMetadata(CardProcessor.META_KEY, { id: def.id });
    }
    this.lastCreated.push(card);
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
    (card as any).tagIds = tagIds;
    (card as any).fields = def.fields;
    (card as any).style = def.style as CardStyle;
    if (def.taskStatus) (card as any).taskStatus = def.taskStatus;
    if (def.id) {
      await (card as any).setMetadata(CardProcessor.META_KEY, { id: def.id });
    }
    return card;
  }

  /**
   * Compute layout information and placement coordinates for a set of cards.
   */
  private async calculateLayoutArea(
    count: number,
    columns = count,
  ): Promise<{
    spot: { x: number; y: number };
    startX: number;
    startY: number;
    columns: number;
    totalWidth: number;
    totalHeight: number;
  }> {
    const cols = Math.max(1, Math.min(columns, count));
    const rows = Math.ceil(count / cols);
    const totalWidth =
      CardProcessor.CARD_WIDTH * cols + CardProcessor.CARD_MARGIN * 2;
    const totalHeight =
      CardProcessor.CARD_HEIGHT * rows + CardProcessor.CARD_MARGIN * 2;
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

  /** Create a frame when requested and register it with the board builder. */
  private async maybeCreateFrame(
    useFrame: boolean,
    dims: { width: number; height: number; spot: { x: number; y: number } },
    title?: string,
  ): Promise<Frame | undefined> {
    if (!useFrame) {
      this.builder.setFrame(undefined);
      return undefined;
    }
    const { width, height, spot } = dims;
    const frame = await this.builder.createFrame(
      width,
      height,
      spot.x,
      spot.y,
      title,
    );
    this.lastCreated.push(frame);
    return frame;
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

    const boardTags = await this.getBoardTags();
    const tagMap = new Map(boardTags.map(t => [t.title, t]));

    const map = await this.loadCardMap();

    const { toCreate, toUpdate } = this.partitionCards(cards, map);

    const updated = await Promise.all(
      toUpdate.map(item => this.updateCardWidget(item.card, item.def, tagMap)),
    );

    let created: Card[] = [];
    let frame: Frame | undefined;
    if (toCreate.length > 0) {
      const { spot, startX, startY, columns, totalWidth, totalHeight } =
        await this.calculateLayoutArea(toCreate.length, options.columns);

      frame = await this.maybeCreateFrame(
        options.createFrame !== false,
        { width: totalWidth, height: totalHeight, spot },
        options.frameTitle,
      );

      created = await Promise.all(
        toCreate.map((def, i) =>
          this.createCardWidget(
            def,
            startX + (i % columns) * CardProcessor.CARD_WIDTH,
            startY + Math.floor(i / columns) * CardProcessor.CARD_HEIGHT,
            tagMap,
          ),
        ),
      );
      created.forEach(c => frame?.add(c));
    } else {
      this.builder.setFrame(undefined);
    }

    await this.builder.syncAll([...created, ...updated]);

    this.lastCreated.push(...created);
    if (frame) this.lastCreated.push(frame);

    const target = frame ?? ([...created, ...updated] as any);
    if (created.length || updated.length) {
      await this.builder.zoomTo(target);
    }
  }

  /** Remove cards created by the last `processCards` call. */
  public async undoLast(): Promise<void> {
    if (this.lastCreated.length) {
      await this.builder.removeItems(this.lastCreated);
      this.lastCreated = [];
    }
  }
}
