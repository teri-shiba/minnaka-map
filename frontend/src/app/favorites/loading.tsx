import LoadingIcon from '~/public/loading.svg'

export default function Loading() {
  return (
    <div className="flex min-h-[600px] items-center justify-center">
      <LoadingIcon width={35} height={35} />
    </div>
  )
}
