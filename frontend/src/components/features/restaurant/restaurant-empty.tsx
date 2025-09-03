'use client'

import Link from 'next/link'
import { Button } from '~/components/ui/button'

export default function RestaurantEmpty() {
  return (
    <div className="text-center">
      <p className="text-sm leading-relaxed">
        お店が見つかりませんでした。
        <br />
        条件を変えて再検索してください。
      </p>
      <Link href="/" className="mt-4 inline-block">
        <Button>再検索する</Button>
      </Link>
    </div>
  )
}
