# YourHarmony: Проектная документация

Детский языковой клуб «Гармония» — сайт с лендингом, системой бронирования, блогом и панелью администратора.

## 🛠 Технологический стек
- **Framework**: Next.js (App Router)
- **Database**: PostgreSQL (Prisma Postgres)
- **ORM**: Prisma
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **CMS / Editor**: Tiptap (Rich Text Editor)
- **File Storage**: Vercel Blob
- **HTML Sanitization**: sanitize-html (XSS-защита контента блога)
- **Auth**: NextAuth.js v5 (Credentials provider, JWT-сессии)
- **Testing**: Jest + React Testing Library + Playwright (E2E)

## 📂 Структура проекта
```
prisma/               — схема БД и миграции
src/
  app/                — маршруты (Next.js App Router)
    actions.ts        — все Server Actions
    page.tsx          — главная страница
    blog/             — публичный блог (/blog, /blog/[slug])
    documents/        — юридические страницы (/documents)
    bigbos/           — панель администратора
      login/          — форма входа
      blog/           — управление статьями
      teacher/        — редактирование профиля преподавателя
  components/         — React-компоненты
  lib/
    prisma.ts         — Singleton-клиент Prisma
    utils.ts          — formatDate(), scrollToSection()
    landingTypes.ts   — типы и дефолтные значения всех секций лендинга
public/               — статика
```

## 🚀 Реализованный функционал

### 1. Главная страница (Landing Page)

`src/app/page.tsx` — серверный компонент (async). Загружает настройки всех секций через `getSectionSettings(key)` и передаёт их как props. Каждую секцию можно отключить через поле `enabled`.

**Порядок секций:**

| # | Компонент | Описание |
|---|---|---|
| 1 | `LandingHero` | Заголовок, подзаголовок, CTA-кнопка, stats-bar (ученики / годы / рейтинг) |
| 2 | `BlogPreview` | Превью последних 3 статей блога |
| 3 | `LandingTop` | «О клубе» (3 карточки) + «Форматы» (группа / онлайн) + Галерея фото |
| 4 | `TeacherSection` | Профиль преподавателя (фото, имя, bio, badges) |
| 5 | `HowItWorksSection` | 3 шага: Заявка → Пробное → Начало занятий |
| 6 | `TestimonialsSection` | Карусель отзывов родителей (6 отзывов) |
| 7 | `CtaSection` | Повторный CTA-баннер + кнопка Telegram |
| 8 | `FAQSection` | 8 вопросов/ответов с аккордеоном + FAQPage JSON-LD |
| 9 | `LandingContacts` | Адрес, телефон, Telegram, Yandex Maps iframe |

**Типы и дефолты секций** — `src/lib/landingTypes.ts`:
- Типы: `HeroSettings`, `FeaturesSettings`, `FormatsSettings`, `ContactsSettings`, `HowItWorksSettings`, `TestimonialsSettings`, `CtaSettings`, `FaqSettings`
- Константы `DEFAULT_*` — дефолтные данные, используются при отсутствии записи в БД
- `SECTION_DEFAULTS` — общий словарь дефолтов по `SectionKey`
- Server Action `getSectionSettings(key: SectionKey)` — читает секцию из БД, мерджит с дефолтами

**SEO:**
- `FAQSection` рендерит `<script type="application/ld+json">` с `FAQPage` schema — расширенный сниппет в поиске
- Каждая секция получает props с реальными данными — все тексты индексируются

### 2. Карусель отзывов (`TestimonialsSection`)
- Непрерывная лента: все карточки в одном flex-треке
- Drag/swipe (мышь и тач): порог 25% ширины карточки
- Автопрокрутка каждые 4 сек (останавливается во время drag)
- Пружинная анимация `spring` (stiffness 300, damping 35)
- Навигация: стрелки ← → + dot-индикаторы (активная — pill-форма)
- 3 карточки видно одновременно (на мобильном — 1)

### 3. Система бронирования
- `BookingModal.tsx` — форма записи (имя родителя, возраст ребёнка, телефон)
- Вызывается из Hero, `HowItWorksSection`, `CtaSection`
- Данные → таблица `Booking` через Server Action с серверной валидацией (возраст 1–18, телефон)

### 4. Блог
- `/blog` — список статей, `/blog/[slug]` — страница статьи (SSR + SEO-метаданные)
- `BlogCards.tsx` — client-компонент с Framer Motion stagger
- `BlogPreview` — серверный компонент, показывает 3 последних опубликованных поста

### 5. Аутентификация и панель администратора
- **NextAuth.js v5**, Credentials-провайдер, JWT. Логин/пароль — env-переменные
- `middleware.ts` защищает `/bigbos/*` → редирект на `/bigbos/login`
- Панель `/bigbos`: заявки (просмотр, смена статуса, удаление), переход в блог и профиль
- `/bigbos/blog`: CRUD статей, RichTextEditor (Tiptap), загрузка обложек (Vercel Blob), slug
- `/bigbos/teacher`: редактирование профиля преподавателя (`TeacherForm.tsx`)

### 6. Профиль преподавателя
- Таблица `TeacherProfile` (singleton, upsert по `id=1`)
- Поля: `name`, `bio`, `photoUrl`, `badges` (строка, разделитель `;`)
- Server Actions: `getTeacherProfile`, `updateTeacherProfile`

### 7. Юридические документы
- Все документы объединены на одной странице `/documents` с якорной навигацией:
  - Политика конфиденциальности
  - Пользовательское соглашение
  - Обработка персональных данных

## 📊 Схема базы данных (Prisma)
| Таблица | Поля | Индексы |
|---|---|---|
| `Booking` | id, parentName, childAge, phone, status, createdAt | createdAt, status |
| `Post` | id, title, slug, excerpt, content, coverImage, isPublished, categoryId, createdAt | isPublished, categoryId, createdAt |
| `Category` | id, name, slug | — |
| `Photo` | id, url, createdAt | — |
| `TeacherProfile` | id=1, name, bio, photoUrl, badges | — |
| `LandingSection` | key (SectionKey), data (JSON), enabled | key (unique) |

## 🔐 Переменные окружения
| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `POSTGRES_URL` | Альтернативная строка подключения |
| `BLOB_READ_WRITE_TOKEN` | Токен Vercel Blob для загрузки файлов |
| `ADMIN_USER` | Логин для доступа к `/bigbos` |
| `ADMIN_PASSWORD` | Пароль для доступа к `/bigbos` |
| `AUTH_SECRET` | Секрет NextAuth.js для подписи JWT (`npx auth secret`) |

## 🔧 История изменений

### Новые блоки лендинга + CMS для секций (2026-03-20)
- Добавлены 4 новые секции: `HowItWorksSection`, `TestimonialsSection`, `CtaSection`, `FAQSection`
- `TestimonialsSection` реализована как карусель с drag, автопрокруткой и dot-навигацией
- `FAQSection` включает `FAQPage` JSON-LD schema для расширенного сниппета в поиске
- Введён `src/lib/landingTypes.ts` — централизованные типы и дефолты всех секций
- `page.tsx` переведён в async-компонент: загружает настройки секций через `getSectionSettings`
- Каждая секция принимает `data` prop с типом из `landingTypes.ts`, fallback на DEFAULT_*
- Отзывы приведены к реалистичному виду (конкретные детали, сомнения, живой язык)

### Редизайн и контакты (2026-03-18)
- Переработан лендинг: новый порядок секций, stats-bar, glow-анимация CTA
- `TeacherSection.tsx` — новый компонент с аватаром, bio, badges
- Yandex Maps iframe в контактах; кнопки Telegram и WhatsApp
- Анимации: mouse parallax в Hero, counter-анимация stats, stagger карточек, slide-in Teacher

### Аутентификация, тесты, безопасность (2026-03-17–18)
- NextAuth.js v5 (JWT, Credentials), защита `/bigbos/*` через middleware
- XSS-защита блога (`sanitize-html`), серверная валидация бронирований
- Credentials в env-переменные, индексы БД, Prisma singleton
- 47 unit-тестов (Jest) + 10 E2E-тестов (Playwright)
- `/admin` → `/bigbos`; удаление заявок; CRUD профиля преподавателя
- Юридические страницы объединены в `/documents`

## 📝 Backlog
- Уведомления (Email/Telegram) о новых бронированиях
- CI/CD (GitHub Actions) с автозапуском Jest + Playwright
- Управление секциями лендинга из `/bigbos` (UI для `LandingSection`)
- Расширение галереи (сортировка, подписи)
- Тесты для новых компонентов лендинга
