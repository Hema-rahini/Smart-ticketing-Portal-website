'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { ActivityFeed, TicketOverview } from '@/components/dashboard/activity-feed'
import {
  TicketStatusChart,
  TicketPriorityChart,
  ProductivityTrendChart,
  DepartmentPerformanceChart,
  TeamProductivityChart,
} from '@/components/dashboard/charts'
import {
  Ticket,
  TicketCheck,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  CheckCircle,
  BarChart3,
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, tickets, users } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!currentUser) return null

  const role = currentUser.role

  // Calculate stats based on role
  const getStats = () => {
    let relevantTickets = tickets

    if (role === 'employee' || role === 'intern') {
      relevantTickets = tickets.filter(
        t => t.createdBy === currentUser.id || t.assignedTo?.includes(currentUser.id)
      )
    } else if (role === 'manager') {
      const teamMembers = users
        .filter(u => u.managerId === currentUser.id)
        .map(u => u.id)
      relevantTickets = tickets.filter(
        t => t.createdBy === currentUser.id ||
          t.assignedTo?.some(id => teamMembers.includes(id) || id === currentUser.id)
      )
    }

    return {
      totalTickets: relevantTickets.length,
      openTickets: relevantTickets.filter(t => t.status === 'open').length,
      inProgress: relevantTickets.filter(t => t.status === 'in-progress').length,
      pendingReview: relevantTickets.filter(t => t.status === 'pending-review').length,
      completed: relevantTickets.filter(t => t.status === 'completed').length,
      highPriority: relevantTickets.filter(t => t.priority === 'high' && t.status !== 'closed').length,
    }
  }

  const stats = getStats()

  const renderAdminDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tickets"
          value={stats.totalTickets}
          icon={Ticket}
          trend={{ value: 12, isPositive: true }}
          description="from last month"
        />
        <StatsCard
          title="Open Tickets"
          value={stats.openTickets}
          icon={AlertCircle}
          trend={{ value: 5, isPositive: false }}
          description="needs attention"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          trend={{ value: 18, isPositive: true }}
          description="this month"
        />
        <StatsCard
          title="Total Users"
          value={users.length}
          icon={Users}
          description="active members"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <TicketStatusChart />
        <TicketPriorityChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2">
          <ProductivityTrendChart />
        </div>
        <ActivityFeed />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <DepartmentPerformanceChart />
        <TeamProductivityChart />
      </div>
    </>
  )

  const renderManagerDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Team Tickets"
          value={stats.totalTickets}
          icon={Ticket}
          trend={{ value: 8, isPositive: true }}
          description="from last week"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          description="being worked on"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={AlertCircle}
          description="awaiting review"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          trend={{ value: 15, isPositive: true }}
          description="this week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2">
          <TicketOverview />
        </div>
        <ActivityFeed />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <TeamProductivityChart />
        <ProductivityTrendChart />
      </div>
    </>
  )

  const renderEmployeeDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="My Tickets"
          value={stats.totalTickets}
          icon={Ticket}
          description="total assigned"
        />
        <StatsCard
          title="Open"
          value={stats.openTickets}
          icon={AlertCircle}
          description="needs action"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          icon={Clock}
          description="currently working"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          trend={{ value: 20, isPositive: true }}
          description="this week"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2">
          <TicketOverview />
        </div>
        <ActivityFeed />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <TicketStatusChart />
        <ProductivityTrendChart />
      </div>
    </>
  )

  const renderInternDashboard = () => (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Assigned Tasks"
          value={stats.totalTickets}
          icon={Ticket}
          description="total tasks"
        />
        <StatsCard
          title="Pending"
          value={stats.openTickets + stats.inProgress}
          icon={Clock}
          description="in queue"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pendingReview}
          icon={AlertCircle}
          description="awaiting feedback"
        />
        <StatsCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          trend={{ value: 10, isPositive: true }}
          description="great progress!"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2">
          <TicketOverview />
        </div>
        <ActivityFeed />
      </div>
    </>
  )

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">
              {`Here's what's happening with your ${role === 'admin' ? 'organization' : role === 'manager' ? 'team' : 'tasks'} today.`}
            </p>
          </div>
        </div>

        {/* Role-based Dashboard Content */}
        {role === 'admin' && renderAdminDashboard()}
        {role === 'manager' && renderManagerDashboard()}
        {role === 'employee' && renderEmployeeDashboard()}
        {role === 'intern' && renderInternDashboard()}
      </div>
    </DashboardLayout>
  )
}
