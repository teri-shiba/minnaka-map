'use client'

import type { PageInfo } from '~/types/pagination'
import { useMemo } from 'react'
import { usePagination } from '~/hooks/usePagination'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/ui/pagination/Pagination'
import { generatePaginationStructure } from '~/utils/pagination'

interface RestaurantPaginationProps {
  pagination: PageInfo
}

export default function RestaurantPagination({ pagination }: RestaurantPaginationProps) {
  const { currentPage, totalPages } = pagination
  const { createPageUrl, navigateToPage } = usePagination()

  const createEllipsis = (key: string) => (
    <PaginationItem key={key}>
      <PaginationEllipsis />
    </PaginationItem>
  )

  const pageNumbers = useMemo(() => {
    const paginationStructure = generatePaginationStructure({ currentPage, totalPages,
    })

    const createPageItem = (page: number) => (
      <PaginationItem key={page}>
        <PaginationLink
          href={createPageUrl(page)}
          isActive={currentPage === page}
          size="sm"
          onClick={(e) => {
            e.preventDefault()
            navigateToPage(page)
          }}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    )

    const pageItems = paginationStructure.pages.map(createPageItem)

    const withStartEllipsis = paginationStructure.ellipsisPositions.includes('start')
      ? [
          pageItems[0],
          createEllipsis('ellipsis1'),
          ...pageItems.slice(1),
        ]
      : pageItems

    const withBothEllipsis = paginationStructure.ellipsisPositions.includes('end')
      ? [
          ...withStartEllipsis.slice(0, -1),
          createEllipsis('ellipsis2'),
          withStartEllipsis[withStartEllipsis.length - 1],
        ]
      : withStartEllipsis

    return withBothEllipsis
  }, [
    currentPage,
    totalPages,
    createPageUrl,
    navigateToPage,
  ])

  return (
    <Pagination className="mt-4">
      <PaginationContent>
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

        {pageNumbers}

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
