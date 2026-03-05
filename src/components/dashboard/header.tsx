"use client"

import { Bell, Search, User, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  return (
    <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-background/50 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <SidebarTrigger className="md:hidden h-9 w-9" />
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search records..." 
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
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white h-9 w-9">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-1 pr-1 md:pr-3 flex items-center gap-2 md:gap-3 rounded-full hover:bg-secondary/50 h-9">
              <Avatar className="w-7 h-7 md:w-8 md:h-8">
                <AvatarImage src="https://picsum.photos/seed/doctor/100/100" />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-white">Dr. Sarah Chen</p>
                <p className="text-[10px] text-muted-foreground">Gastroenterologist</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass-card mt-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Security</DropdownMenuItem>
            <DropdownMenuItem>Help Center</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
