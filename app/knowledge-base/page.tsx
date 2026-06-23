'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore as useStore } from '@/lib/store'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Search,
  BookOpen,
  HelpCircle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Key,
  Shield,
  Laptop,
  Users,
  Compass,
} from 'lucide-react'

interface Article {
  id: string
  title: string
  category: 'getting-started' | 'workflows' | 'it-security' | 'hr-policies'
  summary: string
  content: string
  helpfulCount: number
  unhelpfulCount: number
}

const KNOWLEDGE_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Getting Started: SmartTicketing Portal Basics',
    category: 'getting-started',
    summary: 'An introductory guide on how to log in, navigate the sidebar, and manage notifications.',
    content: `Welcome to the SmartTicketing Portal! This guide will help you understand the interface.

## 1. Authentication and Roles
Depending on your department role, you will see different pages.
- **Employees & Interns**: Can create support requests and manage assigned tasks.
- **Managers**: Can review team tickets, check productivity trends, and assign tasks.
- **Admins**: Have full access to departments and user controls.

## 2. Navigating the Workspace
- **Dashboard**: Get a high-level summary of open tasks and ticket queues.
- **Tickets**: Create or modify technical tickets. Use the filtering options to narrow by priority or category.
- **Chat**: Communicate with support personnel or teams directly in real time.`,
    helpfulCount: 142,
    unhelpfulCount: 2
  },
  {
    id: '2',
    title: 'Configuring VPN and Security Certificates',
    category: 'it-security',
    summary: 'Detailed instructions to install VPN profile credentials and security certificates on macOS and Windows.',
    content: `This guide details the security configurations needed to connect to the internal database safely.

## Step 1: Install AnyConnect
Download the secure mobility client from the IT directory page. Install it and specify server address: \`vpn.smartticket.com\`.

## Step 2: Request User Credentials
Your security profile is configured upon onboarding. Input your corporate email and input the MFA verification code from your authenticator app.

## Step 3: Install Trusted Root Certificates
To access developer portals, you must trust the local CA root certificate. Click 'Trust' in macOS Keychain or Windows Certmgr under Trusted Root Certification Authorities.`,
    helpfulCount: 98,
    unhelpfulCount: 5
  },
  {
    id: '3',
    title: 'Ticket SLA & Severity Guidelines',
    category: 'workflows',
    summary: 'A cheatsheet explaining high, medium, and low ticket classifications and response deadlines.',
    content: `Our ticket triaging operates under a strict Service Level Agreement (SLA). Please reference these timelines:

### Critical (S1)
- **Criteria**: Core features broken. Affecting entire database or organization.
- **First Response**: Within 15 minutes.
- **Resolution Target**: 2 Hours.

### High (S2)
- **Criteria**: Blocking primary user workflow. No immediate workaround.
- **First Response**: Within 45 minutes.
- **Resolution Target**: 8 Hours.

### Medium (S3)
- **Criteria**: Minor performance degrade or non-blocking functional bug.
- **First Response**: Within 2 Hours.
- **Resolution Target**: 48 Hours.`,
    helpfulCount: 114,
    unhelpfulCount: 1
  },
  {
    id: '4',
    title: 'PTO Leave & Holidays Accrual Policies',
    category: 'hr-policies',
    summary: 'Policy overview on vacation balances, accrual structures, and bereavement/medical leave.',
    content: `All full-time employees accrue Paid Time Off (PTO) annually.

## 1. Vacation Leaves
- Employees accrue **2.08 vacation days** monthly, totaling **25 days per calendar year**.
- Accrued leaves roll over up to a maximum of 5 days into the subsequent year.

## 2. Medical / Sick Leave
- All employees receive **12 fully paid sick days** annually.
- Medical notes from certified practitioners are required for sick leaves exceeding 3 consecutive business days.

## 3. Requesting PTO
Leaves should be requested at least **7 business days** in advance via the /leave portal to allow proper coverage scheduling.`,
    helpfulCount: 85,
    unhelpfulCount: 3
  }
]

const CATEGORY_MAP = {
  all: { label: 'All Articles', icon: BookOpen },
  'getting-started': { label: 'Getting Started', icon: Compass },
  'workflows': { label: 'Workflows & SLAs', icon: FileText },
  'it-security': { label: 'IT & Security', icon: Key },
  'hr-policies': { label: 'HR & Policies', icon: Users }
}

export default function KnowledgeBasePage() {
  const router = useRouter()
  const { isAuthenticated, currentUser } = useStore()

  // States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  
  // Feedback states
  const [feedbackGiven, setFeedbackGiven] = useState<{ [id: string]: 'helpful' | 'unhelpful' }>({})

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!currentUser) return null

  // Filter Articles
  const filteredArticles = KNOWLEDGE_ARTICLES.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          article.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Vote Article Handler
  const handleVote = (articleId: string, type: 'helpful' | 'unhelpful') => {
    if (feedbackGiven[articleId]) {
      toast.info('You have already submitted feedback for this article.')
      return
    }

    setFeedbackGiven(prev => ({ ...prev, [articleId]: type }))
    toast.success('Thank you for your feedback!')
  }

  return (
    <DashboardLayout title="Knowledge Base">
      <div className="space-y-6">
        
        {/* Top Banner Search Area */}
        <Card className="shadow-xs border overflow-hidden bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 relative py-6">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">How can we help you today?</h2>
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles, guides, SLAs, or HR documents..."
                className="pl-11 pr-4 py-6 text-sm rounded-xl bg-background shadow-xs w-full"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Instant suggestions: VPN setup, holiday accruals, S1 response times, task management
            </p>
          </CardContent>
        </Card>

        {/* Core Categories selector grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {Object.entries(CATEGORY_MAP).map(([key, value]) => {
            const CatIcon = value.icon
            const isSelected = selectedCategory === key
            return (
              <Card
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`shadow-xs border cursor-pointer hover:shadow-sm transition-all duration-200 ${
                  isSelected ? 'border-primary bg-primary/5 text-primary' : 'bg-card text-foreground hover:bg-secondary/15'
                }`}
              >
                <CardContent className="p-3.5 flex items-center justify-center flex-col text-center space-y-2">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground/75'}`}>
                    <CatIcon className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xs font-bold">{value.label}</span>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Content Section: Articles and FAQ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Articles list (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-foreground/80 tracking-wider flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-primary" />
              Documentation Articles ({filteredArticles.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map(article => (
                <Card
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="shadow-xs border bg-card hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2.5">
                      <Badge variant="outline" className="text-[9px] capitalize font-bold bg-secondary/80">
                        {article.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors mt-2.5">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                    <div className="flex items-center gap-3 pt-2 text-[10px] text-muted-foreground border-t border-dashed">
                      <ThumbsUp className="h-3 w-3 text-emerald-600" />
                      <span>{article.helpfulCount} people found this helpful</span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredArticles.length === 0 && (
                <div className="col-span-2 text-center py-12 text-muted-foreground bg-card border rounded-xl">
                  No articles matched your search query. Try other keywords!
                </div>
              )}
            </div>
          </div>

          {/* Quick FAQ Accordion (1 Column) */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-foreground/80 tracking-wider flex items-center gap-2">
              <HelpCircle className="h-4.5 w-4.5 text-primary" />
              Quick FAQs
            </h3>

            <Card className="shadow-xs border bg-card">
              <CardContent className="pt-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-xs font-semibold py-3">
                      What are the IT support service hours?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                      Our IT Helpdesk is staffed Monday to Friday, from 8:00 AM to 6:00 PM EST. For critical outages outside these hours, please trigger the S1 escalation emergency flow on Slack in #it-helpdesk.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xs font-semibold py-3">
                      How long does ticket triage take?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                      Standard ticket review takes less than 2 hours. High-priority tickets (S2) are reviewed within 45 minutes, and critical server issues (S1) are triaged within 15 minutes.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger className="text-xs font-semibold py-3">
                      Where can I view payroll dates?
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground leading-relaxed">
                      Salaries are paid semi-monthly, on the 15th and the last business day of the month. Accruals, paystubs, and compensation sheets can be verified in the HR Portal.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>

      {/* Article Detail dialog Reader */}
      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        {selectedArticle && (
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-4 border-b bg-secondary/5 shrink-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] capitalize font-bold bg-background">
                  {selectedArticle.category.replace('-', ' ')}
                </Badge>
              </div>
              <DialogTitle className="text-base font-bold text-foreground mt-2 leading-snug">{selectedArticle.title}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {selectedArticle.summary}
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6 py-4 overflow-y-auto">
              <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {selectedArticle.content}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-secondary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
              <span className="text-[10px] text-muted-foreground">
                Was this article helpful to resolve your query?
              </span>
              <div className="flex items-center gap-2.5">
                <Button
                  variant={feedbackGiven[selectedArticle.id] === 'helpful' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs gap-1.5 h-8 font-semibold py-1.5 px-3 rounded-lg"
                  onClick={() => handleVote(selectedArticle.id, 'helpful')}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Yes ({selectedArticle.helpfulCount + (feedbackGiven[selectedArticle.id] === 'helpful' ? 1 : 0)})
                </Button>
                <Button
                  variant={feedbackGiven[selectedArticle.id] === 'unhelpful' ? 'destructive' : 'outline'}
                  size="sm"
                  className="text-xs gap-1.5 h-8 font-semibold py-1.5 px-3 rounded-lg"
                  onClick={() => handleVote(selectedArticle.id, 'unhelpful')}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  No ({selectedArticle.unhelpfulCount + (feedbackGiven[selectedArticle.id] === 'unhelpful' ? 1 : 0)})
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </DashboardLayout>
  )
}
