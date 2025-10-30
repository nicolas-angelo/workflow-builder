import type { Metadata, Viewport } from 'next'
import { ThemeColorScript } from '@/providers/theme-provider'
import { ClerkProvider } from '@/providers/clerk-provider'
import { GlobalProviders } from './providers'
import fonts from '@/lib/fonts'
import { cn } from '@/lib/utils'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Faststack',
    template: '%s | Faststack',
  },
  description: 'Faststack Platform',
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
  userScalable: true,
  interactiveWidget: 'resizes-content',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        className={cn(fonts(['geistSans', 'jetBrainsMono']))}
        lang="en"
        suppressHydrationWarning
      >
        <head>
          <ThemeColorScript />
        </head>
        <body className="antialiased">
          <GlobalProviders themeProps={{ enableSystem: false }}>
            {children}
          </GlobalProviders>
        </body>
      </html>
    </ClerkProvider>
  )
}
