'use client'

import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface SchoolCardProps {
  slug: string
  name: string
  shortName: string
  primaryColor: string
  description: string
}

export function SchoolCard({ 
  slug, 
  name, 
  shortName,
  primaryColor, 
  description 
}: SchoolCardProps) {
  return (
    <Link href={`/${slug}`}>
      <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary">
        <div className="flex flex-col gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: primaryColor }}
          >
            {shortName.charAt(0)}
          </div>
          
          <div>
            <h3 className="font-bold text-xl">{name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: primaryColor }}>
            <MapPin className="w-4 h-4" />
            <span>View Events</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

