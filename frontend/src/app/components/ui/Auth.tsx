'use client'

import * as React from 'react'
import { useMediaQuery } from '~/hooks/use-media-query'
import { AuthDialog } from './dialogs/AuthDialog'

import { AuthDrawer } from './drawers/AuthDrawer'

export function Auth() {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  return (
    <>
      { isDesktop ? <AuthDialog /> : <AuthDrawer /> }
    </>
  )
}
