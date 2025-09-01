'use client'

import type { PageInfo } from '~/types/pagination'
import { cn } from '~/utils/cn'
import RestaurantPagination from './restaurant-pagination'

interface Props {
  totalPages: number
  isMobile: boolean
  pagination: PageInfo
}

export default function RestaurantListFooter({ totalPages, isMobile, pagination }: Props) {
  if (totalPages <= 1 && isMobile === false)
    return null

  // TODO: ドロワーの時、高さが不足して表示されていない問題を解決する
  return (
    <div className={cn(isMobile ? 'mt-4 space-y-2' : 'mt-4 space-y-2 rounded-lg bg-gray-50/50 p-4')}>
      {totalPages > 1 && <RestaurantPagination pagination={pagination} />}
      <p className="text-center text-xs text-muted-foreground">
        Powered by
        {' '}
        <a href="http://webservice.recruit.co.jp/" className="text-sky-600">
          ホットペッパーグルメ Webサービス
        </a>
      </p>
    </div>
  )
}
