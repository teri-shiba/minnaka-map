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

// ========================================================
// Sort Restaurant
// ========================================================
export const SORT_GENRE = [
  {
    genreCode: 'G001',
    genreName: '居酒屋',
  },
  {
    genreCode: 'G002',
    genreName: 'ダイニングバー・バル',
  },
  {
    genreCode: 'G003',
    genreName: '創作料理',
  },
  {
    genreCode: 'G004',
    genreName: '和食',
  },
  {
    genreCode: 'G005',
    genreName: '洋食',
  },
  {
    genreCode: 'G006',
    genreName: 'イタリアン・フレンチ',
  },
  {
    genreCode: 'G007',
    genreName: '中華',
  },
  {
    genreCode: 'G008',
    genreName: '焼肉・ホルモン',
  },
  {
    genreCode: 'G017',
    genreName: '韓国料理',
  },
  {
    genreCode: 'G009',
    genreName: 'アジア・エスニック料理',
  },
  {
    genreCode: 'G010',
    genreName: '各国料理',
  },
  {
    genreCode: 'G011',
    genreName: 'カラオケ・パーティ',
  },
  {
    genreCode: 'G012',
    genreName: 'バー・カクテル',
  },
  {
    genreCode: 'G013',
    genreName: 'ラーメン',
  },
  {
    genreCode: 'G016',
    genreName: 'お好み焼き・もんじゃ',
  },
  {
    genreCode: 'G014',
    genreName: 'カフェ・スイーツ',
  },
  {
    genreCode: 'G015',
    genreName: 'その他グルメ',
  },
] as const
