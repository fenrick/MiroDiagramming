import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  SESSION_SECRET: z.string().min(10).default('dev-secret-change-me'),
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
})

type Env = z.infer<typeof EnvSchema>

export function loadEnv(): Env {
  const raw = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT ?? '3000',
    SESSION_SECRET: process.env.SESSION_SECRET,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
    MIRO_CLIENT_ID: process.env.MIRO_CLIENT_ID,
    MIRO_CLIENT_SECRET: process.env.MIRO_CLIENT_SECRET,
    MIRO_REDIRECT_URL: process.env.MIRO_REDIRECT_URL,
    MIRO_IDEMPOTENCY_CLEANUP_SECONDS: process.env.MIRO_IDEMPOTENCY_CLEANUP_SECONDS,
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
