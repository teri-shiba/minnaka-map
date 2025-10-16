/**
 * HotPepper APIのエラーコードをHTTPステータスコードに変換
 * @param code HotPepper APIのエラーコード（1000, 2000, 3000）
 * @returns HTTPステータスコード
 */

export function mapHotPepperErrorCode(code: number): number {
  switch (code) {
    case 1000: // サーバ障害エラー
      return 500
    case 2000: // APIキーまたはIPアドレスの認証エラー
      return 401
    case 3000: // パラメータ不正エラー
      return 400
    default: // 不明なエラーはリクエストエラー扱い
      return 400
  }
}
