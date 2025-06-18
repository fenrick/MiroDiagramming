import { BoardBuilder } from './BoardBuilder';
import { loadCards, CardData } from './cards';
import { prepareArea } from './card-area';
import type { Frame, Tag, Card, CardStyle } from '@mirohq/websdk-types';

export interface CardProcessOptions {
  createFrame?: boolean;
  frameTitle?: string;
  /** Number of columns for card layout. */
  columns?: number;
  /** Maximum width for a row of cards. */
  maxWidth?: number;
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
    const layout = prepareArea(cards.length, {
      columns: options.columns,
      maxWidth: options.maxWidth,
      cardWidth,
      cardHeight,
    });

    const spot = await this.builder.findSpace(layout.width, layout.height);

    const useFrame = options.createFrame !== false;
    let frame: Frame | undefined;
    if (useFrame) {
      frame = await this.builder.createFrame(
        layout.width,
        layout.height,
        spot.x,
        spot.y,
        options.frameTitle,
      );
    } else {
      this.builder.setFrame(undefined);
    }

    const boardTags = await this.getBoardTags();

    const created = await Promise.all(
      cards.map((def, i) => {
        const pos = layout.positions[i];
        return this.createCardWidget(
          def,
          spot.x + pos.x,
          spot.y + pos.y,
          boardTags,
        );
      }),
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
