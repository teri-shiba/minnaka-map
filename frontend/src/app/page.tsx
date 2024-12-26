'use client'
import type { AxiosError } from 'axios'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current)
      return
    hasRun.current = true

    if (searchParams.has('confirmation_token')) {
      const confirmationToken = searchParams.get('confirmation_token')
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/confirmations`

      axios.patch(url, { confirmation_token: confirmationToken })
        .then(() => {
          toast.success('メールアドレスの確認が完了しました')
          router.replace('/')
        })
        .catch((e: AxiosError) => {
          const status = e.response?.status
          const message = '予期しないエラーが発生しました'

          if (status === 404) {
            toast.error('ユーザーが見つかりません')
          }
          else if (status === 400) {
            toast.error('メールアドレスはすでに確認済みです')
          }
          else {
            toast.error(message)
          }
        })
    }
    else {
      toast.error('不正なアクセスです')
    }
  }, [router, searchParams])

  return (
    <div>Hello</div>
  )
}
