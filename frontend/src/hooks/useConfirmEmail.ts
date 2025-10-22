'use client'

import { useSetAtom } from 'jotai'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { toast } from 'sonner'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'
import { authModalOpenAtom } from '~/state/auth-modal-open.atom'

export default function useConfirmEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setModalOpen = useSetAtom(authModalOpenAtom)
  const token = searchParams.get('confirmation_token')

  useEffect(() => {
    if (!token)
      return

    const confirmEmail = async () => {
      try {
        await toast.promise(
          api.patch('/user/confirmations', { confirmation_token: token }),
          {
            loading: '確認中…',
            success: 'メールアドレスの確認が完了しました',
          },
        )

        setModalOpen(true)
      }
      catch (error) {
        logger(error, {
          component: 'useConfirmEmail',
          action: 'confirmEmail',
        })
      }
      finally {
        router.replace('/', { scroll: false })
      }
    }

    confirmEmail()
  }, [token, setModalOpen, router])
}
