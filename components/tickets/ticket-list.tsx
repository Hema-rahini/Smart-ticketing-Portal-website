'use client'

import { useState } from 'react'
import { useAppStore as useStore } from '@/lib/store'
import type { Ticket } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Clock,
  AlertCircle,
  CheckCircle,
  Circle,
  Paperclip,
  MessageSquare,
  Calendar,
  User,
  Tag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const statusConfig = {
  'open': { label: 'Open', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: Circle },
  'in-progress': { label: 'In Progress', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock },
  'pending-review': { label: 'Pending Review', color: 'bg-purple-500/10 text-purple-600 border-purple-200', icon: AlertCircle },
  'completed': { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle },
  'closed': { label: 'Closed', color: 'bg-gray-500/10 text-gray-600 border-gray-200', icon: CheckCircle },
}

const priorityConfig = {
  high: { label: 'High', color: 'bg-red-500/10 text-red-600 border-red-200' },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  low: { label: 'Low', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
}

interface TicketListProps {
  filter?: {
    status?: Ticket['status'][]
    priority?: Ticket['priority'][]
    createdBy?: string
    assignedTo?: string
  }
  showCreateButton?: boolean
  title?: string
}

export function TicketList({ filter, showCreateButton = true, title = 'Tickets' }: TicketListProps) {
  const { tickets, users, currentUser, createTicket, updateTicket, deleteTicket } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  
  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium' as Ticket['priority'],
    assignedTo: [] as string[],
    dueDate: '',
    tags: '',
  })

  const getUser = (userId: string) => users.find(u => u.id === userId)

  // Filter tickets
  let filteredTickets = [...tickets]
  
  if (filter?.status) {
    filteredTickets = filteredTickets.filter(t => filter.status?.includes(t.status))
  }
  if (filter?.priority) {
    filteredTickets = filteredTickets.filter(t => filter.priority?.includes(t.priority))
  }
  if (filter?.createdBy) {
    filteredTickets = filteredTickets.filter(t => t.createdBy === filter.createdBy)
  }
  if (filter?.assignedTo) {
    filteredTickets = filteredTickets.filter(t => t.assignedTo?.includes(filter.assignedTo!))
  }
  
  if (statusFilter !== 'all') {
    filteredTickets = filteredTickets.filter(t => t.status === statusFilter)
  }
  if (priorityFilter !== 'all') {
    filteredTickets = filteredTickets.filter(t => t.priority === priorityFilter)
  }
  if (searchQuery) {
    filteredTickets = filteredTickets.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Sort by updated date
  filteredTickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const handleCreateTicket = () => {
    if (!currentUser || !newTicket.title) return

    createTicket({
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'open',
      createdBy: currentUser.id,
      assignedTo: newTicket.assignedTo.length > 0 ? newTicket.assignedTo : [currentUser.id],
      department: currentUser.department,
      dueDate: newTicket.dueDate || undefined,
      tags: newTicket.tags ? newTicket.tags.split(',').map(t => t.trim()) : undefined,
    })

    setNewTicket({
      title: '',
      description: '',
      priority: 'medium',
      assignedTo: [],
      dueDate: '',
      tags: '',
    })
    setIsCreateDialogOpen(false)
  }

  const handleStatusChange = (ticketId: string, status: Ticket['status']) => {
    updateTicket(ticketId, { status })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {showCreateButton && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new ticket.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter ticket title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the ticket..."
                    rows={4}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(value) => setNewTicket({ ...newTicket, priority: value as Ticket['priority'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTicket.dueDate}
                      onChange={(e) => setNewTicket({ ...newTicket, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    onValueChange={(value) => setNewTicket({ ...newTicket, assignedTo: [value] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="bug, feature, urgent"
                    value={newTicket.tags}
                    onChange={(e) => setNewTicket({ ...newTicket, tags: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTicket} disabled={!newTicket.title}>
                  Create Ticket
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="pending-review">Pending Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No tickets found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTickets.map((ticket) => {
            const creator = getUser(ticket.createdBy)
            const assignees = ticket.assignedTo?.map(id => getUser(id)).filter(Boolean) || []
            const StatusIcon = statusConfig[ticket.status].icon

            return (
              <Card
                key={ticket.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                      statusConfig[ticket.status].color.replace('text-', 'bg-').replace('border-', '')
                    )}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-foreground">{ticket.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {ticket.description}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedTicket(ticket); }}>
                              View & Assign
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'in-progress')}>
                              Mark In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'completed')}>
                              Mark Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(ticket.id, 'closed')}>
                              Close Ticket
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteTicket(ticket.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Badge variant="outline" className={statusConfig[ticket.status].color}>
                          {statusConfig[ticket.status].label}
                        </Badge>
                        <Badge variant="outline" className={priorityConfig[ticket.priority].color}>
                          {priorityConfig[ticket.priority].label}
                        </Badge>
                        {ticket.tags?.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {creator?.name}
                        </div>
                        {ticket.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(ticket.dueDate), 'MMM d, yyyy')}
                          </div>
                        )}
                        {ticket.comments && ticket.comments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.comments.length}
                          </div>
                        )}
                        {assignees.length > 0 && (
                          <div className="flex items-center gap-1 ml-auto">
                            <div className="flex -space-x-2">
                              {assignees.slice(0, 3).map((user) => (
                                <Avatar key={user?.id} className="h-6 w-6 border-2 border-background">
                                  <AvatarImage src={user?.avatar} />
                                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                                    {user?.name?.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedTicket && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center shrink-0',
                    statusConfig[selectedTicket.status].color.replace('text-', 'bg-').replace('border-', '')
                  )}>
                    {(() => {
                      const Icon = statusConfig[selectedTicket.status].icon
                      return <Icon className="h-5 w-5" />
                    })()}
                  </div>
                  <div>
                    <DialogTitle>{selectedTicket.title}</DialogTitle>
                    <DialogDescription className="mt-1">
                      Created by {getUser(selectedTicket.createdBy)?.name} on{' '}
                      {format(new Date(selectedTicket.createdAt), 'MMM d, yyyy')}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="details" className="flex-1 overflow-hidden">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="comments">
                    Comments ({selectedTicket.comments?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>

                <ScrollArea className="flex-1 mt-4">
                  <TabsContent value="details" className="mt-0 space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <p className="mt-1 text-sm">{selectedTicket.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Select
                          value={selectedTicket.status}
                          onValueChange={(value) => {
                            handleStatusChange(selectedTicket.id, value as Ticket['status'])
                            setSelectedTicket({ ...selectedTicket, status: value as Ticket['status'] })
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="pending-review">Pending Review</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Priority</Label>
                        <div className="mt-1">
                          <Badge variant="outline" className={priorityConfig[selectedTicket.priority].color}>
                            {priorityConfig[selectedTicket.priority].label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {selectedTicket.dueDate && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Due Date</Label>
                        <p className="mt-1 text-sm">
                          {format(new Date(selectedTicket.dueDate), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-muted-foreground">Assign To</Label>
                      <Select
                        onValueChange={(value) => {
                          const updated = { ...selectedTicket, assignedTo: [value] }
                          updateTicket(selectedTicket.id, { assignedTo: [value] })
                          setSelectedTicket(updated)
                        }}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder={
                            selectedTicket.assignedTo?.length
                              ? users.find(u => u.id === selectedTicket.assignedTo![0])?.name || 'Assigned'
                              : 'Select employee'
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedTicket.tags && selectedTicket.tags.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedTicket.tags.map(tag => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="comments" className="mt-0 space-y-4">
                    {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                      selectedTicket.comments.map((comment) => {
                        const author = getUser(comment.authorId)
                        return (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={author?.avatar} />
                              <AvatarFallback className="text-xs bg-secondary">
                                {author?.name?.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{author?.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                                </span>
                              </div>
                              <p className="text-sm mt-1">{comment.content}</p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No comments yet
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="activity" className="mt-0">
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Activity timeline coming soon
                    </p>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
