import type { CardField, CardStyle, CardTaskStatus } from '@mirohq/websdk-types'

import { fileUtilities } from './file-utilities'

export interface CardData {
  /** Optional unique identifier for updating existing cards. */
  id?: string
  title: string
  description?: string
  tags?: string[]
  style?: Partial<Pick<CardStyle, 'cardTheme' | 'fillBackground'>>
  fields?: CardField[]
  taskStatus?: CardTaskStatus
}

export interface CardFile {
  cards: CardData[]
}

function parseCardStyle(
  styleInput: unknown,
): Partial<Pick<CardStyle, 'cardTheme' | 'fillBackground'>> {
  const raw = (styleInput ?? {}) as Record<string, unknown>
  const style: Partial<Pick<CardStyle, 'cardTheme' | 'fillBackground'>> = {}
  if (raw.cardTheme) {
    style.cardTheme = raw.cardTheme as CardStyle['cardTheme']
  }
  if (raw.fillBackground !== undefined) {
    style.fillBackground = raw.fillBackground === true || raw.fillBackground === 'true'
  }
  return style
}

/** Load and parse card data from an uploaded file. */
export class CardLoader {
  private static instance: CardLoader
  private static instances = 0

  private constructor() {
    // Track instance creation to satisfy lint rule and enforce singleton intent
    CardLoader.instances += 1
  }

  /** Access the shared loader instance. */
  public static getInstance(): CardLoader {
    if (!CardLoader.instance) {
      CardLoader.instance = new CardLoader()
    }
    return CardLoader.instance
  }

  /** Load and parse card data from an uploaded file. */
  public async loadCards(file: File): Promise<CardData[]> {
    fileUtilities.validateFile(file)
    const text = await fileUtilities.readFileAsText(file)
    const data = JSON.parse(text) as unknown
    if (!data || typeof data !== 'object' || !Array.isArray((data as { cards?: unknown }).cards)) {
      throw new Error('Invalid card data')
    }
    return (data as CardFile).cards.map((card) => this.normalizeCard(card))
  }

  /** Extract supported style fields and normalize values. */
  private normalizeCard(card: CardData | Record<string, unknown>): CardData {
    const raw = card as Record<string, unknown>
    const style = parseCardStyle(raw.style)
    const result: CardData = { title: String(raw.title) }
    if (typeof raw.id === 'string') {
      result.id = raw.id
    }
    if (typeof raw.description === 'string') {
      result.description = raw.description
    }
    if (Array.isArray(raw.tags)) {
      result.tags = raw.tags as string[]
    }
    if (Array.isArray(raw.fields)) {
      result.fields = raw.fields as CardField[]
    }
    result.taskStatus = raw.taskStatus as CardTaskStatus | undefined
    if (Object.keys(style).length > 0) {
      result.style = style
    }
    return result
  }
}

export const cardLoader = CardLoader.getInstance()
export { parseCardStyle }
