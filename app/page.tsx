"use client"


import { useState } from "react"
import useAuthHook from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';
import { auth, logout } from "../lib/firebase";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DailyWeeklyView } from "@/components/daily-weekly-view"
import { ProjectEpicView } from "@/components/project-epic-view"
import { TaskProvider } from "@/components/task-context"
import { SidebarInset } from "@/components/ui/sidebar"

export default function Home() {
  const { user, loading: authLoading } = useAuthHook();
  const [activeView, setActiveView] = useState<"daily" | "projects">("daily")


  if (authLoading) return <div>Loading...</div>;

  if (!user) {
    return (
      <main style={{ padding: '2rem' }}>
        <LoginForm />
      </main>
    );
  }


  
  return (
    <TaskProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar activeView={activeView} setActiveView={setActiveView} />
          <SidebarInset>
            <main className="flex-1 p-6 bg-gray-50 min-h-screen w-full">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Hello, {user.displayName || "user"} 👋</h1>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Log out
                </button>
              </div>

              {activeView === "daily" ? <DailyWeeklyView /> : <ProjectEpicView />}
            </main>

          
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TaskProvider>
  )
}
