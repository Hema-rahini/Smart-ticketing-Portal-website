'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Send,
  User,
  ShieldAlert,
  Building,
  DollarSign,
  Laptop,
} from 'lucide-react'

interface ContactItem {
  name: string
  role: string
  email: string
  phone: string
  slack: string
  hours: string
  icon: React.ComponentType<{ className?: string }>
}

interface Message {
  sender: 'user' | 'bot'
  text: string
  timestamp: string
}

const SUPPORT_CONTACTS: ContactItem[] = [
  { name: 'IT Helpdesk Support', role: 'Hardware, Software & Network issues', email: 'it.support@smartticket.com', phone: '+1 (555) 019-2283', slack: '#it-helpdesk', hours: 'Mon-Fri, 8 AM - 6 PM EST', icon: Laptop },
  { name: 'HR Department', role: 'Benefits, Leaves & Policies', email: 'hr@smartticket.com', phone: '+1 (555) 019-3382', slack: '#hr-announcements', hours: 'Mon-Fri, 9 AM - 5 PM EST', icon: User },
  { name: 'Operations & Facilities', role: 'Office access, ID badges & building logistics', email: 'ops@smartticket.com', phone: '+1 (555) 019-4471', slack: '#ops-facilities', hours: 'Mon-Fri, 9 AM - 5 PM EST', icon: Building },
  { name: 'Payroll & Finance', role: 'Salaries, Expense filings & Taxes', email: 'finance@smartticket.com', phone: '+1 (555) 019-5560', slack: '#finance-support', hours: 'Mon-Fri, 9 AM - 5 PM EST', icon: DollarSign }
]

const FAQ_BOT_REPLIES = {
  vpn: {
    answer: "To connect to the corporate VPN:\n1. Download the Cisco AnyConnect client from our IT portal.\n2. Enter the server address: `vpn.smartticket.com`.\n3. Log in with your corporate email and verify using the Authenticator App OTP.\nLet me know if you hit any credential errors!",
    prompt: "VPN Connection Problems"
  },
  password: {
    answer: "You can self-service reset your password by going to `auth.smartticket.com/reset` and verifying with your recovery email/phone.\nNote: Passwords must be at least 12 characters, include a number, a special character, and cannot match your last 3 passwords.",
    prompt: "Reset Password Instructions"
  },
  payroll: {
    answer: "Direct deposit configurations can be managed in the HR Portal under Profile > Compensation > Direct Deposit.\nChanges submitted after the 20th of the month will take effect in the next pay cycle. Please upload a voided check or bank letter.",
    prompt: "Direct Deposit Setup"
  },
  ticket: {
    answer: "To submit a new technical ticket, you can fill out the 'Create Support Request' form on the left of this screen. Select the category, urgency, and describe the problem. Our support engineers will triage and respond within 2 hours.",
    prompt: "How to Submit a Ticket"
  }
}

export default function SupportPage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()

  // Ticket Form States
  const [category, setCategory] = useState('it')
  const [urgency, setUrgency] = useState('medium')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  // Chat States
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: "Hello! I'm your virtual support assistant. Select one of the topics below or type your question to get instant help.", timestamp: 'Just now' }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  if (!currentUser) return null

  // Support Request Submittal
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (subject.trim().length < 5) {
      toast.error('Subject must be at least 5 characters long.')
      return
    }

    if (description.trim().length < 10) {
      toast.error('Description must be at least 10 characters long.')
      return
    }

    toast.success('Support Request submitted. Ticket created and assigned to triage.')
    
    // Reset Form
    setSubject('')
    setDescription('')
    setCategory('it')
    setUrgency('medium')
  }

  // Support Chat Trigger
  const triggerBotReply = (answerText: string) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: answerText,
        timestamp: now
      }])
    }, 1200)
  }

  const handleTopicClick = (topicKey: keyof typeof FAQ_BOT_REPLIES) => {
    const topic = FAQ_BOT_REPLIES[topicKey]
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    // Append User Message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: topic.prompt,
      timestamp: now
    }])

    triggerBotReply(topic.answer)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg = inputText.trim()

    // Add User Msg
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMsg,
      timestamp: now
    }])
    setInputText('')

    // Simple keyword matching for Bot reply
    let reply = "I didn't quite catch that. Please select one of the quick support topics or email `it.support@smartticket.com` for direct help."
    const lowerMsg = userMsg.toLowerCase()
    
    if (lowerMsg.includes('vpn') || lowerMsg.includes('connect')) {
      reply = FAQ_BOT_REPLIES.vpn.answer
    } else if (lowerMsg.includes('password') || lowerMsg.includes('login') || lowerMsg.includes('reset')) {
      reply = FAQ_BOT_REPLIES.password.answer
    } else if (lowerMsg.includes('payroll') || lowerMsg.includes('salary') || lowerMsg.includes('bank') || lowerMsg.includes('deposit')) {
      reply = FAQ_BOT_REPLIES.payroll.answer
    } else if (lowerMsg.includes('ticket') || lowerMsg.includes('submit') || lowerMsg.includes('create')) {
      reply = FAQ_BOT_REPLIES.ticket.answer
    }

    triggerBotReply(reply)
  }

  return (
    <DashboardLayout title="Help & Support">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Create Ticket Form */}
        <div className="xl:col-span-1 space-y-6">
          <Card className="shadow-xs border bg-card">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-primary" />
                Create Support Request
              </CardTitle>
              <CardDescription>Submit a ticket directly to the IT & HR administration queue</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT Systems & Tech Support</SelectItem>
                      <SelectItem value="hr">HR & Employee Relations</SelectItem>
                      <SelectItem value="finance">Payroll & Compensation</SelectItem>
                      <SelectItem value="facilities">Office & Facility Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="urgency">Priority / Urgency</Label>
                  <Select value={urgency} onValueChange={setUrgency}>
                    <SelectTrigger id="urgency">
                      <SelectValue placeholder="Select Urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (General Inquiry)</SelectItem>
                      <SelectItem value="medium">Medium (Standard Ticket)</SelectItem>
                      <SelectItem value="high">High (Disruptive Issue)</SelectItem>
                      <SelectItem value="critical">Critical (System Outage)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject / Summary</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Short description of the issue"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="desc">Detailed Description</Label>
                  <textarea
                    id="desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please include error messages, steps to reproduce, or instructions"
                    className="w-full min-h-[120px] text-sm p-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-5 rounded-lg shadow-xs hover:shadow-sm">
                  Submit Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Middle/Right Side: Live Chat Bot & Support directory */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Support Agent Bot Chat */}
          <Card className="shadow-xs border bg-card flex flex-col h-[500px]">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between space-y-0 bg-secondary/10">
              <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Interactive AI Helpdesk Bot</CardTitle>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online & Ready
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] bg-background">FAQ Assistant</Badge>
            </CardHeader>

            {/* Chat message display */}
            <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 pb-4">
                  {messages.map((m, idx) => {
                    const isBot = m.sender === 'bot'
                    return (
                      <div key={idx} className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={isBot ? 'bg-primary/20 text-primary text-xs font-bold' : 'bg-secondary text-secondary-foreground text-xs font-bold'}>
                            {isBot ? 'AI' : 'ME'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`space-y-1 ${isBot ? 'text-left' : 'text-right'}`}>
                          <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                            isBot 
                              ? 'bg-secondary/40 text-foreground border rounded-tl-none' 
                              : 'bg-primary text-primary-foreground rounded-tr-none'
                          }`}>
                            {m.text}
                          </div>
                          <span className="text-[10px] text-muted-foreground block px-1">{m.timestamp}</span>
                        </div>
                      </div>
                    )
                  })}
                  {isTyping && (
                    <div className="flex gap-3 mr-auto max-w-[80%]">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">AI</AvatarFallback>
                      </Avatar>
                      <div className="p-3 bg-secondary/40 text-foreground border rounded-2xl rounded-tl-none flex items-center gap-1 h-10">
                        <span className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-2 w-2 rounded-full bg-foreground/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Bot selection helpers */}
              <div className="p-3 border-t bg-secondary/15 flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" className="text-xs h-8 bg-background" onClick={() => handleTopicClick('vpn')}>
                  🔑 VPN Connection
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8 bg-background" onClick={() => handleTopicClick('password')}>
                  🔄 Reset Password
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8 bg-background" onClick={() => handleTopicClick('payroll')}>
                  💸 Direct Deposit
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-8 bg-background" onClick={() => handleTopicClick('ticket')}>
                  📩 Submit Ticket
                </Button>
              </div>

              {/* Message Input form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t bg-background flex items-center gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your question here (e.g. how do I reset my password?)..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" className="h-10 w-10 shrink-0 bg-primary text-primary-foreground">
                  <Send className="h-4.5 w-4.5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Support Contacts Directory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPORT_CONTACTS.map((contact, idx) => {
              const ContactIcon = contact.icon
              return (
                <Card key={idx} className="shadow-xs border bg-card hover:shadow-sm transition-all duration-200">
                  <CardContent className="pt-5 space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold text-foreground">{contact.name}</h4>
                        <p className="text-[11px] text-muted-foreground leading-tight">{contact.role}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary text-primary shrink-0">
                        <ContactIcon className="h-4.5 w-4.5" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 text-xs text-muted-foreground pt-2.5 border-t border-dashed">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-foreground/70" />
                        <span className="hover:text-primary cursor-pointer select-all">{contact.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-foreground/70" />
                        <span className="select-all">{contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium text-foreground/80">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{contact.hours}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

        </div>

      </div>
    </DashboardLayout>
  )
}
