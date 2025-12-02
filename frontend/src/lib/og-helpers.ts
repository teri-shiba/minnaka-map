import type { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'

// フォントファイルを読み込む
export async function loadFont(filename: string): Promise<Buffer> {
  return fs.readFile(path.join(process.cwd(), 'src/fonts', filename))
}

// 画像ファイルを Base64 形式で読み込む
export async function loadImageAsBase64(filename: string): Promise<string> {
  const data = await fs.readFile(path.join(process.cwd(), 'public', filename))
  return `data:image/png;base64,${data.toString('base64')}`
}

// デフォルトの OGP 画像を返す（フォールバック用）
export async function loadDefaultOgImage(): Promise<Response> {
  const imagePath = path.join(process.cwd(), 'public/og-default.png')
  const imageBuffer = await fs.readFile(imagePath)

  return new Response(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

// ImageResponse 用のオプションを生成する
export function createOgOptions(fontNoto: Buffer, fontNotoJP: Buffer) {
  return {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'NotoSans',
        data: fontNoto,
        weight: 700 as const,
        style: 'normal' as const,
      },
      {
        name: 'NotoSansJP',
        data: fontNotoJP,
        weight: 700 as const,
        style: 'normal' as const,
      },
    ],
  }
}
