import axios from 'axios'
import { toast } from 'sonner'

interface ToastConfig {
  message: string
  type: 'error' | 'warning' | 'info'
}

const STATUS_MESSAGE: Record<
  number,
  ToastConfig | ((url?: string) => ToastConfig)
> = {
  400: (url?: string) => {
    if (url?.includes('/user/confirmations')) {
      return {
        type: 'info',
        message: 'メールアドレスはすでに確認済みです',
      }
    }
    return {
      message: 'リクエストが正しくありません',
      type: 'error',
    }
  },
  401: {
    type: 'error',
    message: '認証エラーが発生しました',
  },
  404: (url?: string) => {
    if (url?.includes('/user/confirmations')) {
      return {
        type: 'error',
        message: 'このリンクは無効です',
      }
    }
    return {
      message: 'ユーザーは見つかりません',
      type: 'error',
    }
  },
}

const baseURL = new URL('/api/v1', process.env.NEXT_PUBLIC_API_BASE_URL).href

const api = axios.create({
  baseURL,
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
      const { status, config } = error.response
      const entry = STATUS_MESSAGE[status]

      let toastConfig: ToastConfig

      if (typeof entry === 'function') {
        toastConfig = entry(config?.url)
      }
      else if (entry) {
        toastConfig = entry
      }
      else {
        toastConfig = {
          message: 'サーバーエラーが発生しました',
          type: 'error',
        }
      }

      switch (toastConfig.type) {
        case 'error':
          toast.error(toastConfig.message)
          break
        case 'info':
          toast.info(toastConfig.message)
          break
      }
    }
    else {
      toast.error('予期しないエラーが発生しました')
    }
    return Promise.reject(error)
  },
)

export default api
