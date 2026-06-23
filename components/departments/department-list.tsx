'use client'

import { useAppStore as useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  Building2,
  Users,
  Plus,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DepartmentList() {
  const { departments, users, tickets } = useStore()

  const getDepartmentStats = (deptName: string) => {
    const deptMembers = users.filter(u => u.department === deptName)
    const deptTickets = tickets.filter(t => t.department === deptName)
    const completedTickets = deptTickets.filter(t => t.status === 'completed' || t.status === 'closed')
    const completionRate = deptTickets.length > 0
      ? Math.round((completedTickets.length / deptTickets.length) * 100)
      : 0

    return {
      members: deptMembers,
      totalTickets: deptTickets.length,
      completedTickets: completedTickets.length,
      completionRate,
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Departments</h2>
          <p className="text-sm text-muted-foreground">Manage organization departments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const stats = getDepartmentStats(dept.name)
          const manager = users.find(u => u.id === dept.managerId)

          return (
            <Card key={dept.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{dept.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {stats.members.length} members
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit Department</DropdownMenuItem>
                      <DropdownMenuItem>View Members</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Manager */}
                {manager && (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={manager.avatar} />
                      <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                        {manager.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      Managed by {manager.name}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-medium">{stats.completionRate}%</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{stats.totalTickets}</p>
                    <p className="text-[10px] text-muted-foreground">Total Tickets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{stats.completedTickets}</p>
                    <p className="text-[10px] text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-foreground">{stats.members.length}</p>
                    <p className="text-[10px] text-muted-foreground">Members</p>
                  </div>
                </div>

                {/* Members Preview */}
                {stats.members.length > 0 && (
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {stats.members.slice(0, 5).map((member) => (
                        <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    {stats.members.length > 5 && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        +{stats.members.length - 5}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
