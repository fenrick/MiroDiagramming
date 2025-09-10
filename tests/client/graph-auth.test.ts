/** @vitest-environment jsdom */
import { GraphAuth } from '../src/core/utils/graph-auth'

describe('GraphAuth', () => {
  test('set, get and clear token', () => {
    const auth = new GraphAuth()
    auth.setToken('abc')
    expect(auth.getToken()).toBe('abc')
    auth.clearToken()
    expect(auth.getToken()).toBeNull()
  })

  test('handleRedirect extracts token', () => {
    const auth = new GraphAuth()
    const origHash = window.location.hash
    sessionStorage.setItem('graph.state', 'state')
    window.location.hash = '#access_token=xyz&state=state'
    auth.handleRedirect()
    expect(auth.getToken()).toBe('xyz')
    expect(window.location.hash).toBe('')
    window.location.hash = origHash
    auth.clearToken()
  })

  test('rejects mismatched state', () => {
    const auth = new GraphAuth()
    sessionStorage.setItem('graph.state', 'a')
    window.location.hash = '#access_token=xyz&state=b'
    auth.handleRedirect()
    expect(auth.getToken()).toBeNull()
    auth.clearToken()
  })

  test('generates and stores state during login', () => {
    const auth = new GraphAuth()
    const original = window.location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).location = { assign: vi.fn() } as any
    auth.login('id', ['Files.Read'], 'https://app')
    const url = (window.location.assign as vi.Mock).mock.calls[0][0]
    const params = new URL(url)
    expect(sessionStorage.getItem('graph.state')).toBe(params.searchParams.get('state'))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).location = original
  })

  test('login redirects to Microsoft', () => {
    const auth = new GraphAuth()
    const original = window.location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).location = { assign: vi.fn() } as any
    auth.login('id', ['Files.Read'], 'https://app')
    expect(window.location.assign).toHaveBeenCalled()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).location = original
  })
})
