'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getMockResponse } from '@/lib/get-mock-response'
import type { Database } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Send, Scissors, User, Loader2, Menu } from 'lucide-react'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

interface Profile {
  hair_type: string | null
  scalp_condition: string | null
  hair_concerns: string[] | null
  email: string
}

interface ChatInterfaceProps {
  conversationId: string | null
  onConversationCreated: (id: string, title: string) => void
  selectedPrompt?: string
  onPromptUsed: () => void
  onToggleSidebar?: () => void
  sidebarOpen?: boolean
}

export function ChatInterface({ 
  conversationId, 
  onConversationCreated, 
  selectedPrompt,
  onPromptUsed,
  onToggleSidebar,
  sidebarOpen
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (conversationId) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [conversationId])

  useEffect(() => {
    if (selectedPrompt) {
      setInput(selectedPrompt)
      onPromptUsed()
    }
  }, [selectedPrompt, onPromptUsed])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('hair_type, scalp_condition, hair_concerns, email')
        .eq('id', user.id)
        .single()
      
      setProfile(data)
    }
  }

  const fetchMessages = async () => {
    if (!conversationId) return

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  const createConversation = async (firstMessage: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const title = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating conversation:', error)
      return null
    }

    return data
  }

  const saveMessage = async (conversationId: string, content: string, role: 'user' | 'assistant') => {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        role
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving message:', error)
      return null
    }

    return data
  }

  const getEmailInitial = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    setLoading(true)
    const userMessage = input.trim()
    setInput('')

    try {
      let currentConversationId = conversationId

      // Create new conversation if needed
      if (!currentConversationId) {
        const newConversation = await createConversation(userMessage)
        if (newConversation) {
          currentConversationId = newConversation.id
          onConversationCreated(newConversation.id, newConversation.title)
        }
      }

      if (!currentConversationId) {
        throw new Error('Failed to create conversation')
      }

      // Add user message
      const userMsg = await saveMessage(currentConversationId, userMessage, 'user')
      if (userMsg) {
        setMessages(prev => [...prev, userMsg])
      }

      // Generate AI response with hair knowledge
      const aiResponse = getMockResponse(
        {
          hairType: profile?.hair_type || undefined,
          scalp: profile?.scalp_condition || undefined,
          concerns: profile?.hair_concerns || undefined
        },
        userMessage
      )

      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

      // Add AI response
      const aiMsg = await saveMessage(currentConversationId, aiResponse, 'assistant')
      if (aiMsg) {
        setMessages(prev => [...prev, aiMsg])
      }

    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="md:hidden border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="p-2 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </Button>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scissors className="h-5 w-5 text-blue-900" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">HairCare AI</h1>
              <p className="text-sm text-gray-500">Your hair care assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto">
          {messages.length === 0 && !loading && (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                  <Scissors className="h-10 w-10 text-blue-900" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Welcome to HairCare AI!
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  I'm your personal hair care assistant with extensive knowledge about hair types, treatments, products, and styling. 
                  Ask me anything about hair care routines, scalp health, hair growth, damage repair, or product recommendations!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-gray-900 mb-1">💡 Hair Analysis</div>
                    <div className="text-gray-600">Get personalized hair care advice</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-gray-900 mb-1">🔍 Product Help</div>
                    <div className="text-gray-600">Find the right hair products</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-gray-900 mb-1">📋 Hair Routines</div>
                    <div className="text-gray-600">Custom hair care routines</div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="font-medium text-gray-900 mb-1">🎯 Hair Solutions</div>
                    <div className="text-gray-600">Address hair concerns & problems</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-10 w-10 bg-blue-900 border-2 border-blue-700 shadow-md">
                  <AvatarFallback className="bg-blue-900">
                    <Scissors className="h-6 w-6 text-white stroke-2" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card className={`max-w-[80%] p-3 shadow-sm ${
                message.role === 'user' 
                  ? 'bg-blue-900 text-white border-blue-800' 
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </Card>

              {message.role === 'user' && profile && (
                <Avatar className="h-10 w-10 bg-gray-700 border-2 border-gray-600 shadow-md">
                  <AvatarFallback className="bg-gray-700 text-white font-bold text-base">
                    {getEmailInitial(profile.email)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-10 w-10 bg-blue-900 border-2 border-blue-700 shadow-md">
                <AvatarFallback className="bg-blue-900">
                  <Scissors className="h-6 w-6 text-white stroke-2" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-white border border-gray-200 p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-900" />
                  <span className="text-sm text-gray-600">Analyzing your hair care question...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hair care, treatments, products, or styling..."
              disabled={loading}
              className="flex-1 border-gray-300 focus:border-blue-900 focus:ring-blue-900"
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()} 
              className="bg-blue-900 hover:bg-blue-800 px-4 shadow-md"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}