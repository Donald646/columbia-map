'use client'

import React from 'react'
import { Search, Filter, Calendar, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LocationSearch } from '@/components/location-search'

interface FilterPanelProps {
  className?: string
  isOpen?: boolean
  onLocationSelect?: (longitude: number, latitude: number, placeName: string) => void
}

export function FilterPanel({ className, isOpen = true, onLocationSelect }: FilterPanelProps) {
  return (
    <div
      className={cn(
        'bg-background border-r p-4 overflow-y-auto h-full',
        'w-80 max-w-[90vw] flex-shrink-0',
        !isOpen && 'hidden',
        className
      )}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>
        </div>

        {/* Location Search */}
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <LocationSearch 
            onLocationSelect={onLocationSelect}
            placeholder="Search buildings, addresses..."
          />
        </div>

        {/* Search Events */}
        <div>
          <label className="block text-sm font-medium mb-2">Search Events</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Keywords..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Date Range
          </label>
          <div className="space-y-2">
            <Input type="date" />
            <Input type="date" />
          </div>
        </div>

        {/* Time Range */}
        <div>
          <label className="block text-sm font-medium mb-2">Time</label>
          <div className="flex gap-2">
            <Input type="time" className="flex-1" />
            <Input type="time" className="flex-1" />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="career">Career</SelectItem>
              <SelectItem value="arts">Arts</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* School/Organization */}
        <div>
          <label className="block text-sm font-medium mb-2">School/Organization</label>
          <Input
            type="text"
            placeholder="e.g., SEAS, GSB"
          />
        </div>

        {/* Free/Paid Toggle */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            Price
          </label>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">All</Button>
            <Button variant="outline" className="flex-1">Free</Button>
            <Button variant="outline" className="flex-1">Paid</Button>
          </div>
        </div>

        {/* Apply Button */}
        <Button className="w-full">
          Apply Filters
        </Button>

        {/* Clear Button */}
        <Button variant="outline" className="w-full">
          Clear All
        </Button>
      </div>
    </div>
  )
}

