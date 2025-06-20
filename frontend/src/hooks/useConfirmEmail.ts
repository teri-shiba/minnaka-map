'use client'

import { useSetAtom } from 'jotai'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import api from '~/lib/api'
import { authModalOpenAtom } from '~/lib/state/authModalOpenAtom'

export default function useConfirmEmail() {
  const router = useRouter()
  const params = useSearchParams()
  const setModalOpen = useSetAtom(authModalOpenAtom)
  const token = params.get('confirmation_token')

  useEffect(() => {
    if (!token)
      return

    const handleConfirmEmail = async () => {
      try {
        await toast.promise(
          api.patch('/user/confirmations', { confirmation_token: token }),
          {
            loading: '確認中…',
            success: 'メールアドレスの確認が完了しました',
            error: '確認に失敗しました',
          },
        )

        setModalOpen(true)
      }
      catch (error) {
        console.error('Confirm Email callback error:', error)
      }
      finally {
        router.replace('/', { scroll: false })
      }
    }

    handleConfirmEmail()
  }, [token, setModalOpen, router])
}
