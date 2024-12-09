import Link from 'next/link'
import Logo from '~/public/logo.svg'
import { Skeleton } from '../skeleton/skeleton'

export default function SkeletonHeader() {
  return (
    <header className="supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-5 xl:container md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Logo
            width={220}
            height={35}
            style={{ display: 'block' }}
          />
        </Link>
        <Skeleton className="h-[40px] w-[102px] rounded-full" />
      </div>
    </header>
  )
}
