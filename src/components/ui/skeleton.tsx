// ─── Base shimmer block ───────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-100${className ? ` ${className}` : ''}`}
      style={{ backgroundImage: 'linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }}
    />
  )
}

// ─── Composed skeletons ───────────────────────────────────────────────────────

export function StudentCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100" style={{ background: '#fff' }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ background: '#f9fafb' }}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        {[0, 1, 2].map(i => (
          <div key={i} className="px-4 py-3 flex flex-col items-center gap-1.5">
            <Skeleton className="h-5 w-8" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Links */}
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        {[0, 1, 2].map(i => (
          <div key={i} className="py-3 flex flex-col items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function LessonRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex gap-4 border border-gray-100 bg-white">
          <Skeleton className="h-8 w-12 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function GradeRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex gap-4 border border-gray-100 bg-white">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function AttendanceRowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl px-4 py-3 flex items-center gap-3 bg-gray-50 border border-gray-100">
          <Skeleton className="h-6 w-6 rounded-full shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function ParentRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex gap-3 border border-gray-100 bg-white">
          <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
            <Skeleton className="h-3 w-40" />
            <div className="flex gap-1 pt-0.5">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function JournalEntrySkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-4 border border-gray-100 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-28 rounded-xl" />
          </div>
          <div className="flex gap-1.5">
            {[0,1,2,3,4].map(j => <Skeleton key={j} className="h-9 w-9 rounded-xl" />)}
          </div>
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      ))}
    </div>
  )
}
