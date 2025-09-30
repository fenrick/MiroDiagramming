import mermaid from 'mermaid'
import type { MermaidConfig } from 'mermaid'

const DEFAULT_CONFIG: MermaidConfig = {
  startOnLoad: false,
  securityLevel: 'loose',
  // Keep diagrams accessible and predictable in the panel UI.
  theme: 'default',
  flowchart: {
    htmlLabels: false,
  },
}

let isInitialized = false

interface MermaidRuntimeApi {
  reset: () => void
}

/**
 * Retrieve the runtime API surfaced by Mermaid's bundled export.
 *
 * Newer versions of Mermaid are expected to expose a dedicated entry point;
 * until then we defensively validate the legacy attachment to fail fast when
 * the API surface changes.
 */
function getMermaidRuntimeApi(): MermaidRuntimeApi {
  const runtime = (mermaid as unknown as { mermaidAPI?: MermaidRuntimeApi }).mermaidAPI

  if (!runtime) {
    throw new TypeError('Mermaid runtime API is unavailable')
  }

  if (typeof runtime.reset !== 'function') {
    throw new TypeError('Mermaid runtime API does not expose reset()')
  }

  return runtime
}

/**
 * Ensure Mermaid's runtime is configured exactly once per session.
 *
 * Subsequent invocations are no-ops unless {@link resetMermaid} has been
 * called (intended for tests).
 */
export function ensureMermaidInitialized(config: MermaidConfig = {}): void {
  if (isInitialized) {
    return
  }
  mermaid.initialize({ ...DEFAULT_CONFIG, ...config })
  isInitialized = true
}

/**
 * Reset Mermaid state for test environments.
 */
export function resetMermaid(): void {
  getMermaidRuntimeApi().reset()
  isInitialized = false
}
