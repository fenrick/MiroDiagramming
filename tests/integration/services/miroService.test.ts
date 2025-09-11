import { afterEach, describe, expect, it, vi } from 'vitest'

import { MiroService } from '../../../src/services/miroService.js'
import * as miroClient from '../../../src/miro/miroClient.js'

describe('MiroService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('is a no-op when boardId missing', async () => {
    const as = vi.fn()
    vi.spyOn(miroClient, 'getMiro').mockReturnValue({ as } as any)
    const svc = new MiroService()
    await expect(svc.createNode('u1', 'n1', { title: 't1' })).resolves.toBeUndefined()
    expect(as).not.toHaveBeenCalled()
  })

  it('creates a card via board API', async () => {
    const createCardItem = vi.fn().mockResolvedValue(undefined)
    const getBoard = vi.fn().mockResolvedValue({ createCardItem })
    const as = vi.fn().mockReturnValue({ getBoard })
    vi.spyOn(miroClient, 'getMiro').mockReturnValue({ as } as any)

    const svc = new MiroService()
    await svc.createNode('u1', 'n1', {
      title: 'hello',
      description: 'world',
      boardId: 'b1',
      extra: 'ignored',
    })
    expect(as).toHaveBeenCalledWith('u1')
    expect(getBoard).toHaveBeenCalledWith('b1')
    expect(createCardItem).toHaveBeenCalledWith({ data: { title: 'hello', description: 'world' } })
  })
})
