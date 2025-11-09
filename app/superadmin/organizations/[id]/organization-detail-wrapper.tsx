'use client'

import { useEffect } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface OrganizationDetailWrapperProps {
  children: React.ReactNode
  breadcrumbs: BreadcrumbItem[]
}

export default function OrganizationDetailWrapper({
  children,
  breadcrumbs,
}: OrganizationDetailWrapperProps) {
  useEffect(() => {
    // Store breadcrumbs in a global variable that the nav can access
    if (typeof window !== 'undefined') {
      (window as Window & { __superadmin_breadcrumbs?: BreadcrumbItem[] | null }).__superadmin_breadcrumbs = breadcrumbs
    }

    return () => {
      if (typeof window !== 'undefined') {
        (window as Window & { __superadmin_breadcrumbs?: BreadcrumbItem[] | null }).__superadmin_breadcrumbs = null
      }
    }
  }, [breadcrumbs])

  return <>{children}</>
}
