import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DNS,
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
  _experiments: { enableLogs: true },
})
