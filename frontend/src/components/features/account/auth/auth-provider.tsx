'use client'

import { Suspense } from 'react'
import useOAuthCallback from '~/hooks/useOAuthCallback'

function AuthCallbacks() {
  useOAuthCallback()
  return null
}

export function AuthProvider() {
  return (
    <Suspense fallback={null}>
      <AuthCallbacks />
    </Suspense>
  )
}
