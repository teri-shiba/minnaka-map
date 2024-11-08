'use client'

import * as React from 'react'
import { useMediaQuery } from '~/hooks/use-media-query'

import { ShareDialog } from './dialogs/ShareDialog'
import { ShareDrawer } from './drawers/ShareDrawer'

export function Share() {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  return (
    <>
      { isDesktop ? <ShareDialog /> : <ShareDrawer /> }
    </>
  )
}
