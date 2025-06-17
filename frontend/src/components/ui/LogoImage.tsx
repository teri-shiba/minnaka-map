import Image from 'next/image'

interface LogoImageProps {
  width: number
  height: number
  className?: string
}

export default function LogoImage({ width, height, className }: LogoImageProps) {
  return (
    <Image
      alt="minnaka map"
      src="/logo.webp"
      width={width}
      height={height}
      priority
      className={className}
    />
  )
}
