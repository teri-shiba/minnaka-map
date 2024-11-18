import Image from 'next/image'
import Link from 'next/link'
import { FaStar } from 'react-icons/fa'
import Liked from '../likes/Liked'
import {
  Card,
  CardContent,
  CardTitle,
} from './Card'

export default function RestaurantCard() {
  return (
    <Link href="/terms">
      <Card className="relative mb-4 sm:w-[498px]">
        <div className="absolute right-1 top-1 z-50 sm:right-0 sm:top-0">
          <Liked />
        </div>
        <div className="relative aspect-[4/3] h-auto w-full overflow-hidden rounded-lg sm:aspect-square sm:size-[140px]">
          <Image
            src="/dummy-image.png"
            alt="image"
            fill
            sizes="(max-width: 640px) 100vw, 140px"
            className="object-cover"
          />
        </div>
        <CardContent className="flex-col space-y-2">
          <CardTitle>店舗名</CardTitle>
          <div className="flex space-x-2">
            <span className="text-sm">ジャンル</span>
            <span className="flex items-center space-x-1 text-sm">
              <FaStar
                size={16}
                fill="orange"
              />
              <span>4.0</span>
            </span>
          </div>
          <p className="text-sm text-gray-500">〒000-0000 東京都渋谷区渋谷 0-0-0</p>
        </CardContent>
      </Card>
    </Link>
  )
}
