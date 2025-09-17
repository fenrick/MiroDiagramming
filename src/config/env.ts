import { z } from 'zod'

function createSourceListSchema(defaultSources: string[]) {
  const defaultValue = defaultSources.join(' ')
  return z
    .string()
    .default(defaultValue)
    .transform((val) => {
      const trimmed = val.trim()
      if (!trimmed) {
        return [...defaultSources]
      }
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed.map((entry) => entry.toString().trim()).filter(Boolean)
        }
      } catch {
        // fall through to string split
      }
      return trimmed
        .split(/[\s,]+/)
        .map((entry) => entry.trim())
        .filter(Boolean)
    })
}

const defaultExternalSources = ["'self'", 'https://miro.com', 'https://*.miro.com']

/**
 * Schema defining all supported environment variables.
 * Each property includes a description and default, ensuring
 * a single source of truth for configuration.
 */
const EnvSchema = z.object({
  /** Node execution mode affecting logging and error handling. */
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  /** HTTP port the Fastify server listens on. */
  PORT: z.coerce.number().int().positive().default(3000),

  /**
   * Secret used to sign session cookies.
   * Replace the default with a long random string in production.
   */
  SESSION_SECRET: z.string().min(10).default('dev-secret-change-me'),

  /** Minimum Pino log level, e.g. `info` or `debug`. */
  LOG_LEVEL: z.string().optional(),

  /**
   * Allowed cross-origin request origins. Accepts a JSON array string
   * (e.g. `["https://app.example"]`) or a comma-separated list.
   */
  CORS_ORIGINS: z
    .string()
    .transform((val) => {
      try {
        return JSON.parse(val) as string[]
      } catch {
        return val.split(',').map((v) => v.trim())
      }
    })
    .optional(),

  /**
   * Allowed parent frames for embedding this app. Accepts JSON array,
   * comma-separated or space-separated list. Defaults to self and Miro origins.
   */
  FRAME_ANCESTORS: createSourceListSchema(defaultExternalSources),
  /** Allowed script sources used in CSP headers. */
  SCRIPT_SRC: createSourceListSchema(defaultExternalSources),
  /** Allowed connect sources (e.g. websockets) used in CSP headers. */
  CONNECT_SRC: createSourceListSchema(defaultExternalSources),

  // Miro OAuth
  /** OAuth client identifier issued by Miro. */
  MIRO_CLIENT_ID: z.string().optional(),
  /** OAuth client secret; treat as sensitive. */
  MIRO_CLIENT_SECRET: z.string().optional(),
  /**
   * Redirect URL registered with Miro, e.g.
   * `http://localhost:3000/auth/miro/callback`.
   */
  MIRO_REDIRECT_URL: z.string().optional(),
  /**
   * Interval in seconds for pruning stale idempotency keys.
   * Defaults to one day.
   */
  MIRO_IDEMPOTENCY_CLEANUP_SECONDS: z.coerce.number().int().positive().default(86400),
  /**
   * Shared secret for verifying webhook signatures. Keep this value
   * private to prevent request forgery.
   */
  MIRO_WEBHOOK_SECRET: z.string().optional(),

  // Queue tuning
  /** Number of concurrent workers processing queued tasks. */
  QUEUE_CONCURRENCY: z.coerce.number().int().positive().default(2),
  /** Maximum retry attempts before a task is dropped. */
  QUEUE_MAX_RETRIES: z.coerce.number().int().positive().default(5),
  /** Initial backoff delay in milliseconds for retries. */
  QUEUE_BASE_DELAY_MS: z.coerce.number().int().positive().default(250),
  /** Upper bound for exponential backoff delay in milliseconds. */
  QUEUE_MAX_DELAY_MS: z.coerce.number().int().positive().default(5000),
  /** Queue length that should trigger warning logs; set ≤ 0 to disable. */
  QUEUE_WARN_LENGTH: z.coerce.number().int().default(25),
  /**
   * Maximum time in milliseconds to wait for the change queue to drain during
   * shutdown before timing out.
   */
  QUEUE_SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),

  /**
   * Absolute path to the directory containing built static assets (index.html, JS, CSS).
   * When unset, the server falls back to common locations under the repository root.
   */
  STATIC_ROOT: z.string().optional(),
})

type Env = z.infer<typeof EnvSchema>

/**
 * Load and validate environment variables using {@link EnvSchema}.
 *
 * @returns Parsed environment values.
 * @throws If validation fails, an Error describing the invalid fields.
 */
export function loadEnv(): Env {
  const raw = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT ?? '3000',
    SESSION_SECRET: process.env.SESSION_SECRET,
    LOG_LEVEL: process.env.LOG_LEVEL,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    FRAME_ANCESTORS: process.env.FRAME_ANCESTORS,
    SCRIPT_SRC: process.env.SCRIPT_SRC,
    CONNECT_SRC: process.env.CONNECT_SRC,
    MIRO_CLIENT_ID: process.env.MIRO_CLIENT_ID,
    MIRO_CLIENT_SECRET: process.env.MIRO_CLIENT_SECRET,
    MIRO_REDIRECT_URL: process.env.MIRO_REDIRECT_URL,
    MIRO_IDEMPOTENCY_CLEANUP_SECONDS: process.env.MIRO_IDEMPOTENCY_CLEANUP_SECONDS,
    MIRO_WEBHOOK_SECRET: process.env.MIRO_WEBHOOK_SECRET,
    QUEUE_CONCURRENCY: process.env.QUEUE_CONCURRENCY,
    QUEUE_MAX_RETRIES: process.env.QUEUE_MAX_RETRIES,
    QUEUE_BASE_DELAY_MS: process.env.QUEUE_BASE_DELAY_MS,
    QUEUE_MAX_DELAY_MS: process.env.QUEUE_MAX_DELAY_MS,
    QUEUE_WARN_LENGTH: process.env.QUEUE_WARN_LENGTH,
    QUEUE_SHUTDOWN_TIMEOUT_MS: process.env.QUEUE_SHUTDOWN_TIMEOUT_MS,
    STATIC_ROOT: process.env.STATIC_ROOT,
  }
  const parsed = EnvSchema.safeParse(raw)
  if (!parsed.success) {
    // Log a compact error; throw to fail fast
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    throw new Error(`Invalid environment: ${issues}`)
  }
  const env = parsed.data as Env
  return env
}

export type { Env }
