import type { Extras } from '@sentry/core'
import * as Sentry from '@sentry/nextjs'

type LogContext = { extra?: Extras, tags?: Record<string, unknown> } | Extras

interface HttpErrorLogOptions {
  error: unknown
  status?: number
  method?: string
  path?: string
  component?: string
  withAuth?: boolean
  responseBody?: string
  force?: boolean
}

function stringifyTags(tags?: Record<string, unknown>): Record<string, string> {
  if (!tags)
    return {}

  const output: Record<string, string> = {}
  for (const [key, value] of Object.entries(tags)) {
    if (value !== undefined)
      output[key] = String(value)
  }
  return output
}

function normalizeContext(context?: LogContext) {
  if (!context)
    return undefined

  const isObject = typeof context === 'object'
  const withExtraAndTags = ('extra' in context || 'tags' in context)

  if (isObject && withExtraAndTags) {
    const ctx = context as { extra?: Extras, tags?: Record<string, unknown> }
    return { extra: ctx.extra, tags: stringifyTags(ctx.tags) }
  }

  return { extra: context as Extras }
}

const IGNORE_STATUS_CODES = new Set([401, 403, 404, 422, 304])

export function shouldLogStatus(status?: number): boolean {
  if (typeof status !== 'number')
    return true

  return !IGNORE_STATUS_CODES.has(status)
}

export function reportHttpError(opts: HttpErrorLogOptions): void {
  if (!opts.force && !shouldLogStatus(opts.status))
    return

  const {
    error,
    status,
    method,
    path,
    component,
    withAuth,
    responseBody,
  } = opts

  const context = {
    tags: { component, method, path, status, withAuth },
    extra: responseBody ? { responseBody } : undefined,
  }

  logger(error instanceof Error ? error : new Error(String(error)), context)
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
