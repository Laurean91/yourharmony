'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
      active
        ? 'bg-purple-600 text-white'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
)

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] focus:outline-none p-4',
      },
    },
    immediatelyRender: false,
  })

  // Sync external value changes (e.g. when loading existing post)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  const setLink = () => {
    const url = window.prompt('URL ссылки:', editor.getAttributes('link').href)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addImage = () => {
    const url = window.prompt('URL изображения:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Жирный (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Курсив (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Зачёркнутый"
        >
          <s>S</s>
        </ToolbarButton>

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Заголовок H2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Заголовок H3"
        >
          H3
        </ToolbarButton>

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Маркированный список"
        >
          • Список
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Нумерованный список"
        >
          1. Список
        </ToolbarButton>

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Цитата"
        >
          ❝ Цитата
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Код"
        >
          {'</>'}
        </ToolbarButton>

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="Ссылка">
          🔗 Ссылка
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Вставить изображение по URL">
          🖼 Картинка
        </ToolbarButton>

        <span className="w-px h-6 bg-gray-300 mx-1 self-center" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Отменить (Ctrl+Z)"
        >
          ↩
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Повторить (Ctrl+Y)"
        >
          ↪
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="bg-white relative">
        {editor.isEmpty && placeholder && (
          <p className="absolute top-4 left-4 text-gray-400 text-sm pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
