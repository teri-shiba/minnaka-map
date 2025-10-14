import * as Sentry from '@sentry/nextjs'
import { ApiError } from './api-error'

interface LogContext {
  component: string
  action?: string
  extra?: Record<string, unknown>
}

function normalizeContext(status: number | unknown, context: LogContext) {
  const tags: Record<string, string> = {
    component: context.component,
  }

  if (context.action)
    tags.action = context.action

  if (status !== undefined)
    tags.status = String(status)

  return {
    tags,
    extra: context.extra,
  }
}

const IGNORE_STATUS_CODES = new Set([401, 403, 404, 422, 304])

export function shouldLogStatus(status?: number): boolean {
  if (typeof status !== 'number')
    return true

  return !IGNORE_STATUS_CODES.has(status)
}

export function logger(error: unknown, context: LogContext) {
  const production = process.env.NODE_ENV === 'production'

  const status = error instanceof ApiError ? error.status : undefined

  if (production && !shouldLogStatus(status))
    return

  const captureContext = normalizeContext(status, context)

  if (production) {
    Sentry.captureException(error, captureContext)
  }
  else {
    console.error(error, captureContext)
  }
}
