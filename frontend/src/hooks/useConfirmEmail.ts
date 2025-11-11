'use client'

import type { ServiceCause } from '~/types/service-result'
import { useSetAtom } from 'jotai'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import api from '~/lib/axios-interceptor'
import { logger } from '~/lib/logger'
import { authModalOpenAtom } from '~/state/auth-modal-open.atom'
import { mapCauseToErrorCode } from '~/utils/map-cause-to-error-code'

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
        await api.patch('/user/confirmations', { confirmation_token: token })
        setModalOpen(true)
        router.replace('/?success=email_confirmed')
      }
      catch (error) {
        logger(error, {
          component: 'useConfirmEmail',
          action: 'confirmEmail',
        })
        const cause = (error as { cause?: ServiceCause })?.cause ?? 'NETWORK'
        const errorCode = mapCauseToErrorCode(cause)
        router.replace(`/?error=${errorCode}`)
      }
    }

    confirmEmail()
  }, [token, setModalOpen, router])
}
