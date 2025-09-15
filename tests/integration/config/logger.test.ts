import { describe, expect, it } from 'vitest'
import pino from 'pino'
import { Writable } from 'stream'

import { getLoggerOptions } from '../../../src/config/logger.js'

describe('logger redaction', () => {
  it('redacts sensitive headers', async () => {
    let log = ''
    const stream = new Writable({
      write(chunk, _enc, cb) {
        log += chunk.toString()
        cb()
      },
    })
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    const logger = pino(getLoggerOptions(), stream)
    process.env.NODE_ENV = origEnv
    logger.info({
      req: {
        headers: {
          authorization: 'secret',
          cookie: 'a=b',
          'x-miro-signature': 'sig',
        },
      },
    })
    stream.end()
    await new Promise((resolve) => stream.on('finish', resolve))
    const logObj = JSON.parse(log)
    expect(logObj.req.headers.authorization).toBe('[Redacted]')
    expect(logObj.req.headers.cookie).toBe('[Redacted]')
    expect(logObj.req.headers['x-miro-signature']).toBe('[Redacted]')
  })
})
