'use client'

import { useParams } from 'next/navigation'
import { SignIn } from '@clerk/nextjs'
import { env } from '@/env'
import { useTheme } from 'next-themes'

export default function AuthPage() {
  const { type } = useParams<{ type: string[] | undefined }>()
  const { resolvedTheme } = useTheme()

  switch (type?.[0]) {
    case 'sign-in':
      return (
        <SignIn
          __experimental={{ newComponents: true }}
          appearance={{
            layout: {
              logoImageUrl:
                resolvedTheme === 'dark'
                  ? '/clerk-dark.png'
                  : '/clerk-light.png',
            },
          }}
          path={env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
          withSignUp
        />
      )
    default:
      return null
  }
}
