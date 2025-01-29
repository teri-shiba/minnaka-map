import Image from 'next/image'
import Link from 'next/link'
import notFound from '~/public/image_not-found.webp'
import { Button } from './components/ui/buttons/Button'

export default function NotFound() {
  return (
    <div className="mx-auto my-14 flex flex-col items-center space-y-4">
      <Image
        alt="Not Found"
        src={notFound}
        width={240}
        height={200}
      />
      <h1>Not Found</h1>
      <p>お探しのページは見つかりませんでした。</p>
      <Button asChild size="lg">
        <Link href="/">トップページに戻る</Link>
      </Button>
    </div>
  )
}
