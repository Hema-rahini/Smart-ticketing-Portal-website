'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FolderKanban,
  Plus,
  CalendarDays,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  Flame,
  Target,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'completed' | 'on-hold' | 'planning'
  priority: 'high' | 'medium' | 'low'
  progress: number
  startDate: string
  dueDate: string
  teamSize: number
  tasksTotal: number
  tasksCompleted: number
  tags: string[]
  lead: string
  color: string
}

const PROJECTS: Project[] = [
  {
    id: '1', name: 'SmartTicket Portal Redesign', description: 'Full UX overhaul of the internal ticketing system with modern design and better workflows.',
    status: 'active', priority: 'high', progress: 68, startDate: '2026-05-01', dueDate: '2026-07-30',
    teamSize: 5, tasksTotal: 34, tasksCompleted: 23, tags: ['Design', 'Frontend'], lead: 'Alex Chen', color: 'from-blue-500 to-indigo-600'
  },
  {
    id: '2', name: 'AI Automation Pipeline', description: 'Implement ML-based ticket routing and auto-assignment to reduce manual overhead by 60%.',
    status: 'active', priority: 'high', progress: 42, startDate: '2026-06-01', dueDate: '2026-08-15',
    teamSize: 4, tasksTotal: 22, tasksCompleted: 9, tags: ['AI', 'Backend'], lead: 'Sarah Kim', color: 'from-purple-500 to-pink-600'
  },
  {
    id: '3', name: 'Mobile App — Employee Self-Service', description: 'Native mobile app for employees to manage tickets, leaves, and tasks on the go.',
    status: 'planning', priority: 'medium', progress: 12, startDate: '2026-07-01', dueDate: '2026-10-30',
    teamSize: 6, tasksTotal: 48, tasksCompleted: 6, tags: ['Mobile', 'React Native'], lead: 'Jordan Lee', color: 'from-emerald-500 to-teal-600'
  },
  {
    id: '4', name: 'HR Analytics Dashboard', description: 'Comprehensive analytics and reporting module for HR managers with exportable insights.',
    status: 'completed', priority: 'medium', progress: 100, startDate: '2026-03-01', dueDate: '2026-05-31',
    teamSize: 3, tasksTotal: 18, tasksCompleted: 18, tags: ['Analytics', 'HR'], lead: 'Maya Patel', color: 'from-amber-500 to-orange-600'
  },
  {
    id: '5', name: 'Onboarding Automation', description: 'Streamline new employee onboarding with automated checklists, document collection, and training paths.',
    status: 'on-hold', priority: 'low', progress: 35, startDate: '2026-04-15', dueDate: '2026-09-01',
    teamSize: 2, tasksTotal: 15, tasksCompleted: 5, tags: ['HR', 'Automation'], lead: 'Chris Wong', color: 'from-rose-500 to-red-600'
  },
]

const MILESTONES = [
  { project: 'SmartTicket Portal Redesign', milestone: 'Design System Complete', date: '2026-06-10', done: true },
  { project: 'SmartTicket Portal Redesign', milestone: 'Frontend Implementation', date: '2026-07-05', done: false },
  { project: 'AI Automation Pipeline', milestone: 'Data Pipeline Setup', date: '2026-06-20', done: true },
  { project: 'AI Automation Pipeline', milestone: 'Model Training & Testing', date: '2026-07-20', done: false },
  { project: 'Mobile App', milestone: 'MVP Wireframes', date: '2026-07-10', done: false },
  { project: 'HR Analytics Dashboard', milestone: 'Full Launch', date: '2026-05-31', done: true },
]

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: Flame },
  completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: CheckCircle2 },
  'on-hold': { label: 'On Hold', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock },
  planning: { label: 'Planning', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: Circle },
}

const priorityColors = {
  high: 'bg-rose-500/10 text-rose-600 border-rose-200',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-200',
  low: 'bg-slate-500/10 text-slate-600 border-slate-200',
}

export default function ProjectsPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()
  const [mounted, setMounted] = useState(false)
  const [projects, setProjects] = useState<Project[]>(PROJECTS)
  const [activeTab, setActiveTab] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', dueDate: '', priority: 'medium' as Project['priority'] })

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/')
  }, [mounted, isAuthenticated, router])

  if (!mounted || !currentUser) {
    return (
      <DashboardLayout title="Projects">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </DashboardLayout>
    )
  }

  const filtered = activeTab === 'all' ? projects : projects.filter(p => p.status === activeTab)
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on-hold').length,
  }

  const handleCreateProject = () => {
    if (!newProject.name.trim()) { toast.error('Project name is required'); return }
    const proj: Project = {
      id: String(Date.now()), name: newProject.name, description: newProject.description,
      status: 'planning', priority: newProject.priority, progress: 0,
      startDate: new Date().toISOString().split('T')[0], dueDate: newProject.dueDate || '2026-12-31',
      teamSize: 1, tasksTotal: 0, tasksCompleted: 0, tags: [], lead: currentUser.name,
      color: 'from-slate-500 to-gray-600'
    }
    setProjects(prev => [proj, ...prev])
    setIsCreateOpen(false)
    setNewProject({ name: '', description: '', dueDate: '', priority: 'medium' })
    toast.success(`Project "${newProject.name}" created successfully!`)
  }

  return (
    <DashboardLayout title="Projects">
      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: stats.total, icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Active', value: stats.active, icon: Flame, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            { label: 'On Hold', value: stats.onHold, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map(s => (
            <Card key={s.label} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-4 flex items-center gap-4">
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

        {/* Filter Tabs + Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="on-hold">On Hold</TabsTrigger>
            </TabsList>
          </Tabs>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0"><Plus className="h-4 w-4" /> New Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create New Project</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Project Name</Label>
                  <Input placeholder="e.g. Customer Portal v2" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <textarea
                    placeholder="Brief project description..."
                    className="w-full min-h-[80px] text-sm p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={newProject.description}
                    onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Due Date</Label>
                    <Input type="date" value={newProject.dueDate} onChange={e => setNewProject(p => ({ ...p, dueDate: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <select
                      value={newProject.priority}
                      onChange={e => setNewProject(p => ({ ...p, priority: e.target.value as Project['priority'] }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateProject}>Create Project</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Project Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map(project => {
            const StatusIcon = statusConfig[project.status].icon
            return (
              <Card key={project.id} className="border shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
                {/* Gradient top bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${project.color}`} />
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate">{project.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{project.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="outline" className={`text-[10px] ${statusConfig[project.status].color}`}>
                        <StatusIcon className="h-2.5 w-2.5 mr-1" />
                        {statusConfig[project.status].label}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${priorityColors[project.priority]}`}>
                        {project.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{project.tasksCompleted}/{project.tasksTotal} tasks</span>
                      <span className="font-semibold text-foreground">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Tags */}
                  {project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{tag}</span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{project.teamSize} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      <span>{project.lead}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      <span>{project.dueDate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Milestones Section */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Upcoming Milestones
            </CardTitle>
            <CardDescription>Key project checkpoints across all active projects</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {MILESTONES.map((m, i) => (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${m.done ? 'opacity-60' : 'hover:bg-secondary/30'}`}>
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.done ? 'bg-emerald-500/10' : 'bg-primary/10'}`}>
                    {m.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-primary" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${m.done ? 'line-through text-muted-foreground' : ''}`}>{m.milestone}</p>
                    <p className="text-xs text-muted-foreground">{m.project}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{m.date}</span>
                  <Badge variant="outline" className={`text-[10px] shrink-0 ${m.done ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-primary/10 text-primary border-primary/30'}`}>
                    {m.done ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
