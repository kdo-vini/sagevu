'use client'
import { useState, useEffect, useRef } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import type { Message } from '@/types'

interface ReplyPanelProps {
  conversationId: string
  initialMessages: Message[]
  specialistName: string
  specialistAvatarUrl: string | null
  subscriberName: string
  subscriberAvatarUrl: string | null
}

export function ReplyPanel({
  conversationId,
  initialMessages,
  specialistName,
  specialistAvatarUrl,
  subscriberName,
  subscriberAvatarUrl,
}: ReplyPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const supabase = createBrowserSupabaseClient()

  // Supabase Realtime — receive new subscriber messages live
  useEffect(() => {
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
          const incoming = payload.new as Message
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev
            return [...prev, incoming]
          })
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const trimmed = content.trim()
    if (!trimmed || isSending) return

    setIsSending(true)
    setError(null)

    // Optimistic assistant message
    const tempId = `temp-${Date.now()}`
    const optimisticMsg: Message = {
      id: tempId,
      conversationId,
      role: 'ASSISTANT',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setContent('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const res = await fetch(`/api/conversations/${conversationId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to send reply')
      }

      const saved: Message = await res.json()

      // Replace temp message with persisted one
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? saved : m))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reply')
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setIsSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const canSend = content.trim().length > 0 && !isSending

  return (
    <div className="flex flex-col h-full">
      {/* Messages area — subscriber on left, creator (ASSISTANT) on right */}
      <div
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 no-scrollbar"
        role="list"
        aria-label="Conversation messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4"
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-outline text-2xl">
                chat_bubble_outline
              </span>
            </div>
            <p className="text-white font-bold mb-1">No messages yet</p>
            <p className="text-outline text-sm max-w-xs">
              When {subscriberName} sends a message, it will appear here.
            </p>
          </div>
        )}

        {messages.map((message) => {
          // From the creator's perspective: USER = subscriber (left), ASSISTANT = creator (right)
          const isCreatorReply = message.role === 'ASSISTANT'
          const displayName = isCreatorReply ? specialistName : subscriberName
          const avatarUrl = isCreatorReply ? specialistAvatarUrl : subscriberAvatarUrl

          return (
            <div
              key={message.id}
              className={cn('flex gap-3 mb-6', isCreatorReply && 'flex-row-reverse')}
              role="listitem"
            >
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border border-outline-variant/20 bg-surface-container-high"
                aria-hidden="true"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div
                    className={cn(
                      'w-full h-full flex items-center justify-center',
                      isCreatorReply
                        ? 'bg-gradient-to-br from-primary/20 to-primary-container/20'
                        : 'bg-surface-container-highest'
                    )}
                  >
                    <span
                      className={cn(
                        'text-xs font-bold',
                        isCreatorReply ? 'text-primary' : 'text-on-surface-variant'
                      )}
                    >
                      {displayName[0]?.toUpperCase() ?? '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div className={cn('max-w-[75%] space-y-1', isCreatorReply && 'items-end flex flex-col')}>
                <div
                  className={cn(
                    'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                    isCreatorReply
                      ? 'bg-gradient-to-br from-primary/20 to-primary-container/20 text-white border border-primary/20 rounded-tr-sm'
                      : 'bg-surface-container border border-outline-variant/10 text-on-surface-variant rounded-tl-sm'
                  )}
                  aria-label={`${displayName}: ${message.content}`}
                >
                  {message.content}
                </div>
                <time
                  dateTime={message.createdAt}
                  className="text-[10px] text-outline px-1"
                >
                  {formatRelativeTime(new Date(message.createdAt))}
                </time>
              </div>
            </div>
          )
        })}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="mx-4 mb-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2"
          role="alert"
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">
            error
          </span>
          {error}
        </div>
      )}

      {/* Reply input */}
      <div className="border-t border-outline-variant/20 bg-surface-container-low p-4 flex-shrink-0">
        <div className="flex items-end gap-3 bg-surface-container-high border border-outline-variant/30 rounded-2xl px-4 py-3 focus-within:border-primary/50 transition-colors duration-200">
          <label htmlFor="creator-reply-input" className="sr-only">
            Reply as {specialistName}
          </label>
          <textarea
            id="creator-reply-input"
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Reply as ${specialistName}...`}
            disabled={isSending}
            rows={1}
            aria-label={`Reply as ${specialistName}`}
            className="flex-1 bg-transparent text-on-surface text-sm placeholder:text-outline resize-none outline-none leading-relaxed max-h-40 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send reply"
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
              canSend
                ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary hover:scale-110 active:scale-95'
                : 'bg-surface-container-highest text-outline cursor-not-allowed'
            )}
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              send
            </span>
          </button>
        </div>
        <p className="text-outline text-[10px] text-center mt-2" aria-hidden="true">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
