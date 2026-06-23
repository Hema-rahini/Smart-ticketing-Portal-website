'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ChatInterface } from '@/components/chat/chat-interface'

export default function ChatPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!currentUser) return null

  return (
    <DashboardLayout title="Chat">
      <ChatInterface />
    </DashboardLayout>
  )
}
