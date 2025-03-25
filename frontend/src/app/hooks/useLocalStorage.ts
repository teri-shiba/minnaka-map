'use client'

import { useCallback, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    }
    catch (e) {
      console.error(`ローカルストレージの読み込みエラー: ${key}`, e)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)

      if (typeof window !== 'undefined') {
        const currentItem = window.localStorage.getItem(key)
        const newValue = JSON.stringify(valueToStore)

        if (currentItem !== newValue) {
          window.localStorage.setItem(key, newValue)
        }
      }
    }
    catch (e) {
      console.error(`ローカルストレージの保存エラー: ${key}`, e)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}
