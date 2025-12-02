import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { tokenManager } from '@/lib/api'

export const Route = createFileRoute('/auth')({
  beforeLoad: () => {
    const isAuthenticated = tokenManager.verifyToken()
    if (isAuthenticated) {
      throw redirect({ to: '/app/investments' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  )
}
