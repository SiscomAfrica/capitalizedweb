import { createFileRoute, redirect } from '@tanstack/react-router'
import { tokenManager } from '@/lib/api'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    const isAuthenticated = tokenManager.verifyToken()
    if (!isAuthenticated) {
      throw redirect({ to: '/auth/login' })
    }
    throw redirect({ to: '/app/investments' })
  },
})
