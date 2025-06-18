import type { CardField, CardStyle } from '@mirohq/websdk-types';
import { fileUtils } from './file-utils';

export interface CardData {
  /** Optional unique identifier for updating existing cards. */
  id?: string;
  title: string;
  description?: string;
  tags?: string[];
  style?: CardStyle & Record<string, unknown>;
  fields?: CardField[];
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
    return (data as CardFile).cards;
  }
}

export const cardLoader = CardLoader.getInstance();
