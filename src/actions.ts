'use server'

import { tasks } from '@trigger.dev/sdk/v3'

export async function triggerTask(task: string, payload: unknown) {
  const handle = await tasks.trigger(task, payload)
  return {
    success: true,
    runId: handle.id,
    publicAccessToken: handle.publicAccessToken,
  }
}
