import type ELK from 'elkjs/lib/elk.bundled.js'

/**
 * Dynamically load the ELK layout engine.
 *
 * In Node-based environments (tests) the package is imported from
 * `node_modules`. Browsers fetch the library from the jsDelivr CDN to
 * avoid bundling it with the application.
 */
let elkPromise: Promise<typeof ELK> | null = null

/**
 * Retrieve the ELK constructor. Subsequent calls return the cached value.
 */
export async function loadElk(): Promise<typeof ELK> {
  if (elkPromise) {
    return elkPromise
  }

  const isNode = typeof process !== 'undefined' && process.release?.name === 'node'

  const dynamic = (p: string) => import(/* @vite-ignore */ p)

  elkPromise = isNode
    ? dynamic('elkjs/lib/elk.bundled.js').then((m) => m.default)
    : (async () => {
        const url = 'https://cdn.jsdelivr.net/npm/elkjs@0.10.0/lib/elk.bundled.js'
        const module_ = (await dynamic(url)) as { default?: typeof ELK }
        if (module_.default) {
          return module_.default
        }
        const gt = globalThis as { ELK?: typeof ELK }
        if (gt.ELK) {
          return gt.ELK
        }
        throw new Error('ELK was not loaded')
      })()

  return elkPromise
}
