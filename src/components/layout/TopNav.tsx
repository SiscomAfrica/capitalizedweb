import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold">Capitalized</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
