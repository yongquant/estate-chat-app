'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Menu, MessageSquare, Scale } from 'lucide-react'
import ConversationsList from './ConversationsList'
import LegalAreasPanel from './LegalAreasPanel'
import { Conversation, LegalArea } from '@/types/chat'

interface SidebarProps {
  conversations: Conversation[]
  activeConversationId?: string
  onSelectConversation: (conversationId: string) => void
  onNewConversation: () => void
  onDeleteConversation: (conversationId: string) => void
  onSelectLegalArea: (area: LegalArea) => void
  isMobile?: boolean
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSelectLegalArea,
  isMobile = false
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const SidebarContent = () => (
    <div className="h-full w-80 border-r bg-background">
      <Tabs defaultValue="conversations" className="h-full flex flex-col">
        <div className="border-b p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversations" className="text-xs">
              <MessageSquare className="h-4 w-4 mr-1" />
              Chats
            </TabsTrigger>
            <TabsTrigger value="legal-areas" className="text-xs">
              <Scale className="h-4 w-4 mr-1" />
              Topics
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="conversations" className="h-full m-0">
            <ConversationsList
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={(id) => {
                onSelectConversation(id)
                if (isMobile) setIsOpen(false)
              }}
              onNewConversation={() => {
                onNewConversation()
                if (isMobile) setIsOpen(false)
              }}
              onDeleteConversation={onDeleteConversation}
            />
          </TabsContent>

          <TabsContent value="legal-areas" className="h-full m-0 overflow-auto">
            <LegalAreasPanel 
              onSelectArea={(area) => {
                onSelectLegalArea(area)
                if (isMobile) setIsOpen(false)
              }} 
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-80">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  return <SidebarContent />
}
