import type { ServiceCause } from '~/types/service-result'
import { HttpError } from '~/lib/http-error'

interface GetErrorInfoOptions {
  error: unknown
  notFoundErrorMessage?: string
}

export function getErrorInfo({
  error,
  notFoundErrorMessage,
}: GetErrorInfoOptions): { message: string, cause: ServiceCause } {
  if (error instanceof HttpError) {
    switch (error.status) {
      case 401:
        return { message: 'ログインが必要です', cause: 'UNAUTHORIZED' }
      case 403:
        return { message: '権限がありません', cause: 'FORBIDDEN' }
      case 404:
        return { message: notFoundErrorMessage ?? 'リソースが見つかりません', cause: 'NOT_FOUND' }
      case 429:
        return { message: 'アクセスが集中しています。時間をあけてお試しください。', cause: 'RATE_LIMIT' }
      default:
        if (error.status >= 500)
          return { message: 'サーバーエラーが発生しました', cause: 'SERVER_ERROR' }

        return { message: error.message, cause: 'REQUEST_FAILED' }
    }
  }

  if (error instanceof TypeError)
    return { message: 'ネットワークエラーが発生しました', cause: 'NETWORK' }

  return { message: '予期しないエラーが発生しました', cause: 'REQUEST_FAILED' }
}
