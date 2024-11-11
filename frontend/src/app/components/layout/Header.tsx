import Image from 'next/image'
import Link from 'next/link'
import { Button } from '../ui/buttons/Button'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="xl:container flex gap-4 h-16 items-center justify-between px-5 md:px-6 mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="minnaka map" width={225} height={25} />
        </Link>
        <Button variant="round">ログイン</Button>
      </div>
    </header>
  )
}
