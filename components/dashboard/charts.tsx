'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore as useStore } from '@/lib/store'

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))']

export function TicketStatusChart() {
  const { tickets } = useStore()

  const statusData = [
    { name: 'Open', value: tickets.filter(t => t.status === 'open').length },
    { name: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length },
    { name: 'Pending Review', value: tickets.filter(t => t.status === 'pending-review').length },
    { name: 'Completed', value: tickets.filter(t => t.status === 'completed').length },
    { name: 'Closed', value: tickets.filter(t => t.status === 'closed').length },
  ].filter(d => d.value > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ticket Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {statusData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function TicketPriorityChart() {
  const { tickets } = useStore()

  const priorityData = [
    { name: 'High', count: tickets.filter(t => t.priority === 'high').length, fill: 'hsl(var(--destructive))' },
    { name: 'Medium', count: tickets.filter(t => t.priority === 'medium').length, fill: 'hsl(var(--chart-4))' },
    { name: 'Low', count: tickets.filter(t => t.priority === 'low').length, fill: 'hsl(var(--chart-3))' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tickets by Priority</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProductivityTrendChart() {
  // Mock weekly data
  const weeklyData = [
    { name: 'Mon', created: 8, resolved: 5 },
    { name: 'Tue', created: 12, resolved: 10 },
    { name: 'Wed', created: 6, resolved: 8 },
    { name: 'Thu', created: 15, resolved: 12 },
    { name: 'Fri', created: 10, resolved: 14 },
    { name: 'Sat', created: 3, resolved: 4 },
    { name: 'Sun', created: 2, resolved: 3 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly Productivity Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="created"
                stroke="hsl(var(--chart-1))"
                fillOpacity={1}
                fill="url(#colorCreated)"
                name="Created"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                stroke="hsl(var(--chart-3))"
                fillOpacity={1}
                fill="url(#colorResolved)"
                name="Resolved"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function DepartmentPerformanceChart() {
  const { tickets, departments } = useStore()

  const departmentData = departments.map(dept => ({
    name: dept.name,
    tickets: tickets.filter(t => t.department === dept.name).length,
    completed: tickets.filter(t => t.department === dept.name && t.status === 'completed').length,
  })).filter(d => d.tickets > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Department Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="tickets" fill="hsl(var(--chart-1))" name="Total Tickets" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="hsl(var(--chart-3))" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function TeamProductivityChart() {
  // Mock team productivity data
  const teamData = [
    { name: 'Sarah M.', productivity: 92 },
    { name: 'John E.', productivity: 85 },
    { name: 'Mike D.', productivity: 78 },
    { name: 'Lisa D.', productivity: 88 },
    { name: 'Alex I.', productivity: 72 },
    { name: 'Tom I.', productivity: 68 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Team Productivity Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teamData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Productivity']}
              />
              <Bar
                dataKey="productivity"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function MonthlyTrendChart() {
  // Mock monthly data
  const monthlyData = [
    { month: 'Jan', tickets: 45, resolved: 42 },
    { month: 'Feb', tickets: 52, resolved: 48 },
    { month: 'Mar', tickets: 61, resolved: 55 },
    { month: 'Apr', tickets: 48, resolved: 52 },
    { month: 'May', tickets: 55, resolved: 50 },
    { month: 'Jun', tickets: 67, resolved: 62 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Monthly Ticket Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="tickets"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-1))' }}
                name="New Tickets"
              />
              <Line
                type="monotone"
                dataKey="resolved"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--chart-3))' }}
                name="Resolved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
