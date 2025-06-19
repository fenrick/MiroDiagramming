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
    if (!data || !Array.isArray((data as any).cards)) {
      throw new Error('Invalid card data');
    }
    return (data as CardFile).cards.map(c => this.normalizeCard(c));
  }

  /** Extract supported style fields and normalize values. */
  private normalizeCard(card: any): CardData {
    const styleRaw = card.style ?? {};
    const style: Partial<Pick<CardStyle, 'cardTheme' | 'fillBackground'>> = {};
    if (styleRaw.cardTheme) style.cardTheme = styleRaw.cardTheme;
    if (styleRaw.fillBackground !== undefined) {
      style.fillBackground =
        styleRaw.fillBackground === true || styleRaw.fillBackground === 'true';
    }
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      tags: Array.isArray(card.tags) ? card.tags : undefined,
      fields: Array.isArray(card.fields) ? card.fields : undefined,
      taskStatus: card.taskStatus,
      style: Object.keys(style).length ? style : undefined,
    };
  }
}

export const cardLoader = CardLoader.getInstance();
