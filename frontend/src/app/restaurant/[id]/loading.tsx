import Section from '~/components/layout/section'
import { Skeleton } from '~/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableRow } from '~/components/ui/table'
import { basicInfoFields, facilitiesFields, headerMetaFields } from '~/data/restaurant-detail-fields'

export default function Loading() {
  return (
    <Section
      className="mb-6 md:mb-8"
      aria-busy="true"
      aria-label="店舗詳細情報を読み込み中"
    >
      <div aria-hidden="true">
        <div className="flex flex-col-reverse py-4 md:items-start md:justify-between md:border-b md:py-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-full max-w-80 md:h-8" />
            <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {headerMetaFields.map(field => (
                <li key={field.key}>
                  <span className="font-bold">
                    {field.label}
                    ：
                  </span>
                  <Skeleton className="inline-block h-4 w-16 align-bottom md:h-5" />
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-4 ml-auto flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="md:flex md:flex-row md:justify-between md:gap-6 md:pt-8">
          <Skeleton className="mb-6 h-60 w-full md:mb-0 md:size-56 md:shrink-0" />
          <div className="md:flex-1">
            <div className="pb-6">
              <h2 className="mb-4 border-l-4 border-primary pl-2 text-base md:text-lg">店舗基本情報</h2>
              <Table className="text-xs md:text-sm">
                <TableBody>
                  {/* 店舗名 */}
                  <TableRow>
                    <TableHead className="w-24 bg-secondary md:w-36">店舗名</TableHead>
                    <TableCell>
                      <Skeleton className="h-5 w-1/3 min-w-28" />
                    </TableCell>
                  </TableRow>

                  {/* 住所 */}
                  <TableRow>
                    <TableHead className="w-24 bg-secondary md:w-36">
                      住所
                    </TableHead>
                    <TableCell>
                      <Skeleton className="h-5 w-1/3 min-w-28" />
                      <Skeleton className="mt-4 h-44 w-full md:h-96" />
                    </TableCell>
                  </TableRow>

                  {/* 基本情報 */}
                  {basicInfoFields.map(field => (
                    <TableRow key={field.key}>
                      <TableHead className="w-24 bg-secondary md:w-36">
                        {field.label}
                      </TableHead>
                      <TableCell>
                        <Skeleton className="h-5 w-1/3 min-w-28" />
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* 店舗URL */}
                  <TableRow>
                    <TableHead className="w-24 bg-secondary md:w-36">
                      店舗URL
                    </TableHead>
                    <TableCell>
                      <Skeleton className="h-5 w-1/3 min-w-28" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div>
              <h2 className="mb-4 border-l-4 border-primary pl-2 text-base md:text-lg">
                席・設備
              </h2>
              <Table className="text-xs md:text-sm">
                <TableBody>
                  {facilitiesFields.map((field) => {
                    return (
                      <TableRow key={field.key}>
                        <TableHead className="w-24 bg-secondary md:w-36">
                          {field.label}
                        </TableHead>
                        <TableCell>
                          <Skeleton className="h-5 w-1/3 min-w-28" />
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
