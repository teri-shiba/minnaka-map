'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import { AuthDialog } from './AuthDialog'
import { AuthDrawer } from './AuthDrawer'

export function Auth() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <>
      { isDesktop ? <AuthDialog /> : <AuthDrawer /> }
    </>
  )
}
