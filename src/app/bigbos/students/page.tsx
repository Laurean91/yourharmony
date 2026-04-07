export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getStudents } from '../../actions'
import StudentCard from '@/components/StudentCard'
import AddStudentModal from '@/components/AddStudentModal'

const TAG_OPTIONS = ['Все', 'Индивидуальное', 'Группа']
const TAG_COLORS: Record<string, string> = {
  'Индивидуальное': 'bg-purple-100 text-purple-700',
  'Группа': 'bg-blue-100 text-blue-700',
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag: filterTag } = await searchParams
  const allStudents = await getStudents()
  const students = filterTag && filterTag !== 'Все'
    ? allStudents.filter(s => s.tag === filterTag)
    : allStudents

  return (
    <div className="p-8 font-sans" style={{ color: 'var(--adm-text-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--adm-text-primary)' }}>Мои ученики</h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>{allStudents.length} {allStudents.length === 1 ? 'ученик' : 'учеников'}</span>
            <AddStudentModal />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {TAG_OPTIONS.map(t => (
            <Link
              key={t}
              href={t === 'Все' ? '/bigbos/students' : `/bigbos/students?tag=${encodeURIComponent(t)}`}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${
                (t === 'Все' && !filterTag) || filterTag === t
                  ? 'bg-purple-600 text-white'
                  : ''
              }`}
              style={
                (t === 'Все' && !filterTag) || filterTag === t
                  ? {}
                  : {
                      background: 'var(--adm-bg-card)',
                      border: '1px solid var(--adm-border-card)',
                      color: 'var(--adm-text-secondary)',
                    }
              }
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Students list */}
        {students.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center text-sm"
            style={{
              background: 'var(--adm-bg-card)',
              border: '1px solid var(--adm-border-card)',
              color: 'var(--adm-text-muted)',
            }}
          >
            Учеников пока нет
          </div>
        ) : (
          <div className="space-y-3">
            {students.map(s => (
              <StudentCard key={s.id} student={s} tagColors={TAG_COLORS} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
