import type { Buffer } from 'node:buffer'
import fs from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { fetchSharedList } from '~/services/fetch-shared-list'

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
  params: { shareUuid: string }
}) {
  const { shareUuid } = await params

  const [result, fontNoto, fontNotoJP, logo, figure] = await Promise.all([
    fetchSharedList(shareUuid),
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

  const isValid = result.success
    && result.data.favorites.length > 0
    && result.data.searchHistory.stationNames.length > 0

  if (!isValid) {
    return new ImageResponse((
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

  const stations = result.data.searchHistory.stationNames.join('・')
  const count = result.data.favorites.length

  return new ImageResponse(
    (
      <div style={containerStyle}>
        <div tw="relative m-auto flex h-full w-full rounded-2xl bg-white p-10">
          <div tw="flex flex-col justify-start items-start text-[#440A07] font-bold">
            <div tw="text-5xl flex">
              {stations}
              のまんなかのお店
              <span tw="px-2 text-[3.25rem]">{count}</span>
              選
            </div>
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
