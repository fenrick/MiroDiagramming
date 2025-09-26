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
  mermaid.mermaidAPI.reset()
  isInitialized = false
}
