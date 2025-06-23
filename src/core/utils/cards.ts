import type {
  CardField,
  CardStyle,
  CardTaskStatus,
} from '@mirohq/websdk-types';
import { fileUtils } from './file-utils';

export interface CardData {
  /** Optional unique identifier for updating existing cards. */
  id?: string;
  title: string;
  description?: string;
  tags?: string[];
  style?: Partial<Pick<CardStyle, 'cardTheme' | 'fillBackground'>>;
  fields?: CardField[];
  taskStatus?: CardTaskStatus;
}

export interface CardFile {
  cards: CardData[];
}

/** Load and parse card data from an uploaded file. */
export class CardLoader {
  private static instance: CardLoader;

  private constructor() {}

  /** Access the shared loader instance. */
  public static getInstance(): CardLoader {
    if (!CardLoader.instance) {
      CardLoader.instance = new CardLoader();
    }
    return CardLoader.instance;
  }

  /** Load and parse card data from an uploaded file. */
  public async loadCards(file: File): Promise<CardData[]> {
    fileUtils.validateFile(file);
    const text = await fileUtils.readFileAsText(file);
    const data = JSON.parse(text) as unknown;
    if (
      !data ||
      typeof data !== 'object' ||
      !Array.isArray((data as { cards?: unknown }).cards)
    ) {
      throw new Error('Invalid card data');
    }
    return (data as CardFile).cards.map((card) =>
      this.normalizeCard(card as unknown as Record<string, unknown>),
    );
  }

  /** Extract supported style fields and normalize values. */
  private normalizeCard(card: Record<string, unknown>): CardData {
    const styleRaw = (card.style ?? {}) as Record<string, unknown>;
    const style: Partial<Pick<CardStyle, 'cardTheme' | 'fillBackground'>> = {};
    if (styleRaw.cardTheme)
      style.cardTheme = styleRaw.cardTheme as CardStyle['cardTheme'];
    if (styleRaw.fillBackground !== undefined) {
      style.fillBackground =
        styleRaw.fillBackground === true || styleRaw.fillBackground === 'true';
    }
    return {
      id: typeof card.id === 'string' ? card.id : undefined,
      title: String(card.title),
      description:
        typeof card.description === 'string' ? card.description : undefined,
      tags: Array.isArray(card.tags) ? (card.tags as string[]) : undefined,
      fields: Array.isArray(card.fields)
        ? (card.fields as CardField[])
        : undefined,
      taskStatus: card.taskStatus as CardTaskStatus | undefined,
      style: Object.keys(style).length ? style : undefined,
    };
  }
}

export const cardLoader = CardLoader.getInstance();
