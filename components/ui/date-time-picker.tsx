'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DateTimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  label?: string
  required?: boolean
  placeholder?: string
}

export function DateTimePicker({
  date,
  setDate,
  label,
  required = false,
  placeholder = 'Select date'
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [timeValue, setTimeValue] = React.useState<string>(
    date && !isNaN(date.getTime()) ? format(date, 'HH:mm') : '12:00'
  )

  React.useEffect(() => {
    if (date && !isNaN(date.getTime())) {
      setSelectedDate(date)
      setTimeValue(format(date, 'HH:mm'))
    }
  }, [date])

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setSelectedDate(undefined)
      setDate(undefined)
      setOpen(false)
      return
    }

    // Combine date with current time
    const [hours, minutes] = timeValue.split(':').map(Number)
    newDate.setHours(hours, minutes, 0, 0)

    setSelectedDate(newDate)
    setDate(newDate)
    setOpen(false)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value
    setTimeValue(newTime)

    if (selectedDate) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newDate = new Date(selectedDate)
      newDate.setHours(hours, minutes, 0, 0)
      setDate(newDate)
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-xs text-muted-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      <div className="flex flex-col gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between font-normal bg-muted/50"
            >
              {selectedDate ? selectedDate.toLocaleDateString() : placeholder}
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
              disabled={(date) => {
                // Disable dates before today
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
            />
          </PopoverContent>
        </Popover>

        <Input
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          className="w-full bg-muted/50 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          required={required}
        />
      </div>
    </div>
  )
}
