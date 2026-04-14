export type SpecialistType = 'HUMAN' | 'AI'
export type PostVisibility = 'PUBLIC' | 'SUBSCRIBERS_ONLY'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE'
export type MessageRole = 'USER' | 'ASSISTANT'

export interface Specialist {
  id: string
  creatorId: string
  name: string
  slug: string
  bio?: string | null
  avatarUrl?: string | null
  coverUrl?: string | null
  type: SpecialistType
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
  specialistId: string
  content: string
  mediaUrls: string[]
  visibility: PostVisibility
  createdAt: string
  updatedAt: string
  specialist?: Pick<Specialist, 'name' | 'avatarUrl' | 'slug'>
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
  specialistId: string
  subscriberId: string
  createdAt: string
  messages?: Message[]
}
