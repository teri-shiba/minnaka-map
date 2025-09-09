type JsonLike = Record<string, unknown> | unknown[]

function toCamel(key: string) {
  return key.replace(/[_-]([a-z])/g, (_, letter) => letter.toUpperCase())
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export function camelizeKeysDeep<T>(input: T): T {
  if (Array.isArray(input))
    return input.map(item => camelizeKeysDeep(item)) as unknown as T

  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) {
      const newKey = toCamel(key)
      const newValue = Array.isArray(value) || isPlainObject(value) ? camelizeKeysDeep(value as JsonLike) : value
      out[newKey] = newValue
    }
    return out as T
  }
  return input
}
