import { defineConfig } from '@trigger.dev/sdk/v3'
import { syncVercelEnvVars } from '@trigger.dev/build/extensions/core'
import { env } from '@/env'

export default defineConfig({
  project: env.TRIGGER_PROJECT_ID,
  runtime: 'node',
  logLevel: 'log',
  maxDuration: 3600,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ['./src/trigger'],
  build: {
    extensions: [syncVercelEnvVars()],
  },
})
