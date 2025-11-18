'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from './button'
import { Input } from './input'
import { Link2, Link2Off, Bold, Italic, Heading1, Heading2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [bubblePosition, setBubblePosition] = useState({ top: 0, left: 0 })
  const [isMounted, setIsMounted] = useState(false)
  const bubbleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Write something...',
      }),
    ],
    content: content || '<p></p>',
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none px-4 py-3 ${className || 'min-h-[150px]'}`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection
      const hasSelection = from !== to

      if (hasSelection && !editor.state.selection.empty) {
        setTimeout(() => {
          const domSelection = window.getSelection()
          if (domSelection && domSelection.rangeCount > 0) {
            const range = domSelection.getRangeAt(0)
            const rect = range.getBoundingClientRect()
            setBubblePosition({
              top: rect.top - 50,
              left: rect.left + rect.width / 2,
            })
            setShowBubble(true)
          }
        }, 0)
      } else {
        setShowBubble(false)
        setIsAddingLink(false)
      }
    },
  })

  const setLink = () => {
    if (!editor || !linkUrl) return

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl })
      .run()

    setLinkUrl('')
    setIsAddingLink(false)
    setShowBubble(false)
  }

  const unsetLink = () => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
    setIsAddingLink(false)
    setShowBubble(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
        if (isAddingLink) {
          setIsAddingLink(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isAddingLink])

  if (!editor || !isMounted) {
    return (
      <div className="min-h-[150px] flex items-center justify-center text-muted-foreground">
        <span className="text-sm">Loading editor...</span>
      </div>
    )
  }

  const ToolbarButton = ({ onClick, isActive, children, title }: { onClick: () => void, isActive?: boolean, children: React.ReactNode, title: string }) => (
    <Button
      type="button"
      size="sm"
      variant={isActive ? "default" : "ghost"}
      onClick={onClick}
      className="h-8 w-8 p-0"
      title={title}
    >
      {children}
    </Button>
  )

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => {
            // Get current position and collapse selection to cursor
            const { from } = editor.state.selection
            editor.chain().focus().setTextSelection(from).toggleHeading({ level: 1 }).run()
          }}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            // Get current position and collapse selection to cursor
            const { from } = editor.state.selection
            editor.chain().focus().setTextSelection(from).toggleHeading({ level: 2 }).run()
          }}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border mx-1" />

        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <Link2 className="w-4 h-4" />
        </ToolbarButton>

        {editor.isActive('link') && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link"
          >
            <Link2Off className="w-4 h-4" />
          </ToolbarButton>
        )}
      </div>

      {/* Editor */}
      <div className="relative">
        <EditorContent editor={editor} />
      </div>

      {/* Bubble menu for selection */}
      {showBubble && (
        <div
          ref={bubbleRef}
          className="fixed z-50 bg-popover border rounded-lg shadow-lg p-2 flex items-center gap-1 transform -translate-x-1/2"
          style={{
            top: `${bubblePosition.top}px`,
            left: `${bubblePosition.left}px`,
          }}
        >
          {!isAddingLink ? (
            <>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>

              <div className="w-px h-6 bg-border mx-1" />

              {editor.isActive('link') ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={unsetLink}
                  className="h-8 gap-2"
                  type="button"
                >
                  <Link2Off className="w-4 h-4" />
                  Remove link
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsAddingLink(true)}
                  className="h-8 gap-2"
                  type="button"
                >
                  <Link2 className="w-4 h-4" />
                  Add link
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Input
                type="url"
                placeholder="Paste link..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setLink()
                  }
                  if (e.key === 'Escape') {
                    setIsAddingLink(false)
                    setLinkUrl('')
                  }
                }}
                className="h-8 w-64"
                autoFocus
              />
              <Button size="sm" onClick={setLink} className="h-8" type="button">
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingLink(false)
                  setLinkUrl('')
                }}
                className="h-8"
                type="button"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
