'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  TicketStatusChart,
  TicketPriorityChart,
  ProductivityTrendChart,
  DepartmentPerformanceChart,
  TeamProductivityChart,
  MonthlyTrendChart,
} from '@/components/dashboard/charts'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  Users,
  Ticket,
  CheckCircle,
  Clock,
} from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, tickets, users } = useStore()
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

  if (!mounted || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const stats = {
    totalTickets: tickets.length,
    resolvedTickets: tickets.filter(t => t.status === 'completed' || t.status === 'closed').length,
    avgResolutionTime: '2.3 days',
    teamProductivity: '87%',
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Tickets"
            value={stats.totalTickets}
            icon={Ticket}
            trend={{ value: 12, isPositive: true }}
            description="from last month"
          />
          <StatsCard
            title="Resolved"
            value={stats.resolvedTickets}
            icon={CheckCircle}
            trend={{ value: 18, isPositive: true }}
            description="this month"
          />
          <StatsCard
            title="Avg Resolution"
            value={stats.avgResolutionTime}
            icon={Clock}
            trend={{ value: 5, isPositive: true }}
            description="faster than avg"
          />
          <StatsCard
            title="Productivity"
            value={stats.teamProductivity}
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
            description="team average"
          />
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TicketStatusChart />
              <TicketPriorityChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProductivityTrendChart />
              <DepartmentPerformanceChart />
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TicketStatusChart />
              <TicketPriorityChart />
            </div>
            <MonthlyTrendChart />
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TeamProductivityChart />
              <DepartmentPerformanceChart />
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProductivityTrendChart />
              <MonthlyTrendChart />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
