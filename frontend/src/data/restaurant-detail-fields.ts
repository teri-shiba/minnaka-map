interface TableField {
  key: string
  label: string
  suffix?: string
}

export const headerMetaFields: TableField[] = [
  { key: 'station', label: '最寄駅' },
  { key: 'genreName', label: 'ジャンル' },
  { key: 'budget', label: '予算' },
]

export const basicInfoFields: TableField[] = [
  { key: 'access', label: 'アクセス' },
  { key: 'open', label: '営業時間' },
  { key: 'close', label: '定休日' },
  { key: 'budget', label: '予算' },
  { key: 'card', label: 'クレジットカード' },
]

export const facilitiesFields: TableField[] = [
  { key: 'capacity', label: '総席数', suffix: '席' },
  { key: 'privateRoom', label: '個室' },
  { key: 'charter', label: '貸切' },
  { key: 'wifi', label: 'WiFi' },
  { key: 'nonSmoking', label: '禁煙・喫煙' },
  { key: 'parking', label: '駐車場' },
]
