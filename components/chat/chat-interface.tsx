'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { getMockResponse } from '@/lib/get-mock-response'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Send, Bot, User, Loader2 } from 'lucide-react'

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
}

interface ChatInterfaceProps {
  conversationId: string | null
  onConversationCreated: (id: string, title: string) => void
  selectedPrompt?: string
  onPromptUsed: () => void
}

export function ChatInterface({ 
  conversationId, 
  onConversationCreated, 
  selectedPrompt,
  onPromptUsed 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        .select('hair_type, scalp_condition, hair_concerns')
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

      // Generate AI response
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
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && !loading && (
            <div className="text-center py-12">
              <Bot className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Welcome to HairCare AI!
              </h3>
              <p className="text-gray-600">
                Ask me anything about hair care, and I'll provide personalized advice based on your profile.
              </p>
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
                <Avatar className="h-8 w-8 bg-purple-600">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <Card className={`max-w-[80%] p-3 ${
                message.role === 'user' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white border'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
              </Card>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 bg-gray-600">
                  <AvatarFallback>
                    <User className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 bg-purple-600">
                <AvatarFallback>
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-white border p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your hair care routine..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
