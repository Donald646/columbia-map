'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedTime: string
  setSelectedTime: (time: string) => void
  selectedPrice: string
  setSelectedPrice: (price: string) => void
  onApply: () => void
  onClear: () => void
}

export function FilterModal({
  open,
  onOpenChange,
  selectedCategory,
  setSelectedCategory,
  selectedTime,
  setSelectedTime,
  selectedPrice,
  setSelectedPrice,
  onApply,
  onClear,
}: FilterModalProps) {
  const categories = [
    { value: 'all', label: 'All' },
    { value: 'social', label: 'Social' },
    { value: 'academic', label: 'Academic' },
    { value: 'career', label: 'Career' },
    { value: 'arts', label: 'Arts' },
    { value: 'sports', label: 'Sports' },
    { value: 'service', label: 'Service' },
  ]

  const timeOptions = [
    { value: 'all', label: 'All' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'week', label: 'This Week' },
  ]

  const priceOptions = [
    { value: 'all', label: 'All' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Category */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={cn(
                    'rounded-full transition-all',
                    selectedCategory === category.value && 'shadow-sm'
                  )}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* When */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">When</label>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedTime === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTime(option.value)}
                  className={cn(
                    'rounded-full transition-all',
                    selectedTime === option.value && 'shadow-sm'
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">Price</label>
            <div className="grid grid-cols-3 gap-2">
              {priceOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedPrice === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPrice(option.value)}
                  className={cn(
                    'rounded-full transition-all',
                    selectedPrice === option.value && 'shadow-sm'
                  )}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => {
              onClear()
              onOpenChange(false)
            }}
          >
            Clear All
          </Button>
          <Button
            className="flex-1 rounded-full shadow-sm"
            onClick={() => {
              onApply()
              onOpenChange(false)
            }}
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


