import { beforeEach, expect, test, vi } from 'vitest'
import { CardClient } from '../src/core/utils/card-client'
import type { CardData } from '../src/core/utils/cards'
vi.mock('logfire', () => ({
  span: (_: string, fn: () => unknown) => fn(),
  warning: vi.fn(),
  error: vi.fn(),
}))

vi.stubGlobal('fetch', vi.fn())
vi.stubGlobal('miro', {
  board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
})

beforeEach(() => (fetch as unknown as vi.Mock).mockReset())

test('createCard posts single card', async () => {
  const api = new CardClient('/api')
  const card: CardData = { title: 't' }
  await api.createCard(card)
  const call = (fetch as vi.Mock).mock.calls[0]
  expect((fetch as vi.Mock).mock.calls).toHaveLength(1)
  expect(JSON.parse(call[1].body)).toHaveLength(1)
  expect(call[1].headers.get('Idempotency-Key')).toBeDefined()
})

test('createCards posts all cards in one request', async () => {
  const api = new CardClient('/api')
  const cards = Array.from({ length: 21 }, () => ({ title: 't' }))
  await api.createCards(cards)
  const call = (fetch as vi.Mock).mock.calls[0]
  expect((fetch as vi.Mock).mock.calls).toHaveLength(1)
  expect(JSON.parse(call[1].body)).toHaveLength(21)
  expect(call[1].headers.get('Idempotency-Key')).toBeDefined()
})
