'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
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
