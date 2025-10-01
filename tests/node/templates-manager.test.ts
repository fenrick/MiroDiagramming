import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('TemplateManager construction and parsing', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  const setupWithMocks = async () => {
    vi.mock('../../templates/shapeTemplates.json', () => ({
      default: {
        Primary: {
          alias: ['Alias One', 'Unsafe/Alias'],
          elements: [
            {
              shape: 'rectangle',
              text: '{{label}}',
              style: {
                borderWidth: '2',
                padding: '12px',
                empty: '   ',
                negative: '-3',
                negativeDecimal: '-1.5',
                badNumber: '1.2.3',
              },
            },
          ],
        },
        Secondary: {
          elements: [
            {
              shape: 'circle',
              text: 'Static',
            },
          ],
        },
      },
    }))
    vi.mock('../../templates/connectorTemplates.json', () => ({
      default: {
        flow: {
          alias: ['Flows'],
          style: {
            strokeWidth: '4px',
            caption: 'ignore',
          },
        },
      },
    }))
  }

  it('sanitises aliases and builds lookup tables in the constructor', async () => {
    await setupWithMocks()
    vi.mock('../../templates/experimentalShapeMap.json', () => ({
      default: { 'Alias One': 'diamond', 'Unsafe/Alias': 'circle' },
    }))

    const { TemplateManager } = await import('../../src/board/templates')
    const manager = TemplateManager.getInstance()

    // Safe alias resolves to canonical template
    expect(manager.getTemplate('Alias One')).toMatchObject({
      elements: [expect.any(Object)],
    })
    // Unsafe alias is ignored during sanitisation
    expect(manager.getTemplate('Unsafe/Alias')).toBeUndefined()

    // Connector alias registration happens alongside shape aliases
    const connector = manager.getConnectorTemplate('Flows')
    expect(connector?.style?.strokeWidth).toBe(4)
  })

  it('skips experimental overrides when the feature flag is disabled', async () => {
    vi.stubEnv('VITE_MIRO_EXPERIMENTAL_SHAPES', 'false')
    await setupWithMocks()
    vi.mock('../../templates/experimentalShapeMap.json', () => ({
      default: { 'Alias One': 'diamond' },
    }))

    const { TemplateManager } = await import('../../src/board/templates')
    const manager = TemplateManager.getInstance()

    const template = manager.getTemplate('Alias One')
    expect(template?.elements?.[0]?.shape).toBe('rectangle')
  })

  it('parses numeric style values while leaving invalid entries intact', async () => {
    await setupWithMocks()
    vi.mock('../../templates/experimentalShapeMap.json', () => ({
      default: {},
    }))

    const { TemplateManager } = await import('../../src/board/templates')
    const manager = TemplateManager.getInstance()

    const style = manager.resolveStyle({
      borderWidth: '2',
      padding: '12px',
      empty: '   ',
      negative: '-3',
      negativeDecimal: '-1.5',
      badNumber: '1.2.3',
    })

    expect(style.borderWidth).toBe(2)
    expect(style.padding).toBe(12)
    expect(style.empty).toBe('   ')
    expect(style.negative).toBe(-3)
    expect(style.negativeDecimal).toBe(-1.5)
    expect(style.badNumber).toBe('1.2.3')
  })
})
