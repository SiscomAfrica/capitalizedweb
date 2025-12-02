import { createFileRoute } from '@tanstack/react-router'
import { SubscriptionScreen } from '@/screens/subscription/SubscriptionScreen'

export const Route = createFileRoute('/app/subscription')({
  component: SubscriptionScreen,
})
