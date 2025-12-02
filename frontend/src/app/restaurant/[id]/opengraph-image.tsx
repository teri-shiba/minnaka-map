import { ImageResponse } from 'next/og'
import { createOgOptions, loadDefaultOgImage, loadFont, loadImageAsBase64 } from '~/lib/og-helpers'
import { fetchRestaurantDetail } from '~/services/fetch-restaurant-detail'

export const runtime = 'nodejs'

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await fetchRestaurantDetail(id)

  if (!result.success || result.data.name === '')
    return loadDefaultOgImage()

  const name = result.data.name
  const genre = result.data.genreName
  const address = result.data.address

  const [fontNoto, fontNotoJP, logo, figure] = await Promise.all([
    loadFont('NotoSans-Bold.ttf'),
    loadFont('NotoSansJP-Bold.ttf'),
    loadImageAsBase64('logo.png'),
    loadImageAsBase64('figure_ogp.png'),
  ])

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
    createOgOptions(fontNoto, fontNotoJP),
  )
}
