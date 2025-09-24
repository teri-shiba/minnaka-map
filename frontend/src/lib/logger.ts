import type { Extras } from '@sentry/core'
import * as Sentry from '@sentry/nextjs'

type LogContext = { extra?: Extras, tags?: Record<string, string> } | Extras

function normalizeContext(context?: LogContext) {
  if (!context)
    return undefined

  if (typeof context === 'object' && ('extra' in context || 'tags' in context)) {
    return context as { extra?: Extras, tags?: Record<string, string> }
  }

  return { extra: context as Extras }
}

export function logger(error: unknown, context?: LogContext) {
  const captureContext = normalizeContext(context)

  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, captureContext)
  }
  else {
    console.error(error, captureContext)
  }
}
