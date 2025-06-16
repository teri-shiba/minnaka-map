'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'

import { DeleteAccountDialog } from './dialogs/DeleteAccountDialog'
import { DeleteAccountDrawer } from './drawers/DeleteAccountDrawer'

export function DeleteAccount() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <>
      { isDesktop ? <DeleteAccountDialog /> : <DeleteAccountDrawer /> }
    </>
  )
}
