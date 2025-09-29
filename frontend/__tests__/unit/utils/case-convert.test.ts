import { isPlainObject, toCamelDeep, toSnakeDeep } from '~/utils/case-convert'

describe('isPlainObject', () => {
  it('プレーンオブジェクトのとき、true を返す', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
  })

  it('配列や null Data などのとき、false を返す', () => {
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(new Date())).toBe(false)
  })
})

describe('toCamelDeep', () => {
  it('オブジェクトのキーをキャメルに変換し、入れ子も処理する', () => {
    const input = {
      'user_id': 1,
      'kebab-case': 'ok',
      'profile': { 'first_name': 'Taro', 'last-name': 'Yamada' },
      'items': [{ shop_id: 'a_1' }, { 'shop-name': 'abc' }, 123],
    }

    const output = toCamelDeep(input)
    expect(output).toEqual({
      userId: 1,
      kebabCase: 'ok',
      profile: { firstName: 'Taro', lastName: 'Yamada' },
      items: [{ shopId: 'a_1' }, { shopName: 'abc' }, 123],
    })
  })

  it('配列やプリミティブはそのまま返す', () => {
    expect(toCamelDeep([1, 'a', true])).toEqual([1, 'a', true])
    expect(toCamelDeep('str')).toBe('str')
    expect(toCamelDeep(10)).toBe(10)
    expect(toCamelDeep(null)).toBe(null)
    expect(toCamelDeep(undefined as unknown as string)).toBeUndefined()
  })

  it('値が Date の場合でも値は変換せず、キーのみ変換する', () => {
    const date = new Date('2025-01-01T00:00:00Z')
    const input = { created_at: date }
    const output = toCamelDeep(input)
    expect(output).toEqual({ createdAt: date })
    expect((output as any).createdAt).toBeInstanceOf(Date)
  })

  it('snake -> camel -> snake の往復でキーが元に戻る (正規化前提)', () => {
    const snake = { user_id: 1, profile: { first_name: 'Taro' }, items: [{ shop_id: 'x' }] }
    const round = toSnakeDeep(toCamelDeep(snake))
    expect(round).toEqual(snake)
  })
})

describe('toSnakeDeep', () => {
  it('オブジェクトのキーをスネークに変換し、入れ子も処理する', () => {
    const input = {
      'userId': 1,
      'UserName': 'Yamada',
      'kebab case': 'ok',
      'profile': { firstName: 'Taro', lastName: 'Yamada' },
      'items': [{ shopId: 'a' }, 123],
    }

    const output = toSnakeDeep(input)
    expect(output).toEqual({
      user_id: 1,
      user_name: 'Yamada',
      kebab_case: 'ok',
      profile: { first_name: 'Taro', last_name: 'Yamada' },
      items: [{ shop_id: 'a' }, 123],
    })
  })

  it(' camel -> snake -> camel の往復でキーが元に戻る (正規化前提)', () => {
    const camel = { userId: 1, profile: { firstName: 'Taro' }, items: [{ shopId: 'x' }] }
    const round = toCamelDeep(toSnakeDeep(camel))
    expect(round).toEqual(camel)
  })

  it('連続する区切りや先頭/末尾のアンダースコア、連続大文字を正しく正規化する', () => {
    const input = { '__UserID__': 1, 'multi--dash key': 2, 'URLValue': 3 }
    const output = toSnakeDeep(input)
    expect(output).toEqual({
      user_id: 1,
      multi_dash_key: 2,
      url_value: 3,
    })
  })
})
