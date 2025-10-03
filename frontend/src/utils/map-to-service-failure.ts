import type { ErrorHandlingOptions } from '~/services/api-client'
import type { ServiceFailure } from '~/types/service-result'

function isHttpErrorLike(error: unknown): error is { status: number } {
  return !!error && typeof (error as any).status === 'number'
}

export function mapToServiceFailure(
  error: unknown,
  options: ErrorHandlingOptions,
): ServiceFailure {
  const { defaultMessage, notFoundMessage } = options

  if (isHttpErrorLike(error)) {
    if (error.status === 401)
      return { success: false, message: '認証が必要です', cause: 'UNAUTHORIZED' }
    if (error.status === 403)
      return { success: false, message: '権限がありません', cause: 'FORBIDDEN' }
    if (error.status === 404)
      return { success: false, message: notFoundMessage ?? 'リソースが見つかりません', cause: 'NOT_FOUND' }
    if (error.status === 429)
      return { success: false, message: 'アクセスが集中しています。時間をあけてお試しください。', cause: 'RATE_LIMIT' }
    if (error.status >= 500)
      return { success: false, message: 'サーバーエラーが発生しました', cause: 'SERVER_ERROR' }

    return { success: false, message: defaultMessage, cause: 'REQUEST_FAILED' }
  }

  if (error instanceof TypeError)
    return { success: false, message: 'ネットワークエラーが発生しました', cause: 'NETWORK' }

  return { success: false, message: defaultMessage, cause: 'REQUEST_FAILED' }
}
