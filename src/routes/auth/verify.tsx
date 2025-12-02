import { createFileRoute } from '@tanstack/react-router'
import { VerifyPhoneScreen } from '@/screens/auth/VerifyPhoneScreen'

export const Route = createFileRoute('/auth/verify')({
  component: VerifyPhoneScreen,
})
