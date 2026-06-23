'use client'

import { useState } from 'react'
import { useAppStore as useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Megaphone,
  Pin,
  PinOff,
  Plus,
  MoreHorizontal,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const reactionEmojis = ['👍', '❤️', '🎉', '🚀', '👏', '✅']

export function AnnouncementsList() {
  const { currentUser, users, announcements, createAnnouncement, togglePinAnnouncement, reactToAnnouncement } = useStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
  })

  const getUser = (userId: string) => users.find(u => u.id === userId)

  const isAdmin = currentUser?.role === 'admin'

  // Sort announcements: pinned first, then by date
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleCreateAnnouncement = () => {
    if (!currentUser || !newAnnouncement.title || !newAnnouncement.content) return

    createAnnouncement({
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      authorId: currentUser.id,
      isPinned: false,
      reactions: {},
    })

    setNewAnnouncement({ title: '', content: '' })
    setIsCreateDialogOpen(false)
  }

  const handleReaction = (announcementId: string, emoji: string) => {
    if (!currentUser) return
    reactToAnnouncement(announcementId, emoji, currentUser.id)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground">Stay updated with the latest news</p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Broadcast a message to all users in the organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Announcement title"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement..."
                    rows={6}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAnnouncement}
                  disabled={!newAnnouncement.title || !newAnnouncement.content}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {sortedAnnouncements.map((announcement) => {
          const author = getUser(announcement.authorId)
          const totalReactions = announcement.reactions
            ? Object.values(announcement.reactions).reduce((sum, arr) => sum + arr.length, 0)
            : 0

          return (
            <Card
              key={announcement.id}
              className={cn(
                'transition-all',
                announcement.isPinned && 'border-primary/50 bg-primary/5'
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={author?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {author?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{announcement.title}</CardTitle>
                        {announcement.isPinned && (
                          <Badge variant="secondary" className="text-xs">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs mt-0.5">
                        Posted by {author?.name} • {format(new Date(announcement.createdAt), 'MMM d, yyyy h:mm a')}
                      </CardDescription>
                    </div>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => togglePinAnnouncement(announcement.id)}>
                          {announcement.isPinned ? (
                            <>
                              <PinOff className="h-4 w-4 mr-2" />
                              Unpin
                            </>
                          ) : (
                            <>
                              <Pin className="h-4 w-4 mr-2" />
                              Pin
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {announcement.content}
                </p>

                {/* Reactions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-1">
                    {announcement.reactions &&
                      Object.entries(announcement.reactions).map(([emoji, userIds]) => {
                        const hasReacted = userIds.includes(currentUser?.id || '')
                        return (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'h-7 px-2 text-xs',
                              hasReacted && 'bg-primary/10 text-primary'
                            )}
                            onClick={() => handleReaction(announcement.id, emoji)}
                          >
                            {emoji} {userIds.length}
                          </Button>
                        )
                      })}
                  </div>
                  <Separator orientation="vertical" className="h-5" />
                  <div className="flex gap-0.5">
                    {reactionEmojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-sm hover:bg-secondary"
                        onClick={() => handleReaction(announcement.id, emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {sortedAnnouncements.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Megaphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No announcements yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
