'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SlidersHorizontal, DollarSign, Calendar, MapPin } from 'lucide-react'

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
    { value: 'all', label: 'All Categories' },
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
    { value: 'weekend', label: 'This Weekend' },
  ]

  const priceOptions = [
    { value: 'all', label: 'All' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price */}
          <div>
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price
            </label>
            <div className="flex gap-2">
              {priceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPrice(option.value)}
                  className={`flex-1 px-4 py-2 border rounded-md transition-colors ${
                    selectedPrice === option.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input hover:bg-muted'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-semibold mb-3 block">Category</label>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.value}
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={selectedCategory === category.value}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm">{category.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* When */}
          <div>
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              When
            </label>
            <div className="space-y-2">
              {timeOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors"
                >
                  <input
                    type="radio"
                    name="time"
                    value={option.value}
                    checked={selectedTime === option.value}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Distance - Placeholder for future */}
          <div>
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Distance
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
                <input type="radio" name="distance" defaultChecked className="w-4 h-4 cursor-pointer" />
                <span className="text-sm">All</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
                <input type="radio" name="distance" className="w-4 h-4 cursor-pointer" />
                <span className="text-sm">Walking distance (1 mi.)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-muted p-2 rounded-md transition-colors">
                <input type="radio" name="distance" className="w-4 h-4 cursor-pointer" />
                <span className="text-sm">Nearby (0.5 mi.)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              onClear()
              onOpenChange(false)
            }}
          >
            Clear All
          </Button>
          <Button
            className="flex-1"
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


