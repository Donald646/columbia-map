'use client'

import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const email = searchParams.get('email')
  const next = searchParams.get('next')

  const handleGoogleLogin = async () => {
    const supabase = createClient()

    // Build the redirect URL with the next parameter if it exists
    let redirectUrl = `${window.location.origin}/auth/callback`
    if (next) {
      redirectUrl += `?next=${encodeURIComponent(next)}`
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Login error:', error)
      alert('Failed to login. Please try again.')
    }
  }

  const getErrorMessage = () => {
    switch (error) {
      case 'invalid_domain':
        return `Email ${email} is not from a supported school domain. Please use your school email.`
      case 'no_email':
        return 'No email address found in your Google account.'
      case 'auth_failed':
        return 'Authentication failed. Please try again.'
      default:
        return null
    }
  }

  const errorMessage = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border rounded-lg p-8 shadow-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Sign In</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your school email to continue
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                {errorMessage}
              </div>
            </div>
          )}

          <Button
            onClick={handleGoogleLogin}
            className="w-full gap-2"
            size="lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Use your .edu email address
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full mx-4">
          <div className="bg-card border rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Sign In</h1>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
