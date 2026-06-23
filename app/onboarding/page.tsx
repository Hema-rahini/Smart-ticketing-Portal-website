'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  ClipboardCheck,
  CheckCircle,
  HelpCircle,
  Mail,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react'

interface OnboardingTask {
  id: string
  title: string
  description: string
  category: 'hr' | 'it' | 'training' | 'team'
  timeline: 'day1' | 'week1' | 'month1' | 'day90'
  completed: boolean
}

const INITIAL_TASKS: OnboardingTask[] = [
  // Day 1
  { id: '1', title: 'Sign HR employment contract & upload identity documents', description: 'Review and sign your digital contract via DocuSign. Upload files in the HR portal.', category: 'hr', timeline: 'day1', completed: true },
  { id: '2', title: 'Configure Slack, email, & authenticate corporate credentials', description: 'Access your corporate Gmail, set up your profile on Slack, and configure Google Authenticator 2FA.', category: 'it', timeline: 'day1', completed: true },
  { id: '3', title: 'One-on-one intro meeting with Onboarding Buddy', description: 'Meet with your assigned buddy for a quick introductory video call and virtual office tour.', category: 'team', timeline: 'day1', completed: true },
  { id: '4', title: 'Complete workplace safety & security compliance quiz', description: 'Watch the security tutorial videos and complete the short compliance assessment.', category: 'hr', timeline: 'day1', completed: false },

  // Week 1
  { id: '5', title: 'Set up local dev environment & retrieve ticket repository', description: 'Clone the ticketing repository, install dependencies (pnpm), and verify the dev build works locally.', category: 'it', timeline: 'week1', completed: true },
  { id: '6', title: 'Review ticket triaging guidelines & SLA handbook', description: 'Read through the internal Knowledge Base documentation regarding priority triage and escalation rules.', category: 'training', timeline: 'week1', completed: false },
  { id: '7', title: 'Schedule introductory sync with Sarah Jenkins (Manager)', description: 'Book a 30-minute sync on Google Calendar to talk about team objectives and goals.', category: 'team', timeline: 'week1', completed: false },

  // Month 1
  { id: '8', title: 'Resolve 10 low-complexity support tickets', description: 'Select first batch of tickets from the queue, diagnose customer issues, and submit fixes.', category: 'training', timeline: 'month1', completed: false },
  { id: '9', title: 'Attend IT security and API best practices seminar', description: 'Join the engineering seminar covering secure API designs and SQL injection mitigations.', category: 'training', timeline: 'month1', completed: false },
  { id: '10', title: 'Participate in team sprint planning & retro meetings', description: 'Actively contribute during weekly engineering planning and retro check-ins.', category: 'team', timeline: 'month1', completed: false },

  // Day 90
  { id: '11', title: 'Ship first major feature ticket to staging/prod', description: 'Coordinate with QA and lead developers to deploy a core feature modification safely.', category: 'technical' as any, timeline: 'day90', completed: false },
  { id: '12', title: 'Deliver onboarding feedback survey to HR team', description: 'Provide constructive feedback on your onboarding roadmap to help refine processes.', category: 'hr', timeline: 'day90', completed: false }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()

  // State
  const [tasks, setTasks] = useState<OnboardingTask[]>(INITIAL_TASKS)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!currentUser) return null

  // Calculate Progress
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Task Toggle Handler
  const handleTaskToggle = (id: string, checked: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: checked } : t))
    const task = tasks.find(t => t.id === id)
    if (task) {
      if (checked) {
        toast.success(`Completed task: "${task.title}"`, {
          icon: '🎉'
        })
      } else {
        toast.info(`Marked as incomplete: "${task.title}"`)
      }
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedTaskId(prev => prev === id ? null : id)
  }

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case 'hr': return 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800'
      case 'it': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800'
      case 'training': return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800'
      default: return 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-800'
    }
  }

  const renderTimelineTasks = (timelineKey: 'day1' | 'week1' | 'month1' | 'day90') => {
    const filtered = tasks.filter(t => t.timeline === timelineKey)
    return (
      <div className="space-y-3 mt-4">
        {filtered.map(t => {
          const isExpanded = expandedTaskId === t.id
          return (
            <div
              key={t.id}
              className={`p-3.5 border rounded-xl bg-card hover:shadow-xs transition-all duration-200 ${
                t.completed ? 'border-emerald-500/20 bg-emerald-500/[0.01]' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={(checked) => handleTaskToggle(t.id, !!checked)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0" onClick={() => toggleExpand(t.id)}>
                  <div className="flex items-start justify-between gap-3 cursor-pointer">
                    <h4 className={`text-sm font-semibold text-foreground leading-snug select-none ${
                      t.completed ? 'line-through text-muted-foreground font-normal' : ''
                    }`}>
                      {t.title}
                    </h4>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground p-0">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className={`text-[10px] uppercase font-semibold border ${getCategoryBadgeColor(t.category)}`}>
                      {t.category}
                    </Badge>
                  </div>

                  {isExpanded && (
                    <div className="text-xs text-muted-foreground pt-3 mt-3 border-t border-dashed leading-relaxed">
                      {t.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <DashboardLayout title="Onboarding Checklist">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Onboarding Checklist & Tabs */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Progress Header Box */}
          <Card className="shadow-xs border bg-card/60 backdrop-blur-md overflow-hidden relative">
            <CardContent className="pt-6 pb-6 space-y-4">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Welcome to the Team, {currentUser.name.split(' ')[0]}!
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Complete your onboarding journey step-by-step. Get set up, meet stakeholders, and start shipping code.
                  </p>
                </div>
                <span className="text-2xl font-extrabold text-primary font-mono shrink-0">{progressPercent}%</span>
              </div>
              <div className="space-y-1">
                <Progress value={progressPercent} className="h-3" indicatorColor="bg-gradient-to-r from-blue-600 to-emerald-500" />
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold pt-1">
                  <span>{completedTasks} of {totalTasks} tasks completed</span>
                  <span>{progressPercent === 100 ? 'Onboarding Complete!' : 'On Track'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist Tabs Grid */}
          <Card className="shadow-xs border">
            <CardHeader className="pb-3 border-b bg-secondary/5">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Your Onboarding Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="day1" className="space-y-2">
                <TabsList className="grid grid-cols-4 w-full bg-secondary/15 rounded-lg p-1">
                  <TabsTrigger value="day1" className="text-xs font-semibold py-2">Day 1</TabsTrigger>
                  <TabsTrigger value="week1" className="text-xs font-semibold py-2">Week 1</TabsTrigger>
                  <TabsTrigger value="month1" className="text-xs font-semibold py-2">Month 1</TabsTrigger>
                  <TabsTrigger value="day90" className="text-xs font-semibold py-2">Day 90</TabsTrigger>
                </TabsList>

                <TabsContent value="day1">
                  {renderTimelineTasks('day1')}
                </TabsContent>
                <TabsContent value="week1">
                  {renderTimelineTasks('week1')}
                </TabsContent>
                <TabsContent value="month1">
                  {renderTimelineTasks('month1')}
                </TabsContent>
                <TabsContent value="day90">
                  {renderTimelineTasks('day90')}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Onboarding Buddy and FAQ Helper */}
        <div className="space-y-6">
          
          {/* Onboarding Buddy Widget */}
          <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold">Your Onboarding Buddy</CardTitle>
              <CardDescription>Get in touch for questions, setup blockages, or team syncs</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold">SM</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Sarah Mercer</h4>
                  <p className="text-xs text-muted-foreground">Senior Systems Engineer</p>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-200 mt-1 font-semibold">
                    Available Today
                  </Badge>
                </div>
              </div>

              <Separator className="border-dashed" />

              <div className="space-y-2.5 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground/80">
                    <Mail className="h-3.5 w-3.5" />
                    Email:
                  </span>
                  <span className="font-semibold text-foreground/90 select-all">s.mercer@smartticket.com</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground/80">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Slack:
                  </span>
                  <span className="font-semibold text-primary select-all">@sarah.mercer</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground/80">
                    <Clock className="h-3.5 w-3.5" />
                    Availability:
                  </span>
                  <span className="font-semibold text-foreground/90">9:00 AM — 5:30 PM EST</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Box */}
          <Card className="shadow-xs border bg-secondary/10">
            <CardContent className="pt-5 space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-center gap-2 text-foreground font-bold mb-1.5">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                <span>Onboarding FAQs</span>
              </div>
              <p>
                <strong>Where do I submit HR contracts?</strong>
                <br />
                Under the Onboarding day-1 checklist item, click it to see the link to the HR portal or email `hr@smartticket.com` directly.
              </p>
              <p>
                <strong>How long do I have to complete the security quiz?</strong>
                <br />
                You must complete the workplace safety quiz within the first 48 hours of starting.
              </p>
            </CardContent>
          </Card>

        </div>

      </div>
    </DashboardLayout>
  )
}
