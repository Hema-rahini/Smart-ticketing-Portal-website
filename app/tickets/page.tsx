'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TicketList } from '@/components/tickets/ticket-list'
import { KanbanBoard } from '@/components/tickets/kanban-board'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { List, Columns } from 'lucide-react'

export default function TicketsPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!currentUser) return null

  return (
    <DashboardLayout title="Tickets">
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2">
            <Columns className="h-4 w-4" />
            Kanban Board
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <TicketList />
        </TabsContent>

        <TabsContent value="kanban">
          <KanbanBoard />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
