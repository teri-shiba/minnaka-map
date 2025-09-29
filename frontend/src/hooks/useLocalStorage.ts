'use client'

import { useCallback, useEffect, useState } from 'react'
import { logger } from '~/lib/logger'

interface Options {
  refreshOnFocus?: boolean
}

const isBrowser = (): boolean => typeof window !== 'undefined'

function safeParseJson(raw: string): unknown | undefined {
  try {
    return JSON.parse(raw)
  }
  catch {
    return undefined
  }
}

function isSameStoredValue(storedJson: string | null, nextValue: unknown): boolean {
  if (storedJson === null)
    return false

  const nextJson = JSON.stringify(nextValue)

  if (typeof nextJson !== 'string')
    return false

  if (storedJson === nextJson)
    return true

  const parsed = safeParseJson(storedJson)
  if (parsed === undefined)
    return false

  return JSON.stringify(parsed) === nextJson
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: Options,
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser())
      return initialValue

    const item = window.localStorage.getItem(key)
    if (item === null)
      return initialValue

    const parsed = safeParseJson(item)
    if (parsed === undefined) {
      logger(new Error('localStorageに無効なJSONが保存されています'), {
        key,
        tags: { component: 'useLocalStorage: storedValue' },
      })

      return initialValue
    }

    return parsed as T
  })

  const refreshValue = useCallback(() => {
    if (!isBrowser())
      return

    const item = window.localStorage.getItem(key)
    if (!item)
      return

    const parsed = safeParseJson(item)
    if (parsed === undefined) {
      logger(new Error('localStorageに無効なJSONが保存されています'), {
        key,
        tags: { component: 'useLocalStorage: refreshValue' },
      })

      return
    }

    setStoredValue(parsed as T)
  }, [key])

  const setValue = useCallback((value: T | ((value: T) => T)) => {
    try {
      const valueToStore = typeof value === 'function'
        ? (value as (value: T) => T)(storedValue)
        : value

      setStoredValue(valueToStore)

      if (!isBrowser())
        return

      const storedJson = window.localStorage.getItem(key)
      if (isSameStoredValue(storedJson, valueToStore))
        return

      const serialized = JSON.stringify(valueToStore)
      if (typeof serialized !== 'string')
        return

      window.localStorage.setItem(key, serialized)
    }
    catch (error) {
      logger(error, {
        key,
        tags: { component: 'useLocalStorage: setValue' },
      })
    }
  }, [key, storedValue])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null)
        return

      if (e.storageArea && e.storageArea !== window.localStorage)
        return

      const parsed = safeParseJson(e.newValue)
      if (parsed === undefined) {
        logger(new Error('ストレージイベントで無効なJSONが検出されました'), {
          key,
          tags: { component: 'useLocalStorage: handleStorageChange' },
        })

        return
      }

      setStoredValue(parsed as T)
    }

    const handleWindowFocus = () => {
      if (options?.refreshOnFocus)
        refreshValue()
    }

    window.addEventListener('storage', handleStorageChange)
    if (options?.refreshOnFocus)
      window.addEventListener('focus', handleWindowFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      if (options?.refreshOnFocus)
        window.removeEventListener('focus', handleWindowFocus)
    }
  }, [key, options?.refreshOnFocus, refreshValue])

  return [storedValue, setValue, refreshValue] as const
}
