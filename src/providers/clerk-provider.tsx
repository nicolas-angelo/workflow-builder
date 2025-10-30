'use client'

import { useTheme } from 'next-themes'
import { ClerkProvider as ClerkNextJSProvider } from '@clerk/nextjs'
import { shadcn } from '@clerk/themes'
import type { Elements, LocalizationResource } from '@clerk/types'
import { env } from '@/env'

type ClerkProviderProps = React.ComponentProps<typeof ClerkNextJSProvider>

const createElements = (
  elements?: Partial<Elements>
): Partial<Elements> => ({
  input:
    '!bg-input/30 focus-visible:!bg-transparent dark:bg-input/30 rounded-lg',
  tagInputContainer: '!bg-input/30',
  card: 'bg-linear-to-r from-card to-background rounded-rounded',
  cardBox: 'shadow-sm border rounded-rounded',
  // popoverBox: 'shadow-sm border',
  // navbarButton: '[&>svg]:text-foreground [&>span]:text-foreground',
  // button: {
  //   borderRadius: 'var(--radius)',
  //   '&::after': {
  //     display: 'none',
  //   },
  // },
  ...(elements ?? {}),
})

const localization: LocalizationResource = {
  signIn: {
    start: {
      subtitle: 'Welcome back! Please sign in to continue',
      titleCombined: '',
    },
  },
}

export function ClerkProvider({
  children,
  appearance = {},
  ...props
}: ClerkProviderProps) {
  const { resolvedTheme } = useTheme()
  const { elements = {}, ...rest } = appearance
  return (
    <ClerkNextJSProvider
      appearance={{
        theme: shadcn,
        elements: createElements(elements),
        ...rest,
        layout: {
          helpPageUrl: 'https://google.com',
          privacyPageUrl: 'https://google.com',
          termsPageUrl: 'https://google.com',
          logoImageUrl:
            resolvedTheme === 'dark'
              ? '/clerk-dark.png'
              : '/clerk-light.png',
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
      localization={localization}
      {...props}
      afterMultiSessionSingleSignOutUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      afterSignOutUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      experimental={{
        commerce: true,
      }}
      signInFallbackRedirectUrl={
        env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
      }
      signInUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpFallbackRedirectUrl={
        env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
      }
      supportEmail="nicolas@faststack.ai"
    >
      {children}
    </ClerkNextJSProvider>
  )
}
