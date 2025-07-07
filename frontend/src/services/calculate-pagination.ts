import type { PageInfo, PaginatedResult } from '~/types/pagination'

interface PaginationParams {
  page?: string
  itemsPerPage?: number
}

export function calculatePagination<T>(
  items: T[],
  params: PaginationParams = {},
): PaginatedResult<T> {
  const { page = '1', itemsPerPage = 10 } = params

  const currentPage = Math.max(1, Number.parseInt(page))
  const totalCount = items.length
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const validCurrentPage = Math.min(currentPage, totalPages || 1)

  const startIndex = (validCurrentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageItems = items.slice(startIndex, endIndex)

  const pagination: PageInfo = {
    currentPage: validCurrentPage,
    totalPages,
    totalCount,
  }

  return {
    items: currentPageItems,
    pagination,
  }
}
