'use client'
import type { StaticImageData } from 'next/image'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '~/hooks/useAuth'
import logo from '~/public/logo.webp'
import logoMark from '~/public/logo_mark.webp'
import UserMenu from '~/ui/dropdownmenu/UserMenu'
import { Skeleton } from '~/components/ui/skeleton'
import { Auth } from '../features/account/auth/Auth'

interface logoImages {
  id: number
  src: StaticImageData
  width: number
  height: number
  customClassName: string
}

export default function Header() {
  const { user, isLoading } = useAuth()

  const pathname = usePathname()
  const exceptHomeClassName = pathname !== '/' ? 'border-b border-gray-200' : null

  const logoImages: logoImages[] = [
    {
      id: 0,
      src: logo,
      width: 224,
      height: 29,
      customClassName: 'hidden md:block',
    },
    {
      id: 1,
      src: logoMark,
      width: 28,
      height: 28,
      customClassName: 'block md:hidden',
    },
  ]

  return (
    <header className={`relative z-50 h-16 w-full bg-white ${exceptHomeClassName}`}>
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center">
          {logoImages.map(logo => (
            <Image
              key={logo.id}
              src={logo.src}
              alt="logo"
              width={logo.width}
              height={logo.height}
              priority
              aria-label="Go to Home"
              className={logo.customClassName}
            />
          ))}
        </Link>
        {isLoading
          ? <Skeleton className="h-10 w-[87px] rounded-full" />
          : user && user.isSignedIn
            ? <UserMenu />
            : <Auth />}
      </div>
    </header>
  )
}
