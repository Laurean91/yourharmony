import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import EnglishGamesModule from '@/components/games/EnglishGamesModule'

export const metadata = {
  title: 'Игры English',
}

export default async function GamesPage() {
  const session = await auth()
  if (!session || session.user.role !== 'PARENT') redirect('/parent/login')

  return <EnglishGamesModule />
}
