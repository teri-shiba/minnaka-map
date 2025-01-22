import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function useOAuthCallback() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const currentStatus = params.get('status')
    setStatus(currentStatus)
  }, [params])

  useEffect(() => {
    if (!status)
      return

    if (status === 'success') {
      toast.success('ログインに成功しました')
    }
    else if (status === 'error') {
      toast.error('ログインに失敗しました')
    }
    else {
      toast.error('不正なアクセスです')
    }

    router.push('/')
  }, [status, router])
}
