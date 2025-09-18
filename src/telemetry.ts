import { debug } from './logger'

type SpanCallback<T> = () => T | Promise<T>

type SpanOptions<T> = {
  callback: SpanCallback<T>
}

export async function span<T>(name: string, options: SpanOptions<Promise<T>>): Promise<T>
export async function span<T>(name: string, options: SpanOptions<T | Promise<T>>): Promise<T>
export async function span<T>(name: string, options: SpanOptions<T | Promise<T>>): Promise<T> {
  const start = performance.now()
  try {
    const result = options.callback()
    if (result && typeof (result as Promise<T>).then === 'function') {
      return await (result as Promise<T>)
    }
    return result as T
  } finally {
    if (import.meta.env.DEV) {
      const duration = Math.round((performance.now() - start) * 100) / 100
      debug({ span: name, durationMs: duration }, `span:${name}`)
    }
  }
}
