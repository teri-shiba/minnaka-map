export interface TokenInfo {
  token: string
  restaurantId: string
  searchHistoryId: number
}

export type TokenMap = Record<string, TokenInfo>
