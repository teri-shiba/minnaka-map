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
      <Card className="sm:w-[498px] relative mb-4">
        <div className="absolute top-1 sm:top-0 right-1 sm:right-0 z-50">
          <Liked />
        </div>
        <div className="relative w-full h-auto sm:w-[140px] sm:h-[140px] rounded-lg aspect-[4/3] sm:aspect-square overflow-hidden">
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
          <p className="text-gray-500 text-sm">〒000-0000 東京都渋谷区渋谷 0-0-0</p>
        </CardContent>
      </Card>
    </Link>
  )
}
