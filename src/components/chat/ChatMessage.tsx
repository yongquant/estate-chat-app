'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Message } from '@/types/chat'
import { Bot, User, AlertTriangle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

const ChatMessage = ({ message, isStreaming = false }: ChatMessageProps) => {
  const isAssistant = message.role === 'assistant'
  const hasDisclaimer = message.metadata?.disclaimer
  const realEstateArea = message.metadata?.legal_area
  const confidence = message.metadata?.confidence
  const citations = message.metadata?.citations

  return (
    <div className={cn('flex gap-4 px-6 py-4', isAssistant ? 'bg-muted/30' : '')}>
      <Avatar className={cn('h-8 w-8 flex-shrink-0 mt-1')}>
        {isAssistant ? (
          <>
            <AvatarFallback className={cn('bg-primary text-primary-foreground')}>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
            <AvatarImage src="/placeholder-avatar.jpg" />
          </>
        ) : (
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={cn('flex-1 space-y-4')}>
        <div className={cn('flex items-center gap-2')}>
          <span className={cn('text-sm font-medium')}>
            {isAssistant ? 'Real Estate Assistant' : 'You'}
          </span>
          {realEstateArea && (
            <Badge variant="secondary" className={cn('text-xs')}>
              {realEstateArea}
            </Badge>
          )}
          {confidence && (
            <Badge variant="outline" className={cn('text-xs')}>
              {Math.round(confidence * 100)}% confidence
            </Badge>
          )}
        </div>

        <div className={cn('prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-p:text-sm prose-p:leading-relaxed prose-strong:font-semibold')}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={cn("bg-muted px-1.5 py-0.5 rounded-sm font-mono text-sm", className)} {...props}>
                    {children}
                  </code>
                )
              },
              p({ children }) {
                return <p className={cn('text-sm leading-relaxed', isStreaming && 'animate-pulse')}>{children}</p>
              },
              ul({ children }) {
                return <ul className="list-disc list-outside ml-4 space-y-1">{children}</ul>
              },
              ol({ children }) {
                return <ol className="list-decimal list-outside ml-4 space-y-1">{children}</ol>
              },
              li({ children }) {
                return <li className="text-sm">{children}</li>
              },
              a({ children, ...props }) {
                return (
                  <a className="text-primary hover:underline" {...props}>
                    {children}
                  </a>
                )
              }
            }}
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {citations?.length > 0 && (
          <Card className={cn('p-3 bg-blue-50 border-blue-200')}>
            <div className={cn('flex items-start gap-2')}>
              <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-900 mb-1">References:</p>
                <ul className="list-disc list-outside ml-4 space-y-1">
                  {citations.map((citation, index) => (
                    <li key={index} className="text-xs text-blue-800">
                      {citation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {hasDisclaimer && isAssistant && (
          <Card className={cn('p-3 bg-amber-50 border-amber-200')}>
            <div className={cn('flex items-start gap-2')}>
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                <strong>Important Notice:</strong> This information is for educational purposes only
                and should not be considered legal advice.
              </p>
            </div>
          </Card>
        )}

        <p className={cn('text-xs text-muted-foreground')}>
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  )
}

export default ChatMessage
