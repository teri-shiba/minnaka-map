'use client'

import { useAtomValue } from 'jotai'
import { userStateAtom } from '~/state/user-state.atom'
import { getDeleteDescription } from '~/utils/get-delete-description'
import DeleteAccountForm from './DeleteAccountForm'

interface DeleteAccountContentProps {
  onClose: () => void
}

export default function DeleteAccountContent({ onClose }: DeleteAccountContentProps) {
  const user = useAtomValue(userStateAtom)

  return (
    <>
      <p className="pb-4 text-sm leading-6">
        {getDeleteDescription(user.provider)}
        <br />
        この操作は取り消すことができません。
        {user.provider === 'email' && '確認のため、登録中のメールアドレスを入力してください。'}
      </p>
      <DeleteAccountForm onClose={onClose} />
    </>
  )
}
