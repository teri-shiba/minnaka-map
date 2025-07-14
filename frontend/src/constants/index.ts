import type { AuthProvider } from '~/types/auth-provider'

// ========================================================
// API Services Configuration
// ========================================================
export const API_SERVICES = {
  hotpepper: {
    endpoint: '/api_keys/hotpepper',
    serviceName: 'HotPepper',
  },
  maptiler: {
    endpoint: '/api_keys/maptiler',
    serviceName: 'MapTiler',
  },
} as const

export type SupportedService = keyof typeof API_SERVICES

// =========================================================
// Authentication Providers
// =========================================================
export const AUTH_PROVIDERS: readonly AuthProvider[] = [
  {
    name: 'Google',
    iconImg: '/icon_Google.webp',
    authUrl: 'google_oauth2',
  },
  {
    name: 'LINE',
    iconImg: '/icon_LINE.webp',
    authUrl: 'line',
  },
] as const

// ========================================================
// Geography & Location
// ========================================================
export const JAPAN_BOUNDS = {
  LAT_MIN: 26.0,
  LAT_MAX: 45.5,
  LNG_MIN: 123.0,
  LNG_MAX: 146.0,
} as const

// ========================================================
// Pagination
// ========================================================
export const PAGINATION = {
  FIRST_PAGE: 1,
  SECOND_PAGE: 2,
  CURRENT_PAGE_RANGE: 1,
  LAST_PAGE_OFFSET: 1,
  ELLIPSIS_THRESHOLD: 4,
  ELLIPSIS_START_OFFSET: 3,
  ELLIPSIS_END_OFFSET: 2,
} as const

// ========================================================
// Cache
// ========================================================
export const CACHE_DURATION = {
  RESTAURANT_INFO: 86400, // 24H (60 * 60 * 24)
} as const
