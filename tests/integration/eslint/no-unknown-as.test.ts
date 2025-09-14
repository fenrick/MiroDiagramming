import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'
import { describe, it, expect } from 'vitest'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const configPath = path.resolve(__dirname, '../../../eslint.config.mjs')

describe('eslint config', () => {
  const eslint = new ESLint({
    overrideConfigFile: configPath,
  })

  it('flags double unknown assertions', async () => {
    const result = (
      await eslint.lintText('const foo: unknown = 1\nvoid (foo as unknown as string)\n')
    )[0]!
    expect(result.errorCount).toBe(1)
    expect(result.messages[0]?.ruleId).toBe('no-restricted-syntax')
  })

  it('allows single assertion', async () => {
    const result = (await eslint.lintText('const foo: unknown = 1\nvoid (foo as string)\n'))[0]!
    expect(result.errorCount).toBe(0)
  })
})
