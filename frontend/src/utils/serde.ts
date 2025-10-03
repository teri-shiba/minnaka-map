import { isPlainObject, toCamelDeep, toSnakeDeep } from './case-convert'

export function toSnakeRequest<T>(value: T, enabled: boolean): T {
  if (!enabled || !isPlainObject(value))
    return value

  return toSnakeDeep(value as Record<string, unknown>) as unknown as T
}

export async function parseApiResponse<T>(response: Response, toCamel: boolean): Promise<T> {
  const contentType = (response.headers.get('content-type') ?? '').toLowerCase()
  const isText = contentType.includes('text/')
  const isNoContent = response.status === 204

  if (isText)
    return await response.text() as unknown as T

  if (isNoContent)
    return null as T

  const json = await response.json()
  return (toCamel ? toCamelDeep(json) : json) as T
}
