import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { LuArrowUpRight } from 'react-icons/lu'
import FavoriteButton from '~/components/features/restaurant/favorite-button'
import ShareRestaurantDialog from '~/components/features/restaurant/share/share-restaurant-dialog'
import Section from '~/components/layout/section'
import { Table, TableBody, TableCell, TableHead, TableRow } from '~/components/ui/table'
import { basicInfoFields, facilitiesFields, headerMetaFields } from '~/data/restaurant-detail-fields'
import { fetchRestaurantDetail } from '~/services/fetch-restaurant-detail'
import { getFavoriteInitialData } from '~/services/get-favorite-initial-data'
import { getGoogleMapsEmbedUrl } from '~/services/get-google-maps-embed-url'
import { mapCauseToErrorCode } from '~/utils/map-cause-to-error-code'

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ historyId?: string, t?: string }>
}

export default async function RestaurantDetailPage({ params, searchParams }: RestaurantDetailPageProps) {
  const { id } = await params
  const { historyId, t: token } = await searchParams

  const result = await fetchRestaurantDetail(id)
  if (!result.success) {
    if (result.cause === 'NOT_FOUND')
      notFound()

    const errorCode = mapCauseToErrorCode(result.cause)
    redirect(`/?error=${errorCode}`)
  }

  const { data } = result

  const { resolvedHistoryId, favoriteData } = await getFavoriteInitialData({
    hotpepperId: id,
    historyId,
    token,
  })

  // Google Maps：埋め込みが取れたら iframe、それ以外は検索リンク
  const mapEmbedUrl = await getGoogleMapsEmbedUrl(`${data.name} ${data.address}`)
  const mapSearch = new URL('https://www.google.com/maps/search/')
  mapSearch.search = new URLSearchParams({ api: '1', query: `${data.name} ${data.address}` }).toString()

  return (
    <Section className="mb-6 md:mb-8">
      {/* ヘッダー */}
      <div className="flex flex-col-reverse py-4 md:items-start md:justify-between md:border-b md:py-6">
        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl">{data.name}</h1>
          <ul className="text-sm md:flex md:flex-row md:gap-3">
            {headerMetaFields.map(field => (
              <li key={field.key}>
                <span className="font-bold">
                  {field.label}
                  ：
                </span>
                {data[field.key as keyof typeof data] || '-'}
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-4 ml-auto flex gap-4">
          <ShareRestaurantDialog
            restaurantName={data.name}
            restaurantAddress={data.address}
            station={data.station}
          />
          <FavoriteButton
            hotpepperId={id}
            initialIsFavorite={favoriteData?.isFavorite ?? false}
            initialFavoriteId={favoriteData?.favoriteId ?? null}
            token={token}
            initialHistoryId={resolvedHistoryId}
          />
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="md:flex md:flex-row md:justify-between md:gap-6 md:pt-8">
        {/* 画像 */}
        <div className="mb-6 md:mb-0 md:shrink-0">
          <div className="relative max-w-96 overflow-hidden rounded-lg md:w-[223px]">
            <Image
              src={data.imageUrl || '/placeholder.svg'}
              alt={data.name}
              width={223}
              height={168}
              className="aspect-3/2 size-full object-cover md:aspect-square"
            />
          </div>
          <p className="pt-1.5 text-xs text-muted-foreground md:text-right">画像提供：ホットペッパー グルメ</p>
        </div>

        {/* テーブル */}
        <div className="md:flex-1">
          {/* 店舗基本情報 */}
          <div className="pb-6">
            <h2 className="mb-4 border-l-4 border-primary pl-2 text-base md:text-lg">店舗基本情報</h2>
            <Table className="text-xs md:text-sm">
              <TableBody>
                {/* 店舗名 */}
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">店舗名</TableHead>
                  <TableCell>{data.name || '-'}</TableCell>
                </TableRow>

                {/* 住所 */}
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">住所</TableHead>
                  <TableCell>
                    {data.address || '-'}
                    {data.address && (
                      <div className="relative mt-4 h-44 w-full md:h-96">
                        {mapEmbedUrl
                          ? (
                            /* eslint-disable-next-line react-dom/no-missing-iframe-sandbox */
                              <iframe
                                src={mapEmbedUrl}
                                width="600"
                                height="338"
                                style={{ border: 0 }}
                                allowFullScreen
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute left-0 top-0 size-full"
                              />
                            )
                          : (
                              <a
                                href={mapSearch.toString()}
                                aria-label="Google Mapsで場所を開く（新しいタブ）"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-600 hover:underline"
                              >
                                Google Maps で場所を開く
                                <LuArrowUpRight className="inline-block size-4 pl-0.5 align-bottom md:align-text-bottom" />
                              </a>
                            )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>

                {/* 基本情報 */}
                {basicInfoFields.map(field => (
                  <TableRow key={field.key}>
                    <TableHead className="w-24 bg-secondary md:w-36">{field.label}</TableHead>
                    <TableCell>{data[field.key as keyof typeof data] || '-'}</TableCell>
                  </TableRow>
                ))}

                {/* 店舗URL */}
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">店舗URL</TableHead>
                  <TableCell>
                    {data.urls
                      ? (
                          <a
                            href={data.urls}
                            aria-label="ホットペッパーグルメ店舗ページ（新しいタブ）"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-600 hover:underline"
                          >
                            <span>ホットペッパーグルメで予約・詳細を見る</span>
                            <LuArrowUpRight
                              className="inline-block size-4 pl-0.5 align-bottom md:align-text-bottom"
                              aria-hidden="true"
                            />
                            <span className="sr-only">（外部サイトが開きます）</span>
                          </a>
                        )
                      : '-'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div>
            <h2 className="mb-4 border-l-4 border-primary pl-2 text-base md:text-lg">席・設備</h2>
            <Table className="text-xs md:text-sm">
              <TableBody>
                {facilitiesFields.map((field) => {
                  const value = data[field.key as keyof typeof data]
                  const displayValue = value
                    ? (field.suffix ? `${value}${field.suffix}` : value)
                    : '-'

                  return (
                    <TableRow key={field.key}>
                      <TableHead className="w-24 bg-secondary md:w-36">
                        {field.label}
                      </TableHead>
                      <TableCell>{displayValue}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <p className="pt-3 text-right text-xs text-muted-foreground">
            Powered by
            {' '}
            <a
              href="http://webservice.recruit.co.jp/"
              className="text-sky-600"
            >
              ホットペッパーグルメ Webサービス
            </a>
          </p>
        </div>
      </div>
    </Section>
  )
}
