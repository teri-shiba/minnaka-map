import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

export default function useOAuthCallback() {
  const router = useRouter()
  const params = useSearchParams()
  const currentStatus = params.get('status')
  const { fetchUser, logout } = useAuth()

  useEffect(() => {
    if (!currentStatus)
      return

    const fetchData = async () => {
      if (currentStatus === 'success') {
        toast.success('ログインに成功しました')
        await fetchUser()
      }
      else if (currentStatus === 'error') {
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
  }, [currentStatus])
}
