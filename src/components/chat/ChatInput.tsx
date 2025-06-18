'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, Paperclip } from 'lucide-react'
import { useState, KeyboardEvent } from 'react'
import DocumentUpload from './DocumentUpload'
import { toast } from 'sonner'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  onFileUpload?: (files: File[], documentType: string) => void
}

export default function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "Describe your real estate question in detail...",
  onFileUpload
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)

  const handleSend = () => {
    if (!message.trim() || isLoading) return

    onSendMessage(message.trim())
    setMessage('')
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFileUpload = async (files: File[], documentType: string) => {
    try {
      // Create FormData and append files
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('documentType', documentType);

      // Upload files
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      // Call parent's onFileUpload if it exists
      onFileUpload?.(files, documentType);
      setShowDocumentUpload(false);

      // Auto-generate a message about the uploaded documents
      const fileNames = files.map(f => f.name).join(', ');
      onSendMessage(`I've uploaded ${files.length} document(s) (${fileNames}) of type "${documentType}". Can you help me understand these documents?`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    }
  };

  return (
    <div className="border-t bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        {showDocumentUpload && onFileUpload && (
          <DocumentUpload
            onFileUpload={handleFileUpload}
            isLoading={isLoading}
          />
        )}

        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col gap-2">
            {onFileUpload && (
              <Button
                onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                variant="outline"
                size="icon"
                className="h-[28px] w-[28px]"
              >
                <Paperclip className="h-3 w-3" />
              </Button>
            )}
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter to send, Shift+Enter for new line.
          <span className="font-medium"> Remember: This is educational information only, not legal advice.</span>
        </p>
      </div>
    </div>
  )
}
