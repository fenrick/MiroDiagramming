import type ELK from 'elkjs/lib/elk.bundled.js'

/**
 * Dynamically load the ELK layout engine.
 *
 * In Node-based environments (tests) the package is imported from
 * `node_modules`. Browsers fetch the library from the jsDelivr CDN to
 * avoid bundling it with the application.
 */
let elkPromise: Promise<typeof ELK> | null = null

interface ElkModule {
  default?: unknown
  ELK?: unknown
}

const dynamicImport = async (path: string): Promise<ElkModule> =>
  import(/* @vite-ignore */ path) as Promise<ElkModule>

const isElkConstructor = (candidate: unknown): candidate is typeof ELK =>
  typeof candidate === 'function'

/**
 * Retrieve the ELK constructor. Subsequent calls return the cached value.
 */
export async function loadElk(): Promise<typeof ELK> {
  if (elkPromise) {
    return elkPromise
  }

  const hasProcess = typeof process !== 'undefined'
  let isNodeRuntime = false
  if (hasProcess && typeof process.release === 'object') {
    isNodeRuntime = process.release.name === 'node'
  }

  elkPromise = isNodeRuntime
    ? dynamicImport('elkjs/lib/elk.bundled.js').then((module_) => {
        const candidate = module_.default
        if (isElkConstructor(candidate)) {
          return candidate
        }
        throw new Error('Failed to load ELK from node module')
      })
    : (async () => {
        const url = 'https://cdn.jsdelivr.net/npm/elkjs@0.10.0/lib/elk.bundled.js'
        const module_ = await dynamicImport(url)
        const candidate = module_.default ?? module_.ELK ?? (globalThis as ElkModule).ELK
        if (isElkConstructor(candidate)) {
          return candidate
        }
        throw new Error('ELK was not loaded')
      })()

  return elkPromise
}
