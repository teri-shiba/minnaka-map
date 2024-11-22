'use client'

import * as React from 'react'
import { useMediaQuery } from '~/app/hooks/useMediaQuery'

import { LogoutDialog } from './dialogs/LogoutDialog'
import { LogoutDrawer } from './drawers/LogoutDrawer'

export function Logout() {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  return (
    <>
      { isDesktop ? <LogoutDialog /> : <LogoutDrawer /> }
    </>
  )
}
