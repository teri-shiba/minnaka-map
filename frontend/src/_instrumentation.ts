import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./_sentry.server.config')
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./_sentry.edge.config')
  }
}

export const onRequestError = Sentry.captureRequestError
