import { BoardBuilder } from './BoardBuilder';
import { loadCards, CardData } from './cards';
import type { Frame, Tag, Card, CardStyle } from '@mirohq/websdk-types';

export interface CardProcessOptions {
  createFrame?: boolean;
  frameTitle?: string;
}

/**
 * Helper that places cards from a data set onto the board.
 */
export class CardProcessor {
  constructor(private builder: BoardBuilder = new BoardBuilder()) {}

  /** Metadata key used to store card identifiers. */
  private static readonly META_KEY = 'app.miro.cards';

  /** Cached board cards when processing updates. */
  private cardsCache: Card[] | undefined;

  /** Default width used for card widgets. */
  private static readonly CARD_WIDTH = 300;

  /** Default height used for card widgets. */
  private static readonly CARD_HEIGHT = 200;

  /** Spacing margin applied around cards and frames. */
  private static readonly CARD_MARGIN = 50;

  private async getBoardTags(): Promise<Tag[]> {
    return (await miro.board.get({ type: 'tag' })) as Tag[];
  }

  /**
   * Ensure the board contains tags for all provided names.
   * Unknown tags are created and returned alongside existing tags.
   */
  private async ensureTags(names: string[], tags: Tag[]): Promise<Tag[]> {
    const missing = names.filter(n => !tags.some(t => t.title === n));
    if (missing.length === 0) return tags;
    const created = (await Promise.all(
      missing.map(title => miro.board.createTag({ title })),
    )) as Tag[];
    return tags.concat(created);
  }

  /** Retrieve all cards on the board, cached for the current run. */
  private async getBoardCards(): Promise<Card[]> {
    if (!this.cardsCache) {
      this.cardsCache = (await miro.board.get({ type: 'card' })) as Card[];
    }
    return this.cardsCache;
  }

  /** Find an existing card by identifier if present. */
  private async findCardById(id: string): Promise<Card | undefined> {
    const cards = await this.getBoardCards();
    const metas = await Promise.all(
      cards.map(c => (c as any).getMetadata(CardProcessor.META_KEY)),
    );
    for (let i = 0; i < cards.length; i++) {
      if (metas[i]?.id === id) {
        return cards[i];
      }
    }
    return undefined;
  }

  private tagIds(names: string[] | undefined, tags: Tag[]): string[] {
    return (names ?? [])
      .map(name => tags.find(t => t.title === name)?.id)
      .filter((id): id is string => !!id);
  }

  private async createCardWidget(
    def: CardData,
    x: number,
    y: number,
    tags: Tag[],
  ): Promise<Card> {
    const tagIds = this.tagIds(def.tags, tags);
    const card = (await miro.board.createCard({
      title: def.title,
      description: def.description ?? '',
      tagIds,
      fields: def.fields,
      style: def.style as CardStyle,
      x,
      y,
    })) as Card;
    if (def.id) {
      await (card as any).setMetadata(CardProcessor.META_KEY, { id: def.id });
    }
    return card;
  }

  /** Update an existing card with data from the definition. */
  private async updateCardWidget(
    card: Card,
    def: CardData,
    tags: Tag[],
  ): Promise<Card> {
    const tagIds = this.tagIds(def.tags, tags);
    card.title = def.title;
    card.description = def.description ?? '';
    (card as any).tagIds = tagIds;
    (card as any).fields = def.fields;
    (card as any).style = def.style as CardStyle;
    if (def.id) {
      await (card as any).setMetadata(CardProcessor.META_KEY, { id: def.id });
    }
    return card;
  }

  /**
   * Compute layout information and placement coordinates for a set of cards.
   */
  private async prepareArea(count: number): Promise<{
    spot: { x: number; y: number };
    startX: number;
    y: number;
    totalWidth: number;
    totalHeight: number;
  }> {
    const totalWidth =
      CardProcessor.CARD_WIDTH * count + CardProcessor.CARD_MARGIN * 2;
    const totalHeight =
      CardProcessor.CARD_HEIGHT + CardProcessor.CARD_MARGIN * 2;
    const spot = await this.builder.findSpace(totalWidth, totalHeight);
    const startX =
      spot.x -
      totalWidth / 2 +
      CardProcessor.CARD_MARGIN +
      CardProcessor.CARD_WIDTH / 2;
    const y =
      spot.y -
      totalHeight / 2 +
      CardProcessor.CARD_MARGIN +
      CardProcessor.CARD_HEIGHT / 2;
    return { spot, startX, y, totalWidth, totalHeight };
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
    return this.builder.createFrame(width, height, spot.x, spot.y, title);
  }

  /** Load cards from a file and create them on the board. */
  public async processFile(
    file: File,
    options: CardProcessOptions = {},
  ): Promise<void> {
    const cards = await loadCards(file);
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
    const boardTags = await this.getBoardTags();
    const allNames = Array.from(new Set(cards.flatMap(c => c.tags ?? [])));
    const tags = await this.ensureTags(allNames, boardTags);

    const toCreate: CardData[] = [];
    const toUpdate: Array<{ card: Card; def: CardData }> = [];

    for (const def of cards) {
      if (def.id) {
        const existing = await this.findCardById(def.id);
        if (existing) {
          toUpdate.push({ card: existing, def });
          continue;
        }
      }
      toCreate.push(def);
    }

    const updated = await Promise.all(
      toUpdate.map(item => this.updateCardWidget(item.card, item.def, tags)),
    );

    let created: Card[] = [];
    let frame: Frame | undefined;
    if (toCreate.length > 0) {
      const { spot, startX, y, totalWidth, totalHeight } =
        await this.prepareArea(toCreate.length);

      frame = await this.maybeCreateFrame(
        options.createFrame !== false,
        { width: totalWidth, height: totalHeight, spot },
        options.frameTitle,
      );

      created = await Promise.all(
        toCreate.map((def, i) =>
          this.createCardWidget(
            def,
            startX + i * CardProcessor.CARD_WIDTH,
            y,
            tags,
          ),
        ),
      );
      created.forEach(c => frame?.add(c));
    } else {
      this.builder.setFrame(undefined);
    }

    await this.builder.syncAll([...created, ...updated]);

    const target = frame ?? ([...created, ...updated] as any);
    if (created.length || updated.length) {
      await this.builder.zoomTo(target);
    }
  }
}
