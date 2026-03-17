export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Политика конфиденциальности</h1>
        <p className="text-gray-600 mb-6">
          Ваша конфиденциальность важна для нас. В этом документе описывается, какие персональные данные мы собираем и как их используем.
        </p>
        <h2 className="text-2xl font-bold mb-4">1. Сбор информации</h2>
        <p className="text-gray-600 mb-6">
          Мы собираем ваше имя, номер телефона и возраст ребенка при заполнении формы записи на занятие. Эти данные необходимы для связи с вами и организации учебного процесса.
        </p>
        <h2 className="text-2xl font-bold mb-4">2. Использование данных</h2>
        <p className="text-gray-600 mb-6">
          Мы используем предоставленную информацию исключительно для обработки вашей заявки и не передаем её третьим лицам.
        </p>
        <a href="/" className="text-purple-600 hover:underline">Вернуться на главную</a>
      </div>
    </div>
  )
}
