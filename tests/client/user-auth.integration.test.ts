import http, { type Server } from 'node:http'
import { AddressInfo } from 'node:net'
import { afterAll, beforeAll, expect, test, vi } from 'vitest'
import { AuthClient, registerWithCurrentUser } from '../src/user-auth'

let server: Server
let url: string

beforeAll(async () => {
  server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/users') {
      let body = ''
      req.on('data', (chunk) => {
        body += chunk
      })
      req.on('end', () => {
        const data = JSON.parse(body)
        if (
          typeof data.access_token === 'string' &&
          typeof data.refresh_token === 'string' &&
          typeof data.expires_at === 'string'
        ) {
          res.writeHead(202).end()
        } else {
          res.writeHead(400).end()
        }
      })
      return
    }
    res.writeHead(404).end()
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const addr = server.address() as AddressInfo
  url = `http://127.0.0.1:${addr.port}/api/users`
}, 30000)

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
})

test('registerCurrentUser sends token to server', async () => {
  ;(global as unknown as { miro: unknown }).miro = {
    board: {
      getIdToken: vi.fn().mockResolvedValue('tok'),
      getUserInfo: vi.fn().mockResolvedValue({ id: 'u1', name: 'Alice' }),
    },
  }
  const client = new AuthClient(url)
  const originalFetch = global.fetch
  let status = 0
  global.fetch = async (...args) => {
    const r = await originalFetch(...args)
    status = r.status
    return r
  }
  await registerWithCurrentUser(client)
  expect(status).toBe(202)
  global.fetch = originalFetch
})
