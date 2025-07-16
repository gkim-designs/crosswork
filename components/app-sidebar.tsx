"use client"

import { Calendar, FolderKanban, Home, Settings, LogOut } from "lucide-react"
import { logout } from "../lib/firebase"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"

interface AppSidebarProps {
  activeView: "daily" | "projects"
  setActiveView: (view: "daily" | "projects") => void
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  const menuItems = [
    {
      title: "Daily & Weekly",
      icon: Calendar,
      view: "daily" as const,
    },
    {
      title: "Projects & Epics",
      icon: FolderKanban,
      view: "projects" as const,
    },
  ]

  return (
    <Sidebar collapsible="none" className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6 text-blue-600" />
          <h1 className="text-lg font-semibold">TaskFlow</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => setActiveView(item.view)} isActive={activeView === item.view}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
    
            <SidebarMenuButton onClick={logout}>
              <Settings className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
