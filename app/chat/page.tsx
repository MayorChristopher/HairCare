'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatInterface } from '@/components/chat/chat-interface'

export default function ChatPage() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth')
    } else {
      setUser(user)
    }
  }

  const handleConversationSelect = (id: string) => {
    setCurrentConversationId(id)
  }

  const handleNewChat = () => {
    setCurrentConversationId(null)
  }

  const handleConversationCreated = (id: string, title: string) => {
    setCurrentConversationId(id)
  }

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt)
  }

  const handlePromptUsed = () => {
    setSelectedPrompt('')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen">
      <div className="w-80 flex-shrink-0">
        <ChatSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          onNewChat={handleNewChat}
          onPromptSelect={handlePromptSelect}
        />
      </div>
      <div className="flex-1">
        <ChatInterface
          conversationId={currentConversationId}
          onConversationCreated={handleConversationCreated}
          selectedPrompt={selectedPrompt}
          onPromptUsed={handlePromptUsed}
        />
      </div>
    </div>
  )
}
