'use client'

interface RichTextViewerProps {
  content: string
  className?: string
}

export function RichTextViewer({ content, className = '' }: RichTextViewerProps) {
  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
