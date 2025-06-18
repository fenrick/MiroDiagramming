import type { CardField, CardStyle } from '@mirohq/websdk-types';
import { readFileAsText, validateFile } from './file-utils';

export interface CardData {
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
export async function loadCards(file: File): Promise<CardData[]> {
  validateFile(file);
  const text = await readFileAsText(file);
  const data = JSON.parse(text) as unknown;
  if (!data || !Array.isArray((data as any).cards)) {
    throw new Error('Invalid card data');
  }
  return (data as CardFile).cards;
}
