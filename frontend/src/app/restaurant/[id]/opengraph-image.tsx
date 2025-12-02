import type { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { fetchRestaurantDetail } from '~/services/fetch-restaurant-detail'

export const runtime = 'nodejs'

const OG_WIDTH = 1200
const OG_HEIGHT = 630

async function loadFont(filename: string): Promise<Buffer> {
  return fs.readFile(path.join(process.cwd(), 'src/fonts', filename))
}

async function loadImageAsBase64(filename: string): Promise<string> {
  const data = await fs.readFile(path.join(process.cwd(), 'public', filename))
  return `data:image/png;base64,${data.toString('base64')}`
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [result, fontNoto, fontNotoJP, logo, figure] = await Promise.all([
    fetchRestaurantDetail(id),
    loadFont('NotoSans-Bold.ttf'),
    loadFont('NotoSansJP-Bold.ttf'),
    loadImageAsBase64('logo.png'),
    loadImageAsBase64('figure_ogp.png'),
  ])

  const fonts = [
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
  ]

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100%',
    width: '100%',
    padding: '3rem',
    backgroundColor: '#FF9659',
    fontFamily: 'NotoSans, NotoSansJP',
    fontWeight: 700,
  }

  const name = result.success && result.data.name
  const genre = result.success && result.data.genreName
  const address = result.success && result.data.address

  if (!result.success || name === '') {
    return new ImageResponse(
      (
        <div style={containerStyle}>
          <div tw="relative m-auto flex h-full w-full items-center justify-center rounded-2xl bg-white p-10">
            <div tw="flex flex-col items-center pb-56 font-bold text-[#60424C]">
              <div tw="mb-6 text-5xl">みんなのまんなか</div>
              <img src={logo} width={450} height={58} alt="" />
            </div>

            <div tw="absolute bottom-0 inset-x-0 flex justify-center">
              <img src={figure} width={430} height={290} alt="" />
            </div>
          </div>
        </div>
      ),
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        fonts,
      },
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          height: '100%',
          width: '100%',
          padding: '3rem',
          backgroundColor: '#FF9659',
          fontFamily: 'NotoSans, NotoSansJP',
          fontWeight: 700,
        }}
      >
        <div tw="relative m-auto flex h-full w-full rounded-2xl bg-white p-10">
          <div tw="flex flex-col justify-start items-start text-[#440A07] font-bold">
            {genre && (
              <div tw="rounded-full bg-orange-50 mb-6 px-5 pt-4 pb-5 text-3xl leading-none">
                {genre}
              </div>
            )}
            <div tw="mb-6 text-5xl">{name}</div>
            <div tw="text-3xl">{address}</div>
          </div>

          <div tw="absolute bottom-10 left-10 flex">
            <img src={logo} width={450} height={58} alt="" />
          </div>

          <div tw="absolute bottom-0 right-10 flex">
            <img src={figure} width={350} height={240} alt="" />
          </div>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts,
    },
  )
}
