// Force dynamic rendering for all dashboard routes to prevent build-time issues
export const dynamic = 'force-dynamic'
export const revalidate = 0

import { DashboardShell } from '@/components/layout/dashboard-shell'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
