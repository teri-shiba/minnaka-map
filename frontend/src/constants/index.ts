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
// Restaurant Marker Options
// ========================================================
export const ICON = {
  SIZE: [40, 44] as [number, number],
  ANCHOR: [20, 34] as [number, number],
} as const

// ========================================================
// Display Restaurant Card on Map
// ========================================================
export const CARD_POSITION = {
  CARD_WIDTH: 240,
  CARD_HEIGHT: 280,
  OFFSET: 5,
  MARGIN: 10,
} as const

// ========================================================
// Sort Restaurant
// ========================================================
export const SORT_GENRE = [
  { code: 'G001', name: '居酒屋' },
  { code: 'G002', name: 'ダイニングバー・バル' },
  { code: 'G003', name: '創作料理' },
  { code: 'G004', name: '和食' },
  { code: 'G005', name: '洋食' },
  { code: 'G006', name: 'イタリアン・フレンチ' },
  { code: 'G007', name: '中華' },
  { code: 'G008', name: '焼肉・ホルモン' },
  { code: 'G017', name: '韓国料理' },
  { code: 'G009', name: 'アジア・エスニック料理' },
  { code: 'G010', name: '各国料理' },
  { code: 'G011', name: 'カラオケ・パーティ' },
  { code: 'G012', name: 'バー・カクテル' },
  { code: 'G013', name: 'ラーメン' },
  { code: 'G016', name: 'お好み焼き・もんじゃ' },
  { code: 'G014', name: 'カフェ・スイーツ' },
  { code: 'G015', name: 'その他グルメ' },
] as const
