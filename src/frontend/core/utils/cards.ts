import type { CardField, CardStyle, CardTaskStatus } from '@mirohq/websdk-types'

import { fileUtils } from './file-utils'

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

  private constructor() {}

  /** Access the shared loader instance. */
  public static getInstance(): CardLoader {
    if (!CardLoader.instance) {
      CardLoader.instance = new CardLoader()
    }
    return CardLoader.instance
  }

  /** Load and parse card data from an uploaded file. */
  public async loadCards(file: File): Promise<CardData[]> {
    fileUtils.validateFile(file)
    const text = await fileUtils.readFileAsText(file)
    const data = JSON.parse(text) as unknown
    if (!data || typeof data !== 'object' || !Array.isArray((data as { cards?: unknown }).cards)) {
      throw new Error('Invalid card data')
    }
    return (data as CardFile).cards.map((card) =>
      this.normalizeCard(card as Record<string, unknown>),
    )
  }

  /** Extract supported style fields and normalize values. */
  private normalizeCard(card: Record<string, unknown>): CardData {
    const style = parseCardStyle(card.style)
    const result: CardData = { title: String(card.title) }
    if (typeof card.id === 'string') {
      result.id = card.id
    }
    if (typeof card.description === 'string') {
      result.description = card.description
    }
    if (Array.isArray(card.tags)) {
      result.tags = card.tags as string[]
    }
    if (Array.isArray(card.fields)) {
      result.fields = card.fields as CardField[]
    }
    result.taskStatus = card.taskStatus as CardTaskStatus | undefined
    if (Object.keys(style).length) {
      result.style = style
    }
    return result
  }
}

export const cardLoader = CardLoader.getInstance()
export { parseCardStyle }
