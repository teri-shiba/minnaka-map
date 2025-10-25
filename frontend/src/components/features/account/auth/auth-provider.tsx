'use client'

import { Suspense } from 'react'
import useConfirmEmail from '~/hooks/useConfirmEmail'
import useOAuthCallback from '~/hooks/useOAuthCallback'

function AuthCallbacks() {
  useOAuthCallback()
  useConfirmEmail()
  return null
}

export function AuthProvider() {
  return (
    <Suspense fallback={null}>
      <AuthCallbacks />
    </Suspense>
  )
}
