import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'number' | 'url' | 'datetime-local' | 'textarea' | 'select' | 'checkbox'
  value: string | number | boolean
  onChange: (value: any) => void
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  rows?: number
  className?: string
  description?: string
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  options,
  rows = 4,
  className = '',
  description
}: FormFieldProps) {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            required={required}
          />
        )

      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={onChange}
            required={required}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={name}
              checked={value as boolean}
              onChange={(e) => onChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <Label htmlFor={name} className="font-normal cursor-pointer">
              {label}
            </Label>
          </div>
        )

      default:
        return (
          <Input
            type={type}
            id={name}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
          />
        )
    }
  }

  if (type === 'checkbox') {
    return (
      <div className={className}>
        {renderInput()}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <Label htmlFor={name} className="mb-2 block">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {renderInput()}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  )
}
