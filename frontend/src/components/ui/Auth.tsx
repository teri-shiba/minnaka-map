'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import { AuthDialog } from './dialogs/AuthDialog'

import { AuthDrawer } from './drawers/AuthDrawer'

export function Auth() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <>
      { isDesktop ? <AuthDialog /> : <AuthDrawer /> }
    </>
  )
}
