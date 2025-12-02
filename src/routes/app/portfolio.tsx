import { createFileRoute } from '@tanstack/react-router'
import { PortfolioScreen } from '@/screens/portfolio/PortfolioScreen'

export const Route = createFileRoute('/app/portfolio')({
  component: PortfolioScreen,
})
