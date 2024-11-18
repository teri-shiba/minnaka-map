import Image from 'next/image'
import Link from 'next/link'
import { Auth } from '../ui/Auth'

export default function Header() {
  return (
    <header className="supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-5 xl:container md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="minnaka map" width={225} height={25} />
        </Link>
        <Auth />
      </div>
    </header>
  )
}
