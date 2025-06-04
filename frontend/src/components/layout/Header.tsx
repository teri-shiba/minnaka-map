import Image from 'next/image'
import Link from 'next/link'
import logo from '~/public/logo.webp'
import logoMark from '~/public/logo_mark.webp'

export default async function Header() {
  // const [user] = useAtom(userStateAtom)

  return (
    <header className="w-full">
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
        {/* {user.isSignedIn
          // ? <Skeleton className="h-[40px] w-[87px] rounded-full" />
          // : user
          ? <UserMenu />
          : <Auth />} */}
      </div>
    </header>
  )
}
