import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'

export const metadata = {
  title: 'Terms of Service — Sagevu',
  description:
    'Sagevu Terms of Service and Community Guidelines, including our strict off-platform communication policy.',
}

interface SectionProps {
  id: string
  title: string
  children: React.ReactNode
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-white font-black text-xl mb-4 tracking-tight">
        {title}
      </h2>
      <div className="text-on-surface-variant text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

const TOC_ITEMS = [
  { href: '#overview', label: 'Platform Overview' },
  { href: '#off-platform', label: 'Off-Platform Communication Policy' },
  { href: '#payments', label: 'Subscription & Payments' },
  { href: '#content', label: 'Content Standards' },
  { href: '#termination', label: 'Account Termination' },
  { href: '#liability', label: 'Limitation of Liability' },
  { href: '#governing-law', label: 'Governing Law' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <Navbar />

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">
              Legal
            </p>
            <h1 className="text-white font-black text-4xl tracking-tighter mb-4">
              Terms of Service &amp; Community Guidelines
            </h1>
            <p className="text-outline text-sm">
              Effective date: April 14, 2026 &nbsp;·&nbsp; Last updated: April
              14, 2026
            </p>
            <p className="text-on-surface-variant text-sm leading-relaxed mt-4">
              By accessing or using Sagevu (&ldquo;the Platform&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;), you agree to be bound by
              these Terms of Service. If you do not agree, do not use the
              Platform.
            </p>
          </div>

          {/* Table of Contents */}
          <nav
            aria-label="Terms of Service sections"
            className="mb-12 p-6 rounded-2xl bg-surface-container border border-outline-variant/10"
          >
            <p className="text-white font-bold text-sm mb-4">Contents</p>
            <ol className="space-y-2">
              {TOC_ITEMS.map((item, i) => (
                <li key={item.href} className="flex items-center gap-3">
                  <span className="text-outline text-xs tabular-nums w-4 shrink-0">
                    {i + 1}.
                  </span>
                  <a
                    href={item.href}
                    className="text-on-surface-variant text-sm hover:text-primary transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-12 divide-y divide-outline-variant/10">
            {/* 1. Platform Overview */}
            <Section id="overview" title="1. Platform Overview">
              <p>
                Sagevu is a subscription-based platform that connects
                subscribers with AI and human specialists across a range of
                subjects. Specialists publish content and interact with
                subscribers via Sagevu&rsquo;s built-in messaging system.
              </p>
              <p>
                Sagevu retains a 15% platform fee on all transactions.
                Specialists receive 85% of subscription revenue. All content on
                the Platform must comply with these Terms and our Content
                Standards (see Section 4). The Platform is strictly
                safe-for-work (SFW).
              </p>
              <p>
                These Terms apply to all users of Sagevu, including creators
                (&ldquo;Specialists&rdquo;) and paying subscribers
                (&ldquo;Subscribers&rdquo;). By creating an account you
                represent that you are at least 18 years old and that all
                information you provide is accurate and current.
              </p>
            </Section>

            {/* 2. Off-Platform Communication Policy */}
            <div className="pt-12">
              <section id="off-platform" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="material-symbols-outlined text-primary"
                    aria-hidden="true"
                  >
                    security
                  </span>
                  <h2 className="text-white font-black text-xl tracking-tight">
                    2. Off-Platform Communication Policy
                  </h2>
                </div>

                {/* Highlighted callout */}
                <div className="mb-6 p-5 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-primary font-bold text-sm mb-1">
                    Zero-Tolerance Policy
                  </p>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    All communication between Specialists and Subscribers
                    must occur exclusively through Sagevu&rsquo;s messaging
                    system. Circumventing this policy — for any reason — is a
                    serious violation that may result in immediate account
                    suspension and forfeiture of pending earnings.
                  </p>
                </div>

                <div className="text-on-surface-variant text-sm leading-relaxed space-y-4">
                  <div>
                    <h3 className="text-white font-bold mb-2">
                      2.1 Prohibited conduct
                    </h3>
                    <p className="mb-3">
                      The following actions are strictly prohibited on Sagevu
                      for both Specialists and Subscribers:
                    </p>
                    <ul className="space-y-2 pl-4">
                      {[
                        'Sharing or soliciting personal contact information, including but not limited to: phone numbers, personal email addresses, WhatsApp numbers, Telegram usernames, Snapchat handles, Instagram or other social media profiles, Discord tags, or any other direct contact identifier.',
                        'Directing or encouraging another user to communicate via any channel outside of Sagevu.',
                        'Advertising, promoting, or linking to competing subscription platforms (e.g. OnlyFans, Fanvue, Patreon, etc.) within chats or posts.',
                        "Soliciting payments, tips, or gifts outside of Sagevu's official payment infrastructure, including but not limited to: bank transfers, PayPal, Pix, cryptocurrency wallets, or any third-party payment service.",
                        'Sharing URLs or deeplinks whose primary purpose is to redirect users away from Sagevu.',
                        'Using coded language or indirect methods to arrange off-platform contact.',
                      ].map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">
                            &#x2022;
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-white font-bold mb-2">
                      2.2 Why this policy exists
                    </h3>
                    <p>
                      This policy protects both Specialists and Subscribers.
                      When interactions move off-platform, both parties lose the
                      protections that Sagevu provides: dispute resolution,
                      fraud prevention, chargeback mediation, identity
                      verification, and transaction records. Off-platform
                      transactions cannot be monitored, verified, or protected
                      by Sagevu, and Sagevu accepts no liability for any harm,
                      loss, or dispute arising from off-platform interactions.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-white font-bold mb-2">
                      2.3 Monitoring and enforcement
                    </h3>
                    <p>
                      Sagevu actively monitors messaging activity for violations
                      of this policy using automated systems and human review.
                      Users who suspect a violation may report it via our in-app
                      reporting tools. Reports are reviewed by our Trust &amp;
                      Safety team.
                    </p>
                    <p className="mt-2">
                      Sagevu reserves the right to read message content where
                      required for safety review, fraud prevention, or in
                      response to a valid legal request. By using the Platform
                      you consent to this limited review.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-white font-bold mb-2">
                      2.4 Consequences of violations
                    </h3>
                    <p>
                      Violations of this policy may result in any or all of the
                      following, at Sagevu&rsquo;s sole discretion:
                    </p>
                    <ul className="space-y-2 pl-4 mt-2">
                      {[
                        'Issuance of a formal warning.',
                        'Temporary suspension of the account.',
                        'Permanent termination of the account.',
                        'Forfeiture of any pending or unpaid earnings balance.',
                        'Reporting of suspected fraud or criminal conduct to the relevant authorities.',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 shrink-0">
                            &#x2022;
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-white font-bold mb-2">
                      2.5 Subscriber protections
                    </h3>
                    <p>
                      Subscribers should never share personal contact
                      information with Specialists, even if asked. Legitimate
                      Specialists on Sagevu will never need your phone number,
                      personal email, or social media handle to provide their
                      services. If a Specialist requests such information or
                      attempts to move the relationship off-platform, please
                      report it immediately using the in-app tools. You may also
                      contact us at{' '}
                      <a
                        href="mailto:safety@sagevu.com"
                        className="text-primary hover:underline"
                      >
                        safety@sagevu.com
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* 3. Subscription & Payments */}
            <div className="pt-12">
              <Section id="payments" title="3. Subscription &amp; Payments">
                <p>
                  Subscriptions are billed monthly via Stripe. By subscribing
                  you authorize Sagevu to charge your payment method on a
                  recurring basis. Prices are displayed inclusive of applicable
                  taxes where required by law.
                </p>
                <p>
                  Sagevu retains a 15% platform fee on all subscription revenue.
                  Specialists receive 85%. Payouts are subject to Sagevu&rsquo;s
                  payout schedule and minimum threshold requirements.
                </p>
                <p>
                  <span className="text-white font-semibold">Refunds:</span>{' '}
                  Subscription fees are generally non-refundable once a billing
                  period has commenced. Exceptions may be granted at
                  Sagevu&rsquo;s discretion in cases of documented technical
                  failure or fraudulent charge. Chargebacks filed without first
                  contacting Sagevu support may result in account suspension.
                </p>
                <p>
                  <span className="text-white font-semibold">Cancellation:</span>{' '}
                  You may cancel your subscription at any time. Cancellation
                  takes effect at the end of the current billing period; access
                  is retained until then. Sagevu does not prorate partial
                  periods.
                </p>
                <p>
                  All off-platform payment arrangements are strictly prohibited
                  under Section 2 and void any Sagevu protections.
                </p>
              </Section>
            </div>

            {/* 4. Content Standards */}
            <div className="pt-12">
              <Section id="content" title="4. Content Standards">
                <p>
                  Sagevu is a strictly safe-for-work (SFW) platform. All
                  content — including posts, profile images, cover images, and
                  messages — must comply with these standards.
                </p>
                <p>
                  <span className="text-white font-semibold">
                    Prohibited content includes:
                  </span>
                </p>
                <ul className="space-y-2 pl-4">
                  {[
                    'Sexually explicit or suggestive material of any kind.',
                    'Content depicting or glorifying violence, self-harm, or threats.',
                    'Hate speech, discrimination, or harassment based on race, gender, religion, nationality, sexual orientation, or disability.',
                    'Spam, unsolicited promotions, or misleading information.',
                    'Content that infringes third-party intellectual property rights.',
                    'Any content that is illegal under applicable law.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 shrink-0">
                        &#x2022;
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p>
                  Sagevu reserves the right to remove any content that violates
                  these standards without prior notice. Repeat violations will
                  result in account termination.
                </p>
              </Section>
            </div>

            {/* 5. Account Termination */}
            <div className="pt-12">
              <Section id="termination" title="5. Account Termination">
                <p>
                  Sagevu may suspend or permanently terminate any account at its
                  sole discretion, with or without prior notice, for violations
                  of these Terms, applicable law, or behavior that Sagevu
                  reasonably believes is harmful to the Platform, its users, or
                  third parties.
                </p>
                <p>
                  Upon termination: (a) your right to access the Platform ceases
                  immediately; (b) active subscriptions will be canceled; (c)
                  any pending earnings may be forfeited in cases of policy
                  violations; (d) Sagevu is not obligated to retain or deliver
                  any content associated with a terminated account.
                </p>
                <p>
                  Users may terminate their own account at any time by
                  contacting{' '}
                  <a
                    href="mailto:support@sagevu.com"
                    className="text-primary hover:underline"
                  >
                    support@sagevu.com
                  </a>
                  . Account deletion requests will be processed within 30 days.
                  Note that certain records may be retained for legal compliance
                  obligations.
                </p>
              </Section>
            </div>

            {/* 6. Limitation of Liability */}
            <div className="pt-12">
              <Section id="liability" title="6. Limitation of Liability">
                <p>
                  To the fullest extent permitted by applicable law, Sagevu and
                  its officers, directors, employees, agents, and licensors
                  shall not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including but not limited
                  to: loss of profits, loss of data, loss of goodwill, service
                  interruption, or any other intangible losses, arising out of
                  or relating to your use of — or inability to use — the
                  Platform.
                </p>
                <p>
                  Sagevu&rsquo;s total aggregate liability to you for any claim
                  arising from these Terms or your use of the Platform shall not
                  exceed the greater of: (a) the total fees paid by you to
                  Sagevu in the twelve (12) months preceding the claim, or (b)
                  R$100 BRL.
                </p>
                <p>
                  The Platform is provided &ldquo;as is&rdquo; and &ldquo;as
                  available&rdquo; without warranties of any kind, express or
                  implied, including but not limited to warranties of
                  merchantability, fitness for a particular purpose, or
                  non-infringement.
                </p>
                <p>
                  Sagevu is not responsible for the actions, content, or conduct
                  of any Specialist or Subscriber on the Platform. You
                  acknowledge that your use of the Platform is at your own risk.
                </p>
              </Section>
            </div>

            {/* 7. Governing Law */}
            <div className="pt-12">
              <Section id="governing-law" title="7. Governing Law">
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of the Federative Republic of Brazil, without
                  regard to its conflict of law provisions. The parties submit
                  to the exclusive jurisdiction of the courts of São Paulo, SP,
                  Brazil for the resolution of any disputes arising from these
                  Terms.
                </p>
                <p>
                  If any provision of these Terms is found to be unenforceable
                  or invalid, that provision shall be limited or eliminated to
                  the minimum extent necessary so that these Terms shall
                  otherwise remain in full force and effect and enforceable.
                </p>
                <p>
                  Sagevu reserves the right to modify these Terms at any time.
                  Continued use of the Platform following notice of changes
                  constitutes acceptance of the updated Terms. Material changes
                  will be communicated via email or prominent in-app
                  notification.
                </p>
              </Section>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-outline-variant/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-outline text-xs">
              Questions? Contact{' '}
              <a
                href="mailto:legal@sagevu.com"
                className="text-primary hover:underline"
              >
                legal@sagevu.com
              </a>
            </p>
            <Link
              href="/"
              className="text-outline text-xs hover:text-white transition-colors duration-200"
            >
              &larr; Back to Sagevu
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
