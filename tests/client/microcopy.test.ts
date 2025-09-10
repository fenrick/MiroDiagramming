import { applyButtonText, getErrorToastMessage, syncBarText } from '../src/ui/microcopy'

describe('microcopy', () => {
  test('sync bar syncing message', () => {
    expect(syncBarText.syncing(3)).toBe('Syncing 3 changes…')
  })

  test('apply button primary label', () => {
    expect(applyButtonText.primary(2)).toBe('Apply 2 change(s)')
  })

  test('maps status codes to error messages', () => {
    expect(getErrorToastMessage(429)).toBe(
      'We\u2019re hitting the API limit. I\u2019ll retry shortly.',
    )
    expect(getErrorToastMessage(401)).toBe('Miro session expired. Please sign in again.')
    expect(getErrorToastMessage(503)).toBe('Miro is having trouble. We\u2019ll retry in a moment.')
    expect(getErrorToastMessage(418)).toBe('An unexpected error occurred.')
  })
})
