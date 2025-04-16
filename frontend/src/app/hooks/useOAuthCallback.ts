import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

export default function useOAuthCallback() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<string | null>(null)
  const { fetchUser, logout } = useAuth()

  useEffect(() => {
    const currentStatus = params.get('status')
    setStatus(currentStatus)
  }, [params])

  useEffect(() => {
    if (!status)
      return

    const fetchData = async () => {
      if (status === 'success') {
        toast.success('ログインに成功しました')
        await fetchUser()
      }
      else if (status === 'error') {
        toast.error('ログインに失敗しました')
        await logout()
      }
      else {
        toast.error('不正なアクセスです')
        await logout()
      }

      router.push('/')
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])
}
