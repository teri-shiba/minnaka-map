import { API_PREFIX } from '~/constants'

type QueryPrimitive = string | number | boolean
type QueryArray = ReadonlyArray<QueryPrimitive>
type QueryValue = QueryPrimitive | QueryArray | null | undefined

export interface QueryParams {
  readonly [key: string]: QueryValue
}

// -------------------
// 内部ユーティリティ
// -------------------
const isServer = typeof window === 'undefined'

function getApiOrigin(): string {
  const baseOrigin = isServer
    ? process.env.API_BASE_URL
    : process.env.NEXT_PUBLIC_API_BASE_URL

  if (!baseOrigin)
    throw new Error('API base URL is not set')

  return baseOrigin.replace(/\/+$/, '') // 末尾スラッシュは削る
}

// null/undefined をまとめて判定
function isNullish(value: unknown): value is null | undefined {
  return value === null || value === undefined
}

// QueryValue が配列かどうかの型ガード
function isPrimitiveArray(value: QueryValue): value is QueryArray {
  return Array.isArray(value)
}

// QueryParams を URLSearchParams に変換
function buildSearchString(params?: QueryParams): string {
  if (!params)
    return ''

  const searchParams = new URLSearchParams()

  const appendSingleValue = (key: string, primitive: QueryPrimitive) => {
    searchParams.append(key, String(primitive))
  }

  for (const [key, rawValue] of Object.entries(params)) {
    if (isNullish(rawValue))
      continue

    if (isPrimitiveArray(rawValue)) {
      for (const element of rawValue) {
        appendSingleValue(key, element)
      }
    }
    else {
      appendSingleValue(key, rawValue)
    }
  }

  return searchParams.toString()
}

// 先頭スラッシュを強制
function ensureLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`
}

// -------------------
// 公開ユーティリティ
// -------------------
export function apiUrl(path: string, params?: QueryParams): URL {
  const origin = getApiOrigin()
  const normalizedPath = ensureLeadingSlash(path)
  const url = new URL(`${API_PREFIX}${normalizedPath}`, origin)

  const searchString = buildSearchString(params)
  if (searchString)
    url.search = searchString

  return url
}

// 文字列（href 用）を直接返すショートカット
export function apiHref(path: string, params?: QueryParams): string {
  return apiUrl(path, params).toString()
}

// Axios の baseURL 用（/api/v1 を含むベースを返す）
export function apiBaseHref(): string {
  const baseUrl = new URL(`${API_PREFIX}/`, getApiOrigin()) // 末尾スラッシュ付きで作る
  return baseUrl.toString().replace(/\/$/, '') // axios の baseURL は末尾スラッシュ無しに揃える
}
