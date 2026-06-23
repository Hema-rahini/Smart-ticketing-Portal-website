'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Trophy,
  Medal,
  Star,
  TrendingUp,
  Ticket,
  CheckCircle,
  Zap,
  Award,
  Crown,
  Target,
  Flame,
  Users,
} from 'lucide-react'

const LEADERBOARD = [
  { rank: 1, name: 'Sarah Kim', role: 'Engineer', dept: 'Engineering', ticketsResolved: 47, avgResolution: '1.2d', csat: 98, streak: 14, points: 2840, badge: '🏆 Top Resolver', trend: '+12%' },
  { rank: 2, name: 'Alex Chen', role: 'Manager', dept: 'Product', ticketsResolved: 38, avgResolution: '1.5d', csat: 95, streak: 9, points: 2210, badge: '⚡ Speed Demon', trend: '+8%' },
  { rank: 3, name: 'Maya Patel', role: 'Designer', dept: 'Design', ticketsResolved: 31, avgResolution: '2.0d', csat: 97, streak: 11, points: 1970, badge: '⭐ Quality Star', trend: '+15%' },
  { rank: 4, name: 'Jordan Lee', role: 'Developer', dept: 'Engineering', ticketsResolved: 29, avgResolution: '1.8d', csat: 93, streak: 6, points: 1720, badge: '🎯 Accuracy Pro', trend: '+5%' },
  { rank: 5, name: 'Chris Wong', role: 'Analyst', dept: 'Finance', ticketsResolved: 25, avgResolution: '2.3d', csat: 91, streak: 4, points: 1480, badge: '🔥 Rising Star', trend: '+22%' },
  { rank: 6, name: 'Priya Sharma', role: 'HR Lead', dept: 'HR', ticketsResolved: 22, avgResolution: '1.9d', csat: 96, streak: 8, points: 1390, badge: '❤️ People First', trend: '+3%' },
  { rank: 7, name: 'Mike Johnson', role: 'Marketing', dept: 'Marketing', ticketsResolved: 19, avgResolution: '2.6d', csat: 88, streak: 3, points: 1120, badge: '📊 Data Driven', trend: '+6%' },
  { rank: 8, name: 'Lisa Wang', role: 'Support', dept: 'Operations', ticketsResolved: 17, avgResolution: '3.0d', csat: 90, streak: 5, points: 980, badge: '🌟 Consistent', trend: '+1%' },
]

const ACHIEVEMENTS = [
  { title: 'Ticket Crusher', desc: 'Resolve 50+ tickets in a month', icon: '🎯', earned: false, progress: 94 },
  { title: 'Speed Racer', desc: 'Maintain <1 day avg resolution for 2 weeks', icon: '⚡', earned: true, progress: 100 },
  { title: 'Perfect Score', desc: 'Achieve 100% CSAT for a full week', icon: '⭐', earned: false, progress: 72 },
  { title: 'Iron Streak', desc: 'Maintain a 21-day resolution streak', icon: '🔥', earned: false, progress: 67 },
  { title: 'Team Player', desc: 'Assist 10 colleagues on complex tickets', icon: '🤝', earned: true, progress: 100 },
  { title: 'Early Bird', desc: 'Clock in before 9 AM for 30 days', icon: '🌅', earned: false, progress: 40 },
]

const DEPT_RANKINGS = [
  { dept: 'Engineering', score: 92, tickets: 86, color: 'from-blue-500 to-indigo-600' },
  { dept: 'Design', score: 89, tickets: 50, color: 'from-purple-500 to-pink-600' },
  { dept: 'Product', score: 87, tickets: 66, color: 'from-emerald-500 to-teal-600' },
  { dept: 'HR', score: 85, tickets: 40, color: 'from-amber-500 to-orange-600' },
  { dept: 'Marketing', score: 79, tickets: 51, color: 'from-rose-500 to-red-600' },
  { dept: 'Finance', score: 75, tickets: 36, color: 'from-slate-500 to-gray-600' },
]

const rankColors: Record<number, string> = {
  1: 'from-yellow-400 to-amber-500',
  2: 'from-slate-300 to-slate-400',
  3: 'from-orange-400 to-amber-600',
}

const rankIcons: Record<number, typeof Crown> = {
  1: Crown,
  2: Trophy,
  3: Medal,
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (mounted && !isAuthenticated) router.push('/')
  }, [mounted, isAuthenticated, router])

  if (!mounted || !currentUser) {
    return (
      <DashboardLayout title="Leaderboard">
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </DashboardLayout>
    )
  }

  const top3 = LEADERBOARD.slice(0, 3)
  const rest = LEADERBOARD.slice(3)

  return (
    <DashboardLayout title="Leaderboard">
      <div className="space-y-6">
        {/* Hero Podium */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-orange-500/5 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Trophy className="h-6 w-6 text-amber-500" />
                June 2026 Champions
                <Trophy className="h-6 w-6 text-amber-500" />
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Top performers based on tickets resolved, speed, and satisfaction</p>
            </div>

            {/* Podium Layout */}
            <div className="flex items-end justify-center gap-4 max-w-lg mx-auto">
              {/* 2nd Place */}
              <div className="flex-1 text-center">
                <div className="relative inline-block mb-2">
                  <Avatar className="h-14 w-14 mx-auto border-4 border-slate-300 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-slate-300 to-slate-400 text-white font-bold">
                      {top3[1].name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow">
                    <span className="text-[10px] font-bold text-white">2</span>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-t-xl p-3 h-24 flex flex-col items-center justify-center">
                  <p className="font-bold text-sm">{top3[1].name}</p>
                  <p className="text-xs text-muted-foreground">{top3[1].points.toLocaleString()} pts</p>
                  <span className="text-sm mt-1">{top3[1].badge.split(' ')[0]}</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex-1 text-center -mt-4">
                <div className="relative inline-block mb-2">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Crown className="h-6 w-6 text-amber-500" />
                  </div>
                  <Avatar className="h-18 w-18 mx-auto border-4 border-amber-400 shadow-xl" style={{ height: '72px', width: '72px' }}>
                    <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white font-bold text-lg">
                      {top3[0].name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow">
                    <span className="text-[10px] font-bold text-white">1</span>
                  </div>
                </div>
                <div className="bg-amber-500/10 rounded-t-xl p-3 h-32 flex flex-col items-center justify-center border-2 border-amber-400/30">
                  <p className="font-bold">{top3[0].name}</p>
                  <p className="text-xs text-muted-foreground">{top3[0].points.toLocaleString()} pts</p>
                  <span className="text-sm mt-1">{top3[0].badge.split(' ')[0]}</span>
                  <Badge className="mt-1 text-[9px] bg-amber-500/20 text-amber-600 border-amber-300 border">🏆 Champion</Badge>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex-1 text-center">
                <div className="relative inline-block mb-2">
                  <Avatar className="h-14 w-14 mx-auto border-4 border-orange-400 shadow-md">
                    <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-600 text-white font-bold">
                      {top3[2].name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center shadow">
                    <span className="text-[10px] font-bold text-white">3</span>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-slate-800/60 rounded-t-xl p-3 h-20 flex flex-col items-center justify-center">
                  <p className="font-bold text-sm">{top3[2].name}</p>
                  <p className="text-xs text-muted-foreground">{top3[2].points.toLocaleString()} pts</p>
                  <span className="text-sm mt-1">{top3[2].badge.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="individual" className="space-y-4">
          <TabsList>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Individual Rankings */}
          <TabsContent value="individual">
            <Card className="border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Full Rankings
                </CardTitle>
                <CardDescription>Sorted by total points this month</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 p-0">
                <div className="divide-y">
                  {LEADERBOARD.map(person => (
                    <div key={person.rank} className={`flex items-center gap-4 px-5 py-3 hover:bg-secondary/20 transition-colors ${currentUser.name === person.name ? 'bg-primary/5' : ''}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        person.rank <= 3 ? `bg-gradient-to-br ${rankColors[person.rank]} text-white` : 'bg-muted text-muted-foreground'
                      }`}>
                        {person.rank}
                      </div>
                      <Avatar className="h-9 w-9 border-2 border-border shrink-0">
                        <AvatarFallback className="bg-secondary text-xs font-semibold">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm">{person.name}</p>
                          {currentUser.name === person.name && <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20 border">You</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{person.role} · {person.dept}</p>
                      </div>
                      <div className="hidden sm:grid grid-cols-3 gap-6 text-center text-xs">
                        <div>
                          <p className="font-bold text-base">{person.ticketsResolved}</p>
                          <p className="text-muted-foreground">Resolved</p>
                        </div>
                        <div>
                          <p className="font-bold text-base text-emerald-500">{person.csat}%</p>
                          <p className="text-muted-foreground">CSAT</p>
                        </div>
                        <div>
                          <p className="font-bold text-base">{person.streak}d</p>
                          <p className="text-muted-foreground">Streak</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-base">{person.points.toLocaleString()}</p>
                        <p className="text-[10px] text-emerald-500 font-medium">{person.trend}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Department Rankings */}
          <TabsContent value="departments">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEPT_RANKINGS.map((dept, i) => (
                <Card key={dept.dept} className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className={`h-1 w-full bg-gradient-to-r ${dept.color}`} />
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-bold text-lg">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold">{dept.dept}</p>
                          <span className="font-bold text-primary">{dept.score}pts avg</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Ticket className="h-3 w-3" />{dept.tickets} tickets</span>
                          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" />Score: {dept.score}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements */}
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACHIEVEMENTS.map(ach => (
                <Card key={ach.title} className={`border shadow-sm transition-all duration-200 ${ach.earned ? 'ring-2 ring-amber-400/40' : 'opacity-80 hover:opacity-100'}`}>
                  <CardContent className="pt-5 pb-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${ach.earned ? 'bg-amber-500/10' : 'bg-muted'}`}>
                        {ach.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm">{ach.title}</p>
                          {ach.earned && <Badge className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-300 border">Earned!</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{ach.desc}</p>
                        {!ach.earned && (
                          <div className="mt-2">
                            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                              <span>Progress</span><span>{ach.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${ach.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
