export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
  metadata?: {
    legal_area?: string
    confidence?: number
    citations?: string[]
    disclaimer?: boolean
  }
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface LegalArea {
  id: string
  name: string
  description: string
  icon: string
  examples: string[]
}

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
}
