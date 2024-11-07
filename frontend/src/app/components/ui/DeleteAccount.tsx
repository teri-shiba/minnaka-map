'use client'

import * as React from 'react'
import { useMediaQuery } from '~/hooks/use-media-query'

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
