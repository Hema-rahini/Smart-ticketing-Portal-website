export type UserRole = 'admin' | 'manager' | 'employee' | 'intern'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  department?: string
  joinedAt: string
  managerId?: string
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: 'open' | 'in-progress' | 'pending-review' | 'completed' | 'closed'
  priority: 'high' | 'medium' | 'low'
  createdBy: string
  assignedTo?: string[]
  department?: string
  createdAt: string
  updatedAt: string
  dueDate?: string
  attachments?: Attachment[]
  comments?: Comment[]
  tags?: string[]
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  uploadedBy: string
  uploadedAt: string
}

export interface Comment {
  id: string
  content: string
  authorId: string
  createdAt: string
  attachments?: Attachment[]
}

export interface Message {
  id: string
  content: string
  senderId: string
  receiverId?: string
  channelId?: string
  createdAt: string
  readBy?: string[]
  attachments?: Attachment[]
}

export interface Channel {
  id: string
  name: string
  type: 'direct' | 'group' | 'ticket'
  members: string[]
  ticketId?: string
  lastMessage?: Message
  createdAt: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: string
  isPinned: boolean
  reactions?: { [emoji: string]: string[] }
  targetRoles?: UserRole[]
}

export interface Department {
  id: string
  name: string
  managerId?: string
  memberCount: number
}

export interface ActivityItem {
  id: string
  type: 'ticket_created' | 'ticket_updated' | 'comment_added' | 'status_changed' | 'user_joined' | 'announcement'
  userId: string
  targetId?: string
  description: string
  createdAt: string
}

export interface DashboardStats {
  totalTickets: number
  openTickets: number
  closedTickets: number
  pendingReviews: number
  totalUsers?: number
  activeUsers?: number
}

export interface ChartData {
  name: string
  value: number
  [key: string]: string | number
}
