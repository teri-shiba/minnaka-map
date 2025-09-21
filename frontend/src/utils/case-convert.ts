type JsonLike = Record<string, unknown> | unknown[]

function toCamel(key: string) {
  return key.replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase())
}

function toSnake(key: string) {
  return key.replace(/([A-Z])/g, '_$1') // camel/Pascal を区切る
    .replace(/[-\s]/g, '_') // kebab も念のため
    .replace(/_{2,}/g, '_') // 二重アンダースコア圧縮
    .toLowerCase()
    .replace(/^_+/, '') // 先頭のアンダースコアは除去
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
