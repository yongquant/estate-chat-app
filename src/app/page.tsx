'use client'

import { useState, useEffect } from 'react'

// Force dynamic rendering to avoid build-time issues with Supabase
export const dynamic = 'force-dynamic'

import { useChat } from '@/hooks/useChat'
import ChatInterface from '@/components/chat/ChatInterface'
import Sidebar from '@/components/sidebar/Sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LegalArea } from '@/types/chat'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'

export default function HomePage() {
  const [activeConversationId, setActiveConversationId] = useState<string>()
  const [user, setUser] = useState<User | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [emailInput, setEmailInput] = useState('')

  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  const {
    messages,
    conversations,
    isLoading,
    streamingMessage,
    sendMessage,
    loadConversations,
    loadMessages,
    deleteConversation
  } = useChat({ conversationId: activeConversationId })

  useEffect(() => {
    // Check auth state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadConversations()
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadConversations()
      } else {
        setActiveConversationId(undefined)
      }
    })

    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('resize', checkMobile)
    }
  }, [loadConversations])

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId)
    }
  }, [activeConversationId, loadMessages])

  const handleSendMessage = async (content: string | any[]) => {
    if (!user) {
      showEmailForm()
      return
    }

    const convId = await sendMessage(content, activeConversationId)
    if (convId && convId !== activeConversationId) {
      setActiveConversationId(convId)
    }
  }

  const handleFileUpload = async (files: File[], documentType: string) => {
    if (!user) {
      showEmailForm()
      return
    }

    // In a real implementation, you would upload files to Supabase Storage
    // and then analyze them with an AI service
    console.log('Document upload:', { files, documentType })

    // For now, we'll just show a placeholder response
    // In production, you'd process the documents and create appropriate responses
  }

  const handleNewConversation = () => {
    setActiveConversationId(undefined)
  }

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId)
  }

  const handleSelectLegalArea = (area: LegalArea) => {
    const prompt = `I have a question about ${area.name}. Can you help me understand ${area.description}?`
    handleSendMessage(prompt)
  }

  const showEmailForm = () => {
    setIsSigningIn(true)
  }

  const signInWithEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Error:', error.message)
        return
      }

      // Show success message to check email
      alert('Check your email for the login link!')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (emailInput.trim()) {
      signInWithEmail(emailInput.trim())
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    toast.success('Successfully signed out')
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-md p-8">
          <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6">
            <UserIcon className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Real Estate Assistant</h1>
          <p className="text-gray-600 mb-8">
            Get informed guidance on real estate matters. Sign in to start a conversation with our AI assistant.
          </p>

          {!isSigningIn ? (
            <Button onClick={showEmailForm} size="lg" className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Sign In with Email
            </Button>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSigningIn(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  <LogIn className="h-4 w-4 mr-2" />
                  Send Link
                </Button>
              </div>
            </form>
          )}

          <p className="text-xs text-gray-500 mt-4">
            We&apos;ll send you a magic link to sign in securely.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background">
      {!isMobile && (
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={deleteConversation}
          onSelectLegalArea={handleSelectLegalArea}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Sidebar
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                  onNewConversation={handleNewConversation}
                  onDeleteConversation={deleteConversation}
                  onSelectLegalArea={handleSelectLegalArea}
                  isMobile={true}
                />
              )}
              <h1 className="text-xl font-semibold">Real Estate Assistant</h1>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            streamingMessage={streamingMessage}
            onFileUpload={handleFileUpload}
          />
        </div>
      </div>
    </div>
  )
}
