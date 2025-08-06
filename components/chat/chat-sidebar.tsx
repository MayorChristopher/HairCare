'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Plus, Settings, LogOut, User, Shield, Sparkles } from 'lucide-react'
import prompts from '@/data/prompts.json'

interface Conversation {
  id: string
  title: string
  created_at: string
}

interface Profile {
  id: string
  full_name: string | null
  role: 'user' | 'admin'
}

interface ChatSidebarProps {
  currentConversationId?: string
  onConversationSelect: (id: string) => void
  onNewChat: () => void
  onPromptSelect: (prompt: string) => void
}

export function ChatSidebar({ 
  currentConversationId, 
  onConversationSelect, 
  onNewChat,
  onPromptSelect 
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
    fetchConversations()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', user.id)
        .single()
      
      setProfile(data)
    }
  }

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('conversations')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
      
      setConversations(data || [])
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  const handleAdminClick = () => {
    router.push('/admin')
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h1 className="font-bold text-lg text-gray-900">HairCare AI</h1>
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Chats</h3>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => onConversationSelect(conversation.id)}
                >
                  <div className="flex items-start gap-2 w-full">
                    <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conversation.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No conversations yet
              </p>
            )}
          </div>

          <Separator className="my-4" />

          {/* Suggested Prompts */}
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Suggested Questions</h3>
            {prompts.slice(0, 6).map((prompt, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 text-sm"
                onClick={() => onPromptSelect(prompt)}
              >
                <div className="flex items-start gap-2 w-full">
                  <span className="text-purple-600">•</span>
                  <span className="flex-1 text-gray-700">{prompt}</span>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t">
        {profile && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {profile.full_name || 'User'}
                </p>
                <div className="flex items-center gap-1">
                  <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {profile.role}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleProfileClick}
                className="flex-1"
              >
                <User className="h-4 w-4" />
              </Button>
              
              {profile.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAdminClick}
                  className="flex-1"
                >
                  <Shield className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="flex-1"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
