import type { ErrorCode } from '~/constants'
import type { ServiceFailure } from '~/types/service-result'

export function mapFailureToErrorCode(failure: ServiceFailure): ErrorCode {
  switch (failure.cause) {
    case 'UNAUTHORIZED': return 'auth_required'
    case 'INVALID_SIGNATURE': return 'validation_failed'
    case 'EXPIRED': return 'link_expired'
    case 'RATE_LIMIT': return 'rate_limit_exceeded'
    case 'SERVER_ERROR': return 'network_error'
    default: return 'validation_error'
  }
}

export function mapFailureToRestaurantCode(failure: ServiceFailure): ErrorCode {
  if (failure.cause === 'RATE_LIMIT')
    return 'rate_limit_exceeded'
  if (failure.cause === 'SERVER_ERROR')
    return 'server_error'

  return 'restaurant_fetch_failed'
}

export function getErrorMessage(
  failure: ServiceFailure,
  operationLabel: string,
): string {
  switch (failure.cause) {
    case 'NETWORK':
      return '通信に失敗しました。ネットワークをご確認のうえ、もう一度お試しください。'
    case 'UNAUTHORIZED':
      return 'この操作にはログインが必要です。ログインしてからもう一度お試しください。'
    case 'FORBIDDEN':
      return 'この操作を行う権限がありません。'
    case 'NOT_FOUND':
      return '対象が見つかりませんでした。画面を更新してからもう一度お試しください。'
    case 'RATE_LIMIT':
      return 'ただいま混み合っています。時間をおいてもう一度お試しください。'
    case 'SERVER_ERROR':
      return 'サーバーでエラーが発生しました。時間をおいてもう一度お試しください。'
    default:
      return `${operationLabel}に失敗しました。時間をおいてもう一度お試しください。`
  }
}
