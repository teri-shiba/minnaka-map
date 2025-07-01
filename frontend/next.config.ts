import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imgfp.hotp.jp',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

export default withSentryConfig(nextConfig, {
  org: 'sole-proprietor-s4',
  project: 'minnaka-map',
  silent: !process.env.CI,
  disableLogger: true,
})
