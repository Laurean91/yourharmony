import { ReactNode } from 'react'
import Link from 'next/link'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 opacity-30 text-gray-400">{icon}</div>
      <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
      {description && <p className="text-xs text-gray-400 max-w-xs">{description}</p>}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
            >
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(90deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 14px rgba(124,58,237,0.25)' }}
            >
              {action.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
