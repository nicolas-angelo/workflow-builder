export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex h-dvh flex-col bg-background py-12 sm:px-6 lg:px-8">
      <div className="flex h-full flex-col items-center justify-center sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}
