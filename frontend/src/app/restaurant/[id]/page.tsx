import Image from 'next/image'
import { LuArrowUpRight } from 'react-icons/lu'
import FavoriteButton from '~/components/features/restaurant/FavoriteButton'
import Section from '~/components/layout/Section'
import ShareRestaurantDialog from '~/components/ui/dialogs/ShareRestaurantDialog'
import { Table, TableBody, TableCell, TableHead, TableRow } from '~/components/ui/table/Table'
import { fetchRestaurantDetail } from '~/services/fetch-restaurant-detail'
import { getApiKey } from '~/services/get-api-key'

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: { historyId?: string }
}

export default async function RestaurantDetailPage({ params, searchParams }: RestaurantDetailPageProps) {
  const { id } = await params
  const { historyId } = await searchParams

  const restaurant = await fetchRestaurantDetail(id)
  const googleMapsApiKey = await getApiKey('googlemaps')

  const {
    // 基本情報
    name,
    address,
    access,
    station,
    genreName,
    budget,
    imageUrl,

    // 営業情報
    open,
    close,
    card,
    urls,

    // 設備情報
    capacity,
    privateRoom,
    charter,
    nonSmoking,
    wifi,
    parking,
  } = restaurant

  const query = encodeURIComponent(`${name} ${address}`)
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${query}`

  return (
    <Section className="mb-6 md:mb-8">
      <div className="flex flex-col-reverse py-4 md:items-start md:justify-between md:border-b md:py-6">
        <div className="space-y-2">
          <h2>{name}</h2>
          <ul className="text-sm md:flex md:flex-row md:gap-3">
            <li>
              <span className="font-bold">最寄駅：</span>
              {station}
            </li>
            <li>
              <span className="font-bold">ジャンル：</span>
              {genreName}
            </li>
            <li>
              <span className="font-bold">予算：</span>
              {budget}
            </li>
          </ul>
        </div>
        <div className="mb-4 ml-auto flex gap-4">
          <ShareRestaurantDialog
            restaurantName={name}
            restaurantAddress={address}
            station={station}
          />
          <FavoriteButton
            hotPepperId={id}
            initialHistoryId={historyId}
          />
        </div>
      </div>
      <div className="md:flex md:flex-row md:justify-between md:gap-6 md:pt-8">
        <div className="mx-auto mb-6 md:mb-0 md:shrink-0">
          <div className="relative max-w-96 overflow-hidden rounded-lg bg-gray-100 md:w-[223px]">
            <Image
              src={imageUrl || '/placeholder.svg'}
              alt={name}
              width={223}
              height={168}
              className="aspect-3/2 size-full object-cover blur-[0.5px] brightness-105 md:aspect-square"
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 70% 60% at center, transparent 40%, rgba(0,0,0,0.08) 80%)',
              }}
            />
          </div>
          <p className="pt-1.5 text-right text-xs text-muted-foreground">画像提供：ホットペッパー グルメ</p>
        </div>
        <div className="md:flex-1">
          <div className="pb-6">
            <h3 className="mb-4 border-l-4 border-primary pl-2">店舗基本情報</h3>
            <Table className="text-xs md:text-sm">
              <TableBody>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">店舗名</TableHead>
                  <TableCell>{name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">住所</TableHead>
                  <TableCell>
                    {address}
                    <div className="relative mt-4 h-44 w-full md:h-96">
                      {/* eslint-disable-next-line react-dom/no-missing-iframe-sandbox */}
                      <iframe
                        src={mapUrl}
                        width="600"
                        height="338"
                        style={{ border: 0 }}
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute left-0 top-0 size-full"
                      >
                      </iframe>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">アクセス</TableHead>
                  <TableCell>{access}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">営業時間</TableHead>
                  <TableCell>{open}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">定休日</TableHead>
                  <TableCell>{close}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">予算</TableHead>
                  <TableCell>{budget}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">クレジットカード</TableHead>
                  <TableCell>{card}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">店舗URL</TableHead>
                  <TableCell>
                    <a
                      href={urls}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="ホットペッパーグルメ店舗ページ（新しいタブで開きます）"
                      className="text-sky-600 hover:underline"
                    >
                      ホットペッパーグルメ店舗ページ
                      <LuArrowUpRight className="inline-block size-4 pl-0.5 align-bottom md:align-text-bottom" />
                    </a>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div>
            <h3 className="mb-4 border-l-4 border-primary pl-2">席・設備</h3>
            <Table className="text-xs md:text-sm">
              <TableBody>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">総席数</TableHead>
                  <TableCell>
                    {capacity}
                    席
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">個室</TableHead>
                  <TableCell>{privateRoom}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">貸切</TableHead>
                  <TableCell>{charter}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">WiFi</TableHead>
                  <TableCell>{wifi}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">禁煙・喫煙</TableHead>
                  <TableCell>{nonSmoking}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-24 bg-secondary md:w-36">駐車場</TableHead>
                  <TableCell>{parking}</TableCell>
                </TableRow>
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
