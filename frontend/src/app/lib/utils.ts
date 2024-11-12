import type { AxiosError, AxiosResponse } from 'axios'
import axios from 'axios'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fetcher(url: string) {
  return axios
    .get(url)
    .then((res: AxiosResponse) => res.data)
    .catch((err: AxiosError) => {
      console.error(err.message)
      throw err
    })
}
