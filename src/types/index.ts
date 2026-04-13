export type PersonaType = 'HUMAN' | 'AI'
export type PostVisibility = 'PUBLIC' | 'SUBSCRIBERS_ONLY'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE'
export type MessageRole = 'USER' | 'ASSISTANT'

export interface Persona {
  id: string
  creatorId: string
  name: string
  slug: string
  bio?: string | null
  avatarUrl?: string | null
  coverUrl?: string | null
  type: PersonaType
  specialty?: string | null
  tagline?: string | null
  isPublished: boolean
  subscriptionPrice: number
  currency: string
  stripePriceId?: string | null
  createdAt: string
  updatedAt: string
  creator?: { name?: string | null; avatarUrl?: string | null }
}

export interface Post {
  id: string
  personaId: string
  content: string
  mediaUrls: string[]
  visibility: PostVisibility
  createdAt: string
  updatedAt: string
  persona?: Pick<Persona, 'name' | 'avatarUrl' | 'slug'>
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  personaId: string
  subscriberId: string
  createdAt: string
  messages?: Message[]
}
