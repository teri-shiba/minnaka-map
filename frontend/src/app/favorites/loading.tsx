import LoadingIcon from '~/public/loading.svg'

export default function Loading() {
  return (
    <div
      className="flex min-h-[600px] items-center justify-center"
      role="status"
      aria-label="読み込み中"
    >
      <LoadingIcon width={35} height={35} />
    </div>
  )
}
