'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Award,
  TrendingUp,
  Target,
  FileText,
  UserCheck,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

interface Goal {
  id: string
  title: string
  category: 'technical' | 'sla' | 'soft-skills'
  progress: number
  dueDate: string
}

interface ReviewPeriod {
  id: string
  period: string
  reviewer: string
  rating: string
  summary: string
  managerFeedback: string
  peerFeedback: string
}

const INITIAL_GOALS: Goal[] = [
  { id: '1', title: 'Complete Advanced Next.js & React 19 course', category: 'technical', progress: 75, dueDate: '2026-07-31' },
  { id: '2', title: 'Maintain ticket first-response SLA under 45 minutes', category: 'sla', progress: 90, dueDate: '2026-06-30' },
  { id: '3', title: 'Deliver knowledge sharing workshop to interns', category: 'soft-skills', progress: 40, dueDate: '2026-08-15' },
  { id: '4', title: 'Resolve 150 ticket queue issues', category: 'technical', progress: 65, dueDate: '2026-09-30' }
]

const HISTORICAL_REVIEWS: ReviewPeriod[] = [
  {
    id: '1',
    period: 'Q1 Review 2026',
    reviewer: 'Sarah Jenkins (Manager)',
    rating: 'Exceeds Expectations',
    summary: 'Strong performance during the migration phase, demonstrating excellent debugging leadership.',
    managerFeedback: 'Sarah has gone above and beyond to support the onboarding of new interns. Her technical troubleshooting on database queries has reduced average ticket response delay by 15%. Recommend continuing training in systems architecture.',
    peerFeedback: 'Sarah is an absolute joy to collaborate with. She always takes time to review pull requests thoroughly and explains complex concepts without being patronizing.'
  },
  {
    id: '2',
    period: 'Annual Review 2025',
    reviewer: 'Sarah Jenkins (Manager)',
    rating: 'Meets Expectations',
    summary: 'Consistent and reliable team contributor who hits SLA metrics reliably.',
    managerFeedback: 'A solid year of performance. Sarah handles ticket assignments with speed and precision. For the upcoming year, I would like to see Sarah take more ownership of cross-team coordination meetings to expand leadership presence.',
    peerFeedback: 'Always dependable. When we had system outages in October, Sarah worked diligently alongside ops to ensure communication stayed open.'
  }
]

export default function PerformancePage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()

  // State
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS)
  const [selectedReview, setSelectedReview] = useState<ReviewPeriod | null>(null)
  
  // Self Evaluation States
  const [achievements, setAchievements] = useState('')
  const [improvements, setImprovements] = useState('')
  const [techRating, setTechRating] = useState([80])
  const [commRating, setCommRating] = useState([80])
  const [teamRating, setTeamRating] = useState([80])
  const [isSelfEvalSubmitted, setIsSelfEvalSubmitted] = useState(false)
  const [submitDate, setSubmitDate] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!currentUser) return null

  // Update Goal Progress Handler
  const handleProgressChange = (id: string, newProgress: number[]) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, progress: newProgress[0] } : g))
  }

  const handleSaveGoalProgress = (title: string) => {
    toast.success(`Progress saved for: "${title}"`)
  }

  // Submit Self Evaluation Handler
  const handleSelfEvalSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!achievements.trim() || !improvements.trim()) {
      toast.error('Please fill out all fields before submitting.')
      return
    }

    const todayStr = new Date().toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })
    setIsSelfEvalSubmitted(true)
    setSubmitDate(todayStr)
    toast.success('Your Self-Evaluation has been submitted successfully to HR.')
  }

  return (
    <DashboardLayout title="Performance Reviews">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Metrics & Goals */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Core Metrics summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-xs border bg-card">
              <CardContent className="pt-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Overall Rating</span>
                  <span className="text-xl font-extrabold text-foreground">4.8 / 5.0</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Top 10% of Dept</span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-xs border bg-card">
              <CardContent className="pt-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Goals Completed</span>
                  <span className="text-xl font-extrabold text-foreground">12 / 15</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">80% Success Rate</span>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-xs border bg-card">
              <CardContent className="pt-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block uppercase">SLA Compliance</span>
                  <span className="text-xl font-extrabold text-foreground">98.4%</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Target is &gt; 95%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Goals Section */}
          <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Active Career Goals
              </CardTitle>
              <CardDescription>Track and update the progress of your professional targets</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-5">
              {goals.map(g => (
                <div key={g.id} className="space-y-2.5 p-3 rounded-xl border bg-secondary/10 hover:bg-secondary/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground leading-snug">{g.title}</h4>
                      <div className="flex items-center gap-2.5 mt-1">
                        <Badge variant="outline" className="text-[10px] capitalize bg-background font-semibold">
                          {g.category.replace('-', ' ')}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {g.dueDate}
                        </span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary font-mono">{g.progress}%</span>
                  </div>
                  
                  {/* Slider controls */}
                  <div className="flex items-center gap-4 pt-1">
                    <Slider
                      value={[g.progress]}
                      onValueChange={(val) => handleProgressChange(g.id, val)}
                      max={100}
                      step={5}
                      className="flex-1 cursor-pointer"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2.5 hover:bg-primary/10 text-primary font-semibold"
                      onClick={() => handleSaveGoalProgress(g.title)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Core Competencies bar charts */}
          <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Core Competencies Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">Technical Capabilities & Problem Solving</span>
                  <span className="text-primary">95%</span>
                </div>
                <Progress value={95} className="h-2.5 bg-secondary" indicatorColor="bg-blue-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">Communication & Stakeholder Management</span>
                  <span className="text-primary">90%</span>
                </div>
                <Progress value={90} className="h-2.5 bg-secondary" indicatorColor="bg-purple-600" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-foreground">Team Collaboration & Mentoring</span>
                  <span className="text-primary">96%</span>
                </div>
                <Progress value={96} className="h-2.5 bg-secondary" indicatorColor="bg-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Self-Eval and History list */}
        <div className="space-y-6">
          
          {/* Self Evaluation Form */}
          <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Self-Evaluation Portal
              </CardTitle>
              <CardDescription>Assess your achievements and goals for the current cycle</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isSelfEvalSubmitted ? (
                <div className="text-center py-8 space-y-3 bg-emerald-500/5 border border-dashed border-emerald-500/30 rounded-xl">
                  <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Self-Evaluation Submitted</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Submitted on {submitDate}</p>
                  </div>
                  <p className="text-xs text-muted-foreground px-4">
                    Your answers are logged and locked. Your manager has been notified to proceed with evaluation.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSelfEvalSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="achievements" className="text-xs font-bold text-foreground">What are your key wins this period?</Label>
                    <textarea
                      id="achievements"
                      value={achievements}
                      onChange={(e) => setAchievements(e.target.value)}
                      placeholder="Specify tickets closed, processes optimized, or documentation written..."
                      className="w-full min-h-[80px] text-xs p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="improvements" className="text-xs font-bold text-foreground">Where would you like to improve?</Label>
                    <textarea
                      id="improvements"
                      value={improvements}
                      onChange={(e) => setImprovements(e.target.value)}
                      placeholder="Specify technologies to learn, SLA speedups, or communication improvements..."
                      className="w-full min-h-[80px] text-xs p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                  
                  {/* Slider ratings */}
                  <div className="space-y-3 pt-2 border-t border-dashed">
                    <Label className="text-[11px] font-bold uppercase text-foreground/80">Self Competency Scores</Label>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Technical Capabilities</span>
                        <span className="font-semibold text-foreground">{techRating[0]}%</span>
                      </div>
                      <Slider value={techRating} onValueChange={setTechRating} max={100} step={5} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Communication Skills</span>
                        <span className="font-semibold text-foreground">{commRating[0]}%</span>
                      </div>
                      <Slider value={commRating} onValueChange={setCommRating} max={100} step={5} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Team Collaboration</span>
                        <span className="font-semibold text-foreground">{teamRating[0]}%</span>
                      </div>
                      <Slider value={teamRating} onValueChange={setTeamRating} max={100} step={5} />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-primary text-primary-foreground text-xs font-semibold py-4 rounded-lg mt-2">
                    Submit Evaluation
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Historical Reviews Panel */}
          <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Review History
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <div className="divide-y px-6">
                {HISTORICAL_REVIEWS.map(period => (
                  <div
                    key={period.id}
                    className="py-3 flex items-center justify-between cursor-pointer group hover:bg-secondary/10 px-2 rounded-lg transition-all"
                    onClick={() => setSelectedReview(period)}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {period.period}
                      </h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{period.reviewer}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] bg-secondary/80 font-bold max-w-[100px] truncate">
                        {period.rating}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Review Detail Modal */}
      <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
        {selectedReview && (
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{selectedReview.period}</DialogTitle>
              <DialogDescription>Completed by {selectedReview.reviewer}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2.5 text-sm text-foreground">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-muted-foreground font-semibold uppercase">Overall Assessment:</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 font-bold py-0.5">
                  {selectedReview.rating}
                </Badge>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-xs uppercase text-foreground/80 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Manager Feedback
                </h5>
                <p className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border">
                  {selectedReview.managerFeedback}
                </p>
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-xs uppercase text-foreground/80 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Peer & Team Feedback
                </h5>
                <p className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border">
                  {selectedReview.peerFeedback}
                </p>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" onClick={() => setSelectedReview(null)}>Close Details</Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </DashboardLayout>
  )
}
