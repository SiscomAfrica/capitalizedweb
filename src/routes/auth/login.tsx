import { createFileRoute } from '@tanstack/react-router'
import { LoginScreen } from '@/screens/auth/LoginScreen'

export const Route = createFileRoute('/auth/login')({
  component: LoginScreen,
})
