'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

interface SchoolNavProps {
  schoolSlug: string
  schoolName: string
  schoolHorizontalLogo: string | null
  user: { id: string } | null
  userRole: string | null
  isOrgAdmin: boolean
}

export default function SchoolNav({
  schoolSlug,
  schoolName,
  schoolHorizontalLogo,
  user,
  userRole,
  isOrgAdmin
}: SchoolNavProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const isAdmin = userRole === 'super_admin' || isOrgAdmin

  const getDashboardUrl = () => {
    if (userRole === 'super_admin') return '/superadmin'
    if (isOrgAdmin) return '/admin'
    return null
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Logo/Branding */}
          <Link
            href={`/${schoolSlug}`}
            className="flex items-center gap-2.5 hover:opacity-70 transition-opacity"
          >
            <span className="font-bold text-xl tracking-tight">EventsCU</span>
            {schoolHorizontalLogo ? (
              <>
                <span className="text-muted-foreground/40">|</span>
                <div className="relative h-8 w-auto max-w-[200px]">
                  <Image
                    src={schoolHorizontalLogo}
                    alt={schoolName}
                    width={200}
                    height={32}
                    className="object-contain h-full w-auto"
                    priority
                  />
                </div>
              </>
            ) : (
              <>
                <span className="text-muted-foreground/40">|</span>
                <span className="text-sm font-medium text-muted-foreground">{schoolName}</span>
              </>
            )}
          </Link>

          {/* Center - Organizations Link */}
          <Link
            href={`/${schoolSlug}/organizations`}
            className="hidden sm:block absolute left-1/2 -translate-x-1/2 text-sm font-medium hover:text-foreground transition-colors text-muted-foreground"
          >
            Organizations
          </Link>

          {/* Right - User actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && getDashboardUrl() && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.push(getDashboardUrl()!)}
                    className="hidden sm:inline-flex"
                  >
                    Admin Dashboard
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => router.push('/auth/login')}
                className="bg-foreground text-background hover:bg-foreground/90"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
