'use client'

import { useAppStore as useStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Ticket,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Bell,
  Users,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const activityIcons = {
  ticket_created: Ticket,
  ticket_updated: Ticket,
  comment_added: MessageSquare,
  status_changed: CheckCircle,
  user_joined: Users,
  announcement: Bell,
}

export function ActivityFeed() {
  const { activities, users } = useStore()

  const getUser = (userId: string) => users.find(u => u.id === userId)

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px] px-6">
          <div className="space-y-4 pb-4">
            {activities.slice(0, 10).map((activity) => {
              const user = getUser(activity.userId)
              const Icon = activityIcons[activity.type] || AlertCircle

              return (
                <div key={activity.id} className="flex gap-3">
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                        {user?.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background flex items-center justify-center">
                      <Icon className="h-3 w-3 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium text-foreground">{user?.name}</span>
                      {' '}
                      <span className="text-muted-foreground">{activity.description}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export function TicketOverview() {
  const { tickets, users } = useStore()

  const getUser = (userId: string) => users.find(u => u.id === userId)

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const statusColors = {
    'open': 'bg-blue-500/10 text-blue-600 border-blue-200',
    'in-progress': 'bg-amber-500/10 text-amber-600 border-amber-200',
    'pending-review': 'bg-purple-500/10 text-purple-600 border-purple-200',
    'completed': 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    'closed': 'bg-gray-500/10 text-gray-600 border-gray-200',
  }

  const priorityColors = {
    high: 'bg-red-500/10 text-red-600 border-red-200',
    medium: 'bg-amber-500/10 text-amber-600 border-amber-200',
    low: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Ticket className="h-5 w-5 text-primary" />
          Recent Tickets
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          <div className="space-y-1 px-6 pb-4">
            {recentTickets.map((ticket) => {
              const creator = getUser(ticket.createdBy)
              
              return (
                <div
                  key={ticket.id}
                  className="p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {ticket.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by {creator?.name} • {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Badge variant="outline" className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={statusColors[ticket.status]}>
                      {ticket.status.replace('-', ' ')}
                    </Badge>
                    {ticket.tags?.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
