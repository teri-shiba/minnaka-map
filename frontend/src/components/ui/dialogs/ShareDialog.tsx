'use client'

import Image from 'next/image'
import { useState } from 'react'
import { FaXTwitter } from 'react-icons/fa6'
import { LuCopy, LuMail, LuShare } from 'react-icons/lu'
import { toast } from 'sonner'
import { useShare } from '~/hooks/useShare'
import { Button } from '../buttons/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './Dialog'

interface ShareDialogProps {
  restaurantName: string
  restaurantAddress: string
}

export function ShareDialog({ restaurantName, restaurantAddress }: ShareDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const [currentUrl] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.href : ''
  })
  const { share, isMobile } = useShare()

  const shareData = {
    title: restaurantName,
    text: `${restaurantAddress}をチェック`,
    url: currentUrl,
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast.success('リンクをコピーしました')
    }
    catch (error) {
      toast.error('リンクのコピーに失敗しました')
      console.error('Failed to copy link:', error)
    }
  }

  // TODO: テキスト変更
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`${restaurantName} - みんなかマップ`)
    const body = encodeURIComponent(
      `店名: ${restaurantName}\n住所: ${restaurantAddress}\nURL: ${currentUrl}`,
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  // TODO: テキスト変更
  const handleXShare = () => {
    const text = encodeURIComponent(`${restaurantName}をチェック！`)
    const url = encodeURIComponent(currentUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`)
  }

  const handleMainShare = async (e: React.MouseEvent) => {
    if (!currentUrl)
      return

    if (typeof navigator !== 'undefined' && 'share' in navigator && isMobile)
      e.preventDefault()

    await share(shareData)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-32" onClick={handleMainShare}>
          <LuShare />
          シェアする
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[470px]">
        <DialogHeader>
          <DialogTitle className="mx-auto">
            <div className="flex items-center gap-2 py-2">
              <Image
                alt="mark"
                src="/logo_mark.webp"
                width={24}
                height={24}
              />
              <h2>このお店をシェアする</h2>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            気になるお店をみんなにシェアしよう！
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="flex h-auto items-center py-3 text-sm"
          >
            <LuCopy className="inline-block size-3" />
            <span>リンクをコピー</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleEmailShare}
            className="flex h-auto items-center py-3 text-sm"
          >
            <LuMail className="inline-block size-3" />
            <span>メール</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleXShare}
            className="flex h-auto items-center py-3 text-sm"
          >
            <FaXTwitter className="inline-block size-3" />
            <span>Twitter</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
