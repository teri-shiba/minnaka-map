'use client'

import type { SharePayload } from '~/hooks/useShare'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { FaXTwitter } from 'react-icons/fa6'
import { LuCopy, LuMail, LuShare } from 'react-icons/lu'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import useShare from '~/hooks/useShare'
import { logger } from '~/lib/logger'

interface ShareDialogProps {
  restaurantName: string
  restaurantAddress: string
  station: string
}

export default function ShareRestaurantDialog({
  restaurantName,
  restaurantAddress,
  station,
}: ShareDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const { openNativeShare } = useShare()

  const pathname = usePathname()
  const currentUrl = useMemo(() => {
    if (typeof window === 'undefined')
      return ''
    return new URL(pathname, window.location.origin).toString()
  }, [pathname])

  const sharePayload: SharePayload = useMemo(
    () => ({
      title: `${restaurantName} [みんなかマップ]`,
      text: `店名: ${restaurantName}\n住所: ${restaurantAddress}\n最寄駅: ${station}`,
      url: currentUrl,
    }),
    [restaurantName, restaurantAddress, station, currentUrl],
  )

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast.success('リンクをコピーしました')
    }
    catch (error) {
      toast.error('リンクのコピーに失敗しました')
      logger(error, { component: 'handleCopyLink' })
    }
  }, [currentUrl])

  const handleEmailShare = useCallback(() => {
    const subject = encodeURIComponent(`${restaurantName} [みんなかマップ]`)
    const body = encodeURIComponent(
      `${sharePayload.text}\n\n${sharePayload.url}`,
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }, [restaurantName, sharePayload])

  const handleXShare = useCallback(() => {
    const text = encodeURIComponent(`「${restaurantName}」に集まろう！\nみんなのまんなか #みんなかマップ`)
    const url = encodeURIComponent(currentUrl)
    const intent = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    window.open(intent, '_blank', 'noopener,noreferrer')
  }, [restaurantName, currentUrl])

  const handleMainShare = useCallback(
    async (e: React.MouseEvent) => {
      if (!currentUrl)
        return

      e.preventDefault()

      const result = await openNativeShare(sharePayload)
      if (result.success)
        return

      setOpen(true)
    },
    [currentUrl, sharePayload, openNativeShare],
  )

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-32" onClick={handleMainShare}>
          <LuShare />
          シェアする
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
              <h2>このお店をシェア</h2>
            </div>
          </DialogTitle>
          <DialogDescription className="text-center">
            気になるお店をみんなにシェアしよう！
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
