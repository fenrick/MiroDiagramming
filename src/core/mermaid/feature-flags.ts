type EnvironmentSource = Readonly<Record<string, unknown>>

interface FlagOptions {
  readonly environment?: EnvironmentSource
}

interface BooleanFlagConfig {
  readonly key: FlagKey
  readonly defaultValue: boolean
  readonly truthy?: readonly string[]
  readonly falsy?: readonly string[]
}

function getImportMetaEnvironment(): EnvironmentSource | undefined {
  const meta = import.meta as unknown
  if (typeof meta !== 'object' || meta === null) {
    return undefined
  }

  const environment = (meta as { readonly env?: unknown }).env
  if (typeof environment !== 'object' || environment === null) {
    return undefined
  }

  return environment as EnvironmentSource
}

type FlagKey = 'VITE_MERMAID_ENABLED' | 'VITE_MIRO_EXPERIMENTAL_SHAPES'

interface MermaidEnvironment {
  readonly VITE_MERMAID_ENABLED?: unknown
  readonly VITE_MIRO_EXPERIMENTAL_SHAPES?: unknown
}

function readFlagValue(key: FlagKey, environment?: EnvironmentSource): string | undefined {
  const source = environment ?? getImportMetaEnvironment()
  if (!source) {
    return undefined
  }

  const typed = source as MermaidEnvironment
  switch (key) {
    case 'VITE_MERMAID_ENABLED': {
      const candidate = typed.VITE_MERMAID_ENABLED
      return typeof candidate === 'string' ? candidate : undefined
    }

    case 'VITE_MIRO_EXPERIMENTAL_SHAPES': {
      const candidate = typed.VITE_MIRO_EXPERIMENTAL_SHAPES
      return typeof candidate === 'string' ? candidate : undefined
    }

    default: {
      return undefined
    }
  }
}

function normaliseValue(value: string): string {
  return value.trim().toLowerCase()
}

function resolveBooleanFlag(config: BooleanFlagConfig, options?: FlagOptions): boolean {
  const raw = readFlagValue(config.key, options?.environment)
  if (typeof raw !== 'string') {
    return config.defaultValue
  }

  const normalised = normaliseValue(raw)

  if (config.truthy?.some((candidate) => normaliseValue(candidate) === normalised)) {
    return true
  }

  if (config.falsy?.some((candidate) => normaliseValue(candidate) === normalised)) {
    return false
  }

  return config.defaultValue
}

/**
 * Feature toggle for enabling Mermaid-based rendering flows.
 *
 * Controlled via the `VITE_MERMAID_ENABLED` env variable; defaults to true so
 * the feature is active during development builds unless explicitly disabled.
 */
export function isMermaidEnabled(options?: FlagOptions): boolean {
  return resolveBooleanFlag(
    {
      key: 'VITE_MERMAID_ENABLED',
      defaultValue: true,
      falsy: ['false'],
    },
    options,
  )
}

/**
 * Enable use of experimental flowchart shapes where appropriate.
 *
 * Controlled via `VITE_MIRO_EXPERIMENTAL_SHAPES`; defaults to true so
 * development builds benefit from richer shapes unless disabled.
 */
export function isExperimentalShapesEnabled(options?: FlagOptions): boolean {
  return resolveBooleanFlag(
    {
      key: 'VITE_MIRO_EXPERIMENTAL_SHAPES',
      defaultValue: false,
      truthy: ['true'],
    },
    options,
  )
}

export type { FlagOptions }
