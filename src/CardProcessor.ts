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

  private async getBoardTags(): Promise<Tag[]> {
    return (await miro.board.get({ type: 'tag' })) as Tag[];
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
      description: def.description,
      tagIds,
      fields: def.fields,
      style: def.style as CardStyle,
      x,
      y,
    })) as Card;
    return card;
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

    const cardWidth = 300;
    const cardHeight = 200;
    const totalWidth = cardWidth * cards.length + 100;
    const totalHeight = cardHeight + 100;

    const spot = await this.builder.findSpace(totalWidth, totalHeight);

    const useFrame = options.createFrame !== false;
    let frame: Frame | undefined;
    if (useFrame) {
      frame = await this.builder.createFrame(
        totalWidth,
        totalHeight,
        spot.x,
        spot.y,
        options.frameTitle,
      );
    } else {
      this.builder.setFrame(undefined);
    }

    const boardTags = await this.getBoardTags();

    const startX = spot.x - totalWidth / 2 + 50 + cardWidth / 2;
    const y = spot.y - totalHeight / 2 + 50 + cardHeight / 2;

    const created = await Promise.all(
      cards.map((def, i) =>
        this.createCardWidget(def, startX + i * cardWidth, y, boardTags),
      ),
    );
    created.forEach(c => frame?.add(c));

    await this.builder.syncAll(created);

    if (frame) {
      await this.builder.zoomTo(frame);
    } else {
      await this.builder.zoomTo(created as any);
    }
  }
}
