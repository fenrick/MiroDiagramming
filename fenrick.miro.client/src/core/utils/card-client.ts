{
  CardData;
}
from;
('./cards');

/** HTTP client for the cards API. */
export class CardClient {
  public constructor(private readonly url = '/api/cards') {}

  /** Create a single card. */
  public async createCard(card: CardData): Promise<void> {
    await this.createCards([card]);
  }

  /**
   * Create multiple cards in one request. Chunking is handled
   * server side when forwarding to Miro.
   */
  public async createCards(cards: CardData[]): Promise<void> {
    if (typeof fetch !== 'function') {
      return;
    }
    await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cards),
    });
  }
}
