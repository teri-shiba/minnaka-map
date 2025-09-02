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

  const showPagination = totalPages > 1

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className={cn(
        'flex flex-col',
        showPagination && 'divide-y divide-border',
      )}
      >
        {showPagination && (
          <div className="pb-2">
            <RestaurantPagination pagination={pagination} />
          </div>
        )}
        <div className={cn(showPagination && 'pt-2')}>
          <p className="text-center text-xs text-muted-foreground">
            Powered by
            {' '}
            <a href="http://webservice.recruit.co.jp/" className="text-sky-600">
              ホットペッパーグルメ Webサービス
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
