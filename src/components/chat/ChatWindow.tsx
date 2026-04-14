'use client'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import type { Message, Specialist } from '@/types'

interface ChatWindowProps {
  specialist: Specialist
  conversationId: string | null
  initialMessages: Message[]
}

export function ChatWindow({
  specialist,
  conversationId: initialConvId,
  initialMessages,
}: ChatWindowProps) {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [conversationId, setConversationId] = useState<string | null>(initialConvId)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createBrowserSupabaseClient()

  // Subscribe to Supabase Realtime for new messages
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom when messages or streaming content change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  async function handleSend(content: string) {
    if (isLoading) return
    setIsLoading(true)

    // Optimistic user message
    const tempId = `temp-${Date.now()}`
    const userMessage: Message = {
      id: tempId,
      conversationId: conversationId ?? '',
      role: 'USER',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistId: specialist.id,
          content,
          conversationId,
        }),
      })

      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        return
      }

      // Capture new conversation id from header if first message
      const newConvId = res.headers.get('X-Conversation-Id')
      if (newConvId && !conversationId) {
        setConversationId(newConvId)
      }

      // Stream response for AI specialists
      if (specialist.type === 'AI' && res.body) {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        setStreamingContent('')

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          setStreamingContent(accumulated)
        }

        setStreamingContent('')
        // The persisted DB message arrives via Supabase Realtime
      }
    } catch (err) {
      console.error('Send error:', err)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setIsLoading(false)
    }
  }

  const showTypingIndicator = isLoading && !streamingContent && specialist.type === 'AI'

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <header className="flex items-center gap-3 px-4 md:px-6 py-3 md:py-4 border-b border-outline-variant/20 bg-surface-container-low flex-shrink-0">
        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
          {specialist.avatarUrl ? (
            <img
              src={specialist.avatarUrl}
              alt={specialist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
              <span className="text-lg font-black text-primary" aria-hidden="true">
                {specialist.name[0]}
              </span>
            </div>
          )}
          {specialist.type === 'AI' && (
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-surface-container"
              title="AI Specialist"
              aria-hidden="true"
            />
          )}
        </div>
        <div>
          <h2 className="text-white font-bold text-sm">{specialist.name}</h2>
          <p className="text-outline text-xs">
            {specialist.type === 'AI'
              ? 'AI Specialist · Always available'
              : 'Human Creator'}
          </p>
        </div>
      </header>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto p-3 md:p-6 space-y-2 no-scrollbar"
        role="list"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {/* Empty state */}
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-primary text-2xl">
                waving_hand
              </span>
            </div>
            <p className="text-white font-bold mb-1">Start a conversation</p>
            <p className="text-outline text-sm max-w-xs">
              {specialist.type === 'AI'
                ? `Ask ${specialist.name} anything about ${specialist.specialty ?? 'their expertise'}.`
                : `Send ${specialist.name} a message. They'll respond specialistlly.`}
            </p>
          </div>
        )}

        {/* Persisted messages */}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            specialistName={specialist.name}
            specialistAvatarUrl={specialist.avatarUrl}
            userName={user?.fullName}
            userAvatarUrl={user?.imageUrl}
          />
        ))}

        {/* Streaming response bubble */}
        {streamingContent && (
          <ChatMessage
            message={{
              id: 'streaming',
              conversationId: conversationId ?? '',
              role: 'ASSISTANT',
              content: streamingContent,
              createdAt: new Date().toISOString(),
            }}
            specialistName={specialist.name}
            specialistAvatarUrl={specialist.avatarUrl}
          />
        )}

        {/* Typing indicator */}
        {showTypingIndicator && (
          <div className="flex gap-3 mb-4" aria-label="Typing indicator" role="status">
            <div
              className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border border-outline-variant/20 bg-surface-container-high"
              aria-hidden="true"
            >
              {specialist.avatarUrl ? (
                <img
                  src={specialist.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
                  <span className="text-xs font-bold text-primary">
                    {specialist.name[0]}
                  </span>
                </div>
              )}
            </div>
            <div className="bg-surface-container border border-outline-variant/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              <span className="typing-dot w-2 h-2 rounded-full bg-outline" />
              <span className="typing-dot w-2 h-2 rounded-full bg-outline" />
              <span className="typing-dot w-2 h-2 rounded-full bg-outline" />
            </div>
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        disabled={isLoading}
        placeholder={`Message ${specialist.name}...`}
      />
    </div>
  )
}
