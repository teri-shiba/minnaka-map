'use client'

import { useMediaQuery } from '../../hooks/useMediaQuery'

import { DeleteAccountDialog } from './dialogs/DeleteAccountDialog'
import { DeleteAccountDrawer } from './drawers/DeleteAccountDrawer'

export function DeleteAccount() {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  return (
    <>
      { isDesktop ? <DeleteAccountDialog /> : <DeleteAccountDrawer /> }
    </>
  )
}
