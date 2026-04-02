'use client'

import { createContext, useContext, ReactNode } from 'react'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useToastState, Toast, ToastVariant } from '@/hooks/useToast'

// ─── Context ─────────────────────────────────────────────────────────────────

type ToastContextValue = {
  toast: {
    success: (msg: string) => void
    error:   (msg: string) => void
    warning: (msg: string) => void
    info:    (msg: string) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const { toasts, toast, dismiss } = useToastState()

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ─── Styles per variant ───────────────────────────────────────────────────────

const VARIANTS: Record<ToastVariant, {
  bg: string; border: string; iconColor: string; textColor: string
  Icon: React.ComponentType<{ size: number; className?: string }>
}> = {
  success: {
    bg: '#f0fdf4', border: '#bbf7d0', iconColor: '#16a34a', textColor: '#14532d',
    Icon: CheckCircle2,
  },
  error: {
    bg: '#fef2f2', border: '#fecaca', iconColor: '#dc2626', textColor: '#7f1d1d',
    Icon: AlertCircle,
  },
  warning: {
    bg: '#fffbeb', border: '#fde68a', iconColor: '#d97706', textColor: '#78350f',
    Icon: AlertTriangle,
  },
  info: {
    bg: '#eff6ff', border: '#bfdbfe', iconColor: '#2563eb', textColor: '#1e3a5f',
    Icon: Info,
  },
}

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const v = VARIANTS[toast.variant]
  const { Icon } = v

  return (
    <div
      role="alert"
      className="flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg w-full"
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        animation: 'toast-in 0.25s ease',
      }}
    >
      <span className="mt-0.5 shrink-0" style={{ color: v.iconColor }}>
        <Icon size={18} />
      </span>
      <p className="flex-1 text-sm font-semibold leading-snug" style={{ color: v.textColor }}>
        {toast.message}
      </p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 transition-opacity opacity-50 hover:opacity-100"
        style={{ color: v.iconColor }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Container ───────────────────────────────────────────────────────────────

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Desktop: bottom-right */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-[9999] flex-col gap-2 w-80">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
      </div>
      {/* Mobile: above bottom-nav */}
      <div className="md:hidden fixed bottom-20 left-3 right-3 z-[9999] flex flex-col gap-2">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
      </div>
    </>
  )
}
