'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { UserManagement } from '@/components/users/user-management'

export default function UsersPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, currentUser, router])

  if (!currentUser || currentUser.role !== 'admin') return null

  return (
    <DashboardLayout title="User Management">
      <UserManagement />
    </DashboardLayout>
  )
}
