import { generatePagination } from '~/utils/generate-pagination'

describe('generatePagination', () => {
  it('総ページ数が閾値以下のとき、1..totalPages を全て返し、三点リーダーは出さない', () => {
    const { pages, ellipsisPositions } = generatePagination({ currentPage: 1, totalPages: 4 })
    expect(pages).toEqual([1, 2, 3, 4])
    expect(ellipsisPositions).toEqual([])
  })

  it('先頭付近 (current=1) のとき、[1, 中央, 最後] を返し、右側のみ三点リーダーを出す', () => {
    const { pages, ellipsisPositions } = generatePagination({ currentPage: 1, totalPages: 10 })
    expect(pages).toEqual([1, 2, 10])
    expect(ellipsisPositions).toEqual(['end'])
  })

  it('中央付近 (current=5) のとき、[1,4,5,6,最終] を返し、両側に 3 点リーダーを返す', () => {
    const { pages, ellipsisPositions } = generatePagination({ currentPage: 5, totalPages: 10 })
    expect(pages).toEqual([1, 4, 5, 6, 10])
    expect(ellipsisPositions).toEqual(['start', 'end'])
  })

  it('末尾付近 (current=10) のとき、[1,9,10] を返し、左側のみ三点リーダーを出す', () => {
    const { pages, ellipsisPositions } = generatePagination({ currentPage: 10, totalPages: 10 })
    expect(pages).toEqual([1, 9, 10])
    expect(ellipsisPositions).toEqual(['start'])
  })

  it('閾値超えだが中央が広がって全ページが埋まるとき、三点リーダーは出さない (境界)', () => {
    const { pages, ellipsisPositions } = generatePagination({ currentPage: 3, totalPages: 5 })
    expect(pages).toEqual([1, 2, 3, 4, 5])
    expect(ellipsisPositions).toEqual([])
  })
})
