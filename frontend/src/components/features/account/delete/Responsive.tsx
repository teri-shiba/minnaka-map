'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import DeleteAccountDialog from './Dialog'
import DeleteAccountDrawer from './Drawer'

export default function DeleteAccount() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <>
      { isDesktop ? <DeleteAccountDialog /> : <DeleteAccountDrawer /> }
    </>
  )
}
