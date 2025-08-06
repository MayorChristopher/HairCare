'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { ChatInterface } from '@/components/chat/chat-interface'
import type { Database } from '@/lib/supabase'

export default function ChatPage() {
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [selectedPrompt, setSelectedPrompt] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)
  const router = useRouter()
  const supabase = createClientComponentClient<Database>()

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
    // Trigger sidebar refresh
    setRefreshTrigger(prev => prev + 1)
  }

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt)
  }

  const handlePromptUsed = () => {
    setSelectedPrompt('')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-900 border-t-transparent"></div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading HairCare AI</h2>
            <p className="text-gray-600">Preparing your personalized hair care assistant...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out md:hidden ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <ChatSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={(id) => {
            handleConversationSelect(id)
            setSidebarOpen(false) // Close sidebar on mobile after selection
          }}
          onNewChat={() => {
            handleNewChat()
            setSidebarOpen(false) // Close sidebar on mobile after new chat
          }}
          onPromptSelect={(prompt) => {
            handlePromptSelect(prompt)
            setSidebarOpen(false) // Close sidebar on mobile after prompt selection
          }}
          refreshTrigger={refreshTrigger}
          isMobile={true}
        />
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block lg:w-80 md:w-72 flex-shrink-0">
        <ChatSidebar
          currentConversationId={currentConversationId}
          onConversationSelect={handleConversationSelect}
          onNewChat={handleNewChat}
          onPromptSelect={handlePromptSelect}
          refreshTrigger={refreshTrigger}
          isMobile={false}
        />
      </div>
      
      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        <ChatInterface
          conversationId={currentConversationId}
          onConversationCreated={handleConversationCreated}
          selectedPrompt={selectedPrompt}
          onPromptUsed={handlePromptUsed}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
      </div>
    </div>
  )
}