/**
 * Feature toggle for enabling Mermaid-based rendering flows.
 *
 * Controlled via the `VITE_MERMAID_ENABLED` env variable; defaults to true so
 * the feature is active during development builds unless explicitly disabled.
 */
export function isMermaidEnabled(): boolean {
  const flag = import.meta.env.VITE_MERMAID_ENABLED
  if (typeof flag === 'string') {
    return flag.toLowerCase() !== 'false'
  }
  return true
}

/**
 * Enable use of experimental flowchart shapes where appropriate.
 *
 * Controlled via `VITE_MIRO_EXPERIMENTAL_SHAPES`; defaults to true so
 * development builds benefit from richer shapes unless disabled.
 */
export function isExperimentalShapesEnabled(): boolean {
  const flag = import.meta.env.VITE_MIRO_EXPERIMENTAL_SHAPES
  if (typeof flag === 'string') {
    return flag.toLowerCase() === 'true'
  }
  return false
}
