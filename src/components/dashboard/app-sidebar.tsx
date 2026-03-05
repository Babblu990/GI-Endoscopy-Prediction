"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Upload,
  FileText,
  Settings,
  BrainCircuit,
  Activity,
  LogOut,
  Microscope
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Upload, label: "Upload Image", href: "/upload" },
  { icon: BrainCircuit, label: "AI Results", href: "/results" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg cyan-glow">
            <Microscope className="w-6 h-6 text-primary" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="font-bold text-lg tracking-tight text-white">GI Detect AI</h1>
            <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Medical Intelligence</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
                className={pathname === item.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-white"}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="group-data-[collapsible=icon]:hidden bg-secondary/30 rounded-xl p-4 border border-white/5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium text-white">System Status</span>
          </div>
          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
            <div className="bg-accent h-full w-[92%]" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">AI Models Online: 3/3</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-destructive hover:bg-destructive/10">
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
