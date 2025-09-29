export function externalHref(
  baseOrigin: string | undefined,
  path: string,
  params?: URLSearchParams | Record<string, string>,
) {
  if (!baseOrigin)
    throw new Error('External API base URL is not set')

  const origin = baseOrigin.replace(/\/+$/, '')
  const normalizedPath = `/${path.replace(/^\/+/, '')}`

  const url = new URL(normalizedPath, origin)

  if (params) {
    const sp = params instanceof URLSearchParams ? params : new URLSearchParams(params)
    url.search = sp.toString()
  }

  return url.toString()
}
