
"use client"

import { Bell, Search, Activity } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

export function Header() {
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-background/50 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <SidebarTrigger className="md:hidden h-9 w-9" />
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search global records..." 
            className="pl-10 bg-secondary/50 border-none focus-visible:ring-primary/50 text-sm h-9 w-full"
            suppressHydrationWarning
          />
        </div>
        {/* Mobile Search Button */}
        <Button variant="ghost" size="icon" className="sm:hidden h-9 w-9 text-muted-foreground">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-2 mr-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">System Live</span>
        </div>
        
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white h-9 w-9">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
        </Button>

        <Badge variant="outline" className="border-white/10 bg-secondary/30 text-white font-mono text-[10px] h-8 px-3 rounded-full flex gap-2">
          <Activity className="w-3 h-3 text-primary" />
          PORTAL.PRO
        </Badge>
      </div>
    </header>
  )
}
