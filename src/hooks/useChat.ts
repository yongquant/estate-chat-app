'use client'

import { useState, useCallback, useEffect } from 'react'
import { Message, Conversation } from '@/types/chat'
import { supabase } from '@/lib/supabase'
import { useCompletion } from '@ai-sdk/react'

interface Message {
  id: string;
  content: string | Array<{ type: string; text?: string; file?: File; mimeType?: string; data?: ArrayBuffer }>;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  metadata?: any;
}

interface UseChatProps {
  conversationId?: string;
}

export function useChat({ conversationId: initialConversationId }: UseChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);

  // Use the completion hook for AI interaction
  const { completion, complete, isLoading: isCompletionLoading } = useCompletion({
    api: '/api/chat',
    onResponse: () => {
      // When response starts, create a new streaming message
      const streamingMsg: Message = {
        id: crypto.randomUUID(),
        content: '',
        role: 'assistant',
        created_at: new Date().toISOString()
      }
      setStreamingMessage(streamingMsg)
    },
    onUpdate: (completion) => {
      // Update streaming message content as it comes in
      setStreamingMessage(prev => prev ? { ...prev, content: completion } : null)
    },
    onFinish: async (prompt, completion) => {
      // When response finishes, save the message
      const finalMessage: Message = {
        id: streamingMessage?.id || crypto.randomUUID(),
        content: completion,
        role: 'assistant',
        created_at: new Date().toISOString()
      }

      if (initialConversationId) {
        const savedMessage = await saveMessage(finalMessage, initialConversationId)
        if (savedMessage) {
          setMessages(prev => [...prev, savedMessage])
        }
      } else {
        // If no conversationId, just add to messages directly
        setMessages(prev => [...prev, finalMessage])
      }

      // Only clear streaming message after we've updated the messages array
      setStreamingMessage(null)
    }
  })

  const loadConversations = useCallback(async () => {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setConversations(conversations || [])
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }, [])

  const generateConversationTitle = useCallback(async (message: string): Promise<string> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: 'You are a title generator. Generate a very brief (3-5 words) title. Response should be ONLY the title, nothing else.'
          }, {
            role: 'user',
            content: message
          }]
        })
      })

      if (!response.ok) throw new Error('Failed to generate title')

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let title = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          // Remove "data: " prefix and parse JSON
          const lines = chunk.split('\n').filter(line => line.trim())
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6)
              if (jsonStr === '[DONE]') continue
              try {
                const data = JSON.parse(jsonStr)
                title += data.text || ''
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      return title.trim() || message.slice(0, 100)
    } catch (error) {
      console.error('Error generating title:', error)
      return message.slice(0, 100)
    }
  }, [])

  const createConversation = useCallback(async (title: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          title,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) throw error
      await loadConversations()
      return data.id
    } catch (error) {
      console.error('Error creating conversation:', error)
      return null
    }
  }, [loadConversations])

  const saveMessage = useCallback(async (message: Message, conversationId: string): Promise<Message | null> => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
          role: message.role,
          metadata: message.metadata
        }])
        .select()
        .single()

      if (error) throw error

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

      return data
    } catch (error) {
      console.error('Error saving message:', error)
      return null
    }
  }, [])

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }, [])

  const sendMessage = useCallback(async (
    content: string | Array<{ type: string; text?: string; file?: File; mimeType?: string }>,
    conversationId?: string
  ) => {
    try {
      setIsLoading(true)
      let convId = conversationId

      // Create conversation if needed
      if (!convId && typeof content === 'string') {
        const title = await generateConversationTitle(content)
        convId = await createConversation(title)
      }

      // Create user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        content,
        role: 'user',
        created_at: new Date().toISOString()
      }

      // Add user message to messages
      setMessages(prev => [...prev, userMessage])

      if (convId) {
        await saveMessage(userMessage, convId)
      }

      // If content contains files, we need to prepare them for the API
      if (Array.isArray(content)) {
        const preparedContent = await Promise.all(
          content.map(async (item) => {
            if (item.file) {
              const arrayBuffer = await item.file.arrayBuffer()
              return {
                ...item,
                data: arrayBuffer,
                file: undefined // Remove the File object as it can't be serialized
              }
            }
            return item
          })
        )

        // Send message with file data
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: convId,
            messages: [
              { role: 'user', content: preparedContent }
            ]
          })
        })

        if (!response.ok) throw new Error('Failed to send message')

        const result = await response.json()

        // Create assistant message
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          content: result.text,
          role: 'assistant',
          created_at: new Date().toISOString()
        }

        if (convId) {
          const savedMessage = await saveMessage(assistantMessage, convId)
          if (savedMessage) {
            setMessages(prev => [...prev, savedMessage])
          }
        } else {
          setMessages(prev => [...prev, assistantMessage])
        }
      } else {
        // For text-only messages, use the completion hook with conversation context
        await complete(content as string, {
          body: {
            conversationId: convId
          }
        })
      }
      return convId
    } catch (error) {
      console.error('Error sending message:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [complete, messages, generateConversationTitle, createConversation, saveMessage])

  const deleteConversation = useCallback(async (convId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', convId)

      if (error) throw error
      await loadConversations()
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }, [loadConversations])

  // Load initial conversation if ID provided
  useEffect(() => {
    if (initialConversationId) {
      loadMessages(initialConversationId)
    }
  }, [initialConversationId, loadMessages])

  return {
    messages,
    conversations,
    isLoading: isLoading || isCompletionLoading,
    streamingMessage: streamingMessage ? { ...streamingMessage, content: completion } : null,
    sendMessage,
    deleteConversation,
    loadConversations,
    loadMessages
  }
}
