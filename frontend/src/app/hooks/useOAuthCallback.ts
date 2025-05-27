import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

export default function useOAuthCallback() {
  const router = useRouter()
  const params = useSearchParams()
  const pathName = usePathname()
  const { fetchUser, resetUserState } = useAuth()
  const hasRun = useRef(false)

  const authParams = useMemo(() => ({
    status: params.get('status'),
    message: params.get('message'),
  }), [params])

  useEffect(() => {
    if (!authParams.status || hasRun.current)
      return

    hasRun.current = true

    const errorMessage = authParams.message
      ? decodeURIComponent(authParams.message)
      : 'ログインに失敗しました'

    const handleOAuthCallback = async (): Promise<void> => {
      try {
        if (authParams.status === 'success') {
          await fetchUser()
          toast.success('ログインに成功しました')
        }
        else if (authParams.status === 'error') {
          await resetUserState()
          toast.error(errorMessage)
        }
        else {
          await resetUserState()
          toast.error('不正なアクセスです')
        }
      }
      catch (error) {
        await resetUserState()
        toast.error('ユーザーの取得に失敗しました')
        console.error('OAuth callback error:', error)
      }
      finally {
        router.replace(pathName, { scroll: false })
      }
    }

    handleOAuthCallback()
  }, [authParams, router, pathName, fetchUser, resetUserState])
}
