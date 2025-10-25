export function buildHotPepperShop(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name: `テスト店舗 ${id}`,
    address: '東京都千代田区神田1-1-1',
    lat: 35.123456,
    lng: 139.123456,
    photo: {
      pc: {
        l: `https://img.example.com/${id}_l.jpg`,
        m: `https://img.example.com/${id}_m.jpg`,
        s: `https://img.example.com/${id}_s.jpg`,
      },
    },
    logo_image: `https://img.example.com/${id}_logo.jpg`,
    urls: { pc: `https://example.com/${id}` },
    genre: { code: 'G001', name: '居酒屋', catch: '' },
    open: '11:00～22:00',
    close: '年末年始休',
    budget: '3000円',
    access: '最寄り駅から徒歩5分',
    ...overrides,
  }
}

export function buildHotPepperResults(shops: any[], totalAvailable: number) {
  return {
    results: {
      results_available: totalAvailable,
      shop: shops,
    },
  }
}
