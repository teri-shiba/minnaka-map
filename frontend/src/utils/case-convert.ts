type JsonLike = Record<string, unknown> | unknown[]

function toCamel(key: string) {
  return key.replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase())
}

function toSnake(key: string) {
  return key
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2') // URLValue -> URL_Value
    .replace(/([a-z\d])([A-Z])/g, '$1_$2') // userID -> user_ID
    .replace(/[-\s]/g, '_') // ハイフン/空白を _
    .replace(/_{2,}/g, '_') // 連続 _ を圧縮
    .toLowerCase()
    .replace(/^_+|_+$/g, '') // 先頭/末尾 _ を除去
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object')
    return false

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function isTraversable(value: unknown): value is JsonLike {
  return Array.isArray(value) || isPlainObject(value)
}

function convertDeep<T>(input: T, mapKey: (key: string) => string): T {
  if (Array.isArray(input))
    return input.map(item => convertDeep(item as any, mapKey)) as unknown as T

  if (isPlainObject(input)) {
    const output: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      const newKey = mapKey(key)
      output[newKey] = isTraversable(value) ? convertDeep(value as JsonLike, mapKey) : value
    }
    return output as T
  }
  return input
}

export function toCamelDeep<T>(input: T): T {
  return convertDeep(input, toCamel)
}

export function toSnakeDeep<T>(input: T): T {
  return convertDeep(input, toSnake)
}
