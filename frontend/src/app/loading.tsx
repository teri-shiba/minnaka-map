import LoadingIcon from '~/public/loading.svg'

export default function Loading() {
  return (
    <div className="grid h-svh w-svw place-content-center bg-white">
      <LoadingIcon
        width={35}
        height={35}
      />
    </div>
  )
}
