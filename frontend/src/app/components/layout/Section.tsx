export function Section({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  return (
    <section className={className}>
      <div className="mx-auto max-w-screen-lg px-5">
        {children}
      </div>
    </section>
  )
}
