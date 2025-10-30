import { createEnv } from '@t3-oss/env-nextjs'
import { vercel } from '@t3-oss/env-core/presets-zod'
import { z } from 'zod/v4'

const sharedSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
})

const clientSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string(),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string(),
})

const serverSchema = z.object({
  CLERK_SECRET_KEY: z.string(),
})

const schema = z.object({
  ...clientSchema.shape,
  ...serverSchema.shape,
  ...sharedSchema.shape,
})

const runtimeEnv = Object.fromEntries(
  Object.keys(schema.shape).map(key => [key, process.env[key]])
) as Record<keyof typeof schema.shape, string | undefined>

export const env = createEnv({
  extends: [vercel()],
  server: serverSchema.shape,
  client: clientSchema.shape,
  shared: sharedSchema.shape,
  experimental__runtimeEnv: {
    ...runtimeEnv,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
  },
  emptyStringAsUndefined: true,
  isServer: typeof window === 'undefined',
  onValidationError: issues => {
    console.warn('❌ Invalid environment variables:')
    issues.forEach(issue => {
      console.error(issue.path?.join('.') || 'Unknown', issue.message)
    })
    throw new Error('Invalid environment variables')
  },
  // Called when server variables are accessed on the client.
  onInvalidAccess: variable => {
    throw new Error(
      `❌ Cannot access env var: '${variable}' on the client`
    )
  },
})
