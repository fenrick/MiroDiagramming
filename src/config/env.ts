import { z } from 'zod'

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .refine((v) => Number.isFinite(v) && v > 0, 'PORT must be a positive integer')
    .default('4000' as unknown as string) as unknown as z.ZodEffects<z.ZodString, number>,
  SESSION_SECRET: z.string().min(10).default('dev-secret-change-me'),
  CORS_ORIGIN: z.string().optional(),

  // Miro OAuth (used in later phases)
  MIRO_CLIENT_ID: z.string().optional(),
  MIRO_CLIENT_SECRET: z.string().optional(),
  MIRO_REDIRECT_URL: z.string().optional(),
})

type Env = z.infer<typeof EnvSchema> & { PORT: number }

export function loadEnv(): Env {
  const raw = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT ?? '4000',
    SESSION_SECRET: process.env.SESSION_SECRET,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    MIRO_CLIENT_ID: process.env.MIRO_CLIENT_ID,
    MIRO_CLIENT_SECRET: process.env.MIRO_CLIENT_SECRET,
    MIRO_REDIRECT_URL: process.env.MIRO_REDIRECT_URL,
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
