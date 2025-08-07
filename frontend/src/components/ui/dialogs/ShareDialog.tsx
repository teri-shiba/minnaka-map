'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { FaXTwitter } from 'react-icons/fa6'
import { LuCopy, LuMail, LuShare } from 'react-icons/lu'
import { toast } from 'sonner'
import { useShare } from '~/hooks/useShare'
import { Button } from '../buttons/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './Dialog'

interface ShareDialogProps {
  restaurantName: string
  restaurantAddress: string
  station: string
}

export function ShareDialog({ restaurantName, restaurantAddress, station }: ShareDialogProps) {
  const [open, setOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const currentUrl = useMemo(() => `${origin}${pathname}`, [origin, pathname])
  const { share, isMobile } = useShare()

  const shareData = useMemo(() => ({
    title: `店名: ${restaurantName}`,
    text: `住所: ${restaurantAddress}`,
    station: `最寄駅: ${station}`,
    url: `URL: ${currentUrl}`,
  }), [restaurantName, restaurantAddress, station, currentUrl])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      toast.success('リンクをコピーしました')
    }
    catch (error) {
      toast.error('リンクのコピーに失敗しました')
      console.error('Failed to copy link:', error)
    }
  }, [currentUrl])

  const handleEmailShare = useCallback(() => {
    const subject = encodeURIComponent(`${restaurantName} - みんなかマップ`)
    const body = encodeURIComponent(
      `${shareData.title}\n${shareData.text}\n${shareData.station}\n\n${shareData.url}`,
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }, [restaurantName, restaurantAddress, currentUrl])

  // TODO: テキスト変更
  const handleXShare = useCallback(() => {
    const text = encodeURIComponent(`${restaurantName}をチェック！`)
    const url = encodeURIComponent(currentUrl)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`)
  }, [restaurantName, currentUrl])

  const handleMainShare = useCallback(async (e: React.MouseEvent) => {
    if (!currentUrl)
      return

    if (typeof navigator !== 'undefined' && 'share' in navigator && isMobile)
      e.preventDefault()

    await share(shareData)
  }, [currentUrl, isMobile, shareData, share])

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
