import { createFileRoute } from '@tanstack/react-router'
import { InvestmentsScreen } from '@/screens/investments/InvestmentsScreen'

export const Route = createFileRoute('/app/investments')({
  component: InvestmentsScreen,
})
