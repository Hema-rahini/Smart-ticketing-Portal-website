'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TicketList } from '@/components/tickets/ticket-list'

export default function TasksPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only redirect after client has mounted so zustand can load persisted state from localStorage
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/')
    }
  }, [mounted, isAuthenticated, router])

  // Show skeleton loader while hydrating to prevent blank screen
  if (!mounted || !currentUser) {
    return (
      <DashboardLayout title="My Tasks">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-12 bg-muted animate-pulse rounded" />
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="My Tasks">
      <TicketList
        title="My Tasks"
        filter={{
          assignedTo: currentUser.id,
        }}
      />
    </DashboardLayout>
  )
}
