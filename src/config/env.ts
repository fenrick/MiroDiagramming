import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  SESSION_SECRET: z.string().min(10).default('dev-secret-change-me'),
  LOG_LEVEL: z.string().optional(),
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

  // Miro OAuth (used in later phases)
  MIRO_CLIENT_ID: z.string().optional(),
  MIRO_CLIENT_SECRET: z.string().optional(),
  MIRO_REDIRECT_URL: z.string().optional(),
  MIRO_IDEMPOTENCY_CLEANUP_SECONDS: z.coerce.number().int().positive().default(86400),
  MIRO_WEBHOOK_SECRET: z.string().optional(),

  // Queue tuning
  QUEUE_CONCURRENCY: z.coerce.number().int().positive().default(2),
  QUEUE_MAX_RETRIES: z.coerce.number().int().positive().default(5),
  QUEUE_BASE_DELAY_MS: z.coerce.number().int().positive().default(250),
  QUEUE_MAX_DELAY_MS: z.coerce.number().int().positive().default(5000),
})

type Env = z.infer<typeof EnvSchema>

export function loadEnv(): Env {
  const raw = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT ?? '3000',
    SESSION_SECRET: process.env.SESSION_SECRET,
    LOG_LEVEL: process.env.LOG_LEVEL,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    MIRO_CLIENT_ID: process.env.MIRO_CLIENT_ID,
    MIRO_CLIENT_SECRET: process.env.MIRO_CLIENT_SECRET,
    MIRO_REDIRECT_URL: process.env.MIRO_REDIRECT_URL,
    MIRO_IDEMPOTENCY_CLEANUP_SECONDS: process.env.MIRO_IDEMPOTENCY_CLEANUP_SECONDS,
    MIRO_WEBHOOK_SECRET: process.env.MIRO_WEBHOOK_SECRET,
    QUEUE_CONCURRENCY: process.env.QUEUE_CONCURRENCY,
    QUEUE_MAX_RETRIES: process.env.QUEUE_MAX_RETRIES,
    QUEUE_BASE_DELAY_MS: process.env.QUEUE_BASE_DELAY_MS,
    QUEUE_MAX_DELAY_MS: process.env.QUEUE_MAX_DELAY_MS,
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
