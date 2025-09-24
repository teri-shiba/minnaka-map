type JsonLike = Record<string, unknown> | unknown[]

function toCamel(key: string) {
  return key.replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase())
}

function toSnake(key: string) {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // 略語 + 単語の境界線: URLValue -> URL_Value
    .replace(/([a-z\d])([A-Z])/g, '$1_$2') // 小文字/数字 + 大文字の境界線: userID -> user_ID
    .replace(/[-\s]/g, '_') // ハイフン/空白はアンダースコア
    .replace(/_{2,}/g, '_') // 連続アンダースコア圧縮
    .toLowerCase() // 小文字に変換
    .replace(/^_+|_+$/g, '') // 先頭/末尾ののアンダースコアを除去
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function toCamelDeep<T>(input: T): T {
  if (Array.isArray(input))
    return input.map(item => toCamelDeep(item)) as unknown as T

  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      const newKey = toCamel(key)
      const newValue = Array.isArray(value) || isPlainObject(value) ? toCamelDeep(value as JsonLike) : value
      out[newKey] = newValue
    }
    return out as T
  }
  return input
}

export function toSnakeDeep<T>(input: T): T {
  if (Array.isArray(input))
    return input.map(item => toSnakeDeep(item)) as unknown as T

  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      const newKey = toSnake(key)
      const newValue = Array.isArray(value) || isPlainObject(value) ? toSnakeDeep(value as JsonLike) : value
      out[newKey] = newValue
    }
    return out as T
  }
  return input
}
