'use client'

import type { PageInfo } from '~/types/pagination'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
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
  const router = useRouter()
  const searchParams = useSearchParams()

  const createPageUrl = useCallback((page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `?${params.toString()}`
  }, [searchParams])

  const handlePageClick = useCallback((page: number) => {
    router.push(createPageUrl(page))
  }, [router, createPageUrl])

  const createEllipsis = (key: string) => (
    <PaginationItem key={key}>
      <PaginationEllipsis />
    </PaginationItem>
  )

  const createNavigationButton = useCallback((
    direction: 'previous' | 'next',
    targetPage: number,
    isActive: boolean,
  ) => {
    const Component = direction === 'previous' ? PaginationPrevious : PaginationNext

    return (
      <Component
        href={isActive ? createPageUrl(targetPage) : '#'}
        onClick={(e) => {
          e.preventDefault()
          if (isActive)
            handlePageClick(targetPage)
        }}
        className={!isActive ? 'cursor-not-allowed opacity-50' : ''}
      />
    )
  }, [createPageUrl, handlePageClick])

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
            handlePageClick(page)
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
    handlePageClick,
  ])

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          {createNavigationButton('previous', currentPage - 1, currentPage > 1)}
        </PaginationItem>

        {pageNumbers}

        <PaginationItem>
          {createNavigationButton('next', currentPage + 1, currentPage < totalPages)}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
