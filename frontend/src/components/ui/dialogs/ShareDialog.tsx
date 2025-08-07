'use client'

import Image from 'next/image'
import { useState } from 'react'
import { FaXTwitter } from "react-icons/fa6"
import { Button } from '../buttons/Button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'
import { LuCopy, LuMail, LuShare } from 'react-icons/lu'
import { useShare } from '~/hooks/useShare'
import { toast } from 'sonner'

interface ShareDialogProps {
  restaurantName: string
  restaurantAddress: string
}

export function ShareDialog({ restaurantName, restaurantAddress }: ShareDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const { share } = useShare()

  const shareData = {
    title: restaurantName,
    text: `${restaurantAddress}をチェック`,
    url: window.location.href,
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('リンクをコピーしました')
    } catch (error) {
      toast.error('リンクのコピーに失敗しました')
      console.error('Failed to copy link:', error)
    }
  }

  // TODO: テキスト変更
  const handleEmailShare = async () => {
    const subject = encodeURIComponent(`${restaurantName}の情報`)
    const body = encodeURIComponent(
      `${restaurantName}をチェックしてみてください！\n\n${restaurantAddress}\n\n${window.location.href}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  // TODO: テキスト変更
  const handleXShare = async () => {
    const text = encodeURIComponent(`${restaurantName}をチェック！`)
    const url = encodeURIComponent(window.location.href)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`)

  }

  const handleMainShare = async () => {
    share(shareData)
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
            className="text-sm flex h-auto items-center py-3"
          >
            <LuCopy className='size-3 inline-block' />
            <span>リンクをコピー</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleEmailShare}
            className="text-sm flex h-auto items-center py-3"
          >
            <LuMail className='size-3 inline-block' />
            <span>メール</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleXShare}
            className="text-sm flex h-auto items-center py-3"
          >
            <FaXTwitter className='size-3 inline-block' />
            <span>Twitter</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
