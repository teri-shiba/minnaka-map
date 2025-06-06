import axios from 'axios'
import { toast } from 'sonner'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 5000,
})

api.interceptors.response.use(
  response => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status
      if (status === 401) {
        toast.error('認証エラーが発生しました。再ログインしてください。')
      }
      else if (status === 422) {
        const errors = error.response.data.errors
        toast.error(errors.full_messages || 'バリデーションエラーです')
      }
      else {
        toast.error('サーバーエラーが発生しました')
      }
    }
    else {
      toast.error('予期しないエラーが発生しました')
    }
    return Promise.reject(error)
  },
)

export default api
