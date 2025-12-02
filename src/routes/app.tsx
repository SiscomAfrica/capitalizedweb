import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { tokenManager } from '@/lib/api'
import { TopNav } from '@/components/layout/TopNav'
import { BottomNav } from '@/components/layout/BottomNav'

export const Route = createFileRoute('/app')({
  beforeLoad: () => {
    const isAuthenticated = tokenManager.verifyToken()
    if (!isAuthenticated) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopNav />
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
