'use client'

import { AlertCircle, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useWorkflow } from '@/hooks/workflow/use-workflow'

export function ValidationStatus() {
  const validationState = useWorkflow(store => store.validationState)

  const hasErrors = validationState.errors.length > 0
  const hasWarnings = validationState.warnings.length > 0

  if (!hasErrors && !hasWarnings) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="cursor-pointer">
          {hasErrors && (
            <Badge className="gap-1" variant="destructive">
              <AlertCircle className="size-3" />
              <span>{validationState.errors.length} errors</span>
            </Badge>
          )}
          {!hasErrors && hasWarnings && (
            <Badge className="gap-1" variant="secondary">
              <AlertTriangle className="size-3" />
              <span>{validationState.warnings.length} warnings</span>
            </Badge>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="font-semibold text-sm">
            {hasErrors ? 'Workflow Errors' : 'Workflow Warnings'}
          </div>

          {hasErrors && (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {validationState.errors.map((error, idx) => (
                <div
                  className="rounded border border-red-200 bg-red-50 p-2 text-xs"
                  key={`error-${error.type}-${error.message}-${idx}`}
                >
                  <div className="font-medium text-red-900">
                    {error.type}
                  </div>
                  <div className="mt-1 text-red-700">{error.message}</div>
                </div>
              ))}
            </div>
          )}

          {!hasErrors && hasWarnings && (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {validationState.warnings.map((warning, idx) => (
                <div
                  className="rounded border border-yellow-200 bg-yellow-50 p-2 text-xs"
                  key={`warning-${warning}-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: Neede it
                    idx
                  }`}
                >
                  <div className="text-yellow-700">{warning}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
