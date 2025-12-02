import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 bg-[#191970] shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-white">Capitalized</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
