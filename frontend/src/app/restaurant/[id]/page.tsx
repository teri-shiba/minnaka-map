import Image from 'next/image'
import Link from 'next/link'
import Section from '~/components/layout/Section'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table/Table'
import { fetchRestaurantDetail } from '~/services/fetch-restaurant-detail'

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { id } = await params
  const restaurant = await fetchRestaurantDetail(id)

  return (
    <Section>
      <div className="border-b">
        <h2>{restaurant.name}</h2>
        <ul className="md:flex md:flex-row md:gap-4">
          <li>
            <span className="font-bold">最寄駅：</span>
            {restaurant.station}
          </li>
          <li>
            <span className="font-bold">ジャンル：</span>
            {restaurant.genreName}
          </li>
          <li>
            <span className="font-bold">予算：</span>
            {restaurant.budget}
          </li>
        </ul>
      </div>
      <div className="md:flex md:flex-row md:justify-between md:gap-6">
        <div className="md:flex-shrink-0">
          <Image
            src={restaurant.imageUrl}
            alt={restaurant.name}
            width={223}
            height={168}
          />
          <p className="text-right text-muted-foreground text-xs">画像提供：ホットペッパー グルメ</p>
        </div>
        <div className="">
          <div className="">
            <h3 className="">店舗基本情報</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableHead className="w-[150px]">店舗名</TableHead>
                  <TableCell>{restaurant.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">住所</TableHead>
                  <TableCell>{restaurant.address}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">アクセス</TableHead>
                  <TableCell>{restaurant.access}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">営業時間</TableHead>
                  <TableCell>{restaurant.open}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">定休日</TableHead>
                  <TableCell>{restaurant.close}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">予算</TableHead>
                  <TableCell>{restaurant.budget}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">クレジットカード</TableHead>
                  <TableCell>{restaurant.card}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">店舗URL</TableHead>
                  <TableCell>
                    <Link href={restaurant.urls} className='text-sky-600 hover:underline'>{restaurant.urls}</Link>
                    <p className='text-sm'>（ホットペッパーに遷移します）</p>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="">
            <h3 className="">席・設備</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableHead className="w-[150px]">総席数</TableHead>
                  <TableCell>{restaurant.capacity}席</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">個室</TableHead>
                  <TableCell>{restaurant.privateRoom}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">貸切</TableHead>
                  <TableCell>{restaurant.charter}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">WiFi</TableHead>
                  <TableCell>{restaurant.wifi}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">禁煙・喫煙</TableHead>
                  <TableCell>{restaurant.nonSmoking}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHead className="w-[150px]">駐車場</TableHead>
                  <TableCell>{restaurant.parking}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Section>
  )
}
