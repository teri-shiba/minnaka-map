'use client'

import { useMediaQuery } from '~/app/hooks/useMediaQuery'

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
