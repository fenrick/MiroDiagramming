import type { CardField, CardStyle } from '@mirohq/websdk-types';

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

const readFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target) {
        reject('Failed to load file');
        return;
      }
      resolve(e.target.result as string);
    };
    reader.onerror = () => reject('Failed to load file');
    reader.readAsText(file, 'utf-8');
  });

/** Load and parse card data from an uploaded file. */
export async function loadCards(file: File): Promise<CardData[]> {
  if (!file || typeof file !== 'object' || typeof file.name !== 'string') {
    throw new Error('Invalid file');
  }
  const text = await readFile(file);
  const data = JSON.parse(text) as unknown;
  if (!data || !Array.isArray((data as any).cards)) {
    throw new Error('Invalid card data');
  }
  return (data as CardFile).cards;
}
