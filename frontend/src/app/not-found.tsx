import Image from 'next/image'
import Link from 'next/link'
import { Button } from './components/ui/buttons/Button'

export default function NotFound() {
  return (
    <div className="max-w-screen-lg px-5 mx-auto flex flex-col items-center space-y-4 my-14">
      <Image src="/image-404.png" alt="Not Found" width={240} height={200} />
      <h1>Not Found</h1>
      <p>お探しのページは見つかりませんでした。</p>
      <Button asChild size="lg">
        <Link href="/">トップページに戻る</Link>
      </Button>
    </div>
  )
}
