import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole, Ticket, Message, Channel, Announcement, Department, ActivityItem } from './types'
import { supabase } from './supabase/client'

interface AppState {
  currentUser: User | null
  isAuthenticated: boolean
  selectedRole: UserRole | null
  users: User[]
  tickets: Ticket[]
  messages: Message[]
  channels: Channel[]
  announcements: Announcement[]
  departments: Department[]
  activities: ActivityItem[]
  loading: boolean
  sidebarOpen: boolean
  currentView: string
  setCurrentUser: (user: User | null) => void
  setSelectedRole: (role: UserRole | null) => void
  login: (email: string, password: string, role: UserRole, name?: string) => Promise<boolean>
  loginWithError: (email: string, password: string, role: UserRole, name?: string, department?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setSidebarOpen: (open: boolean) => void
  setCurrentView: (view: string) => void
  fetchUsers: () => Promise<void>
  fetchTickets: () => Promise<void>
  fetchAnnouncements: () => Promise<void>
  fetchMessages: () => Promise<void>
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Ticket | null>
  updateTicket: (id: string, updates: Partial<Ticket>) => Promise<void>
  deleteTicket: (id: string) => Promise<void>
  sendMessage: (message: Omit<Message, 'id' | 'createdAt'>) => Promise<void>
  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>
  togglePinAnnouncement: (id: string) => Promise<void>
  reactToAnnouncement: (id: string, emoji: string, userId: string) => void
  addUser: (user: Omit<User, 'id' | 'joinedAt'>) => Promise<void>
  updateUser: (id: string, updates: Partial<User>) => Promise<void>
}

function mapUser(u: any): User {
  return { id: u.id, name: u.name, email: u.email, role: u.role as UserRole, avatar: u.avatar || '', department: u.department || '', joinedAt: u.joined_at, managerId: u.manager_id || undefined }
}

function mapTicket(t: any): Ticket {
  return { id: t.id, title: t.title, description: t.description || '', status: t.status, priority: t.priority, createdBy: t.created_by, assignedTo: t.assigned_to || [], department: t.department || '', createdAt: t.created_at, updatedAt: t.updated_at, dueDate: t.due_date || undefined, tags: t.tags || [], comments: [] }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null, isAuthenticated: false, selectedRole: null, users: [], tickets: [], messages: [], channels: [], announcements: [], departments: [], activities: [], loading: false, sidebarOpen: true, currentView: 'dashboard',
      setCurrentUser: (user) => set({ currentUser: user }),
      setSelectedRole: (role) => set({ selectedRole: role }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentView: (view) => set({ currentView: view }),
      login: async (email, password, role, name?) => {
        try {
          // Check if user already exists in our users table with this role
          const { data: existingUsers } = await supabase.from('users').select('*').eq('email', email).eq('role', role)
          const isSignUp = !existingUsers || existingUsers.length === 0

          if (isSignUp) {
            // SIGN UP flow — create auth account first
            const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password })
            if (signUpError) { console.error('SignUp error:', signUpError); return false }
            if (!authData.user) return false

            // Then insert into users table
            const insertName = name && name.trim() ? name.trim() : email.split('@')[0]
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({ name: insertName, email, role })
              .select()
              .single()
            if (insertError) { console.error('Insert error:', insertError); return false }
            if (!newUser) return false
            set({ currentUser: mapUser(newUser), isAuthenticated: true, selectedRole: role })
          } else {
            // SIGN IN flow — validate password via Supabase Auth
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
            if (signInError) { console.error('SignIn error:', signInError); return false }
            if (!authData.user) return false
            set({ currentUser: mapUser(existingUsers[0]), isAuthenticated: true, selectedRole: role })
          }

          await get().fetchUsers()
          await get().fetchTickets()
          await get().fetchAnnouncements()
          await get().fetchMessages()
          return true
        } catch (err) {
          console.error('Login exception:', err)
          return false
        }
      },
      loginWithError: async (email, password, role, name?, department?) => {
        try {
          // Check if email already exists with ANY role
          const { data: existingAny } = await supabase.from('users').select('*').eq('email', email)
          
          if (existingAny && existingAny.length > 0) {
            const existingRole = existingAny[0].role
            if (existingRole !== role) {
              // Email is registered with a different role — block it
              return { success: false, error: `This email is already registered as ${existingRole}. Please use that role to sign in.` }
            }
            // Same role — sign in with password
            const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
            if (signInError) return { success: false, error: 'Invalid email or password. Please try again.' }
            if (!authData.user) return { success: false, error: 'Invalid email or password.' }
            set({ currentUser: mapUser(existingAny[0]), isAuthenticated: true, selectedRole: role })
          } else {
            // New user — create auth account
            const { data: authData, error: signUpError } = await supabase.auth.signUp({ email, password })
            if (signUpError) return { success: false, error: signUpError.message }
            if (!authData.user) return { success: false, error: 'Could not create account.' }

            const insertName = name && name.trim() ? name.trim() : email.split('@')[0]
            const { data: newUser, error: insertError } = await supabase
              .from('users')
              .insert({ name: insertName, email, role, department: department || null })
              .select()
              .single()
            if (insertError) return { success: false, error: insertError.message }
            if (!newUser) return { success: false, error: 'Could not save user data.' }
            set({ currentUser: mapUser(newUser), isAuthenticated: true, selectedRole: role })
          }

          await get().fetchUsers()
          await get().fetchTickets()
          await get().fetchAnnouncements()
          await get().fetchMessages()
          return { success: true }
        } catch (err: any) {
          return { success: false, error: err.message || 'Unexpected error.' }
        }
      },
      logout: () => {
        supabase.auth.signOut()
        set({ currentUser: null, isAuthenticated: false, selectedRole: null, users: [], tickets: [], messages: [], announcements: [] })
      },
      fetchUsers: async () => {
        const { data } = await supabase.from('users').select('*').order('joined_at', { ascending: false })
        if (data) set({ users: data.map(mapUser) })
      },
      fetchTickets: async () => {
        const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false })
        if (data) set({ tickets: data.map(mapTicket) })
      },
      fetchAnnouncements: async () => {
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
        if (data) set({ announcements: data.map(a => ({ id: a.id, title: a.title, content: a.content, authorId: a.author_id, createdAt: a.created_at, isPinned: a.is_pinned, targetRoles: a.target_roles || [], reactions: {} })) })
      },
      fetchMessages: async () => {
        const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
        if (data) set({ messages: data.map(m => ({ id: m.id, content: m.content, senderId: m.sender_id, receiverId: m.receiver_id, channelId: m.channel_id, createdAt: m.created_at, readBy: m.read_by || [] })) })
      },
      createTicket: async (ticketData) => {
        const { data } = await supabase.from('tickets').insert({ title: ticketData.title, description: ticketData.description, status: ticketData.status, priority: ticketData.priority, created_by: ticketData.createdBy, assigned_to: ticketData.assignedTo || [], department: ticketData.department, due_date: ticketData.dueDate || null, tags: ticketData.tags || [] }).select().single()
        if (!data) return null
        const newTicket = mapTicket(data)
        set(state => ({ tickets: [newTicket, ...state.tickets] }))
        return newTicket
      },
      updateTicket: async (id, updates) => {
        const dbUpdates: any = { updated_at: new Date().toISOString() }
        if (updates.title) dbUpdates.title = updates.title
        if (updates.description) dbUpdates.description = updates.description
        if (updates.status) dbUpdates.status = updates.status
        if (updates.priority) dbUpdates.priority = updates.priority
        if (updates.assignedTo) dbUpdates.assigned_to = updates.assignedTo
        if (updates.dueDate) dbUpdates.due_date = updates.dueDate
        if (updates.tags) dbUpdates.tags = updates.tags
        await supabase.from('tickets').update(dbUpdates).eq('id', id)
        set(state => ({ tickets: state.tickets.map(t => t.id === id ? { ...t, ...updates } : t) }))
      },
      deleteTicket: async (id) => {
        await supabase.from('tickets').delete().eq('id', id)
        set(state => ({ tickets: state.tickets.filter(t => t.id !== id) }))
      },
      sendMessage: async (messageData) => {
        const { data } = await supabase.from('messages').insert({ content: messageData.content, sender_id: messageData.senderId, receiver_id: messageData.receiverId || null, channel_id: messageData.channelId || null }).select().single()
        if (data) set(state => ({ messages: [...state.messages, { id: data.id, content: data.content, senderId: data.sender_id, receiverId: data.receiver_id, channelId: data.channel_id, createdAt: data.created_at, readBy: [] }] }))
      },
      createAnnouncement: async (announcementData) => {
        const { data } = await supabase.from('announcements').insert({ title: announcementData.title, content: announcementData.content, author_id: announcementData.authorId, is_pinned: announcementData.isPinned || false, target_roles: announcementData.targetRoles || [] }).select().single()
        if (data) set(state => ({ announcements: [{ id: data.id, title: data.title, content: data.content, authorId: data.author_id, createdAt: data.created_at, isPinned: data.is_pinned, targetRoles: data.target_roles || [], reactions: {} }, ...state.announcements] }))
      },
      togglePinAnnouncement: async (id) => {
        const a = get().announcements.find(a => a.id === id)
        if (!a) return
        await supabase.from('announcements').update({ is_pinned: !a.isPinned }).eq('id', id)
        set(state => ({ announcements: state.announcements.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a) }))
      },
      reactToAnnouncement: (id, emoji, userId) => {
        set(state => ({ announcements: state.announcements.map(a => { if (a.id !== id) return a; const reactions = { ...a.reactions }; if (!reactions[emoji]) reactions[emoji] = []; if (reactions[emoji].includes(userId)) { reactions[emoji] = reactions[emoji].filter(u => u !== userId) } else { reactions[emoji] = [...reactions[emoji], userId] }; return { ...a, reactions } }) }))
      },
      addUser: async (userData) => {
        const { data } = await supabase.from('users').insert({ name: userData.name, email: userData.email, role: userData.role, department: userData.department, manager_id: userData.managerId || null }).select().single()
        if (data) set(state => ({ users: [...state.users, mapUser(data)] }))
      },
      updateUser: async (id, updates) => {
        const dbUpdates: any = {}
        if (updates.name !== undefined) dbUpdates.name = updates.name
        if (updates.email !== undefined) dbUpdates.email = updates.email
        if (updates.role !== undefined) dbUpdates.role = updates.role
        if (updates.department !== undefined) dbUpdates.department = updates.department
        if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar
        const { error } = await supabase.from('users').update(dbUpdates).eq('id', id)
        if (error) { console.error('Update user error:', error); return }
        // Update both users list AND currentUser if it's the same person
        set(state => ({
          users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
          currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser
        }))
      },
    }),
    { name: 'smart-ticketing-storage', partialize: (state) => ({ currentUser: state.currentUser, isAuthenticated: state.isAuthenticated, selectedRole: state.selectedRole, sidebarOpen: state.sidebarOpen }) }
  )
)