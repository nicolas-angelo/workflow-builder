import type { NextConfig } from 'next'
import '@/env'

const nextConfig: NextConfig = {
  transpilePackages: ['shiki'],
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['@icons-pack/react-simple-icons'],
    authInterrupts: true,
    globalNotFound: true,
    viewTransition: true,
  },
  turbopack: {
    debugIds: true,
  },
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    dangerouslyAllowSVG: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  allowedDevOrigins: ['*.ngrok.dev'],
}

export default nextConfig
