'use client'

import Image from 'next/image'
import { useCallback, useMemo } from 'react'
import { FaXTwitter } from 'react-icons/fa6'
import { LuCopy, LuMail, LuShare } from 'react-icons/lu'
import { toast } from 'sonner'
import { logger } from '~/lib/logger'
import { Button } from '../button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../dialog'

interface ShareFavoriteListDialogProps {
  isOpen: boolean
  onClick: () => void
  isDisabled: boolean
  onClose: () => void
  shareUrl?: string
  title?: string
}
export default function ShareFavoriteListDialog({
  isOpen,
  onClick,
  isDisabled,
  onClose,
  shareUrl,
  title,
}: ShareFavoriteListDialogProps) {
  const handleCopyLink = useCallback(
    async () => {
      if (!shareUrl)
        return

      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('リンクをコピーしました')
      }
      catch (error) {
        toast.error('リンクのコピーに失敗しました')
        logger(error, { tags: { component: 'ShareFavoriteListDialog', action: 'copy' } })
      }
    },
    [shareUrl],
  )

  // TODO: 正しく起動するのかチェックする
  const handleEmailShare = useCallback(() => {
    if (!shareUrl || !title)
      return

    const subject = `${title}のまんなかのお店 [みんなかマップ]`
    const body = `${title}のまんなかのお店を今すぐチェックしよう！\n\n詳細はこちら：\n${shareUrl}`
    const mailto = new URL('mailto:')
    mailto.search = new URLSearchParams({ subject, body }).toString()
    window.location.href = mailto.toString()
  }, [shareUrl, title])

  const handleXShare = useCallback(() => {
    if (!shareUrl || !title)
      return

    const intent = new URL('https://twitter.com/intent/tweet')
    intent.search = new URLSearchParams({
      text: `「${title}」のまんなかのお店をシェア！\nみんなのまんなか #みんなかマップ`,
      url: shareUrl,
    }).toString()
    window.open(intent.toString(), '_blank', 'noopener,noreferrer')
  }, [shareUrl, title])

  const options = useMemo(() => [
    {
      icon: LuCopy,
      label: 'リンクをコピーする',
      onClick: handleCopyLink,
    },
    {
      icon: LuMail,
      label: 'メールでシェアする',
      onClick: handleEmailShare,
    },
    {
      icon: FaXTwitter,
      label: 'X でシェアする',
      onClick: handleXShare,
    },
  ], [handleCopyLink, handleEmailShare, handleXShare])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={onClick}
          disabled={isDisabled}
          className="rounded-full"
        >
          <LuShare />
          {isDisabled ? 'リストを作成中...' : 'このリストをシェアする'}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-3rem)] sm:max-w-[470px]">
        <DialogHeader>
          <DialogTitle className="mx-auto">
            <div className="flex items-center gap-2 py-2">
              <Image
                alt="mark"
                src="/logo_mark.webp"
                width={24}
                height={24}
              />
              <h2 className="text-xl">お気に入りリストをシェア</h2>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            お気に入りしたお店をみんなにシェアしよう！
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {options.map(({ icon: Icon, label, onClick }) => (
            <Button
              key={label}
              variant="outline"
              className="flex h-auto items-center py-3 text-sm"
              onClick={onClick}
            >
              <Icon className="inline-block size-3" />
              {label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
