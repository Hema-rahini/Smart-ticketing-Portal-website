'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { AuthScreen } from '@/components/auth/auth-screen'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  return <AuthScreen />
}
