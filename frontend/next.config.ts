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

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              'default-src \'self\'',
              'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://*.sentry.io https://www.googletagmanager.com',
              'style-src \'self\' \'unsafe-inline\'',
              'img-src \'self\' data: blob: https://imgfp.hotp.jp https://api.maptiler.com https://*.google.com https://*.googleapis.com',
              'font-src \'self\' data:',
              'frame-src https://www.google.com',
              'connect-src \'self\' http://localhost:3000 https://api.maptiler.com https://*.sentry.io https://accounts.google.com https://www.google-analytics.com',
              'worker-src \'self\' blob:',
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: 'sole-proprietor-s4',
  project: 'javascript-nextjs',
  silent: !process.env.CI,
  disableLogger: true,
})
