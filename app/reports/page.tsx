'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  BarChart2,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

const PAYROLL_DATA = [
  { month: 'January', gross: 285000, deductions: 57000, net: 228000, employees: 24 },
  { month: 'February', gross: 290000, deductions: 58000, net: 232000, employees: 24 },
  { month: 'March', gross: 295000, deductions: 59000, net: 236000, employees: 25 },
  { month: 'April', gross: 298000, deductions: 59600, net: 238400, employees: 25 },
  { month: 'May', gross: 305000, deductions: 61000, net: 244000, employees: 26 },
  { month: 'June', gross: 312000, deductions: 62400, net: 249600, employees: 26 },
]

const DEPT_REPORTS = [
  { dept: 'Engineering', headcount: 8, avgSalary: 95000, openTickets: 12, resolved: 45, satisfaction: 92 },
  { dept: 'Product', headcount: 4, avgSalary: 88000, openTickets: 6, resolved: 28, satisfaction: 88 },
  { dept: 'Design', headcount: 3, avgSalary: 78000, openTickets: 4, resolved: 19, satisfaction: 95 },
  { dept: 'Marketing', headcount: 5, avgSalary: 72000, openTickets: 8, resolved: 32, satisfaction: 85 },
  { dept: 'HR', headcount: 3, avgSalary: 68000, openTickets: 3, resolved: 15, satisfaction: 90 },
  { dept: 'Finance', headcount: 3, avgSalary: 82000, openTickets: 2, resolved: 11, satisfaction: 87 },
]

const COMPLIANCE_ITEMS = [
  { title: 'GDPR Data Audit', status: 'completed', due: '2026-05-30', score: 100 },
  { title: 'Security Policy Review', status: 'completed', due: '2026-06-01', score: 98 },
  { title: 'Employee Handbook Update', status: 'in-progress', due: '2026-07-15', score: 72 },
  { title: 'Benefits Enrollment', status: 'in-progress', due: '2026-07-01', score: 65 },
  { title: 'Annual Tax Filing', status: 'pending', due: '2026-08-01', score: 0 },
  { title: 'ISO Certification Renewal', status: 'pending', due: '2026-09-15', score: 0 },
]

export default function ReportsPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()
  const [mounted, setMounted] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/')
  }, [mounted, isAuthenticated, router])

  if (!mounted || !currentUser) {
    return (
      <DashboardLayout title="Reports">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </DashboardLayout>
    )
  }

  const handleExport = (reportName: string) => {
    setGenerating(reportName)
    setTimeout(() => {
      setGenerating(null)
      toast.success(`${reportName} exported successfully! Check your downloads.`)
    }, 1800)
  }

  const currentPayroll = PAYROLL_DATA[PAYROLL_DATA.length - 1]
  const prevPayroll = PAYROLL_DATA[PAYROLL_DATA.length - 2]
  const payrollGrowth = (((currentPayroll.gross - prevPayroll.gross) / prevPayroll.gross) * 100).toFixed(1)

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Payroll', value: `$${(currentPayroll.net / 1000).toFixed(0)}K`, sub: `+${payrollGrowth}% vs last month`, icon: DollarSign, up: true, color: 'text-emerald-500' },
            { label: 'Total Employees', value: `${currentPayroll.employees}`, sub: '+1 this month', icon: Users, up: true, color: 'text-blue-500' },
            { label: 'Compliance Score', value: '87%', sub: '2 pending reviews', icon: CheckCircle, up: true, color: 'text-purple-500' },
            { label: 'Avg Resolution', value: '2.3 days', sub: '↓ 0.4 days faster', icon: Clock, up: true, color: 'text-amber-500' },
          ].map((stat) => (
            <Card key={stat.label} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className={`text-xs mt-1 flex items-center gap-0.5 ${stat.color}`}>
                      {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {stat.sub}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg bg-secondary/60 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="payroll" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-lg">
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    Monthly Payroll Summary
                  </CardTitle>
                  <CardDescription>6-month payroll overview</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleExport('Payroll Report')}>
                  {generating === 'Payroll Report' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  Export
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {PAYROLL_DATA.slice().reverse().map((row) => (
                    <div key={row.month} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="w-20 text-sm font-medium text-muted-foreground">{row.month}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Net: ${(row.net / 1000).toFixed(0)}K</span>
                          <span>{row.employees} employees</span>
                        </div>
                        <Progress value={(row.net / 300000) * 100} className="h-2" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${(row.gross / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">gross</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-blue-500" />
                    Department Performance
                  </CardTitle>
                  <CardDescription>Headcount, tickets, and satisfaction metrics</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleExport('Department Report')}>
                  {generating === 'Department Report' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  Export
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {DEPT_REPORTS.map((dept) => (
                    <div key={dept.dept} className="p-4 rounded-xl border bg-secondary/20 hover:bg-secondary/40 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{dept.dept}</p>
                            <p className="text-xs text-muted-foreground">{dept.headcount} members · ${(dept.avgSalary / 1000).toFixed(0)}K avg salary</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                          {dept.satisfaction}% satisfied
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 rounded-lg bg-background/80">
                          <p className="text-lg font-bold text-blue-500">{dept.openTickets}</p>
                          <p className="text-[10px] text-muted-foreground">Open Tickets</p>
                        </div>
                        <div className="p-2 rounded-lg bg-background/80">
                          <p className="text-lg font-bold text-emerald-500">{dept.resolved}</p>
                          <p className="text-[10px] text-muted-foreground">Resolved</p>
                        </div>
                        <div className="p-2 rounded-lg bg-background/80">
                          <p className="text-lg font-bold text-purple-500">{dept.satisfaction}%</p>
                          <p className="text-[10px] text-muted-foreground">CSAT Score</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  Compliance Tracker
                </CardTitle>
                <CardDescription>Required audits, certifications, and policy reviews</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {COMPLIANCE_ITEMS.map((item) => (
                  <div key={item.title} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-secondary/20 transition-colors">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      item.status === 'completed' ? 'bg-emerald-500/10' :
                      item.status === 'in-progress' ? 'bg-amber-500/10' : 'bg-muted'
                    }`}>
                      {item.status === 'completed' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> :
                       item.status === 'in-progress' ? <Clock className="h-4 w-4 text-amber-500" /> :
                       <AlertCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{item.title}</p>
                        <span className="text-xs text-muted-foreground">Due {item.due}</span>
                      </div>
                      {item.score > 0 && <Progress value={item.score} className="h-1.5" />}
                    </div>
                    <Badge variant="outline" className={`ml-2 capitalize text-xs shrink-0 ${
                      item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' :
                      item.status === 'in-progress' ? 'bg-amber-500/10 text-amber-600 border-amber-200' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {item.status === 'in-progress' ? 'In Progress' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Full HR Report', desc: 'All employee data, payroll, and performance metrics', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { name: 'Payroll Summary', desc: 'Monthly breakdown with deductions and net pay', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { name: 'Ticket Analytics', desc: 'Resolution times, SLA compliance, and satisfaction', icon: BarChart2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { name: 'Attendance Report', desc: 'Clock-in/out logs, overtime, and leave history', icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { name: 'Compliance Audit', desc: 'All certifications, deadlines, and compliance scores', icon: CheckCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                { name: 'Department KPIs', desc: 'Per-department performance and headcount report', icon: TrendingUp, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
              ].map((report) => (
                <Card key={report.name} className="border shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${report.bg} shrink-0`}>
                        <report.icon className={`h-5 w-5 ${report.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{report.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{report.desc}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4 gap-2"
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(report.name)}
                      disabled={generating === report.name}
                    >
                      {generating === report.name ? (
                        <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Generating...</>
                      ) : (
                        <><Download className="h-3.5 w-3.5" /> Export as PDF</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
