import { Link, useLocation } from '@tanstack/react-router'
import { Home, TrendingUp, Wallet, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/app/investments', label: 'Investments', icon: Home },
  { to: '/app/subscription', label: 'Subscription', icon: TrendingUp },
  { to: '/app/portfolio', label: 'Portfolio', icon: Wallet },
  { to: '/app/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
