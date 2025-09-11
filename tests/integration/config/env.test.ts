import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { loadEnv } from '../../../src/config/env.js'

describe('env', () => {
  const restore: Record<string, string | undefined> = {}

  beforeEach(() => {
    // snapshot keys we touch
    for (const k of [
      'NODE_ENV',
      'PORT',
      'SESSION_SECRET',
      'CORS_ORIGINS',
      'QUEUE_CONCURRENCY',
    ]) {
      restore[k] = process.env[k]
    }
    delete process.env.CORS_ORIGINS
    delete process.env.PORT
    delete process.env.QUEUE_CONCURRENCY
    delete process.env.SESSION_SECRET
    process.env.NODE_ENV = 'test'
  })

  afterEach(() => {
    for (const [k, v] of Object.entries(restore)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  })

  it('parses CORS_ORIGINS from JSON array', () => {
    process.env.CORS_ORIGINS = '["https://a","https://b"]'
    const env = loadEnv()
    expect(env.CORS_ORIGINS).toEqual(['https://a', 'https://b'])
  })

  it('parses CORS_ORIGINS from CSV and trims spaces', () => {
    process.env.CORS_ORIGINS = 'https://a, https://b'
    const env = loadEnv()
    expect(env.CORS_ORIGINS).toEqual(['https://a', 'https://b'])
  })

  it('throws on invalid positive numbers (e.g., PORT=0)', () => {
    process.env.PORT = '0'
    expect(() => loadEnv()).toThrowError(/Invalid environment/)
  })

  it('throws when QUEUE_CONCURRENCY is 0', () => {
    process.env.QUEUE_CONCURRENCY = '0'
    expect(() => loadEnv()).toThrowError(/Invalid environment/)
  })
})

