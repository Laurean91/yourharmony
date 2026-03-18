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
- Построена на базе `LandingClient.tsx`.
- Содержит секции с описанием услуг.
- Интегрирован блок **BlogPreview**, отображающий последние статьи.
- Интерактивные элементы с использованием Framer Motion.

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
- Защита маршрутов через `middleware.ts` — неаутентифицированные запросы к `/admin/*` редиректятся на `/admin/login`.
- Форма входа: `/admin/login` — поля `Логин` / `Пароль` с `htmlFor`/`id` для доступности.
- Кнопка выхода (`SignOutButton.tsx`) — доступна с любой страницы `/admin`.
- Конфигурация: `src/auth.ts`, обработчики — `src/app/api/auth/[...nextauth]/route.ts`.

### 5. Панель администратора (Admin Dashboard)
- Расположена по адресу `/admin`.
- Просмотр и управление заявками на бронирование (`Booking`).
- Переход к управлению блогом.
- Кнопка выхода из сессии.

## 📊 Схема базы данных (Prisma)
- `Booking`: Заявки (id, parentName, childAge, phone, status, createdAt). Индексы: `createdAt`, `status`.
- `Post`: Статьи блога (id, title, slug, excerpt, content, coverImage, isPublished, category). Индексы: `isPublished`, `categoryId`, `createdAt`.
- `Category`: Категории блога.
- `Photo`: Галерея изображений.

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
- Форма `/admin/login` переработана: добавлены `htmlFor`/`id` для accessibility.
- Добавлена кнопка выхода `SignOutButton`.
- **47 unit-тестов** — все проходят:
  - `actions.test.ts` — 24 теста: полная валидация, CRUD заявок/фото/блога.
  - `auth.test.ts` — 7 тестов: `authorize()` при корректных/некорректных данных и отсутствии env.
  - `admin/login/page.test.tsx` — 6 тестов: рендер, ошибка, редирект, loading.
  - `admin/page.test.tsx` — 5 тестов: дашборд, данные, SignOut.
  - `page.test.tsx` — 5 тестов: лендинг, секции, форма.
- **Playwright E2E** (`tests/admin-auth.spec.ts`): 5 сценариев — редирект, форма, ошибка, успешный вход, выход.
- Jest настроен на игнорирование `tests/` (Playwright-директория).
- Fix Production Build, UI Refactoring, Blog Integration, Prisma Singleton — см. предыдущие коммиты.

## 🔐 Переменные окружения
| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `POSTGRES_URL` | Альтернативная строка подключения |
| `BLOB_READ_WRITE_TOKEN` | Токен Vercel Blob для загрузки файлов |
| `ADMIN_USER` | Логин для доступа к `/admin` |
| `ADMIN_PASSWORD` | Пароль для доступа к `/admin` |
| `AUTH_SECRET` | Секрет NextAuth.js для подписи JWT (генерируется `npx auth secret`) |

## 📝 Дальнейшие задачи (Backlog)
- Расширение функционала галереи (`Photo`).
- Уведомления (Email/Telegram) о новых бронированиях.
- Настройка CI/CD (GitHub Actions) с автозапуском Jest + Playwright.
- Добавить тесты для `LandingClient` и `BlogPreview` компонентов.
