import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

export default function useOAuthCallback() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { fetchUser, resetUserState } = useAuth()

  useEffect(() => {
    const currentStatus = params.get('status')
    const message = params.get('message')
    setStatus(currentStatus)
    setErrorMessage(message)
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
        if (errorMessage) {
          toast.error(decodeURIComponent(errorMessage))
        }
        else {
          toast.error('ログインに失敗しました')
        }

        resetUserState()
      }
      else {
        toast.error('不正なアクセスです')
        resetUserState()
      }

      router.push('/')
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, errorMessage])
}
