import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Правовые документы',
  description: 'Политика конфиденциальности, пользовательское соглашение и согласие на обработку персональных данных клуба «Гармония».',
  robots: { index: false, follow: false },
}

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Правовые документы</h1>
        <p className="text-gray-400 text-sm mb-10">Клуб «Гармония»</p>

        {/* Nav */}
        <nav className="flex flex-wrap gap-3 mb-10 border-b border-gray-200 pb-6 text-sm">
          <a href="#privacy" className="text-purple-600 hover:text-purple-800 font-medium transition-colors">Политика конфиденциальности</a>
          <span className="text-gray-300">·</span>
          <a href="#terms" className="text-purple-600 hover:text-purple-800 font-medium transition-colors">Пользовательское соглашение</a>
          <span className="text-gray-300">·</span>
          <a href="#personal-data" className="text-purple-600 hover:text-purple-800 font-medium transition-colors">Обработка персональных данных</a>
        </nav>

        {/* Политика конфиденциальности */}
        <section id="privacy" className="mb-14 scroll-mt-24">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Политика конфиденциальности</h2>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Ваша конфиденциальность важна для нас. В этом документе описывается, какие персональные данные мы собираем и как их используем.
          </p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">1. Сбор информации</h3>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Мы собираем ваше имя, номер телефона и возраст ребёнка при заполнении формы записи на занятие. Эти данные необходимы для связи с вами и организации учебного процесса.
          </p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">2. Использование данных</h3>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Мы используем предоставленную информацию исключительно для обработки вашей заявки и не передаём её третьим лицам.
          </p>
        </section>

        <hr className="border-gray-200 mb-14" />

        {/* Пользовательское соглашение */}
        <section id="terms" className="mb-14 scroll-mt-24">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Пользовательское соглашение</h2>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Используя наш сайт, вы соглашаетесь с условиями данного соглашения.
          </p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">1. Использование сайта</h3>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Сайт клуба «Гармония» предназначен для ознакомления с нашими услугами и подачи заявок на обучение.
          </p>
        </section>

        <hr className="border-gray-200 mb-14" />

        {/* Обработка персональных данных */}
        <section id="personal-data" className="mb-14 scroll-mt-24">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Обработка персональных данных</h2>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Настоящее согласие регулирует обработку персональных данных, которые вы предоставляете при заполнении формы записи на занятия в клубе «Гармония».
          </p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">1. Оператор данных</h3>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Оператором персональных данных является клуб «Гармония». Мы несём ответственность за сохранность и правомерность обработки ваших данных.
          </p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">2. Состав персональных данных</h3>
          <p className="text-gray-600 leading-relaxed mb-3 text-base">Мы собираем следующие персональные данные:</p>
          <ul className="list-disc pl-5 text-gray-600 mb-5 space-y-1.5 text-base leading-relaxed">
            <li>Имя родителя / законного представителя</li>
            <li>Номер телефона</li>
            <li>Возраст ребёнка</li>
          </ul>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">3. Цели обработки</h3>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Персональные данные обрабатываются исключительно в целях рассмотрения заявки на занятие, связи с вами для подтверждения записи и организации учебного процесса.
          </p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">4. Правовое основание</h3>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Обработка осуществляется на основании вашего добровольного согласия, выраженного при отправке формы заявки (ФЗ № 152 «О персональных данных»).
          </p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">5. Передача третьим лицам</h3>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Ваши данные не передаются третьим лицам и не используются в маркетинговых или иных целях, не связанных с обработкой вашей заявки.
          </p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">6. Хранение и удаление</h3>
          <p className="text-gray-600 leading-relaxed mb-5 text-base">
            Данные хранятся до момента отзыва вашего согласия или по истечении срока, необходимого для достижения целей обработки. Вы вправе в любое время направить запрос на удаление ваших данных, связавшись с нами через форму на сайте.
          </p>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">7. Ваши права</h3>
          <p className="text-gray-600 leading-relaxed mb-3 text-base">Вы имеете право:</p>
          <ul className="list-disc pl-5 text-gray-600 mb-5 space-y-1.5 text-base leading-relaxed">
            <li>Получить информацию об обработке ваших данных</li>
            <li>Потребовать исправления неточных данных</li>
            <li>Отозвать согласие на обработку</li>
            <li>Потребовать удаления ваших данных</li>
          </ul>
        </section>

        <a href="/" className="text-sm text-purple-600 hover:text-purple-800 transition-colors">← Вернуться на главную</a>
      </div>
    </div>
  )
}
