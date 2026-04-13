import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
          Sagevu
        </h1>
        <p className="text-outline text-sm">
          Sign in to access your subscriptions
        </p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'bg-surface-container border border-outline-variant/20 shadow-2xl rounded-2xl',
            headerTitle: 'text-on-surface font-bold',
            headerSubtitle: 'text-outline',
            formFieldLabel: 'text-on-surface-variant',
            formFieldInput:
              'bg-surface-container-high border-outline-variant/30 text-on-surface rounded-xl',
            formButtonPrimary:
              'bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl hover:opacity-90',
            footerActionLink: 'text-primary hover:text-primary-container',
            identityPreviewText: 'text-on-surface-variant',
            identityPreviewEditButton: 'text-primary',
          },
        }}
      />
    </div>
  )
}
