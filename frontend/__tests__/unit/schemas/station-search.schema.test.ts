import type { ZodError } from 'zod'
import { stationSearchSchema, stationSearchSubmitSchema } from '~/schemas/station-search.schema'

type ParseResult<T = unknown>
  = | { success: true, data: T }
    | { success: false, error: ZodError<unknown> }

function areaInput(value: string, stationId: number | null = null) {
  return {
    areaValue: value,
    stationId,
  }
}

function areaOutput(stationId: number | null) {
  return { stationId }
}

function messagesOf<T>(result: ParseResult<T>): string[] {
  return result.success ? [] : result.error.issues.map(i => i.message)
}

describe('stationSearchSchema', () => {
  describe('基本的な入力の許容', () => {
    it('空文字を許容する（入力途中の状態）', () => {
      const result = stationSearchSchema.safeParse({
        area: [areaInput(''), areaInput('')],
      })
      expect(result.success).toBe(true)
    })

    it('stationId が null を許容する', () => {
      const result = stationSearchSchema.safeParse({
        area: [areaInput('東京', null), areaInput('新宿', null)],
      })
      expect(result.success).toBe(true)
    })

    it('trim が適用される', () => {
      const result = stationSearchSchema.safeParse({
        area: [areaInput('   東京   ', 1), areaInput('新宿', 2)],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('型の検証', () => {
    it('stationId が string の場合はエラー', () => {
      const payload: any = {
        area: [{ areaValue: '東京', stationId: '123' }],
      }
      const result = stationSearchSchema.safeParse(payload)
      expect(result.success).toBe(false)
    })
  })
})

describe('stationSearchSubmitSchema', () => {
  describe('件数チェック', () => {
    it('0件のとき、エラーになる', () => {
      const result = stationSearchSubmitSchema.safeParse({
        area: [],
      })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toContain('出発地点を2つ以上入力してください')
    })

    it('1件のとき、エラーになる', () => {
      const result = stationSearchSubmitSchema.safeParse({
        area: [areaOutput(1)],
      })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toContain('出発地点を2つ以上入力してください')
    })

    it('null のみが2件のとき、エラーになる', () => {
      const result = stationSearchSubmitSchema.safeParse({
        area: [areaOutput(null), areaOutput(null)],
      })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toContain('出発地点を2つ以上入力してください')
    })

    it('2件以上（nullを除く）のとき、成功する', () => {
      const result = stationSearchSubmitSchema.safeParse({
        area: [areaOutput(1), areaOutput(2)],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('重複チェック', () => {
    it('stationId が重複しているとき、エラーになる', () => {
      const result = stationSearchSubmitSchema.safeParse({
        area: [areaOutput(1), areaOutput(1)],
      })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toContain('同じ出発地点が含まれています')
    })

    it('stationId が重複していないとき、成功する', () => {
      const result = stationSearchSubmitSchema.safeParse({
        area: [areaOutput(1), areaOutput(2), areaOutput(3)],
      })
      expect(result.success).toBe(true)
    })
  })

  describe('nullの扱い', () => {
    it('null が混在していても、有効なIDが2件以上なら成功する', () => {
      const result = stationSearchSubmitSchema.safeParse({
        area: [areaOutput(1), areaOutput(null), areaOutput(3)],

      })
      expect(result.success).toBe(true)
    })

    it('null を除いて1件しかないとき、エラーになる', () => {
      const result = stationSearchSubmitSchema.safeParse({
        area: [areaOutput(1), areaOutput(null), areaOutput(null)],

      })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toContain('出発地点を2つ以上入力してください')
    })
  })
})
