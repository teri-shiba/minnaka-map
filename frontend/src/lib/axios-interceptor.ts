import axios from 'axios'
import { toast } from 'sonner'
import { apiBaseHref } from '~/utils/api-url'

interface ApiErrorPayload {
  error?: { messages?: string }
}

const STATUS_MESSAGE: Record<number, string | ((data: unknown) => string)> = {
  400: 'メールアドレスはすでに確認済みです',
  404: 'ユーザーは見つかりません',
  401: '認証エラーが発生しました。再ログインしてください。',
  422: (data: unknown) => {
    const payload = data as ApiErrorPayload
    return payload?.error?.messages ?? 'バリデーションエラーです'
  },
}

const api = axios.create({
  baseURL: apiBaseHref(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 5000,
})

api.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status, data } = error.response
      const entry = STATUS_MESSAGE[status]
      const message = typeof entry === 'function' ? entry(data) : entry ?? 'サーバーエラーが発生しました'
      toast.error(message)
    }
    else {
      toast.error('予期しないエラーが発生しました')
    }
    return Promise.reject(error)
  },
)

export default api
