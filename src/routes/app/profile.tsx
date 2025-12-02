import { createFileRoute } from '@tanstack/react-router'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'

export const Route = createFileRoute('/app/profile')({
  component: ProfileScreen,
})
