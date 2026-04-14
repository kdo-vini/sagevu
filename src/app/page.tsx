'use client'
import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─── Data ─── */
const FEATURES = [
  {
    icon: 'smart_toy',
    title: 'AI Specialists',
    desc: 'Chat with AI-powered experts trained on specialized knowledge. Available 24/7, always sharp.',
    gradient: 'from-[#8781FF] to-[#C4C0FF]',
  },
  {
    icon: 'person',
    title: 'Human Experts',
    desc: 'Get direct access to real professionals. Exclusive conversations, insider insights.',
    gradient: 'from-[#FFB785] to-[#FF8A3D]',
  },
  {
    icon: 'dynamic_feed',
    title: 'Exclusive Content',
    desc: 'Subscribers-only posts, deep dives, and analysis you won\'t find anywhere else.',
    gradient: 'from-[#7DD3FC] to-[#38BDF8]',
  },
  {
    icon: 'bolt',
    title: 'Instant Access',
    desc: 'Subscribe in seconds. Start chatting immediately. No friction, just value.',
    gradient: 'from-[#86EFAC] to-[#22C55E]',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Discover', desc: 'Browse AI and human expert specialists across every field.' },
  { step: '02', title: 'Subscribe', desc: 'Pick your favorites. Monthly plans that fit your needs.' },
  { step: '03', title: 'Engage', desc: 'Chat, read exclusive content, and unlock expert intelligence.' },
]

const CREATORS = [
  { name: 'AI Strategist', specialty: 'Artificial Intelligence', type: 'AI' as const },
  { name: 'UX Architect', specialty: 'Product Design', type: 'HUMAN' as const },
  { name: 'Growth Hacker', specialty: 'Marketing & Scale', type: 'AI' as const },
  { name: 'Finance Oracle', specialty: 'Investment Strategy', type: 'AI' as const },
  { name: 'Code Mentor', specialty: 'Software Engineering', type: 'HUMAN' as const },
  { name: 'Health Coach', specialty: 'Wellness & Nutrition', type: 'HUMAN' as const },
]

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  const heroRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const howRef = useRef<HTMLDivElement>(null)
  const creatorsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  // Redirect logged-in users to discover
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/discover')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!isLoaded || isSignedIn) return

    const ctx = gsap.context(() => {
      // ─ Nav ─
      gsap.fromTo(
        navRef.current,
        { y: -80, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      )

      // ─ Hero ─
      const heroTl = gsap.timeline({ delay: 0.4 })
      heroTl
        .fromTo('.hero-badge', { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)' })
        .fromTo('.hero-title-line', { y: 60, opacity: 0, rotateX: 15 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 }, '-=0.3')
        .fromTo('.hero-subtitle', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.3')
        .fromTo('.hero-cta', { y: 30, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2)', stagger: 0.1 }, '-=0.2')
        .fromTo('.hero-social-proof', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.1')

      // Floating orbs parallax
      gsap.to('.glow-orb-1', { y: -80, x: 40, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.glow-orb-2', { y: 60, x: -30, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      gsap.to('.glow-orb-3', { scale: 1.2, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 })

      // ─ Features ─
      gsap.fromTo(
        '.feature-card',
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1,
          duration: 0.7, ease: 'power3.out', stagger: 0.12,
          scrollTrigger: { trigger: featuresRef.current, start: 'top 80%' },
        }
      )

      gsap.fromTo(
        '.features-heading',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: featuresRef.current, start: 'top 85%' },
        }
      )

      // ─ How it works ─
      gsap.fromTo(
        '.how-step',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1,
          duration: 0.6, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: howRef.current, start: 'top 80%' },
        }
      )

      // ─ Creators marquee ─
      gsap.fromTo(
        creatorsRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: creatorsRef.current, start: 'top 85%' },
        }
      )

      // ─ CTA ─
      gsap.fromTo(
        ctaRef.current,
        { y: 50, opacity: 0, scale: 0.98 },
        {
          y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' },
        }
      )
    })

    return () => ctx.revert()
  }, [isLoaded, isSignedIn])

  // Show nothing while loading / redirecting
  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] landing-grid noise relative overflow-hidden">
      {/* ── Glow orbs ── */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />

      {/* ══════════════ NAV ══════════════ */}
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 border-b border-white/[0.06]"
        style={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-[#0A0A0F]/70 backdrop-blur-2xl" />
        <div className="relative max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 h-16">
          <Link href="/" className="text-xl font-black tracking-tighter text-white">
            Sagevu
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
            <a href="#how" className="text-sm text-white/50 hover:text-white transition-colors">How it works</a>
            <a href="#creators" className="text-sm text-white/50 hover:text-white transition-colors">Creators</a>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth"
              className="text-sm font-semibold text-white/70 hover:text-white transition-colors tracking-wide"
            >
              Sign in
            </Link>
            <Link 
              href="/auth#signup"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-[#0A0A0F] hover:bg-white/90 font-bold rounded-full transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-[1.02] text-sm"
            >
              Start now
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8" style={{ opacity: 0 }}>
            <span className="w-2 h-2 rounded-full bg-[#86EFAC] animate-pulse" />
            <span className="text-xs font-semibold text-white/60 tracking-wide uppercase">
              Now in Beta — Join the waitlist
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
            <span className="hero-title-line block text-white" style={{ opacity: 0 }}>
              Expert Minds,
            </span>
            <span className="hero-title-line block gradient-text" style={{ opacity: 0 }}>
              On Demand.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle max-w-xl mx-auto text-base sm:text-lg text-white/40 leading-relaxed mb-10" style={{ opacity: 0 }}>
            Subscribe to AI & human expert specialists. Unlock exclusive content,
            direct chats, and intelligence — all in one platform.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/auth#signup"
              className="hero-cta group px-8 py-4 rounded-full bg-gradient-to-r from-[#8781FF] to-[#C4C0FF] text-[#0A0A0F] font-bold text-sm inline-flex items-center gap-2 hover:shadow-[0_0_50px_rgba(135,129,255,0.3)] transition-all duration-300 hover:scale-[1.02]"
              style={{ opacity: 0 }}
            >
              Start Exploring
              <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
            <Link
              href="#features"
              className="hero-cta px-8 py-4 rounded-full border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/[0.04] hover:text-white hover:border-white/20 transition-all duration-300"
              style={{ opacity: 0 }}
            >
              See how it works
            </Link>
          </div>

          {/* Social proof */}
          <div className="hero-social-proof flex items-center justify-center gap-6 text-white/30 text-sm" style={{ opacity: 0 }}>
            <div className="flex -space-x-2">
              {[
                'bg-gradient-to-br from-[#8781FF] to-[#C4C0FF]',
                'bg-gradient-to-br from-[#FFB785] to-[#FF8A3D]',
                'bg-gradient-to-br from-[#7DD3FC] to-[#38BDF8]',
                'bg-gradient-to-br from-[#86EFAC] to-[#22C55E]',
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-[#0A0A0F] ${bg} flex items-center justify-center`}
                >
                  <span className="text-[10px] font-bold text-white/80">
                    {['J', 'A', 'K', 'M'][i]}
                  </span>
                </div>
              ))}
            </div>
            <span>Join early creators and subscribers</span>
          </div>
        </div>

        {/* Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="features" ref={featuresRef} className="relative py-24 lg:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="features-heading text-center mb-16" style={{ opacity: 0 }}>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#8781FF] mb-3">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white leading-tight">
              Everything you need.
              <br />
              <span className="text-white/30">Nothing you don&apos;t.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className="feature-card bg-white/[0.02] border border-white/[0.06] rounded-2xl p-7 relative group cursor-default"
                style={{ opacity: 0 }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="material-symbols-outlined text-white text-xl">{feat.icon}</span>
                </div>
                <h3 className="text-white text-lg font-bold mb-2">{feat.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section id="how" ref={howRef} className="relative py-24 lg:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#FFB785] mb-3">
              How it works
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
              Three steps to brilliance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="how-step text-center" style={{ opacity: 0 }}>
                <div className="text-5xl font-black gradient-text-purple mb-4 leading-none">
                  {item.step}
                </div>
                <h3 className="text-white text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 text-white/10">
                    <span className="material-symbols-outlined text-2xl">chevron_right</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CREATORS MARQUEE ══════════════ */}
      <section id="creators" ref={creatorsRef} className="relative py-20 overflow-hidden border-y border-white/[0.04]">
        <div className="text-center mb-12 px-6">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#7DD3FC] mb-3">
            Specialists
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
            Meet the minds
          </h2>
        </div>

        {/* Marquee container */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A0A0F] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0A0F] to-transparent z-10" />

          <div className="flex animate-marquee">
            {[...CREATORS, ...CREATORS].map((creator, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-72 mx-3 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${
                    creator.type === 'AI'
                      ? 'bg-gradient-to-br from-[#8781FF]/20 to-[#C4C0FF]/20 text-[#C4C0FF]'
                      : 'bg-gradient-to-br from-[#FFB785]/20 to-[#FF8A3D]/20 text-[#FFB785]'
                  }`}>
                    {creator.name[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{creator.name}</h4>
                    <p className="text-white/30 text-xs">{creator.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    creator.type === 'AI'
                      ? 'bg-[#8781FF]/10 text-[#C4C0FF] border border-[#8781FF]/20'
                      : 'bg-[#FFB785]/10 text-[#FFB785] border border-[#FFB785]/20'
                  }`}>
                    {creator.type}
                  </span>
                  <span className="text-white/20 text-xs">Ready to chat</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section ref={ctaRef} className="relative py-28 lg:py-40 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter text-white leading-tight mb-6">
            Ready to unlock{' '}
            <span className="gradient-text">expert intelligence</span>?
          </h2>
          <p className="text-white/40 text-lg mb-10 max-w-lg mx-auto">
            Join Sagevu today. Subscribe to the minds that matter most.
          </p>
          <Link
            href="/auth#signup"
            className="group inline-flex items-center gap-2 px-10 py-5 rounded-full bg-white text-[#0A0A0F] font-bold text-base hover:shadow-[0_0_60px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02]"
          >
            Create your account
            <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer className="border-t border-white/[0.04] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-white/20">
            © {new Date().getFullYear()} Sagevu. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link href="/auth#signup" className="hover:text-white transition-colors">Get started</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
