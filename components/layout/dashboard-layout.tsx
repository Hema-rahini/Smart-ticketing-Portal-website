'use client'

import { useAppStore as useStore } from '@/lib/store'
import { Sidebar } from './sidebar'
import { TopNavbar } from './top-navbar'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { sidebarOpen, isAuthenticated } = useStore()
  
  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopNavbar title={title} />
      <main
        className={cn(
          'min-h-screen pt-16 transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-[72px]'
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
