'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, BadgeCheck, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { DbOrganization } from '@/types/database-helpers'

interface OrganizationsSearchProps {
  organizations: DbOrganization[]
  schoolSlug: string
  schoolName: string
}

export default function OrganizationsSearch({
  organizations,
  schoolSlug,
  schoolName
}: OrganizationsSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  const [searchQuery, setSearchQuery] = useState(initialSearch)

  // Debounce the URL update
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())

      if (searchQuery) {
        params.set('search', searchQuery)
      } else {
        params.delete('search')
      }

      const newUrl = params.toString()
        ? `/${schoolSlug}/organizations?${params.toString()}`
        : `/${schoolSlug}/organizations`

      router.replace(newUrl, { scroll: false })
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, router, schoolSlug, searchParams])

  // Client-side filtering for instant feedback
  const filteredOrganizations = useMemo(() => {
    if (!searchQuery.trim()) return organizations

    const query = searchQuery.toLowerCase()
    return organizations.filter((org) => {
      return (
        org.name.toLowerCase().includes(query) ||
        org.description?.toLowerCase().includes(query) ||
        org.category?.toLowerCase().includes(query)
      )
    })
  }, [organizations, searchQuery])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-3">Organizations</h1>
          <p className="text-muted-foreground mb-8">
            Discover student organizations at {schoolName}
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Contact Banner */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="border rounded-lg p-6 bg-muted/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Don&apos;t see your organization?</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Email us to get your organization added to EventsCU and start posting events.
              </p>
              <a
                href="mailto:team@eventscu.com"
                className="text-sm text-primary hover:underline font-medium"
              >
                team@eventscu.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <Link
                key={org.id}
                href={`/${schoolSlug}/organizations/${org.slug}`}
                className="block"
              >
                <div className="border rounded-lg p-6 hover:border-primary transition-colors bg-card h-full">
                  <div className="flex items-start gap-4 mb-4">
                    {org.logo_url ? (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                        <Image
                          src={org.logo_url}
                          alt={org.name}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl font-bold text-muted-foreground">
                          {org.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg line-clamp-2">
                          {org.name}
                        </h3>
                        {org.verified && (
                          <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        )}
                      </div>

                      {org.category && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {org.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {org.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {org.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed rounded-lg">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No organizations found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search'
                : 'No organizations available yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
