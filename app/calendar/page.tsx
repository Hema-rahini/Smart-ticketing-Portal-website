'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  Filter,
} from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: string // YYYY-MM-DD
  time?: string
  type: 'meeting' | 'deadline' | 'leave' | 'review'
  description?: string
}

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'HR Sync Meeting', date: '2026-06-25', time: '10:00 AM', type: 'meeting', description: 'Weekly sync with the Human Resources department.' },
  { id: '2', title: 'Ticket #1024 Due Date', date: '2026-06-26', time: '05:00 PM', type: 'deadline', description: 'Deadline to resolve the high-priority checkout bug ticket.' },
  { id: '3', title: 'Mid-Year Performance Review', date: '2026-06-28', time: '02:30 PM', type: 'review', description: 'One-on-one session with manager for career alignment.' },
  { id: '4', title: 'Alex Mercer Leave', date: '2026-06-30', type: 'leave', description: 'Annual vacation leave approved.' },
  { id: '5', title: 'Security Compliance Auditing', date: '2026-06-24', time: '09:00 AM', type: 'meeting', description: 'Auditing key workspace access guidelines.' },
  { id: '6', title: 'Sprint Retrospective', date: '2026-06-29', time: '04:00 PM', type: 'meeting', description: 'Discussing wins and learnings from the current sprint.' },
  { id: '7', title: 'Team Outing / Lunch', date: '2026-07-03', time: '12:30 PM', type: 'meeting', description: 'Monthly team gathering for team bonding.' }
]

const eventTypeStyles = {
  meeting: { bg: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800', dot: 'bg-blue-500', label: 'Meeting' },
  deadline: { bg: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800', dot: 'bg-rose-500', label: 'Deadline' },
  leave: { bg: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', label: 'Leave' },
  review: { bg: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800', dot: 'bg-purple-500', label: 'Performance Review' }
}

export default function CalendarPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()
  
  // Set default view to June 2026 matching local time context
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 23)) // June is index 5
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS)
  const [selectedDay, setSelectedDay] = useState<string | null>('2026-06-23')
  const [activeFilters, setActiveFilters] = useState<string[]>(['meeting', 'deadline', 'leave', 'review'])
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)

  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('2026-06-23')
  const [newTime, setNewTime] = useState('10:00 AM')
  const [newType, setNewType] = useState<'meeting' | 'deadline' | 'leave' | 'review'>('meeting')
  const [newDesc, setNewDesc] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!currentUser) return null

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date(2026, 5, 23))
    setSelectedDay('2026-06-23')
  }

  // Calculate calendar days
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay() // 0 = Sunday, 1 = Monday...

  const daysArray = []
  // Fill leading empty cells from previous month
  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    daysArray.push({
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
      dateString: `${month === 0 ? year - 1 : year}-${String(month === 0 ? 12 : month).padStart(2, '0')}-${String(prevMonthDays - i).padStart(2, '0')}`
    })
  }

  // Fill current month cells
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      dayNum: i,
      isCurrentMonth: true,
      dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    })
  }

  // Fill trailing cells for remaining cells in grid (usually grid size is 35 or 42)
  const remaining = daysArray.length % 7 === 0 ? 0 : 7 - (daysArray.length % 7)
  for (let i = 1; i <= remaining; i++) {
    daysArray.push({
      dayNum: i,
      isCurrentMonth: false,
      dateString: `${month === 11 ? year + 1 : year}-${String(month === 11 ? 1 : month + 2).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    })
  }

  const toggleFilter = (type: string) => {
    setActiveFilters(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Event title is required.')
      return
    }

    const createdEvent: CalendarEvent = {
      id: String(Date.now()),
      title: newTitle,
      date: newDate,
      time: newTime || undefined,
      type: newType,
      description: newDesc
    }

    setEvents(prev => [...prev, createdEvent])
    setIsNewEventOpen(false)
    toast.success('Event successfully added to your schedule.')
    
    // Reset Form
    setNewTitle('')
    setNewDesc('')
  }

  // Filtered Events map
  const filteredEvents = events.filter(e => activeFilters.includes(e.type))
  
  const getEventsForDay = (dateStr: string) => {
    return filteredEvents.filter(e => e.date === dateStr)
  }

  const selectedDayEvents = selectedDay ? events.filter(e => e.date === selectedDay) : []

  return (
    <DashboardLayout title="Calendar">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left Side: Filter and Details Pane */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* New Event Button */}
          <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-2 text-sm shadow-sm py-5 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200">
                <Plus className="h-5 w-5" />
                Schedule Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="E.g., Team Standup"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="E.g., 10:00 AM"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type">Event Type</Label>
                  <Select value={newType} onValueChange={(val: any) => setNewType(val)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="leave">Leave / Time-off</SelectItem>
                      <SelectItem value="review">Performance Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="desc">Description (Optional)</Label>
                  <textarea
                    id="desc"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Describe the context of this event"
                    className="w-full min-h-[80px] text-sm p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <DialogFooter className="pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewEventOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-primary text-primary-foreground">Save Event</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Filter Panel */}
          <Card className="shadow-xs border bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                Filter Calendars
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {Object.entries(eventTypeStyles).map(([type, styles]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                    <span className="text-sm text-foreground/80">{styles.label}</span>
                  </div>
                  <Checkbox
                    checked={activeFilters.includes(type)}
                    onCheckedChange={() => toggleFilter(type)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Day Details Side Panel */}
          <Card className="shadow-xs border bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <CalendarIcon className="h-4 w-4 text-primary" />
                Schedule: {selectedDay ? selectedDay : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No events scheduled for this day.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map(e => {
                    const style = eventTypeStyles[e.type]
                    return (
                      <div key={e.id} className="p-3 border rounded-xl bg-card space-y-1.5 hover:shadow-xs transition-shadow">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-semibold text-foreground line-clamp-2">{e.title}</h4>
                          <Badge variant="outline" className={`text-[10px] shrink-0 border ${style.bg}`}>
                            {style.label}
                          </Badge>
                        </div>
                        {e.time && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{e.time}</span>
                          </div>
                        )}
                        {e.description && (
                          <p className="text-xs text-muted-foreground pt-1 border-t border-dashed mt-1.5">
                            {e.description}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Month Grid and Agenda List */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Main Grid Calendar Container */}
          <Card className="shadow-sm border">
            {/* Header Control Toolbar */}
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4 space-y-0 bg-secondary/20">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">
                  {monthNames[month]} {year}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleToday} className="h-8">Today</Button>
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 border-r rounded-r-none">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-l-none">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Day of Week Labels */}
              <div className="grid grid-cols-7 border-b text-center py-2 bg-secondary/5 font-semibold text-xs text-muted-foreground">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Monthly Grid Blocks */}
              <div className="grid grid-cols-7 divide-x divide-y divide-border border-b">
                {daysArray.map((day, idx) => {
                  const dayEvents = getEventsForDay(day.dateString)
                  const isSelected = selectedDay === day.dateString
                  const isToday = day.dateString === '2026-06-23'

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedDay(day.dateString)
                        setNewDate(day.dateString)
                      }}
                      className={`min-h-[105px] p-2 flex flex-col justify-between cursor-pointer hover:bg-secondary/20 transition-all duration-150 group relative ${
                        day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/40 bg-secondary/5'
                      } ${isSelected ? 'bg-primary/5 ring-1 ring-primary/40' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-semibold h-6 w-6 rounded-full flex items-center justify-center ${
                          isToday ? 'bg-primary text-primary-foreground shadow-xs font-bold' : ''
                        }`}>
                          {day.dayNum}
                        </span>
                        
                        {/* Event counter tag for condensed layouts */}
                        {dayEvents.length > 0 && (
                          <span className="text-[10px] xl:hidden font-medium text-primary px-1 rounded-sm bg-primary/10">
                            {dayEvents.length}
                          </span>
                        )}
                      </div>

                      {/* Event Pill blocks for larger layouts */}
                      <div className="hidden xl:flex flex-col gap-1 overflow-y-auto max-h-[70px] select-none scrollbar-none">
                        {dayEvents.map(e => {
                          const style = eventTypeStyles[e.type]
                          return (
                            <div
                              key={e.id}
                              className={`text-[10px] px-2 py-0.5 border rounded-md truncate font-medium flex items-center gap-1 shadow-xs transition-colors duration-150 ${style.bg}`}
                            >
                              <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />
                              <span className="truncate">{e.title}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Calendar List View: Upcoming Agenda */}
          <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Upcoming Agenda (Filtered)
              </CardTitle>
              <CardDescription>Chronological overview of scheduled tasks and meetings</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <div className="divide-y max-h-[300px] overflow-y-auto px-6">
                {filteredEvents
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map(e => {
                    const style = eventTypeStyles[e.type]
                    return (
                      <div key={e.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-secondary/10 px-2 rounded-lg transition-all">
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${style.bg}`}>
                            <CalendarIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">{e.title}</h4>
                            <p className="text-xs text-muted-foreground">{e.description || 'No description provided.'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center">
                          <span className="font-semibold border rounded-md px-2 py-0.5 bg-secondary text-secondary-foreground">
                            {e.date}
                          </span>
                          {e.time && (
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {e.time}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                {filteredEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No upcoming events match the active filters.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </DashboardLayout>
  )
}
