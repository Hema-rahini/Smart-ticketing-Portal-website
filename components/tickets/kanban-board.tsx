'use client'

import { useState } from 'react'
import { useAppStore as useStore } from '@/lib/store'
import type { Ticket } from '@/lib/types'
import { cn } from '@/lib/utils'
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

const columns: { id: Ticket['status']; title: string; color: string }[] = [
  { id: 'open', title: 'Open', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
  { id: 'pending-review', title: 'Pending Review', color: 'bg-purple-500' },
  { id: 'completed', title: 'Completed', color: 'bg-emerald-500' },
]

const priorityConfig = {
  high: { label: 'High', color: 'bg-red-500/10 text-red-600 border-red-200' },
  medium: { label: 'Medium', color: 'bg-amber-500/10 text-amber-600 border-amber-200' },
  low: { label: 'Low', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
}

export function KanbanBoard() {
  const { tickets, users, updateTicket } = useStore()

  const getUser = (userId: string) => users.find(u => u.id === userId)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const ticketId = result.draggableId
    const newStatus = result.destination.droppableId as Ticket['status']

    updateTicket(ticketId, { status: newStatus })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Kanban Board</h2>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTickets = tickets.filter(t => t.status === column.id)
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn('h-3 w-3 rounded-full', column.color)} />
                  <h3 className="font-medium text-foreground">{column.title}</h3>
                  <Badge variant="secondary" className="ml-auto">
                    {columnTickets.length}
                  </Badge>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'flex-1 min-h-[400px] p-2 rounded-lg border-2 border-dashed transition-colors',
                        snapshot.isDraggingOver
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-secondary/30'
                      )}
                    >
                      <div className="space-y-2">
                        {columnTickets.map((ticket, index) => {
                          const creator = getUser(ticket.createdBy)
                          const assignees = ticket.assignedTo?.map(id => getUser(id)).filter(Boolean) || []

                          return (
                            <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    'cursor-grab active:cursor-grabbing',
                                    snapshot.isDragging && 'shadow-lg ring-2 ring-primary'
                                  )}
                                >
                                  <CardContent className="p-3">
                                    <h4 className="font-medium text-sm text-foreground line-clamp-2">
                                      {ticket.title}
                                    </h4>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                      {ticket.description}
                                    </p>

                                    <div className="flex items-center gap-2 mt-3">
                                      <Badge
                                        variant="outline"
                                        className={cn('text-[10px] px-1.5 py-0', priorityConfig[ticket.priority].color)}
                                      >
                                        {priorityConfig[ticket.priority].label}
                                      </Badge>
                                      {ticket.tags?.slice(0, 1).map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>

                                    <div className="flex items-center justify-between mt-3">
                                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                        {ticket.dueDate && (
                                          <div className="flex items-center gap-0.5">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(ticket.dueDate), 'MMM d')}
                                          </div>
                                        )}
                                        {ticket.comments && ticket.comments.length > 0 && (
                                          <div className="flex items-center gap-0.5">
                                            <MessageSquare className="h-3 w-3" />
                                            {ticket.comments.length}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {assignees.length > 0 && (
                                        <div className="flex -space-x-1">
                                          {assignees.slice(0, 2).map((user) => (
                                            <Avatar key={user?.id} className="h-5 w-5 border border-background">
                                              <AvatarImage src={user?.avatar} />
                                              <AvatarFallback className="text-[8px] bg-primary text-primary-foreground">
                                                {user?.name?.split(' ').map(n => n[0]).join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
