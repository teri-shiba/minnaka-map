'use client'

import type { ComponentProps, FormEvent } from 'react'
import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '~/hooks/useAuth'
import { userStateAtom } from '~/state/user-state.atom'
import { Button } from '../buttons/Button'
import { Input } from './Input'
import { Label } from './Label'

interface DeleteAccountFormProps extends ComponentProps<'form'> {
  onClose?: () => void
}

export default function DeleteAccountForm({ onClose }: DeleteAccountFormProps) {
  const user = useAtomValue(userStateAtom)
  const { deleteAccount } = useAuth()
  const [emailInput, setEmailInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDeleteAccount = async (provider: string, value?: string) => {
    const result = await deleteAccount()
    if (result.success)
      onClose?.()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      switch (user.provider) {
        case 'email':
          if (emailInput.toLowerCase() === user.email.toLowerCase()) {
            await handleDeleteAccount('email', emailInput)
          }
          else {
            toast.error('メールアドレスが一致しません')
          }
          break
        case 'google_oauth2':
          await handleDeleteAccount('google_oauth2')
          break
        case 'line':
          await handleDeleteAccount('line')
          break

        default:
          toast.error('不明な認証方式です')
      }
    }
    catch (error) {
      console.error('削除処理エラー：', error)
      toast.error('削除に失敗しました')
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onClose?.()
  }

  const getEmailHint = (email: string) => {
    if (!email)
      return ''

    const [localPart, domain] = email.split('@')

    if (localPart.length <= 3)
      return `${localPart}***@${domain}`

    return `${localPart.slice(0, 3)}***@${domain}`
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        {/* メール認証 */}
        {user.provider === 'email' && (
          <>
            <Label htmlFor="email" className="text-xs font-normal text-gray-500">
              ヒント：
              {getEmailHint(user.email)}
            </Label>
            <Input
              type="email"
              id="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              className="mb-6 mt-2 h-auto py-3 focus-visible:ring-gray-500"
              required
            />
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="h-auto border border-destructive bg-white py-3 text-destructive hover:bg-white hover:text-destructive"
          onClick={handleCancel}
          disabled={isLoading}
        >
          キャンセル
        </Button>
        <Button
          type="submit"
          variant="destructive"
          className="h-auto py-3"
          disabled={isLoading || (user.provider === 'email' && !emailInput)}
        >
          {isLoading ? '処理中...' : '削除する'}
        </Button>
      </div>
    </form>
  )
}
