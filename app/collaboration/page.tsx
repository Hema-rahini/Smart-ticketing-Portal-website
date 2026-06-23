'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { TicketList } from '@/components/tickets/ticket-list'
import { ChatInterface } from '@/components/chat/chat-interface'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, MessageSquare, Ticket, Users } from 'lucide-react'

export default function CollaborationPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser, users, tickets } = useStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
    if (currentUser && !['manager', 'employee'].includes(currentUser.role)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, currentUser, router])

  if (!currentUser || !['manager', 'employee'].includes(currentUser.role)) return null

  // Get collaborative tickets (tickets with multiple assignees)
  const collaborativeTickets = tickets.filter(
    t => t.assignedTo && t.assignedTo.length > 1 && t.assignedTo.includes(currentUser.id)
  )

  const getUser = (userId: string) => users.find(u => u.id === userId)

  return (
    <DashboardLayout title="Collaboration">
      <div className="space-y-6">
        {/* Collaboration Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Collaborative Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collaborativeTickets.length}</div>
              <p className="text-xs text-muted-foreground">Active shared tickets</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(collaborativeTickets.flatMap(t => t.assignedTo || [])).size}
              </div>
              <p className="text-xs text-muted-foreground">Collaborators</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {collaborativeTickets.reduce((sum, t) => sum + (t.comments?.length || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Comments this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="projects" className="gap-2">
              <FolderKanban className="h-4 w-4" />
              Shared Projects
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Team Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {/* Collaborative Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  Shared Workspaces
                </CardTitle>
                <CardDescription>
                  Tickets you&apos;re collaborating on with team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {collaborativeTickets.length > 0 ? (
                  <div className="space-y-4">
                    {collaborativeTickets.map((ticket) => {
                      const collaborators = ticket.assignedTo
                        ?.filter(id => id !== currentUser.id)
                        .map(id => getUser(id))
                        .filter(Boolean) || []

                      return (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Ticket className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{ticket.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {ticket.description.slice(0, 60)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Collaborating with:</span>
                              <div className="flex -space-x-2">
                                {collaborators.slice(0, 3).map((user) => (
                                  <Avatar key={user?.id} className="h-7 w-7 border-2 border-background">
                                    <AvatarImage src={user?.avatar} />
                                    <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                                      {user?.name?.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {ticket.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No collaborative projects yet</p>
                    <p className="text-sm">Create a ticket and assign multiple team members to start collaborating</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Tickets */}
            <TicketList title="All Team Tickets" />
          </TabsContent>

          <TabsContent value="chat">
            <ChatInterface />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
