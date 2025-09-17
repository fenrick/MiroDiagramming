import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'
import * as miroClient from '../../../src/miro/miroClient.js'

describe('shapes routes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function createMiroMock(overrides: Record<string, unknown> = {}) {
    const defaultImpl = {
      createShapeItem: vi.fn().mockResolvedValue({ body: { id: 'shape-1', type: 'shape' } }),
      createTextItem: vi.fn().mockResolvedValue({ body: { id: 'text-1', type: 'text' } }),
      updateShapeItem: vi.fn().mockResolvedValue({ body: { id: 'shape-1', type: 'shape' } }),
      updateTextItem: vi.fn().mockResolvedValue({ body: { id: 'text-1', type: 'text' } }),
      deleteShapeItem: vi.fn().mockResolvedValue({ body: {} }),
      deleteTextItem: vi.fn().mockResolvedValue({ body: {} }),
      getSpecificItem: vi.fn().mockResolvedValue({ body: { id: 'shape-1', type: 'shape' } }),
    }
    const api = { _api: { ...defaultImpl, ...overrides } }
    const as = vi.fn().mockReturnValue(api)
    vi.spyOn(miroClient, 'getMiro').mockReturnValue({ as } as unknown as ReturnType<
      typeof miroClient.getMiro
    >)
    return { api, as }
  }

  it('creates shape items via miro api', async () => {
    const { api, as } = createMiroMock()

    const app = await buildApp()
    await app.ready()

    const res = await request(app.server)
      .post('/api/boards/b1/shapes')
      .send([
        {
          shape: 'rectangle',
          x: 10,
          y: 20,
          width: 120,
          height: 80,
          rotation: 15,
          text: 'Node',
          style: { fillColor: '#fff' },
        },
      ])

    expect(res.status).toBe(200)
    expect(as).toHaveBeenCalledWith(expect.any(String))
    expect(api._api.createShapeItem).toHaveBeenCalledWith('b1', {
      data: { shape: 'rectangle', content: 'Node' },
      style: { fillColor: '#fff' },
      position: { x: 10, y: 20 },
      geometry: { width: 120, height: 80, rotation: 15 },
    })
    expect(res.body).toEqual([{ body: JSON.stringify({ id: 'shape-1', type: 'shape' }) }])

    await app.close()
  })

  it('creates text items when shape is text', async () => {
    const overrides = {
      createTextItem: vi.fn().mockResolvedValue({ body: { id: 'text-1', type: 'text' } }),
    }
    const { api } = createMiroMock(overrides)

    const app = await buildApp()
    await app.ready()

    const res = await request(app.server)
      .post('/api/boards/b2/shapes')
      .send([
        {
          shape: 'text',
          x: 5,
          y: 6,
          width: 200,
          height: 0,
          text: 'Label',
          style: { fontSize: 14 },
        },
      ])

    expect(res.status).toBe(200)
    expect(api._api.createTextItem).toHaveBeenCalledWith('b2', {
      data: { content: 'Label' },
      style: { fontSize: 14 },
      position: { x: 5, y: 6 },
      geometry: { width: 200 },
    })

    await app.close()
  })

  it('retrieves a shape item', async () => {
    const overrides = {
      getSpecificItem: vi.fn().mockResolvedValue({ body: { id: 'shape-42', type: 'shape' } }),
    }
    const { api } = createMiroMock(overrides)

    const app = await buildApp()
    await app.ready()

    const res = await request(app.server).get('/api/boards/b3/shapes/shape-42')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ id: 'shape-42', type: 'shape' })
    expect(api._api.getSpecificItem).toHaveBeenCalledWith('b3', 'shape-42')

    await app.close()
  })

  it('updates text items using text api', async () => {
    const overrides = {
      updateTextItem: vi.fn().mockResolvedValue({ body: { id: 'text-99', type: 'text' } }),
    }
    const { api } = createMiroMock(overrides)

    const app = await buildApp()
    await app.ready()

    const res = await request(app.server)
      .put('/api/boards/b4/shapes/text-99')
      .send({
        shape: 'text',
        x: 1,
        y: 2,
        width: 160,
        height: 0,
        text: 'Updated',
        style: { textAlign: 'center' },
      })

    expect(res.status).toBe(200)
    expect(api._api.updateTextItem).toHaveBeenCalledWith('b4', 'text-99', {
      data: { content: 'Updated' },
      style: { textAlign: 'center' },
      position: { x: 1, y: 2 },
      geometry: { width: 160 },
    })

    await app.close()
  })

  it('deletes items using detected type', async () => {
    const overrides = {
      getSpecificItem: vi.fn().mockResolvedValue({ body: { id: 'shape-5', type: 'text' } }),
      deleteTextItem: vi.fn().mockResolvedValue({ body: {} }),
    }
    const { api } = createMiroMock(overrides)

    const app = await buildApp()
    await app.ready()

    const res = await request(app.server).delete('/api/boards/b5/shapes/shape-5')

    expect(res.status).toBe(204)
    expect(api._api.getSpecificItem).toHaveBeenCalledWith('b5', 'shape-5')
    expect(api._api.deleteTextItem).toHaveBeenCalledWith('b5', 'shape-5')

    await app.close()
  })

  it('returns empty cache payload for shapes listing', async () => {
    createMiroMock()

    const app = await buildApp()
    await app.ready()

    const res = await request(app.server).get('/api/boards/b6/shapes')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('shapes')
    expect(res.body).toHaveProperty('version')

    await app.close()
  })
})
