import type { AuthProvider } from '~/types/auth-provider'

// ===============================================
// Drawer Dimensions
// ===============================================
export const DRAWER_DVH = 30 as const // 30dvh
export const DRAWER_RATIO = DRAWER_DVH / 100 // 0.3

// ===============================================
// API Paths
// ===============================================
export const API_PREFIX = '/api/v1' as const

export const API_ENDPOINTS = {
  STATIONS: '/stations',
  MIDPOINT: '/midpoint',
  VALIDATE_COORDINATES: '/midpoint/validate',
  AUTH: '/auth',
  PROVIDER: '/provider',
  CURRENT_USER_STATUS: '/current/user/show_status',
  AUTH_SIGN_IN: '/auth/sign_in',
  AUTH_SIGN_OUT: '/auth/sign_out',
  USER_CONFIRMATIONS: '/user/confirmations',
} as const

export const dynamicPaths = {
  oauthProvider: (provider: string) => `${API_ENDPOINTS.AUTH}/${provider}`,
}

export type StaticEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS]

// ===============================================
// EXTERNAL API Paths
// ===============================================
export const EXTERNAL_ENDPOINTS = {
  HOTPEPPER_GOURMET_V1: '/hotpepper/gourmet/v1/',
} as const

// ===============================================
// API Services Configuration
// ===============================================
export const API_SERVICES = {
  hotpepper: {
    endpoint: 'api_keys/hotpepper',
    serviceName: 'HotPepper',
  },
  maptiler: {
    endpoint: 'api_keys/maptiler',
    serviceName: 'MapTiler',
  },
  googlemaps: {
    endpoint: 'api_keys/googlemaps',
    serviceName: 'GoogleMaps',
  },
} as const satisfies Record<
  string,
  { readonly endpoint: string, readonly serviceName: string }
>

export type SupportedService = keyof typeof API_SERVICES

// ===============================================
// Authentication Providers
// ===============================================
export const AUTH_PROVIDERS = [
  {
    name: 'Google',
    iconImg: '/icon_Google.webp',
    provider: 'google_oauth2',
  },
  {
    name: 'LINE',
    iconImg: '/icon_LINE.webp',
    provider: 'line',
  },
] as const satisfies ReadonlyArray<AuthProvider>

// ===============================================
// Geography & Location
// ===============================================
export const JAPAN_BOUNDS = {
  LAT_MIN: 26.0,
  LAT_MAX: 45.5,
  LNG_MIN: 123.0,
  LNG_MAX: 146.0,
} as const

// ===============================================
// Pagination
// ===============================================
export const PAGINATION = {
  FIRST_PAGE: 1,
  SECOND_PAGE: 2,
  CURRENT_PAGE_RANGE: 1,
  LAST_PAGE_OFFSET: 1,
  ELLIPSIS_THRESHOLD: 4,
  ELLIPSIS_START_OFFSET: 3,
  ELLIPSIS_END_OFFSET: 2,
} as const

export const FAVORITES_FIRST_PAGE = 1 as const
export const FAVORITE_GROUPS_PER_PAGE = 3 as const

// ===============================================
// Cache
// ===============================================
export const CACHE_DURATION = {
  /* 24H (60 * 60 * 24) */
  RESTAURANT_INFO: 60 * 60 * 24,
} as const

// ===============================================
// Restaurant Marker Options
// ===============================================
export const ICON = {
  SIZE: [40, 44] as [number, number],
  ANCHOR: [20, 34] as [number, number],
} as const

// ===============================================
// Display Restaurant Card on Map
// ===============================================
export const CARD_POSITION = {
  CARD_WIDTH: 240,
  CARD_HEIGHT: 280,
  OFFSET: 5,
  MARGIN: 10,
} as const

// ===============================================
// Sort Restaurant
// ===============================================
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
