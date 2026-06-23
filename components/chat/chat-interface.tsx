'use client'

import { useState, useRef, useEffect } from 'react'
import { useAppStore as useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Send,
  Search,
  Plus,
  MoreVertical,
  Paperclip,
  Image,
  Smile,
  Hash,
  Users,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export function ChatInterface() {
  const { currentUser, users, channels, messages, sendMessage } = useStore()
  const [selectedChannel, setSelectedChannel] = useState(channels[0] || null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getUser = (userId: string) => users.find(u => u.id === userId)

  const channelMessages = messages.filter(m => m.channelId === selectedChannel?.id)

  const filteredChannels = channels.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [channelMessages.length])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser || !selectedChannel) return

    sendMessage({
      content: newMessage,
      senderId: currentUser.id,
      channelId: selectedChannel.id,
    })
    setNewMessage('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] gap-4">
      {/* Channels Sidebar */}
      <Card className="w-72 shrink-0 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Channels
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search channels..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full px-3 pb-3">
            <div className="space-y-1">
              {filteredChannels.map((channel) => {
                const isActive = selectedChannel?.id === channel.id
                const ChannelIcon = channel.type === 'group' ? Users : channel.type === 'ticket' ? Hash : MessageSquare

                return (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary text-foreground'
                    )}
                  >
                    <ChannelIcon className="h-4 w-4 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{channel.name}</p>
                      <p className={cn(
                        'text-xs truncate',
                        isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}>
                        {channel.members.length} members
                      </p>
                    </div>
                    {channel.type === 'ticket' && (
                      <Badge variant={isActive ? 'secondary' : 'outline'} className="text-[10px]">
                        Ticket
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {selectedChannel.type === 'group' ? (
                      <Users className="h-5 w-5 text-primary" />
                    ) : (
                      <Hash className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedChannel.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {selectedChannel.members.length} members
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {channelMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                      <p className="text-sm">No messages yet</p>
                      <p className="text-xs">Start the conversation!</p>
                    </div>
                  ) : (
                    channelMessages.map((message, index) => {
                      const sender = getUser(message.senderId)
                      const isCurrentUser = message.senderId === currentUser?.id
                      const showAvatar = index === 0 || channelMessages[index - 1].senderId !== message.senderId

                      return (
                        <div
                          key={message.id}
                          className={cn(
                            'flex gap-3',
                            isCurrentUser && 'flex-row-reverse'
                          )}
                        >
                          {showAvatar ? (
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={sender?.avatar} />
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {sender?.name?.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="w-8" />
                          )}
                          <div className={cn(
                            'flex flex-col max-w-[70%]',
                            isCurrentUser && 'items-end'
                          )}>
                            {showAvatar && (
                              <div className={cn(
                                'flex items-center gap-2 mb-1',
                                isCurrentUser && 'flex-row-reverse'
                              )}>
                                <span className="text-xs font-medium">{sender?.name}</span>
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(message.createdAt), 'h:mm a')}
                                </span>
                              </div>
                            )}
                            <div className={cn(
                              'rounded-2xl px-4 py-2',
                              isCurrentUser
                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                : 'bg-secondary text-secondary-foreground rounded-tl-sm'
                            )}>
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
                <div className="relative flex-1">
                  <Input
                    placeholder="Type a message..."
                    className="pr-24"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a channel to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
