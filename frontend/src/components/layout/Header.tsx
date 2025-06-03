'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import logo from '~/public/logo.webp'
import logoMark from '~/public/logo_mark.webp'
import { useFetchUser } from '~/hooks/useFetchUser'
import { AuthDialog } from '../ui/dialogs/AuthDialog'
import { Skeleton } from '../ui/skeleton/Skeleton'
import UserMenu from '../ui/dropdownmenu/UserMenu'
import { Auth } from '../ui/Auth'

export default function Header() {
  const pathName = usePathname()
  const isHomePage = pathName === '/'
  const headerBgClass = isHomePage ? 'bg-secondary' : ''
  const { user, isLoading } = useFetchUser()

  return (
    <header className={`w-full ${headerBgClass}`}>
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center">
          {/* TODO: Image タグをひとつにして、切り替える */}
          <Image
            src={logo}
            alt="logo"
            width={224}
            height={29}
            priority
            aria-label="Go to Home"
            className="hidden h-auto md:block"
          />
          <Image
            src={logoMark}
            alt="logo"
            width={28}
            height={28}
            priority
            aria-label="Go to Home"
            className="block h-auto md:hidden"
          />
        </Link>
        {/* {isLoading
          ? <Skeleton className="h-[40px] w-[87px] rounded-full" />
          : user
            ? <p>ログイン済</p>
            : <AuthDialog />} */}
        {isLoading
          ? <Skeleton className="h-[40px] w-[87px] rounded-full" />
          : user
            ? <UserMenu />
            : <Auth />
        }
      </div>
    </header>
  )
}
