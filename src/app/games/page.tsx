import EnglishGamesModule from '@/components/games/EnglishGamesModule'

export const metadata = {
  title: 'Игры English — задания для детей',
  description:
    'Интерактивные задания по английскому для детей 4–6 лет: цвета, предметы и страны. Выбирай правильный ответ по картинке.',
  robots: { index: false, follow: false },
}

/**
 * Открытая (без авторизации) страница-предпросмотр обучающего модуля.
 * Живёт отдельно от админки (/bigbos) и кабинета родителя (/parent),
 * поэтому proxy.ts её не защищает.
 *
 * Модуль опирается на CSS-переменные темы (--par-*), которые в кабинете
 * родителя задаёт layout через data-parent-theme. Здесь мы задаём их сами
 * на обёртке, чтобы сохранить ту же палитру и фон.
 */
export default function PublicGamesPage() {
  return (
    <div
      data-parent-theme="light"
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'var(--par-bg-base)' }}
    >
      {/* Декоративные «блобы» — как в кабинете родителя */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="parent-blob-1 absolute rounded-full"
          style={{
            width: 400,
            height: 400,
            top: '-5%',
            right: '-8%',
            background: 'radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)',
          }}
        />
        <div
          className="parent-blob-2 absolute rounded-full"
          style={{
            width: 350,
            height: 350,
            bottom: '10%',
            left: '-6%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)',
          }}
        />
        <div
          className="parent-blob-1 absolute rounded-full"
          style={{
            width: 250,
            height: 250,
            top: '40%',
            left: '50%',
            background: 'radial-gradient(circle, rgba(249,115,22,0.08), transparent 70%)',
            animationDelay: '3s',
          }}
        />
      </div>

      <main className="relative z-10">
        <EnglishGamesModule />
      </main>
    </div>
  )
}
