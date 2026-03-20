# YourHarmony: Проектная документация

Этот документ содержит описание текущего состояния проекта YourHarmony, его архитектуры, реализованных функций и используемого технологического стека.

## 🌟 Обзор проекта
YourHarmony — это веб-приложение для детского центра или аналогичного сервиса, включающее в себя лендинг, систему бронирования и полноценный блог с панелью администратора.

## 🛠 Технологический стек
- **Framework**: Next.js 16.1.6 (App Router)
- **Runtime**: Node.js
- **Database**: PostgreSQL (Prisma Postgres)
- **ORM**: Prisma 6.4.1
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **CMS / Editor**: Tiptap (Rich Text Editor)
- **File Storage**: Vercel Blob
- **HTML Sanitization**: sanitize-html (XSS-защита контента блога)
- **Auth**: NextAuth.js v5 (Credentials provider, JWT-сессии)
- **Testing**: Jest + React Testing Library + Playwright (E2E)

## 📂 Структура проекта
- `prisma/`: Схема базы данных и конфигурация Prisma.
- `src/app/`: Основные маршруты приложения (Next.js App Router).
- `src/components/`: Повторно используемые React-компоненты.
- `src/lib/`: Общие утилиты и инициализация клиента Prisma (Singleton).
  - `prisma.ts`: Singleton-клиент Prisma с условным логированием (только ошибки в проде).
  - `utils.ts`: Общие утилиты — `formatDate(date, showYear?)` и `scrollToSection(href, offset?)`.
- `src/app/actions.ts`: Серверные действия (Server Actions) для обработки данных.
- `public/`: Статические файлы.

## 🚀 Реализованный функционал

### 1. Главная страница (Landing Page)
Построена на базе `LandingClient.tsx` + отдельных компонентов. Порядок секций:

1. **Hero** (`LandingHero`) — название клуба, подзаголовок, CTA-кнопка записи, stats-bar (50+ учеников, 3 года, ★ 5.0)
2. **Блог** (`BlogPreview`) — превью последних 3 статей
3. **Преимущества** (`LandingTop`) — описание клуба и 3 карточки (Игровая форма, Живое общение, Уютная атмосфера)
4. **Галерея** (`LandingTop`) — фото занятий из БД с модальным просмотром
5. **О преподавателе** (`TeacherSection`) — аватар, имя, описание, badges (CELTA, IELTS 8.0, опыт)
6. **Контакты** (`LandingContacts`) — адрес, телефон, Telegram/WhatsApp, Yandex Maps iframe

### 2. Система бронирования (Booking System)
- **Booking Modal**: Форма записи (имя родителя, возраст ребенка, телефон).
- Модальное окно вынесено в отдельный компонент `BookingModal.tsx` (используется и в лендинге, и в блоге).
- Кнопка вызова формы (`BookingButton.tsx`) реализована как всплывающее окно (Popup), чтобы не перегружать основной интерфейс.
- Данные сохраняются в таблицу `Booking` через Server Actions с серверной валидацией (имя, возраст 1–18, телефон).

### 3. Блог (Blog Section)
- **Публичная часть**: 
  - Главная страница блога (`/blog`) со списком статей.
  - Страница отдельной статьи (`/blog/[slug]`) с SEO-оптимизацией и SSR.
- **Админ-панель блога**:
  - Управление статьями (создание, редактирование, удаление).
  - **RichTextEditor**: Продвинутый редактор на базе Tiptap с поддержкой форматирования, ссылок и изображений.
  - Автоматическая генерация и ручное редактирование `slug` для URL.
  - Загрузка обложек и изображений через Vercel Blob.

### 4. Аутентификация админ-панели
- **NextAuth.js v5** с Credentials-провайдером (JWT-сессии, без OAuth).
- Логин/пароль задаются через переменные окружения `ADMIN_USER` / `ADMIN_PASSWORD`.
- Защита маршрутов через `middleware.ts` — неаутентифицированные запросы к `/bigbos/*` редиректятся на `/bigbos/login`.
- Форма входа: `/bigbos/login` — поля `Логин` / `Пароль` с `htmlFor`/`id` для доступности.
- Кнопка выхода (`SignOutButton.tsx`) — доступна с любой страницы `/bigbos`.
- Конфигурация: `src/auth.ts`, обработчики — `src/app/api/auth/[...nextauth]/route.ts`.

### 5. Панель администратора (Admin Dashboard)
- Расположена по адресу `/bigbos` (ранее `/admin`).
- Просмотр и управление заявками на бронирование (`Booking`): смена статуса, **удаление заявок** (`DeleteBookingButton.tsx`).
- Переход к управлению блогом (`/bigbos/blog`).
- Переход к редактированию профиля преподавателя (`/bigbos/teacher`).
- Кнопка выхода из сессии.

### 6. Профиль преподавателя (Teacher Profile)
- Отдельная страница `/bigbos/teacher` для редактирования блока «О преподавателе» на лендинге.
- **`TeacherForm.tsx`**: форма с полями имя, описание, список badges (через textarea, разделитель `;`), загрузка фото через Vercel Blob.
- Данные хранятся в таблице `TeacherProfile` (singleton-запись, upsert по `id=1`).
- Server Actions: `getTeacherProfile`, `updateTeacherProfile` в `src/app/actions.ts`.

## 📊 Схема базы данных (Prisma)
- `Booking`: Заявки (id, parentName, childAge, phone, status, createdAt). Индексы: `createdAt`, `status`.
- `Post`: Статьи блога (id, title, slug, excerpt, content, coverImage, isPublished, category). Индексы: `isPublished`, `categoryId`, `createdAt`.
- `Category`: Категории блога.
- `Photo`: Галерея изображений.
- `TeacherProfile`: Профиль преподавателя — singleton-запись (id=1). Поля: `name`, `bio`, `photoUrl`, `badges` (строки разделённые `;`).

### 6. Навигация и Подвал (Navigation & Footer)
- **Header**: Фиксированное меню с эффектом Glassmorphism и плавной прокруткой к секциям лендинга.
- **Footer**: Информационный блок с полезными ссылками, юридической информацией и формой обратной связи.
- **Mobile Friendly**: Адаптивное бургер-меню для мобильных устройств.
- **Секция контактов**: Новый блок на главной странице с адресом и картой.

### 7. Юридические страницы
- Реализованы страницы `/privacy` (Политика конфиденциальности) и `/terms` (Пользовательское соглашение).

## 🔧 История изменений

### Security & Code Quality Audit (2026-03-17)
- Credentials админ-панели перенесены из кода в переменные окружения (`ADMIN_USER`, `ADMIN_PASSWORD`).
- Добавлена XSS-защита контента блога через `sanitize-html`.
- Добавлена серверная валидация данных формы бронирования.
- При обновлении и удалении поста старая обложка автоматически удаляется из Vercel Blob.
- Добавлены индексы БД для ускорения запросов.
- Prisma логирует только ошибки в production (ранее — все запросы).
- Устранено дублирование: `formatDate`, `scrollToSection`, `BookingModal` вынесены в общие модули.
- Исправлены `any`-типы в TypeScript.
- SEO: заголовок, описание и `lang` в корневом layout приведены в порядок.

### Аутентификация и тесты (2026-03-18)
- **NextAuth.js v5**: Basic Auth заменён на полноценную сессионную аутентификацию (JWT, Credentials-провайдер).
- Добавлен `AUTH_SECRET` в переменные окружения.
- Форма `/bigbos/login` переработана: добавлены `htmlFor`/`id` для accessibility.
- Добавлена кнопка выхода `SignOutButton`.
- **47 unit-тестов** — все проходят:
  - `actions.test.ts` — 24 теста: полная валидация, CRUD заявок/фото/блога.
  - `auth.test.ts` — 7 тестов: `authorize()` при корректных/некорректных данных и отсутствии env.
  - `bigbos/login/page.test.tsx` — 6 тестов: рендер, ошибка, редирект, loading.
  - `bigbos/page.test.tsx` — 5 тестов: дашборд, данные, SignOut.
  - `page.test.tsx` — 5 тестов: лендинг, секции, форма.
- **Playwright E2E** (`tests/admin-auth.spec.ts`): 5 сценариев — редирект, форма, ошибка, успешный вход, выход.
- Jest настроен на игнорирование `tests/` и `.claude/` директорий.
- Fix Production Build, UI Refactoring, Blog Integration, Prisma Singleton — см. предыдущие коммиты.

### Переименование /admin → /bigbos, удаление заявок, профиль преподавателя (2026-03-18)
- Все маршруты панели переименованы: `/admin` → `/bigbos` (middleware, auth, Next.js pages).
- **Удаление заявок**: кнопка корзины в таблице заявок с `window.confirm` и Server Action `deleteBooking`.
- **TeacherProfile**: новая таблица в Prisma (singleton), Server Actions `getTeacherProfile`/`updateTeacherProfile`.
- **`/bigbos/teacher`**: отдельная страница редактирования профиля преподавателя (`TeacherForm.tsx`) — имя, описание, badges, загрузка фото.
- **Playwright E2E** (`tests/bookings.spec.ts`): 5 тестов — отправка формы, таблица заявок, удаление, подтверждение, смена статуса.

### Анимации и визуальные эффекты (2026-03-18)
- **Mouse parallax** в Hero: blobs смещаются за курсором через `useMotionValue` + `useTransform`.
- **Counter-анимация** для stats-bar: числа считаются от 0 при появлении в viewport (`useInView` + `setInterval`).
- **Glow-анимация** на CTA-кнопке: пульсирующее purple→orange свечение (`@keyframes glow-pulse`, 2.5s infinite).
- **Stagger-анимации**: feature-карточки (0.15s), контактные строки (0.12s) появляются поочерёдно.
- **Slide-in** для `TeacherSection`: аватар вылетает слева, текст справа; badges появляются с stagger 0.08s.
- **`BlogCards.tsx`** (новый client-компонент): карточки блога с Framer Motion stagger 0.1s; `BlogPreview` остался серверным.
- **Тесты** обновлены: `TeacherSection.test.tsx` расширен до 8 тестов (добавлены тест фото и кастомных props).

### Редизайн главной страницы (2026-03-18)
- Название клуба изменено с «Клуб "Гармония"» на «Языковой клуб "Гармония"».
- Переработан порядок секций лендинга (см. раздел «Главная страница»).
- **Stats-bar** в Hero: цифры «50+ учеников», «3 года работаем», «★ 5.0» под CTA-кнопкой.
- Убрана некорректная `animate-ping`-анимация на CTA-кнопке, заменена на `ring-2 ring-white/30`.
- Новый компонент **`TeacherSection.tsx`**: блок о преподавателе с аватаром, именем, описанием и badges.
- Секция контактов вынесена из `LandingTop` в отдельный экспорт **`LandingContacts`**.
- Карта: заглушка «Карта скоро появится» заменена на **Yandex Maps iframe**.
- Контакты: добавлены кнопки **Telegram** и **WhatsApp**.
- Секция преимуществ расширена: добавлено вступительное описание клуба, тексты карточек развёрнуты до 2–3 предложений.
- **Тесты** обновлены и добавлены — итого 23 теста проходят:
  - `page.test.tsx` — 7 тестов: все секции, обновлённое название, stats-bar, порядок секций, контакты.
  - `TeacherSection.test.tsx` — 6 тестов: рендер, имя, метка, инициалы, badges, описание.

## 🔐 Переменные окружения
| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `POSTGRES_URL` | Альтернативная строка подключения |
| `BLOB_READ_WRITE_TOKEN` | Токен Vercel Blob для загрузки файлов |
| `ADMIN_USER` | Логин для доступа к `/bigbos` |
| `ADMIN_PASSWORD` | Пароль для доступа к `/bigbos` |
| `AUTH_SECRET` | Секрет NextAuth.js для подписи JWT (генерируется `npx auth secret`) |

## 📝 Дальнейшие задачи (Backlog)
- Расширение функционала галереи (`Photo`).
- Уведомления (Email/Telegram) о новых бронированиях.
- Настройка CI/CD (GitHub Actions) с автозапуском Jest + Playwright.
- Подключить `TeacherProfile` из БД к лендингу (сейчас `TeacherSection` рендерит хардкод).
- Заменить заглушки (stats, контакты мессенджеров) на реальные данные.
- Добавить тесты для `LandingClient` и `BlogPreview` компонентов.
