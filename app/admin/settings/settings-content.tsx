'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OrganizationForm } from '@/components/forms/organization-form'
import { Pencil } from 'lucide-react'
import TeamManagement from './team-management'
import Image from 'next/image'

interface SettingsContentProps {
  organization: any
  currentUserId: string
  currentUserRole: string
  admins: any[]
  invitations: any[]
  schools: any[]
}

export default function SettingsContent({
  organization,
  currentUserId,
  currentUserRole,
  admins,
  invitations,
  schools
}: SettingsContentProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="mb-4"
          >
            Cancel
          </Button>
          <h1 className="text-3xl font-bold mb-2">Edit Organization</h1>
          <p className="text-muted-foreground">{organization.name}</p>
        </div>

        <OrganizationForm
          schools={schools}
          organization={organization}
          redirectUrl="/admin/settings"
          showVerifiedToggle={false}
          showSchoolSelector={false}
          showSlugField={false}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organization Settings</h1>
        <p className="text-muted-foreground">{organization.name}</p>
      </div>

      {/* Organization Info with Modern Design */}
      <div className="mb-8">
        {/* Banner */}
        <div className="relative w-full h-48 bg-gradient-to-br from-muted/50 to-muted/30 rounded-t-2xl overflow-hidden">
          {organization.banner_url && (
            <Image
              src={organization.banner_url}
              alt="Banner"
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Logo and Info Card */}
        <div className="bg-card border border-t-0 rounded-b-2xl p-6 pt-16 relative">
          {/* Logo overlapping banner */}
          <div className="absolute -top-12 left-8">
            <div className="w-24 h-24 bg-background border-4 border-background rounded-2xl overflow-hidden shadow-xl">
              {organization.logo_url ? (
                <Image
                  src={organization.logo_url}
                  alt="Logo"
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-2xl font-bold text-muted-foreground">
                  {organization.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Edit button */}
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
          </div>

          {/* Organization details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{organization.name}</h2>
            </div>

            {organization.description && (
              <div>
                <label className="text-xs text-muted-foreground uppercase font-semibold">Description</label>
                <p className="text-sm mt-1">{organization.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {organization.website_url && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Website</label>
                  <a
                    href={organization.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block mt-1"
                  >
                    {organization.website_url}
                  </a>
                </div>
              )}

              {organization.mailing_list_url && (
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Mailing List</label>
                  <a
                    href={organization.mailing_list_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline block mt-1"
                  >
                    Join Mailing List
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold">Your Role</label>
              <p className="text-sm mt-1 capitalize">{currentUserRole}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Management */}
      <TeamManagement
        organizationId={organization.id}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        admins={admins}
        invitations={invitations}
      />
    </div>
  )
}
