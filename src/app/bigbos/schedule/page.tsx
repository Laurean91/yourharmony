export const dynamic = 'force-dynamic'

import { getLessons, getStudents } from '../../actions'
import WeekSchedule from '../../../components/WeekSchedule'

export default async function SchedulePage() {
  const [lessons, students] = await Promise.all([getLessons(), getStudents()])

  return <WeekSchedule lessons={lessons as any} students={students} />
}
