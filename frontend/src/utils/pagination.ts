import type { PageInfo } from '~/types/pagination'
import { PAGINATION } from '~/constants'

interface PaginationStructure {
  readonly pages: number[]
  readonly ellipsisPositions: readonly('start' | 'end')[]
}

export function generatePaginationStructure(
  { currentPage, totalPages }: Pick<PageInfo, 'currentPage' | 'totalPages'>,
): PaginationStructure {
  if (totalPages <= PAGINATION.ELLIPSIS_THRESHOLD) {
    return {
      pages: Array.from({ length: totalPages }, (_, i) => i + 1),
      ellipsisPositions: [],
    }
  }

  const start = Math.max(PAGINATION.SECOND_PAGE, currentPage - PAGINATION.CURRENT_PAGE_RANGE)
  const end = Math.min(totalPages - PAGINATION.LAST_PAGE_OFFSET, currentPage + PAGINATION.CURRENT_PAGE_RANGE)

  const centerPages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const pages = [
    PAGINATION.FIRST_PAGE,
    ...centerPages,
    ...(totalPages > PAGINATION.FIRST_PAGE ? [totalPages] : []),
  ].filter((page, index, array) => array.indexOf(page) === index)

  const ellipsisPositions = [
    ...(currentPage > PAGINATION.ELLIPSIS_START_OFFSET ? ['start'] as const : []),
    ...(currentPage < totalPages - PAGINATION.ELLIPSIS_END_OFFSET ? ['end'] as const : []),
  ]

  return { pages, ellipsisPositions }
}
