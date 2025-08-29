'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import { AuthDialog } from './auth-dialog'
import { AuthDrawer } from './auth-drawer'

export function Auth() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <>
      { isDesktop ? <AuthDialog /> : <AuthDrawer /> }
    </>
  )
}
