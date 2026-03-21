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
- **Image Processing**: sharp (сжатие и конвертация в WebP перед загрузкой)
- **HTML Sanitization**: sanitize-html (XSS-защита контента блога)
- **Auth**: NextAuth.js v5 (Credentials provider, JWT-сессии)
- **Email**: Resend (уведомления о новых заявках)
- **Telegram**: Bot API (уведомления о новых заявках прямо в Telegram)
- **Testing**: Jest + React Testing Library + Playwright (E2E)
- **Deployment**: Docker Compose + Nginx + GitHub Actions CI/CD (VPS)

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
- При создании заявки параллельно отправляются уведомления: email (Resend) и Telegram (Bot API)
- Если канал уведомления не настроен — заявка всё равно сохраняется, ошибка только логируется

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
| `RESEND_API_KEY` | API-ключ Resend для отправки email-уведомлений |
| `NOTIFICATION_EMAIL` | Email, на который приходят уведомления о новых заявках |
| `TELEGRAM_BOT_TOKEN` | Токен бота Telegram (получить у @BotFather) |
| `TELEGRAM_CHAT_ID` | ID чата/пользователя для Telegram-уведомлений (узнать у @userinfobot) |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL (используется в Docker Compose) |
| `FASTAPI_SECRET_KEY` | Секретный ключ FastAPI-сервиса |

## 🎨 Брендинг и логотип

**Концепция** — «Живой диалог»: два речевых пузыря (большой фиолетовый — учитель, маленький оранжевый — ребёнок), три звёздочки радости + улыбка.

**Логотип** реализован как inline SVG в `Navbar.tsx` и `Footer.tsx`. Стек: иконка слева + вертикально «Гармония» (Nunito ExtraBold 800, градиент) / «Языковой клуб» (9px, uppercase, tracking 0.2em).

| Вариант | Где используется | Цвета |
|---|---|---|
| Светлый | Navbar (desktop + mobile menu) | purple-600 → orange-500, подпись purple-400/80 |
| Тёмный | Footer | purple-400 → orange-400, подпись purple-300/60 |

**Шрифт** — `Nunito` (ExtraBold 800, cyrillic) подключён через `next/font/google`, CSS-переменная `--font-nunito`.

---

## 🚢 Деплой (Production)

Приложение разворачивается на VPS через Docker Compose. Схема:

```
GitHub push → GitHub Actions
  1. Lint job: npm ci → prisma generate → tsc --noEmit
  2. Deploy job (SSH):
     - Записывает .env из GitHub Secrets
     - git pull origin main
     - docker compose up -d --build
     - docker compose run --rm migrator  (Prisma migrations)
     - Health check: Next.js :3000, FastAPI :8000
     - docker image prune -f
```

**Контейнеры:**
| Сервис | Образ | Порт |
|---|---|---|
| `postgres` | postgres:16-alpine | — |
| `nextjs` | Dockerfile (standalone) | 3000 |
| `fastapi` | api/Dockerfile | 8000 |
| `nginx` | nginx:alpine | 80, 443 |
| `migrator` | Dockerfile (target: migrator) | — (one-shot) |

**Nginx** — reverse proxy + SSL (Let's Encrypt), обслуживает `yourharmony-english.ru`.

**GitHub Secrets** (обязательные): `VPS_HOST`, `VPS_SSH_KEY`, `POSTGRES_PASSWORD`, `AUTH_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL`, `FASTAPI_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

---

## 🔧 История изменений

### Логотип + мобильные фиксы (2026-03-20)
- **SVG-логотип** внедрён в `Navbar.tsx` и `Footer.tsx`: иконка + «Гармония» + «Языковой клуб»
- Шрифт Nunito ExtraBold добавлен через `next/font/google` (кириллица)
- Мобильное меню Navbar: логотип отображается вверху выпадающего меню
- Footer: тёмная версия логотипа, подпись «Языковой клуб» под именем
- `TestimonialsSection`: карусель адаптирована для мобильного — `visibleCount` реактивный (1 на мобильном, 3 на десктопе)
- Таблица заявок в `/bigbos`: добавлены `pr-3` и `whitespace-nowrap` — колонки больше не сливаются
- Форма загрузки галереи: кнопка «Загрузить» переходит под инпут на мобильном (`flex-col sm:flex-row`)
- Секция «Форматы обучения» добавлена в `LandingTop` между «О клубе» и галереей

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

### Telegram-уведомления + API счётчика заявок (2026-03-21)
- **`GET /api/bookings/count`** — новый REST endpoint, возвращает `{ "count": N }` количество заявок со статусом «Новая»
- **Telegram Bot API** — при создании заявки бот отправляет сообщение в чат: имя, возраст, телефон
- Уведомление отправляется параллельно с email (Resend); при сбое любого канала заявка всё равно сохраняется
- Настройка: `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` в `.env` и GitHub Secrets

### Email-уведомления, CI/CD, фиксы (2026-03-21)
- **Resend** — при отправке заявки через `BookingModal` уходит письмо на `NOTIFICATION_EMAIL`
- **GitHub Actions** — workflow `deploy.yml`: lint (tsc) → SSH-деплой на VPS. Secrets передаются через `${{ secrets.X }}` прямо в теле скрипта (обход ограничений `AcceptEnv` на VPS)
- **Docker Compose** — .env записывается на VPS при каждом деплое из GitHub Secrets
- **Auth-баг** — исправлена уязвимость: `middleware.ts` проверяет `req.auth?.user?.name` вместо `req.auth` (NextAuth v5 beta может возвращать truthy-объект без валидного пользователя)
- Удалён `playwright.yml` — E2E-тесты не запускаются в CI (нет DATABASE_URL в runner)

### Сжатие изображений при загрузке (2026-03-21)
- Добавлен `sharp` — серверная обработка изображений перед отправкой в Vercel Blob
- Все загружаемые фото автоматически конвертируются в WebP и масштабируются:
  - Галерея «как проходят занятия»: макс. 1200px, quality 80
  - Фото преподавателя: макс. 600px, quality 85
  - Обложки блога (создание / обновление): макс. 1200px, quality 80
- Функция `compressImage()` в `actions.ts` — принимает `File`, возвращает сжатый `Buffer` + `.webp`-имя

## 📝 Backlog
- Управление секциями лендинга из `/bigbos` (UI для `LandingSection`)
- Расширение галереи (сортировка, подписи)
- Тесты для новых компонентов лендинга
- E2E-тесты в CI (настройка DATABASE_URL для Playwright)
