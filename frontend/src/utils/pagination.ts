import type { PageInfo } from '~/types/pagination'
import { PAGINATION } from '~/constants'

interface PaginationStructure {
  readonly pages: number[]
  readonly ellipsisPositions: readonly('start' | 'end')[]
}

export function generatePagination(
  { currentPage, totalPages }: Pick<PageInfo, 'currentPage' | 'totalPages'>,
): PaginationStructure {
  const {
    FIRST_PAGE,
    SECOND_PAGE,
    CURRENT_PAGE_RANGE,
    LAST_PAGE_OFFSET,
    ELLIPSIS_THRESHOLD,
    ELLIPSIS_START_OFFSET,
    ELLIPSIS_END_OFFSET,
  } = PAGINATION

  if (totalPages <= ELLIPSIS_THRESHOLD) {
    return {
      pages: Array.from({ length: totalPages }, (_, i) => i + 1),
      ellipsisPositions: [],
    }
  }

  const start = Math.max(SECOND_PAGE, currentPage - CURRENT_PAGE_RANGE)
  const end = Math.min(totalPages - LAST_PAGE_OFFSET, currentPage + CURRENT_PAGE_RANGE)

  const centerPages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const pages = Array.from(
    new Set([FIRST_PAGE, ...centerPages, ...(totalPages > FIRST_PAGE ? [totalPages] : [])]),
  )

  const ellipsisPositions = [
    ...(currentPage > ELLIPSIS_START_OFFSET ? ['start'] as const : []),
    ...(currentPage < totalPages - ELLIPSIS_END_OFFSET ? ['end'] as const : []),
  ]

  return { pages, ellipsisPositions }
}
