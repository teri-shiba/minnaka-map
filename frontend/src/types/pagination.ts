export interface PageInfo {
  readonly currentPage: number
  readonly totalPages: number
  readonly totalCount: number
  readonly itemsPerPage: number
}

export interface PaginatedResult<T> {
  readonly items: T[]
  readonly pagination: PageInfo
  readonly hasMore: boolean
}
