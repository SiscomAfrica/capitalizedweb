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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all',
                isActive
                  ? 'text-[#191970]'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={cn(
                "h-6 w-6",
                isActive && "stroke-2"
              )} />
              <span className={cn(
                "text-xs",
                isActive ? "font-semibold" : "font-medium"
              )}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
