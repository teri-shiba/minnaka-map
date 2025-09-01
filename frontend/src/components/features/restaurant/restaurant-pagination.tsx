'use client'

import type { PageInfo } from '~/types/pagination'
import { useMemo } from 'react'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '~/components/ui/pagination'
import { usePagination } from '~/hooks/usePagination'
import { generatePaginationStructure } from '~/utils/pagination'

interface Props {
  pagination: PageInfo
}

export default function RestaurantPagination({ pagination }: Props) {
  const { currentPage, totalPages } = pagination
  const { createPageUrl, navigateToPage } = usePagination()

  const paginationStructure = useMemo(() =>
    generatePaginationStructure({ currentPage, totalPages }), [currentPage, totalPages])

  const paginationSequence = useMemo(() => {
    const pages = paginationStructure.pages
    let result: (number | string)[] = [...pages]

    if (paginationStructure.ellipsisPositions.includes('start')) {
      result = [pages[0], 'ellipsis-start', ...pages.slice(1)]
    }

    if (paginationStructure.ellipsisPositions.includes('end')) {
      result = [...result.slice(0, -1), 'ellipsis-end', result[result.length - 1]]
    }

    return result
  }, [paginationStructure])

  return (
    <Pagination className="md:border-b md:pb-2">
      <PaginationContent>
        {/* 前へボタン */}
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? createPageUrl(currentPage - 1) : '#'}
            onClick={(e) => {
              e.preventDefault()
              if (currentPage > 1)
                navigateToPage(currentPage - 1)
            }}
            className={currentPage <= 1 ? 'cursor-not-allowed opacity-50' : ''}
          />
        </PaginationItem>

        {paginationSequence.map((item) => {
          // 省略記号の場合
          if (typeof item === 'string') {
            return (
              <PaginationItem key={item}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          // ページ番号の場合
          return (
            <PaginationItem key={item}>
              <PaginationLink
                href={createPageUrl(item)}
                isActive={currentPage === item}
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  navigateToPage(item)
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        {/* 次へボタン */}
        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? createPageUrl(currentPage + 1) : '#'}
            onClick={(e) => {
              e.preventDefault()
              if (currentPage < totalPages)
                navigateToPage(currentPage + 1)
            }}
            className={currentPage >= totalPages ? 'cursor-not-allowed opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
