'use client'

import { useMediaQuery } from '~/hooks/useMediaQuery'
import DeleteAccountDialog from './delete-account-dialog'
import DeleteAccountDrawer from './delete-account-drawer'

export default function DeleteAccount() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <>
      {isDesktop ? <DeleteAccountDialog /> : <DeleteAccountDrawer />}
    </>
  )
}
