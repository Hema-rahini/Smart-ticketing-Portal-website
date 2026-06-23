'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Clock,
  Calendar,
  LogOut,
  Coffee,
  CheckCircle,
  FileText,
  AlertTriangle,
  Play,
  Square,
  Plus,
} from 'lucide-react'

interface LeaveRequest {
  id: string
  type: 'vacation' | 'sick' | 'personal'
  startDate: string
  endDate: string
  totalDays: number
  status: 'approved' | 'pending' | 'rejected'
  reason: string
  requestedAt: string
}

interface ClockSession {
  date: string
  clockIn: string
  clockOut: string | null
  totalHours: string | null
}

const INITIAL_LEAVES: LeaveRequest[] = [
  { id: '1', type: 'vacation', startDate: '2026-07-06', endDate: '2026-07-10', totalDays: 5, status: 'approved', reason: 'Summer family trip to Colorado', requestedAt: '2026-06-15' },
  { id: '2', type: 'sick', startDate: '2026-05-12', endDate: '2026-05-13', totalDays: 1.5, status: 'approved', reason: 'Dental surgery and post-op rest', requestedAt: '2026-05-11' },
  { id: '3', type: 'personal', startDate: '2026-06-25', endDate: '2026-06-25', totalDays: 1, status: 'pending', reason: 'Moving apartments', requestedAt: '2026-06-20' }
]

const INITIAL_SESSIONS: ClockSession[] = [
  { date: '2026-06-22', clockIn: '09:02 AM', clockOut: '05:45 PM', totalHours: '8h 43m' },
  { date: '2026-06-21', clockIn: '08:55 AM', clockOut: '06:10 PM', totalHours: '9h 15m' },
  { date: '2026-06-19', clockIn: '09:05 AM', clockOut: '05:30 PM', totalHours: '8h 25m' },
]

export default function LeavePage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()

  // Attendance states
  const [isClockedIn, setIsClockedIn] = useState(false)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState('00:00:00')
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Leave states
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVES)
  const [sessions, setSessions] = useState<ClockSession[]>(INITIAL_SESSIONS)
  const [isRequestOpen, setIsRequestOpen] = useState(false)

  // PTO states
  const [ptoBalance, setPtoBalance] = useState({
    vacationUsed: 7,
    vacationTotal: 25,
    sickUsed: 4,
    sickTotal: 12,
    personalUsed: 1,
    personalTotal: 5
  })

  // Leave Form State
  const [leaveType, setLeaveType] = useState<'vacation' | 'sick' | 'personal'>('vacation')
  const [startDate, setStartDate] = useState('2026-06-25')
  const [endDate, setEndDate] = useState('2026-06-26')
  const [leaveReason, setLeaveReason] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  // Timer Effect
  useEffect(() => {
    if (isClockedIn && clockInTime) {
      timerRef.current = setInterval(() => {
        const now = new Date()
        const diff = now.getTime() - clockInTime.getTime()
        
        const hrs = Math.floor(diff / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diff % (1000 * 60)) / 1000)

        const formatted = [
          String(hrs).padStart(2, '0'),
          String(mins).padStart(2, '0'),
          String(secs).padStart(2, '0')
        ].join(':')

        setElapsedTime(formatted)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setElapsedTime('00:00:00')
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isClockedIn, clockInTime])

  if (!currentUser) return null

  // Clock in handler
  const handleClockToggle = () => {
    const now = new Date()
    if (!isClockedIn) {
      setIsClockedIn(true)
      setClockInTime(now)
      toast.success('Successfully clocked in. Time tracker started.')
    } else {
      setIsClockedIn(false)
      const clockInFormatted = clockInTime ? clockInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM'
      const clockOutFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      
      // Calculate total hours
      const diffMs = now.getTime() - (clockInTime?.getTime() || now.getTime())
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const timeStr = `${diffHrs}h ${diffMins}m`

      const newSession: ClockSession = {
        date: now.toISOString().split('T')[0],
        clockIn: clockInFormatted,
        clockOut: clockOutFormatted,
        totalHours: timeStr
      }

      setSessions(prev => [newSession, ...prev])
      setClockInTime(null)
      toast.success(`Successfully clocked out. Total time logged: ${timeStr}.`)
    }
  }

  // Calculate total requested days
  const calculateDays = (start: string, end: string) => {
    const sDate = new Date(start)
    const eDate = new Date(end)
    const diff = eDate.getTime() - sDate.getTime()
    if (diff < 0) return 0
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  }

  // Leave submit handler
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
      toast.error('End date cannot be earlier than start date.')
      return
    }

    if (!leaveReason.trim()) {
      toast.error('Please specify a reason for leave.')
      return
    }

    const days = calculateDays(startDate, endDate)

    // Check PTO balance safety
    let currentBalance = 0
    if (leaveType === 'vacation') currentBalance = ptoBalance.vacationTotal - ptoBalance.vacationUsed
    if (leaveType === 'sick') currentBalance = ptoBalance.sickTotal - ptoBalance.sickUsed
    if (leaveType === 'personal') currentBalance = ptoBalance.personalTotal - ptoBalance.personalUsed

    if (days > currentBalance) {
      toast.error(`Insufficient balance. You requested ${days} days, but you only have ${currentBalance} days left.`)
      return
    }

    const newRequest: LeaveRequest = {
      id: String(Date.now()),
      type: leaveType,
      startDate,
      endDate,
      totalDays: days,
      status: 'pending',
      reason: leaveReason,
      requestedAt: new Date().toISOString().split('T')[0]
    }

    setLeaves(prev => [newRequest, ...prev])
    setIsRequestOpen(false)
    setLeaveReason('')
    toast.success('Leave request submitted successfully. Awaiting manager approval.')
  }

  // Cancel pending request handler
  const handleCancelRequest = (id: string) => {
    setLeaves(prev => prev.filter(r => r.id !== id))
    toast.info('Leave request successfully cancelled.')
  }

  const ptoTypes = [
    { key: 'vacation', title: 'Annual Vacation', used: ptoBalance.vacationUsed, total: ptoBalance.vacationTotal, color: 'bg-blue-600', text: 'text-blue-600', icon: Coffee },
    { key: 'sick', title: 'Medical / Sick Leave', used: ptoBalance.sickUsed, total: ptoBalance.sickTotal, color: 'bg-rose-500', text: 'text-rose-500', icon: AlertTriangle },
    { key: 'personal', title: 'Personal Days', used: ptoBalance.personalUsed, total: ptoBalance.personalTotal, color: 'bg-purple-600', text: 'text-purple-600', icon: FileText }
  ]

  const statusColors = {
    approved: 'bg-emerald-500/10 border-emerald-200 text-emerald-600 dark:text-emerald-400',
    pending: 'bg-amber-500/10 border-amber-200 text-amber-600 dark:text-amber-400',
    rejected: 'bg-rose-500/10 border-rose-200 text-rose-600 dark:text-rose-400'
  }

  return (
    <DashboardLayout title="Leave & Attendance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: PTO and History */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PTO Balances Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ptoTypes.map(t => {
              const remaining = t.total - t.used
              const percent = (t.used / t.total) * 100
              const Icon = t.icon
              return (
                <Card key={t.key} className="shadow-xs border bg-card hover:shadow-sm transition-all duration-200">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg bg-secondary/80 ${t.text}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-bold text-foreground">
                        {remaining} <span className="text-xs text-muted-foreground font-normal">days left</span>
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{t.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.used} of {t.total} days used</p>
                    </div>
                    <Progress value={percent} className={`h-2`} indicatorColor={t.color} />
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Leave History List */}
          <Card className="shadow-xs border">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b space-y-0">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Leave Request History
                </CardTitle>
                <CardDescription>View, check, or cancel your PTO requests</CardDescription>
              </div>
              <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-1.5 py-4 font-semibold text-xs bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    Request Leave
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Submit Leave Request</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleLeaveSubmit} className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="leave-type">Leave Category</Label>
                      <Select value={leaveType} onValueChange={(val: any) => setLeaveType(val)}>
                        <SelectTrigger id="leave-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacation">Annual Vacation</SelectItem>
                          <SelectItem value="sick">Medical / Sick Leave</SelectItem>
                          <SelectItem value="personal">Personal Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="end-date">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reason">Reason / Notes</Label>
                      <textarea
                        id="reason"
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder="Provide details about your leave request"
                        className="w-full min-h-[90px] text-sm p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsRequestOpen(false)}>Cancel</Button>
                      <Button type="submit" className="bg-primary text-primary-foreground">Submit Request</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead className="text-center">Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((request) => (
                    <TableRow key={request.id} className="hover:bg-secondary/20">
                      <TableCell className="font-semibold capitalize text-foreground">{request.type}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {request.startDate} to {request.endDate}
                      </TableCell>
                      <TableCell className="text-center text-sm font-semibold">{request.totalDays}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize font-semibold border ${statusColors[request.status]}`}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {request.status === 'pending' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-destructive hover:bg-destructive/15 py-1 px-2.5 rounded-lg h-7 font-medium"
                            onClick={() => handleCancelRequest(request.id)}
                          >
                            Cancel
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaves.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
                        No leave history found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Attendance and Session Tracking */}
        <div className="space-y-6">
          
          {/* Clock In / Out Widget */}
          <Card className="shadow-xs border bg-card overflow-hidden">
            <CardHeader className="pb-3 border-b bg-secondary/15 flex items-center justify-between flex-row space-y-0">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-primary" />
                Work Attendance
              </CardTitle>
              <Badge variant="secondary" className="font-semibold text-[10px]">
                Shift: Standard 9-5
              </Badge>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col items-center text-center space-y-5">
              <div className="space-y-1">
                <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
                  {isClockedIn ? elapsedTime : '00:00:00'}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {isClockedIn ? `Session started at ${clockInTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Clock in to start your work hours tracker'}
                </p>
              </div>

              <Button
                onClick={handleClockToggle}
                className={`w-full py-6 text-sm font-semibold rounded-xl transition-all duration-200 shadow-xs flex items-center justify-center gap-2 ${
                  isClockedIn 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white hover:shadow-sm' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-sm'
                }`}
              >
                {isClockedIn ? (
                  <>
                    <Square className="h-4.5 w-4.5 fill-current" />
                    Clock Out
                  </>
                ) : (
                  <>
                    <Play className="h-4.5 w-4.5 fill-current" />
                    Clock In
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Attendance Log Card */}
          <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-primary" />
                Recent Clock Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <div className="divide-y max-h-[220px] overflow-y-auto px-6">
                {sessions.map((s, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs hover:bg-secondary/10 px-2 rounded-lg transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{s.date}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.clockIn} — {s.clockOut || 'Active'}</p>
                    </div>
                    <Badge variant="outline" className="font-semibold bg-secondary/60 text-foreground border">
                      {s.totalHours || 'Tracking'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  )
}
