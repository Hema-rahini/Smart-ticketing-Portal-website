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
  ClipboardList,
  CheckCircle2,
  Circle,
  ChevronRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Clock,
  Users,
  BarChart3,
  LayoutGrid,
} from 'lucide-react'
import { toast } from 'sonner'

interface SurveyQuestion {
  id: string
  type: 'rating' | 'mcq' | 'text' | 'nps'
  text: string
  options?: string[]
  required: boolean
}

interface Survey {
  id: string
  title: string
  description: string
  status: 'active' | 'completed' | 'draft'
  dueDate: string
  estimatedTime: string
  questions: SurveyQuestion[]
  respondents: number
  totalInvited: number
  category: string
  color: string
}

const SURVEYS: Survey[] = [
  {
    id: '1',
    title: 'Q2 2026 Employee Satisfaction',
    description: 'Help us understand your work experience and what we can improve this quarter.',
    status: 'active',
    dueDate: '2026-06-30',
    estimatedTime: '5 min',
    respondents: 18,
    totalInvited: 26,
    category: 'Engagement',
    color: 'from-blue-500 to-indigo-600',
    questions: [
      { id: 'q1', type: 'rating', text: 'How satisfied are you with your overall work experience?', required: true },
      { id: 'q2', type: 'mcq', text: 'Which aspect of your role do you find most rewarding?', options: ['Career Growth', 'Team Culture', 'Work-Life Balance', 'Compensation', 'Impact of Work'], required: true },
      { id: 'q3', type: 'nps', text: 'How likely are you to recommend this company as a great place to work? (0-10)', required: true },
      { id: 'q4', type: 'text', text: 'What one change would most improve your daily work experience?', required: false },
    ]
  },
  {
    id: '2',
    title: 'Onboarding Experience Feedback',
    description: 'Share your thoughts on the onboarding process to help future employees.',
    status: 'active',
    dueDate: '2026-07-05',
    estimatedTime: '3 min',
    respondents: 5,
    totalInvited: 8,
    category: 'HR',
    color: 'from-emerald-500 to-teal-600',
    questions: [
      { id: 'q1', type: 'rating', text: 'How would you rate your overall onboarding experience?', required: true },
      { id: 'q2', type: 'mcq', text: 'Which onboarding phase felt most valuable?', options: ['Orientation Day', 'Tool Setup', 'Team Introductions', 'Training Modules', 'Buddy Program'], required: true },
      { id: 'q3', type: 'text', text: 'What was missing from your onboarding that would have helped you?', required: false },
    ]
  },
  {
    id: '3',
    title: 'Remote Work Policy Feedback',
    description: 'Your input shapes our hybrid work model for the rest of 2026.',
    status: 'completed',
    dueDate: '2026-06-10',
    estimatedTime: '4 min',
    respondents: 24,
    totalInvited: 26,
    category: 'Policy',
    color: 'from-purple-500 to-pink-600',
    questions: []
  },
  {
    id: '4',
    title: 'Training Program Effectiveness',
    description: 'How effective are our L&D initiatives? Help us invest better in your growth.',
    status: 'draft',
    dueDate: '2026-07-20',
    estimatedTime: '6 min',
    respondents: 0,
    totalInvited: 26,
    category: 'Learning',
    color: 'from-amber-500 to-orange-600',
    questions: []
  },
]

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground border-border' },
}

export default function SurveysPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()
  const [mounted, setMounted] = useState(false)
  const [activeSurvey, setActiveSurvey] = useState<Survey | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | number>>({})
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/')
  }, [mounted, isAuthenticated, router])

  if (!mounted || !currentUser) {
    return (
      <DashboardLayout title="Surveys">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </DashboardLayout>
    )
  }

  const handleStartSurvey = (survey: Survey) => {
    setActiveSurvey(survey)
    setAnswers({})
    setCurrentStep(0)
  }

  const handleSubmit = () => {
    if (!activeSurvey) return
    const required = activeSurvey.questions.filter(q => q.required)
    const unanswered = required.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      toast.error('Please answer all required questions.')
      return
    }
    setSubmitted(prev => new Set([...prev, activeSurvey.id]))
    setActiveSurvey(null)
    toast.success('Survey submitted! Thank you for your feedback 🎉')
  }

  // Survey taking view
  if (activeSurvey) {
    const question = activeSurvey.questions[currentStep]
    const isLast = currentStep === activeSurvey.questions.length - 1
    const progress = ((currentStep + 1) / activeSurvey.questions.length) * 100

    return (
      <DashboardLayout title={activeSurvey.title}>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Survey Header */}
          <Card className="border shadow-sm overflow-hidden">
            <div className={`h-1.5 w-full bg-gradient-to-r ${activeSurvey.color}`} />
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {currentStep + 1} of {activeSurvey.questions.length}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setActiveSurvey(null)} className="text-xs text-muted-foreground">
                  Exit Survey
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>

          {/* Question Card */}
          <Card className="border shadow-md">
            <CardContent className="pt-8 pb-6 px-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-start gap-2">
                    <h3 className="text-lg font-semibold leading-snug">{question.text}</h3>
                    {question.required && <span className="text-rose-500 text-sm mt-0.5">*</span>}
                  </div>
                </div>

                {/* Rating */}
                {question.type === 'rating' && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setAnswers(a => ({ ...a, [question.id]: n }))}
                        className={`h-12 w-12 rounded-xl border-2 font-bold transition-all duration-150 ${
                          answers[question.id] === n
                            ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-md'
                            : 'border-border hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <div className="flex items-center gap-4 ml-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><ThumbsDown className="h-3 w-3" />Poor</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" />Excellent</span>
                    </div>
                  </div>
                )}

                {/* NPS */}
                {question.type === 'nps' && (
                  <div className="space-y-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {Array.from({ length: 11 }, (_, i) => i).map(n => (
                        <button
                          key={n}
                          onClick={() => setAnswers(a => ({ ...a, [question.id]: n }))}
                          className={`h-10 w-10 rounded-lg border-2 text-sm font-bold transition-all duration-150 ${
                            answers[question.id] === n
                              ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-md'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Not at all likely</span><span>Extremely likely</span>
                    </div>
                  </div>
                )}

                {/* MCQ */}
                {question.type === 'mcq' && question.options && (
                  <div className="space-y-2">
                    {question.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setAnswers(a => ({ ...a, [question.id]: opt }))}
                        className={`w-full text-left p-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 flex items-center gap-3 ${
                          answers[question.id] === opt
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-primary/40 hover:bg-secondary/40'
                        }`}
                      >
                        <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          answers[question.id] === opt ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {answers[question.id] === opt && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Text */}
                {question.type === 'text' && (
                  <textarea
                    placeholder="Share your thoughts here..."
                    className="w-full min-h-[120px] text-sm p-4 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    value={(answers[question.id] as string) || ''}
                    onChange={e => setAnswers(a => ({ ...a, [question.id]: e.target.value }))}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(s => s - 1)} className="flex-1">
                Previous
              </Button>
            )}
            {!isLast ? (
              <Button onClick={() => setCurrentStep(s => s + 1)} className="flex-1 gap-2">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Send className="h-4 w-4" /> Submit Survey
              </Button>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Surveys">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Surveys', value: SURVEYS.filter(s => s.status === 'active').length, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Completed', value: SURVEYS.filter(s => s.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Your Responses', value: submitted.size, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Avg Participation', value: '81%', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map(s => (
            <Card key={s.label} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4 flex items-center gap-3">
                <div className={`p-3 rounded-xl ${s.bg} shrink-0`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="all">All Surveys</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {SURVEYS.filter(s => s.status === 'active' && !submitted.has(s.id)).length === 0 ? (
              <Card className="border shadow-sm">
                <CardContent className="py-16 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                  <h3 className="font-bold text-lg">You're all caught up!</h3>
                  <p className="text-muted-foreground text-sm mt-1">No pending surveys at the moment.</p>
                </CardContent>
              </Card>
            ) : (
              SURVEYS.filter(s => s.status === 'active' && !submitted.has(s.id)).map(survey => (
                <Card key={survey.id} className="border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className={`h-1.5 bg-gradient-to-r ${survey.color}`} />
                  <CardContent className="pt-5 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={statusConfig[survey.status].color}>
                            {statusConfig[survey.status].label}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">{survey.category}</Badge>
                        </div>
                        <h3 className="font-bold text-base mt-2">{survey.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{survey.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{survey.estimatedTime}</span>
                          <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />{survey.questions.length} questions</span>
                          <span className="flex items-center gap-1 text-rose-500"><Circle className="h-3 w-3 fill-rose-500" />Due {survey.dueDate}</span>
                        </div>
                      </div>
                      <Button onClick={() => handleStartSurvey(survey)} className="gap-2 shrink-0">
                        Start Survey <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{survey.respondents}/{survey.totalInvited} responded</span>
                        <span>{Math.round((survey.respondents / survey.totalInvited) * 100)}% participation</span>
                      </div>
                      <Progress value={(survey.respondents / survey.totalInvited) * 100} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-4">
            {SURVEYS.map(survey => (
              <Card key={survey.id} className={`border shadow-sm overflow-hidden ${survey.status === 'draft' ? 'opacity-70' : ''}`}>
                <div className={`h-1.5 bg-gradient-to-r ${survey.color}`} />
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={statusConfig[survey.status].color}>{statusConfig[survey.status].label}</Badge>
                        <Badge variant="secondary" className="text-xs">{survey.category}</Badge>
                        {submitted.has(survey.id) && <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border border-emerald-200">✓ Submitted</Badge>}
                      </div>
                      <p className="font-bold">{survey.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{survey.estimatedTime} · Due {survey.dueDate}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0">
                      <p className="font-semibold text-foreground">{Math.round((survey.respondents / survey.totalInvited) * 100)}%</p>
                      <p>response rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="results" className="mt-4">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Q2 2026 Employee Satisfaction — Key Insights
                </CardTitle>
                <CardDescription>Based on 18 responses from 26 invited participants</CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                {[
                  { label: 'Overall Satisfaction (avg rating)', value: 4.2, max: 5, pct: 84, color: 'bg-emerald-500' },
                  { label: 'NPS Score', value: '72', max: null, pct: 72, color: 'bg-blue-500' },
                  { label: 'Would Recommend Company', value: '89%', max: null, pct: 89, color: 'bg-purple-500' },
                ].map(m => (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-bold">{m.value}{m.max ? `/${m.max}` : ''}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.color} transition-all duration-700`} style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold mb-2">Top Improvement Areas (write-in responses)</p>
                  <div className="flex flex-wrap gap-2">
                    {['Better Meeting Culture', 'Flexible Hours', 'Career Growth Path', 'Clearer OKRs', 'Recognition Programs'].map(t => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
