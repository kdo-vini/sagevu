import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) {
    redirect('/sign-in')
  }

  // Fetch conversations where the user is either the subscriber OR the creator of the persona
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { subscriberId: user.id },
        { persona: { creatorId: user.id } }
      ]
    },
    include: {
      persona: {
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          type: true,
          creatorId: true,
        }
      },
      subscriber: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Get only the latest message for preview
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  // Sort logically: conversations with recent messages first
  conversations.sort((a, b) => {
    const timeA = a.messages[0]?.createdAt.getTime() ?? a.createdAt.getTime()
    const timeB = b.messages[0]?.createdAt.getTime() ?? b.createdAt.getTime()
    return timeB - timeA
  })

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 lg:ml-72 min-h-screen px-6 py-12 pb-20 lg:pb-12 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
              Messages
            </h1>
            <p className="text-outline text-sm">
              Your active conversations with experts and subscribers.
            </p>
          </div>

          {/* Conversations List */}
          {conversations.length === 0 ? (
            <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-12 text-center">
              <div
                className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <span className="material-symbols-outlined text-outline text-2xl">
                  forum
                </span>
              </div>
              <h3 className="text-white font-bold mb-2">No messages yet</h3>
              <p className="text-outline text-sm max-w-sm mx-auto mb-6">
                When you subscribe to a persona, your direct conversations will appear here.
              </p>
              <Link 
                href="/discover"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-surface-container-lowest font-bold rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                Find Personas
              </Link>
            </div>
          ) : (
            <div className="bg-surface-container border border-outline-variant/10 rounded-2xl overflow-hidden divide-y divide-outline-variant/10">
              {conversations.map((conv) => {
                // Determine who the "other party" is in this conversation
                const isUserTheCreator = conv.persona.creatorId === user.id
                
                // If I am the creator, the other party is the subscriber.
                // If I am the subscriber, the other party is the persona.
                const otherPartyName = isUserTheCreator ? (conv.subscriber.name || 'Subscriber') : conv.persona.name
                const otherPartyAvatar = isUserTheCreator ? conv.subscriber.avatarUrl : conv.persona.avatarUrl
                const linkHref = `/${conv.persona.slug}/chat` // Chat route is currently standard under the persona slug
                
                const lastMessage = conv.messages[0]

                return (
                  <Link 
                    key={conv.id} 
                    href={linkHref}
                    className="flex items-center gap-4 p-4 sm:p-6 hover:bg-surface-container-high transition-colors group"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/10 flex-shrink-0">
                      {otherPartyAvatar ? (
                        <img src={otherPartyAvatar} alt={otherPartyName} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
                          <span className="text-sm font-bold text-primary">{otherPartyName[0]}</span>
                        </div>
                      )}
                      {!isUserTheCreator && conv.persona.type === 'AI' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-surface-container" title="AI Persona" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-white font-bold text-sm truncate group-hover:text-primary transition-colors">
                          {otherPartyName}
                        </h3>
                        {lastMessage && (
                          <span className="text-[10px] text-outline flex-shrink-0 ml-2 uppercase font-medium tracking-wide">
                            {new Date(lastMessage.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-outline truncate flex items-center gap-2">
                        {isUserTheCreator && (
                          <span className="inline-block px-1.5 py-0.5 rounded-sm bg-surface-variant text-[9px] uppercase tracking-wider text-on-surface-variant">
                            {conv.persona.name} (Your Persona)
                          </span>
                        )}
                        <span className="truncate">
                          {lastMessage ? (
                            <>
                              {lastMessage.role === 'USER' && isUserTheCreator && <span className="text-primary mr-1">They:</span>}
                              {lastMessage.role === 'ASSISTANT' && !isUserTheCreator && <span className="text-primary mr-1">Reply:</span>}
                              {lastMessage.role === 'USER' && !isUserTheCreator && <span className="text-white/40 mr-1">You:</span>}
                              {lastMessage.role === 'ASSISTANT' && isUserTheCreator && <span className="text-white/40 mr-1">You:</span>}
                              {lastMessage.content}
                            </>
                          ) : (
                            <span className="italic opacity-50">No messages yet</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
