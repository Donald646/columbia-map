'use client'

import { Button } from '@/components/ui/button'
import { Calendar, DollarSign, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HorizontalFilterPillsProps {
  selectedCategory: string
  selectedTime: string
  selectedPrice: string
  onCategoryChange: (value: string) => void
  onTimeChange: (value: string) => void
  onPriceChange: (value: string) => void
}

export function HorizontalFilterPills({
  selectedCategory,
  selectedTime,
  selectedPrice,
  onCategoryChange,
  onTimeChange,
  onPriceChange,
}: HorizontalFilterPillsProps) {
  const categories = [
    { value: 'all', label: 'All' },
    { value: 'social', label: 'Social' },
    { value: 'academic', label: 'Academic' },
    { value: 'career', label: 'Career' },
    { value: 'arts', label: 'Arts' },
    { value: 'sports', label: 'Sports' },
  ]

  const timeFilters = [
    { value: 'all', label: 'Anytime' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'week', label: 'This Week' },
  ]

  const priceFilters = [
    { value: 'all', label: 'All' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' },
  ]

  return (
    <div className="absolute top-20 left-0 right-0 z-20">
      <div className="overflow-x-auto px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-2 min-w-max">
          {/* Category Pills */}
          {categories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                'rounded-full shadow-md flex-shrink-0',
                selectedCategory !== cat.value && 'bg-background'
              )}
            >
              <Tag className="w-3.5 h-3.5 mr-1.5" />
              {cat.label}
            </Button>
          ))}

          {/* Divider */}
          <div className="w-px bg-border self-stretch mx-1" />

          {/* Time Pills */}
          {timeFilters.map((time) => (
            <Button
              key={time.value}
              variant={selectedTime === time.value ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onTimeChange(time.value)}
              className={cn(
                'rounded-full shadow-md flex-shrink-0',
                selectedTime !== time.value && 'bg-background'
              )}
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
              {time.label}
            </Button>
          ))}

          {/* Divider */}
          <div className="w-px bg-border self-stretch mx-1" />

          {/* Price Pills */}
          {priceFilters.map((price) => (
            <Button
              key={price.value}
              variant={selectedPrice === price.value ? 'default' : 'secondary'}
              size="sm"
              onClick={() => onPriceChange(price.value)}
              className={cn(
                'rounded-full shadow-md flex-shrink-0',
                selectedPrice !== price.value && 'bg-background'
              )}
            >
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              {price.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
