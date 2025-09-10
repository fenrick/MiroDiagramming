import * as log from '../src/logger'
import { showApiError, showError } from '../src/ui/hooks/notifications'
import { pushToast } from '../src/ui/components/Toast'

vi.mock('../src/ui/components/Toast', () => ({ pushToast: vi.fn() }))

describe('showError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(log, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('passes through short messages', async () => {
    await showError('fail')
    expect(log.error).toHaveBeenCalledWith('fail')
    expect(pushToast).toHaveBeenCalledWith({ message: 'fail' })
  })

  test('truncates long messages', async () => {
    const long = 'a'.repeat(90)
    await showError(long)
    expect(log.error).toHaveBeenCalledWith(long)
    const arg = (pushToast as vi.Mock).mock.calls[0][0].message as string
    expect(arg.length).toBeLessThanOrEqual(80)
    expect(arg.endsWith('...')).toBe(true)
  })

  test('maps status codes to messages', async () => {
    await showApiError(429)
    expect(pushToast).toHaveBeenCalledWith({
      message: 'We\u2019re hitting the API limit. I\u2019ll retry shortly.',
    })
    await showApiError(401)
    expect(pushToast).toHaveBeenCalledWith({
      message: 'Miro session expired. Please sign in again.',
    })
    await showApiError(503)
    expect(pushToast).toHaveBeenCalledWith({
      message: 'Miro is having trouble. We\u2019ll retry in a moment.',
    })
  })
})
