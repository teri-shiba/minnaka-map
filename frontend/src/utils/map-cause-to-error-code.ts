import type { ErrorCode } from '~/constants/toast-messages'
import type { ServiceCause } from '~/types/service-result'

export function mapCauseToErrorCode(cause: ServiceCause): ErrorCode {
  switch (cause) {
    case 'UNAUTHORIZED': return 'auth_required'
    case 'FORBIDDEN': return 'auth_required'
    case 'NOT_FOUND': return 'search_context_missing'
    case 'INVALID_SIGNATURE': return 'validation_failed'
    case 'EXPIRED': return 'link_expired'
    case 'RATE_LIMIT': return 'rate_limit_exceeded'
    case 'SERVER_ERROR': return 'server_error'
    case 'NETWORK': return 'network_error'
    case 'REQUEST_FAILED': return 'request_failed'
    case 'DUPLICATE_EMAIL': return 'duplicate_email'
    case 'ALREADY_CONFIRMED': return 'already_confirmed'
    case 'INVALID_TOKEN': return 'link_expired'
  }
}
