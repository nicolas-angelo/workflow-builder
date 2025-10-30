'use client'

import {
  ThemeProvider,
  type ThemeProviderProps,
} from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'

export function GlobalProviders({
  themeProps,
  children,
}: {
  themeProps?: ThemeProviderProps
  children: React.ReactNode
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      themes={[...(themeProps?.themes ?? []), 'dark', 'light']}
      {...themeProps}
      disableTransitionOnChange
      enableColorScheme
    >
      <Toaster
        position="top-right"
        // richColors
        toastOptions={{
          classNames: {
            toast:
              '!shadow-xs dark:!shadow-black dark:!ring-1 dark:!ring-background-950 !border-none',
          },
        }}
      />
      {children}
    </ThemeProvider>
  )
}
