import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-orange-50 font-sans text-gray-800 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white/50 backdrop-blur-lg border border-white/60 shadow-lg text-5xl mb-6">
          🔍
        </div>
        <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-orange-500 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-3">Страница не найдена</h2>
        <p className="text-gray-500 mb-8">
          Такой страницы не существует. Возможно, она была перемещена или удалена.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-orange-500 text-white font-bold rounded-full shadow-lg hover:brightness-110 transition-all"
          >
            На главную
          </Link>
          <Link
            href="/blog"
            className="px-6 py-3 bg-white/60 backdrop-blur-sm border border-white/60 rounded-full font-semibold text-purple-600 hover:bg-white/80 transition-all shadow-sm"
          >
            Перейти в блог
          </Link>
        </div>
      </div>
    </div>
  )
}
