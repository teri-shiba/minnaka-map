/**
 * NOTE:
 * このテストは「UI入力用スキーマ」(stationSearchSchema) を対象にしています。
 * - 目的: 入力途中でも落ちないことを保証する（stationId を含む一部フィールドは null を許容）。
 * - 背景: 送信時の API は station_ids: number[] のみを受け付け、座標はサーバで算出する。
 * - よって本テストでは「入力途中の値（null を含む）」を許容する振る舞いを確認します。
 *
 * 【発端 / 疑問（なぜこの議論が起きたか）】
 * - 送信時は id しか送らないのに、localStorage に id/name/latitude/longitude を保存しているのはなぜ？
 * - null を許容してよいのか？（UIでは未選択があり得るが、送信時にまで許容してよいのか）
 * - 修正は schemas 側で今やるべきか、それとも StationSearchForm のテスト時にやるべきか？
 * - “駅名 2つ以上”や重複チェックを name で見るのか id で見るのかが曖昧では？
 * - TypeScript の型（設計時）と Zod のバリデーション（実行時）の責務が混ざって見える。
 *
 * 【方針（今は触らない）】
 * - ここでは UI 用スキーマのユニットテストに集中し、入力途中許容(null)の振る舞いのみを担保する。
 * - 送信時の厳格化はフォーム側の工程で一括対応する（下記 TODO）。
 *
 * TODO: (StationSearchForm のテスト/リファクタ工程で実施)
 * - 「送信用スキーマ」(例: stationSearchSubmitSchema) を新設
 *   - 入力がある行は stationId 必須、2件以上、ID で重複なし
 *   - lat/lng は扱わない（APIは id のみを契約）
 * - フォーム送信直前に submitSchema.safeParse(...) で厳格チェック
 *   - 失敗時はトースト表示して送信しない
 * - 保存データの整理
 *   - sessionStorage: stationIds: number[] のみ
 *   - localStorage（履歴用途）: [{ id, name }] のみに縮退（lat/lng は持たない）
 *
 * メモ:
 * - TypeScript はコンパイル時の安全、Zod は実行時の安全。UIでは null を許容し、送信直前で締める二層構成が堅牢。
 */

import type z from 'zod'
import { stationSearchSchema } from '~/schemas/station-search.schema'

type StationInput = z.infer<typeof stationSearchSchema>
type ParseResult = ReturnType<typeof stationSearchSchema.safeParse>

function messagesOf(result: ParseResult): string[] {
  return result.success ? [] : result.error.issues.map(i => i.message)
}

function issuesOf(result: ParseResult) {
  return result.success ? [] : result.error.issues
}

function findIssueByPath(result: ParseResult, path: (string | number)[]) {
  return issuesOf(result).find(i => JSON.stringify(i.path) === JSON.stringify(path))
}

const tokyo = {
  areaValue: '東京',
  stationId: null,
  latitude: null,
  longitude: null,
}

const kanda = {
  areaValue: '神田',
  stationId: null,
  latitude: null,
  longitude: null,
}

const ueno = {
  areaValue: '上野',
  stationId: null,
  latitude: null,
  longitude: null,
}

const VALID: StationInput = { area: [tokyo, kanda] }

function parse(overrides: Partial<StationInput> = {}) {
  return stationSearchSchema.safeParse({
    ...VALID,
    ...overrides,
  })
}

describe('stationSearchSchema', () => {
  describe('areaValue(各行の必須・trim)', () => {
    it('空文字は「出発地点を入力してください」になる ', () => {
      const result = parse({ area: [{ ...tokyo, areaValue: '' }, kanda, ueno] })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['出発地点を入力してください'])
    })

    it('空白のみは trim 後に空になり失敗', () => {
      const result = parse({ area: [{ ...tokyo, areaValue: '    ' }, kanda, ueno] })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['出発地点を入力してください'])
    })

    it('trim は実際に反映される', () => {
      const result = parse({ area: [{ ...tokyo, areaValue: '  東京  ' }, kanda] })
      expect(result.success).toBe(true)

      if (result.success)
        expect(result.data.area[0].areaValue).toBe('東京')
    })
  })

  describe('配列レベルのルール', () => {
    it('1件だけだと「出発地点を2つ以上入力してください」', () => {
      const result = parse({ area: [tokyo] })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['出発地点を2つ以上入力してください'])
    })

    it('空配列のときも「出発地点を2つ以上入力してください」', () => {
      const result = parse({ area: [] })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['出発地点を2つ以上入力してください'])
    })

    it('同じ地点（trim 後を比較）を含むと「同じ出発地点が含まれています」', () => {
      const result = parse({
        area: [tokyo, tokyo],
      })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['同じ出発地点が含まれています'])
    })

    it('空文字と有効な値の両方が存在する場合、個別エラーと配列エラーが同時に帰る', () => {
      const result = parse({
        area: [{ ...tokyo, areaValue: '' }, kanda],
      })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(
        expect.arrayContaining([
          '出発地点を入力してください',
          '出発地点を2つ以上入力してください',
        ]),
      )
      expect(messagesOf(result)).toHaveLength(2)
    })
  })

  describe('stationId / latitude / longitude (number | null)', () => {
    it('null は許可される', () => {
      const result = parse({
        area: [{ ...tokyo, stationId: null, latitude: null, longitude: null }, kanda],
      })
      expect(result.success).toBe(true)
    })

    it('型が不正（例: stationId が string）なら該当パスにエラーがつく', () => {
      const payload: any = { area: [{ ...tokyo, stationId: '123' }, kanda] }
      const result = stationSearchSchema.safeParse(payload)
      expect(result.success).toBe(false)
      const issue = findIssueByPath(result, ['area', 0, 'stationId'])
      expect(issue).toBeDefined()
    })
  })

  it('全要件を満たすと成功する', () => {
    const result = parse()
    expect(result.success).toBe(true)
  })
})
