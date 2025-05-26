import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

export default function useOAuthCallback() {
  const router = useRouter()
  const params = useSearchParams()
  const { fetchUser, resetUserState } = useAuth()

  const authParams = useMemo(() => ({
    status: params.get('status'),
    message: params.get('message'),
  }), [params])

  useEffect(() => {
    if (!authParams.status)
      return

    const handleOAuthCallback = async () => {
      try {
        if (authParams.status === 'success') {
          toast.success('ログインに成功しました')
          await fetchUser()
        }
        else if (authParams.status === 'error') {
          const errorMessage = authParams.message
            ? decodeURIComponent(authParams.message)
            : 'ログインに失敗しました'
          toast.error(errorMessage)
          resetUserState()
        }
        else {
          toast.error('不正なアクセスです')
          resetUserState()
        }
      }
      catch (error) {
        console.error('OAuth callback error:', error)
        toast.error('認証処理中にエラーが発生しました')
        resetUserState()
      }
      finally {
        router.replace('/')
      }
    }

    handleOAuthCallback()
  // }, [authParams, router])
  }, [authParams, fetchUser, resetUserState, router])
}
