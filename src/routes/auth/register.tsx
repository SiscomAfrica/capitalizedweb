import { createFileRoute } from '@tanstack/react-router'
import { RegisterScreen } from '@/screens/auth/RegisterScreen'

export const Route = createFileRoute('/auth/register')({
  component: RegisterScreen,
})
