'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  Ticket,
  MessageSquare,
  Megaphone,
  CheckCircle,
  Clock,
  AlertCircle,
  Check,
  Trash2,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, activities, users } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!currentUser) return null

  const getUser = (userId: string) => users.find(u => u.id === userId)

  const notificationIcons = {
    ticket_created: Ticket,
    ticket_updated: Ticket,
    comment_added: MessageSquare,
    status_changed: CheckCircle,
    user_joined: Clock,
    announcement: Megaphone,
  }

  // Mock unread status for demo
  const unreadIds = new Set(activities.slice(0, 3).map(a => a.id))

  return (
    <DashboardLayout title="Notifications">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Stay updated with your team&apos;s activity
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              <Badge variant="secondary" className="ml-2">
                {unreadIds.size}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {activities.map((activity) => {
                      const user = getUser(activity.userId)
                      const Icon = notificationIcons[activity.type] || AlertCircle
                      const isUnread = unreadIds.has(activity.id)

                      return (
                        <div
                          key={activity.id}
                          className={`flex items-start gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer ${
                            isUnread ? 'bg-primary/5' : ''
                          }`}
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                {user?.name?.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center border">
                              <Icon className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">{user?.name}</span>
                                  {' '}
                                  <span className="text-muted-foreground">{activity.description}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                              {isUnread && (
                                <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unread">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {activities.filter(a => unreadIds.has(a.id)).map((activity) => {
                      const user = getUser(activity.userId)
                      const Icon = notificationIcons[activity.type] || AlertCircle

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                {user?.name?.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center border">
                              <Icon className="h-3 w-3 text-primary" />
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">
                              <span className="font-medium">{user?.name}</span>
                              {' '}
                              <span className="text-muted-foreground">{activity.description}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {activities
                      .filter(a => ['ticket_created', 'ticket_updated', 'status_changed', 'comment_added'].includes(a.type))
                      .map((activity) => {
                        const user = getUser(activity.userId)
                        const Icon = notificationIcons[activity.type] || AlertCircle

                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                          >
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                  {user?.name?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center border">
                                <Icon className="h-3 w-3 text-primary" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-medium">{user?.name}</span>
                                {' '}
                                <span className="text-muted-foreground">{activity.description}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
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
          </TabsContent>

          <TabsContent value="announcements">
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {activities
                      .filter(a => a.type === 'announcement')
                      .map((activity) => {
                        const user = getUser(activity.userId)

                        return (
                          <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 hover:bg-secondary/50 transition-colors cursor-pointer"
                          >
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                                  {user?.name?.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center border">
                                <Megaphone className="h-3 w-3 text-primary" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-medium">{user?.name}</span>
                                {' '}
                                <span className="text-muted-foreground">{activity.description}</span>
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
