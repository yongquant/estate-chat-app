'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Message } from '@/types/chat'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import { useEffect, useRef, useMemo } from 'react'

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string | any[]) => void
  isLoading?: boolean
  streamingMessage?: Message | null
  onFileUpload?: (files: File[], documentType: string) => void
}

export default function ChatInterface({
  messages,
  onSendMessage,
  isLoading = false,
  streamingMessage,
  onFileUpload
}: ChatInterfaceProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingMessage])

  const allMessages = useMemo(() =>
    streamingMessage ? [...messages, streamingMessage] : messages,
    [messages, streamingMessage]
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="mx-auto max-w-4xl">
            {allMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
                    Welcome to Real Estate Assistant
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    Ask questions about real estate matters or upload documents for review. Remember, this is
                    educational information only and not legal advice.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {allMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id || `temp-${index}`}
                    message={message}
                    isStreaming={streamingMessage?.id === message.id}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        onFileUpload={onFileUpload}
      />
    </div>
  )
}
