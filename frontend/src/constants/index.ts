// =============================================================================
// API Services Configuration
// =============================================================================
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
