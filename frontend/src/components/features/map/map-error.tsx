import Link from 'next/link'
import { Button } from '~/components/ui/button'

export default function MapError() {
  return (
    <div className="size-full place-content-center bg-gray-100">
      <div className="flex flex-col items-center gap-1">
        <p>地図の取得に失敗しました。</p>
        <p className="pb-4">お手数ですが、トップページから再度お試しください。</p>
        <Button>
          <Link href="/">トップに戻る</Link>
        </Button>
      </div>
    </div>
  )
}
