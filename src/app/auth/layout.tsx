// Force dynamic rendering for all auth routes to prevent build-time issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
