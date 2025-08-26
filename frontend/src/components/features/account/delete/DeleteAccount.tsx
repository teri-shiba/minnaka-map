'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import { DeleteAccountDialog } from './DeleteAccountDialog'
import { DeleteAccountDrawer } from './DeleteAccountDrawer'

export function DeleteAccount() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <>
      { isDesktop ? <DeleteAccountDialog /> : <DeleteAccountDrawer /> }
    </>
  )
}
