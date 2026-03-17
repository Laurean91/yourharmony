export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Пользовательское соглашение</h1>
        <p className="text-gray-600 mb-6">
          Используя наш сайт, вы соглашаетесь с условиями данного соглашения.
        </p>
        <h2 className="text-2xl font-bold mb-4">1. Использование сайта</h2>
        <p className="text-gray-600 mb-6">
          Сайт клуба "Гармония" предназначен для ознакомления с нашими услугами и подачи заявок на обучение.
        </p>
        <a href="/" className="text-purple-600 hover:underline">Вернуться на главную</a>
      </div>
    </div>
  )
}
