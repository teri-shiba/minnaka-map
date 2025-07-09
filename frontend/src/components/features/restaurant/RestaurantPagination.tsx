import type { PageInfo } from '~/types/pagination'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { PAGINATION } from '~/constants'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/ui/pagination/Pagination'

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
    const pages = []
    const showEllipsis = totalPages > PAGINATION.ELLIPSIS_THRESHOLD

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

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(createPageItem(i))
      }
    }
    else {
      pages.push(createPageItem(1))

      if (currentPage > PAGINATION.ELLIPSIS_START_OFFSET) {
        pages.push(createEllipsis('ellipsis1'))
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push (createPageItem(i))
      }

      if (currentPage < totalPages - PAGINATION.ELLIPSIS_END_OFFSET) {
        pages.push(createEllipsis('ellipsis2'))
      }

      if (totalPages > 1) {
        pages.push(createPageItem(totalPages))
      }
    }

    return pages
  }, [currentPage, totalPages, createPageUrl, handlePageClick])

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
