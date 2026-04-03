import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import GalaxyMap, { type Planet } from '../../../components/GalaxyMap'

export const revalidate = 300

function calcStars(lessons: Array<{ attended: boolean; grade: number | null }>): number {
  return lessons.reduce((sum, l) => {
    let pts = 0
    if (l.attended) pts += 10
    if (l.grade === 5) pts += 15
    else if (l.grade === 4) pts += 10
    else if (l.grade === 3) pts += 5
    else if (l.grade === 2) pts += 2
    return sum + pts
  }, 0)
}

export default async function StarsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'PARENT') redirect('/parent/login')

  const [parent, allStudents] = await Promise.all([
    prisma.parent.findUnique({
      where: { userId: session.user.id },
      include: { students: { select: { studentId: true } } },
    }),
    prisma.student.findMany({
      include: {
        lessons: { select: { attended: true, grade: true } },
      },
    }),
  ])

  if (!parent) redirect('/parent/login')

  const myIds = new Set(parent.students.map(s => s.studentId))

  const planets: Planet[] = allStudents
    .map(s => ({
      id:          s.id,
      // Own child — full name; others — first name only (privacy)
      displayName: myIds.has(s.id) ? s.name : s.name.split(' ')[0],
      // Photo only shown for own child
      photoUrl:    myIds.has(s.id) ? (s.photoUrl ?? null) : null,
      stars:       calcStars(s.lessons),
      isOwn:       myIds.has(s.id),
    }))
    .sort((a, b) => b.stars - a.stars)

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          Звёздная карта
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Каждый ученик — планета. Чем больше звёзд, тем крупнее. Нажми на планету, чтобы увидеть имя.
        </p>
      </div>

      {planets.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">🌌</p>
          <p className="text-sm">Пока нет учеников</p>
        </div>
      ) : (
        <GalaxyMap planets={planets} myStudentIds={[...myIds]} />
      )}
    </div>
  )
}
