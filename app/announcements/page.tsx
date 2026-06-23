'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AnnouncementsList } from '@/components/announcements/announcements-list'

export default function AnnouncementsPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!currentUser) return null

  return (
    <DashboardLayout title="Announcements">
      <AnnouncementsList />
    </DashboardLayout>
  )
}
