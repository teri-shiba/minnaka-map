'use client'

import { useCallback, useEffect, useState } from 'react'
// import { logger } from '~/lib/logger'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    refreshOnFocus?: boolean
  },
) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    }
    catch (error) {
      console.error(error)
      // logger(error, {
      //   key,
      //   tags: { component: 'useLocalStorage: storedValue' },
      // })
      return initialValue
    }
  })

  const refreshValue = useCallback(() => {
    if (typeof window == 'undefined') {
      return
    }

    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsedItem = JSON.parse(item)
        setStoredValue(parsedItem)
      }
    }
    catch (error) {
      console.error(error)
      // logger(error, {
      //   key,
      //   tags: { component: 'useLocalStorage: refreshValue' },
      // })
    }
  }, [key])

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = typeof value === 'function'
        ? (value as (val: T) => T)(storedValue)
        : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        const currentItem = window.localStorage.getItem(key)
        const newValue = JSON.stringify(valueToStore)

        if (currentItem !== newValue) {
          window.localStorage.setItem(key, newValue)
        }
      }
    }
    catch (error) {
      console.error(error)
      // logger(error, {
      //   key,
      //   tags: { component: 'useLocalStorage: setValue' },
      // })
    }
  }, [key, storedValue])

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue)
          setStoredValue(newValue)
        }
        catch (error) {
          console.error(error)
          // logger(error, {
          //   key,
          //   tags: { component: 'useLocalStorage: handleStorageChange' },
          // })
        }
      }
    }

    const handleWindowFocus = () => {
      if (options?.refreshOnFocus) {
        refreshValue()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    if (options?.refreshOnFocus) {
      window.addEventListener('focus', handleWindowFocus)
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange)

      if (options?.refreshOnFocus) {
        window.removeEventListener('focus', handleWindowFocus)
      }
    }
  }, [key, options?.refreshOnFocus, refreshValue])

  return [storedValue, setValue, refreshValue] as const
}
