import { beforeEach, expect, vi } from 'vitest';
import { CardClient } from '../src/core/utils/card-client';

{
  CardData;
}
from;
('../src/core/utils/cards');

vi.stubGlobal('fetch', vi.fn());

beforeEach(() => (fetch as unknown as vi.Mock).mockReset());

test('createCard posts single card', async () => {
  const api = new CardClient('/api');
  const card: CardData = { title: 't' };
  await api.createCard(card);
  expect((fetch as vi.Mock).mock.calls).toHaveLength(1);
  expect(JSON.parse((fetch as vi.Mock).mock.calls[0][1].body)).toHaveLength(1);
});

test('createCards posts all cards in one request', async () => {
  const api = new CardClient('/api');
  const cards = Array.from({ length: 21 }, () => ({ title: 't' }));
  await api.createCards(cards);
  expect((fetch as vi.Mock).mock.calls).toHaveLength(1);
  expect(JSON.parse((fetch as vi.Mock).mock.calls[0][1].body)).toHaveLength(21);
});
