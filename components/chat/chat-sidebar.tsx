'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { 
  MessageSquare, 
  Plus, 
  LogOut, 
  User, 
  Shield, 
  Scissors, 
  Settings,
  Crown,
  Calendar,
  MessageCircle,
  Lightbulb,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import prompts from '@/data/prompts.json'
import type { Database } from '@/lib/supabase'

interface Conversation {
  id: string
  title: string
  created_at: string
}

interface Profile {
  id: string
  full_name: string | null
  role: 'user' | 'admin'
  email: string
  created_at: string
}

interface ChatSidebarProps {
  currentConversationId?: string
  onConversationSelect: (id: string) => void
  onNewChat: () => void
  onPromptSelect: (prompt: string) => void
  refreshTrigger?: number
  isMobile?: boolean
}

export function ChatSidebar({ 
  currentConversationId, 
  onConversationSelect, 
  onNewChat,
  onPromptSelect,
  refreshTrigger,
  isMobile = false
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPrompts, setShowPrompts] = useState(false)
  const [showAccountDetails, setShowAccountDetails] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchProfile()
    fetchConversations()
  }, [])

  // Auto-refresh conversations when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger) {
      fetchConversations()
    }
  }, [refreshTrigger])

  // Set up real-time subscription for conversations
  useEffect(() => {
    const channel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'conversations' 
        }, 
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, role, email, created_at')
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

  const getEmailInitial = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100 bg-blue-900">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-2 bg-blue-800 rounded-xl shadow-lg flex-shrink-0">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-lg text-white truncate">HairCare Recommender</h1>
              <p className="text-xs text-blue-200 truncate">Your personal assistant</p>
            </div>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}} // This will be handled by the parent overlay
              className="p-2 hover:bg-blue-800 flex-shrink-0"
            >
              <X className="h-4 w-4 text-white" />
            </Button>
          )}
        </div>
        
        <Button 
          onClick={onNewChat}
          className="w-full justify-start gap-2 h-10 bg-blue-800 hover:bg-blue-700 text-white shadow-lg text-sm"
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium truncate">New Conversation</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {/* Quick Actions */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-900 truncate">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPrompts(!showPrompts)}
                className="justify-start gap-1 h-8 text-xs p-2"
              >
                <Lightbulb className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Prompts</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleProfileClick}
                className="justify-start gap-1 h-8 text-xs p-2"
              >
                <Settings className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">Profile</span>
              </Button>
            </div>
          </div>

          {/* Suggested Prompts */}
          {showPrompts && (
            <div className="px-3 pb-3">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium text-blue-900 truncate">Suggested Questions</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrompts(false)}
                      className="h-5 w-5 p-0 text-blue-600 hover:bg-blue-100 flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {prompts.slice(0, 4).map((prompt, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-2 text-xs hover:bg-blue-100"
                        onClick={() => {
                          onPromptSelect(prompt)
                          setShowPrompts(false)
                        }}
                      >
                        <div className="flex items-start gap-2 w-full min-w-0">
                          <span className="text-blue-600 mt-0.5 flex-shrink-0">•</span>
                          <span className="flex-1 text-blue-800 leading-relaxed break-words">{prompt}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator className="mx-3" />

          {/* Conversations */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-900 truncate">Recent Conversations</h3>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {conversations.length}
              </Badge>
            </div>
            
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <Button
                    key={conversation.id}
                    variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                    className={`w-full justify-start text-left h-auto p-2 ${
                      currentConversationId === conversation.id 
                        ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onConversationSelect(conversation.id)}
                  >
                    <div className="flex items-start gap-2 w-full min-w-0">
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                        currentConversationId === conversation.id 
                          ? 'bg-blue-100' 
                          : 'bg-gray-100'
                      }`}>
                        <MessageCircle className={`h-3 w-3 ${
                          currentConversationId === conversation.id 
                            ? 'text-blue-600' 
                            : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate mb-1">
                          {conversation.title}
                        </p>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-2 w-2 text-gray-400 flex-shrink-0" />
                          <p className="text-xs text-gray-500 truncate">
                            {formatDate(conversation.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-600 mb-1">No conversations yet</p>
                  <p className="text-xs text-gray-500">Start a new chat to begin!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Collapsible User Profile Section */}
      <div className="border-t border-gray-200 bg-gray-50">
        {profile && (
          <div className="p-3">
            {/* Collapsed Account Header */}
            <Button
              variant="ghost"
              onClick={() => setShowAccountDetails(!showAccountDetails)}
              className="w-full p-2 h-auto justify-between hover:bg-white/50 border border-gray-200 bg-white rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Avatar className="h-10 w-10 bg-blue-900 border-2 border-blue-700 shadow-md flex-shrink-0">
                  <AvatarFallback className="bg-blue-900 text-white font-bold text-base">
                    {getEmailInitial(profile.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {profile.full_name || 'User'}
                  </p>
                  <div className="flex items-center gap-1">
                    {profile.role === 'admin' ? (
                      <Badge variant="default" className="text-xs bg-blue-900">
                        <Crown className="h-3 w-3 mr-1 stroke-2" />
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <User className="h-3 w-3 mr-1 stroke-2" />
                        User
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {showAccountDetails ? (
                <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0 stroke-2" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0 stroke-2" />
              )}
            </Button>

            {/* Expanded Account Details */}
            {showAccountDetails && (
              <Card className="mt-2 bg-white border-gray-200 shadow-sm">
                <CardContent className="p-3">
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0 stroke-2" />
                        <span className="text-xs font-medium text-gray-700">Account Details</span>
                      </div>
                      <div className="pl-5 space-y-1">
                        <p className="text-xs text-gray-900 break-words">{profile.full_name || 'No name set'}</p>
                        <p className="text-xs text-gray-500 break-all">{profile.email}</p>
                        <p className="text-xs text-gray-500">
                          Member since {new Date(profile.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="space-y-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleProfileClick}
                        className="w-full justify-start gap-2 h-8 text-xs"
                      >
                        <Settings className="h-4 w-4 flex-shrink-0 stroke-2" />
                        <span className="truncate">Edit Profile</span>
                      </Button>
                      
                      {profile.role === 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleAdminClick}
                          className="w-full justify-start gap-2 h-8 text-xs"
                        >
                          <Shield className="h-4 w-4 flex-shrink-0 stroke-2" />
                          <span className="truncate">Admin Panel</span>
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full justify-start gap-2 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <LogOut className="h-4 w-4 flex-shrink-0 stroke-2" />
                        <span className="truncate">Sign Out</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}