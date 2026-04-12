# YourHarmony — Общая архитектура и инфраструктура

Детский языковой клуб «Гармония» — сайт с лендингом, системой бронирования, блогом и панелью администратора.

**Продакшн:** https://yourharmony-english.ru  
**API:** https://api.yourharmony-english.ru/docs

---

## Стек

### Frontend / Web
- **Next.js 16** (App Router, Server Components, Server Actions)
- **Prisma** + **PostgreSQL 16**
- **Tailwind CSS**
- **NextAuth.js v5** — аутентификация: Credentials (логин/пароль) + TOTP 2FA для учителя, логин/пароль для родителей
- **Vercel Blob** — хранение файлов и изображений
- **Resend** — email-уведомления о новых заявках
- **Telegram Bot API** — уведомления о новых заявках в Telegram
- **Recharts** — графики аналитики и финансов
- **Framer Motion** — анимации
- **TipTap** — rich text editor для блога
- **sharp** — сжатие изображений в WebP перед загрузкой
- **sanitize-html** — XSS-защита контента блога

### REST API (`api/`)
- **Python 3.12** + **FastAPI 0.115**
- **SQLAlchemy 2.0** async + **asyncpg** — та же БД
- **Pydantic v2** — валидация данных
- **JWT (HS256)** — access (30 мин) + refresh (7 дней) токены
- **pytest** + **httpx** — тесты

### Инфраструктура
- **Docker Compose** — оркестрация всех сервисов
- **Nginx** — реверс-прокси, SSL termination
- **Let's Encrypt** — SSL (certbot)
- **VPS Beget** — хостинг (Ubuntu)
- **GitHub Actions** — CI/CD (TypeScript check → деплой по SSH)

---

## Структура проекта

```
yourharmony/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Лендинг (публичный)
│   │   ├── blog/                 # Блог (/blog, /blog/[slug])
│   │   ├── teacher/              # Страница преподавателя (публичная)
│   │   ├── documents/            # Юридические страницы
│   │   ├── api/                  # Next.js Route Handlers
│   │   │   ├── finance/          # GET /api/finance/stats|report|prices, PATCH prices
│   │   │   │   └── students/[id]/report/
│   │   │   ├── lessons/[id]/     # PATCH /api/lessons/{id}
│   │   │   │   ├── move/         # PATCH /api/lessons/{id}/move
│   │   │   │   ├── journal/      # POST/GET /api/lessons/{id}/journal
│   │   │   │   └── files/        # POST/DELETE /api/lessons/{id}/files
│   │   │   ├── library/          # GET+POST /api/library, DELETE /api/library/[id]
│   │   │   ├── parent/           # /api/parent/schedule|grades
│   │   │   ├── admin/students/[id]/report/
│   │   │   ├── bookings/count/   # GET без авторизации
│   │   │   └── openapi/          # OpenAPI 3.0 спецификация
│   │   ├── api-docs/             # ReDoc UI
│   │   ├── bigbos/               # Административная панель
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Дашборд
│   │   │   ├── students/         # Управление учениками
│   │   │   ├── schedule/         # Недельное расписание
│   │   │   ├── finance/          # Финансовая аналитика
│   │   │   ├── blog/             # Управление блогом
│   │   │   ├── library/          # Управление библиотекой
│   │   │   ├── teacher/          # Редактирование профиля
│   │   │   ├── landing/          # Управление сайтом
│   │   │   └── journal/          # Журнал уроков
│   │   └── parent/               # Кабинет родителя
│   │       ├── layout.tsx
│   │       ├── page.tsx          # Дашборд
│   │       ├── login/
│   │       ├── schedule/
│   │       ├── grades/
│   │       ├── attendance/
│   │       ├── stars/
│   │       └── library/          # Полезная литература
│   ├── components/
│   │   ├── WeekSchedule.tsx      # Недельный timeline (drag-and-drop)
│   │   ├── LessonCalendar.tsx
│   │   ├── StudentModal.tsx
│   │   ├── StudentCard.tsx
│   │   ├── FinanceChart.tsx
│   │   ├── Navbar.tsx
│   │   └── ...
│   └── lib/
│       ├── prisma.ts
│       ├── landingTypes.ts
│       └── financeReport.ts
├── api/                          # REST API (FastAPI)
│   ├── main.py
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── services/
│   ├── controllers/
│   ├── routers/
│   └── tests/
├── scripts/
│   └── gen-og.mjs
├── nginx/
├── Dockerfile
├── api/Dockerfile
├── docker-compose.yml
└── prisma/schema.prisma
```

---

## Схема базы данных

| Модель | Описание |
|--------|----------|
| `Booking` | Заявки с лендинга |
| `Student` | Ученики |
| `Lesson` | Занятия (дата, тег, цена, homework) |
| `LessonStudent` | Связь занятий и учеников + посещаемость |
| `LessonFile` | Прикреплённые файлы к ДЗ (url, name, size) |
| `LibraryFile` | Файлы библиотеки (title, description, url, name, size, category, targetTag) |
| `Post` | Статьи блога |
| `Category` | Категории блога |
| `TeacherProfile` | Профиль преподавателя (singleton) |
| `Photo` | Галерея |
| `SiteSettings` | Настройки лендинга + цены занятий |
| `LandingSection` | Секции лендинга (key, data JSON, enabled) |
| `Parent` | Аккаунты родителей |
| `ParentStudent` | Связь родителей и учеников |
| `User` | Учётные записи (TEACHER/PARENT): id, username, passwordHash, role, email, createdAt |
| `RefreshToken` | Refresh-токены с RTR: tokenHash (SHA-256), family, expiresAt, revokedAt |
| `AuthEvent` | Аудит-лог: action, userId, ip, userAgent, createdAt |
| `MagicToken` | (зарезервировано) Одноразовые токены входа |
| `TotpSecret` | TOTP-секрет для 2FA учителя: secret (base32), verified |

**Индексы:** `Booking(createdAt, status)`, `Post(isPublished, categoryId, createdAt)`, `Lesson(date)`, `LessonStudent(lessonId, studentId)`, `LibraryFile(targetTag)`, `User(username, email)`, `RefreshToken(userId, family)`, `AuthEvent(userId, createdAt)`

---

## Переменные окружения

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `POSTGRES_URL` | Альтернативная строка подключения |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL (Docker Compose) |
| `AUTH_SECRET` | Секрет NextAuth.js (`openssl rand -hex 32`) |
| `ADMIN_USER` | Логин учителя (при первом деплое — seed создаёт запись в БД) |
| `ADMIN_PASSWORD` | Пароль учителя (при первом деплое — хэшируется bcrypt и сохраняется в БД) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob токен |
| `RESEND_API_KEY` | API-ключ Resend |
| `NOTIFICATION_EMAIL` | Email для уведомлений о заявках |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram бота |
| `TELEGRAM_CHAT_ID` | ID чата для уведомлений |
| `FASTAPI_SECRET_KEY` | Секретный ключ FastAPI (`openssl rand -hex 32`) |

---

## API

### FastAPI (`api/`) — полнофункциональный REST

Аутентификация: JWT (`POST /api/v1/auth/login`).

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | `/api/v1/health` | Health check | — |
| POST | `/api/v1/auth/login` | Получить JWT токены | — |
| POST | `/api/v1/auth/refresh` | Обновить access token | — |
| GET/POST | `/api/v1/blog/posts` | Список / создать пост | —/✓ |
| PUT/PATCH/DELETE | `/api/v1/blog/posts/{id}` | Обновить / удалить | ✓ |
| GET/POST | `/api/v1/blog/categories` | Категории | —/✓ |
| GET/POST/PUT/DELETE | `/api/v1/students` | CRUD учеников | ✓ |
| GET/POST/PUT/DELETE | `/api/v1/schedule/lessons` | CRUD занятий | ✓ |
| POST | `/api/v1/schedule/lessons/{id}/enroll` | Записать ученика | ✓ |
| PATCH | `/api/v1/schedule/lessons/{id}/enrollments/{studentId}` | Посещаемость | ✓ |
| GET | `/api/v1/finance/stats` | Статистика 12 мес | ✓ |
| GET/PATCH | `/api/v1/finance/prices` | Цены | ✓ |
| GET | `/api/v1/finance/report` | Отчёт за период | ✓ |
| GET | `/api/v1/finance/students/{id}/report` | Отчёт по ученику | ✓ |

### Next.js API (`src/app/api/`) — Bearer-токен из `FASTAPI_SECRET_KEY`

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/totp/setup` (GET) | Сгенерировать QR-код для Google Authenticator |
| POST | `/api/auth/totp/verify` | Верифицировать TOTP-код (активация 2FA или вход) |
| GET | `/api/auth/totp/status` | Статус TOTP текущего пользователя `{ enabled }` |
| POST | `/api/auth/refresh` | Обновить web-сессию через RTR |
| POST | `/api/auth/mobile` | Mobile JWT: access (2ч) + refresh (7д) с RTR |
| PATCH | `/api/lessons/{id}` | Редактировать занятие |
| PATCH | `/api/lessons/{id}/move` | Перенести занятие |
| POST/GET | `/api/lessons/{id}/journal` | Журнал (оценки, ДЗ, файлы) |
| POST | `/api/lessons/{id}/files` | Загрузить файл к ДЗ |
| DELETE | `/api/lessons/{id}/files/[fileId]` | Удалить файл |
| GET | `/api/finance/stats` | Финансовая статистика |
| GET | `/api/finance/report` | Отчёт за период |
| GET/PATCH | `/api/finance/prices` | Цены |
| GET | `/api/finance/students/{id}/report` | Отчёт по ученику |
| GET | `/api/parent/schedule` | Расписание (с ДЗ) |
| GET | `/api/parent/grades` | Оценки (с ДЗ и файлами) |
| GET | `/api/library` | Библиотека — все файлы (учитель) или по тегу ученика (родитель) |
| POST | `/api/library` | Загрузить файл в библиотеку (учитель, до 50 МБ) |
| DELETE | `/api/library/[id]` | Удалить файл из библиотеки (учитель) |
| GET | `/api/admin/students/{id}/report` | PDF-отчёт ученика |
| GET | `/api/bookings/count` | Кол-во новых заявок |

---

## Деплой

### Архитектура
```
Internet → Nginx :80/:443 → Next.js :3000
                           → FastAPI :8000
              PostgreSQL :5432 (внутренняя Docker-сеть)
```

### CI/CD (GitHub Actions)
1. TypeScript check (`tsc --noEmit`)
2. SSH на VPS → запись `.env` из секретов → `git pull` → `docker compose up -d --build`
3. `migrator` запускается автоматически через `depends_on` перед `nextjs`: `prisma migrate deploy` → `prisma db seed` (создаёт admin если не существует)
4. Health check Next.js (:3000) и FastAPI (:8000/api/v1/health)

### Docker сервисы
| Сервис | Порт |
|--------|------|
| `postgres` | — |
| `nextjs` | 3000 |
| `fastapi` | 8000 |
| `nginx` | 80, 443 |
| `migrator` | — (one-shot) |

### GitHub Secrets
`VPS_HOST`, `VPS_SSH_KEY`, `POSTGRES_PASSWORD`, `AUTH_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `NOTIFICATION_EMAIL`, `FASTAPI_SECRET_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

### Полезные команды на VPS
```bash
docker compose ps
docker compose logs -f nextjs
docker compose restart nextjs
docker compose exec postgres pg_dump -U yourharmony yourharmony > backup_$(date +%Y%m%d).sql
sudo certbot renew && docker compose restart nginx
```

---

## Запуск локально

```bash
# Next.js
npm install
npx prisma db push
npm run dev

# FastAPI
cd api
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" "sqlalchemy[asyncio]" asyncpg pydantic pydantic-settings "python-jose[cryptography]" "passlib[bcrypt]" python-multipart
uvicorn main:app --reload --port 8000

# Тесты API
cd api && pytest tests/ -v --cov=api
```

---

## Android-приложение (план)

### Рекомендуемый стек: React Native + Expo

Текущий FastAPI REST API уже готов для мобильного клиента. MVP:

1. **Личный кабинет родителя** — профиль ребёнка, прогресс, остаток занятий
2. **Расписание + Push-уведомления** — напоминания за 2 часа, уведомления о пересносе
3. **Оплата абонементов** — встроенная оплата (СБП)
4. **Связь с преподавателем** — короткие отчёты после уроков, чат

### Дорожная карта
- **Этап 1:** Мобильная авторизация (JWT уже есть в FastAPI)
- **Этап 2:** Экраны (Главная, Расписание, Профиль) на Expo + React Native
- **Этап 3:** Подключение к API, Expo Push Notifications
- **Этап 4:** Тестирование, сборка `.aab`, публикация Google Play

> Альтернатива (быстрее): Next.js + Capacitor — упаковать кабинет родителя `/parent` в WebView-приложение за 2-3 дня.

---

## История изменений — инфраструктура и безопасность

### Система аутентификации — полная переработка (2026-04-08)

#### Архитектура
- **Учитель** (`TEACHER`): логин/пароль (bcrypt) + опциональный TOTP 2FA (Google Authenticator)
- **Родитель** (`PARENT`): логин/пароль (bcrypt), создаётся и управляется учителем из `/bigbos/parents`
- Пароль учителя хранится в таблице `User` (bcrypt hash), не в `.env`
- `src/proxy.ts` (Next.js 16) — защита маршрутов `/bigbos/*` и `/parent/*`

#### Новые таблицы БД
`User`, `RefreshToken`, `AuthEvent`, `MagicToken` (зарезервировано), `TotpSecret`

#### Новые API endpoints
- `GET /api/auth/totp/setup` — генерация QR-кода
- `POST /api/auth/totp/verify` — верификация кода
- `GET /api/auth/totp/status` — статус 2FA
- `POST /api/auth/refresh` — RTR для web
- `POST /api/auth/mobile` — JWT для мобильных (access 2ч + refresh 7д + RTR)

#### Безопасность
- Refresh Token Rotation (RTR) с family-based detection кражи токена
- Аудит-лог всех auth-событий в `AuthEvent`
- nginx rate limiting: 5 req/min на `/api/auth/*`
- bcrypt rounds=12
- Логин регистронезависим: `username` приводится к нижнему регистру и обрезается от пробелов при авторизации (`src/auth.ts`) и при создании пользователя (`/api/admin/parents`)

#### Docker/CI
- `migrator`: `prisma migrate deploy` + `prisma db seed`
- Seed создаёт admin из `ADMIN_USER`/`ADMIN_PASSWORD` если не существует
- `prisma/migrations/20260408000000_init_auth_system/` — первая миграция
- `tsx` добавлен в devDependencies (нужен для seed)

### Docker фиксы (2026-04-03)
- `db push --skip-generate` вместо `migrate deploy`
- `nextjs` зависит от `migrator: condition: service_completed_successfully`
- `npx tsc --noEmit` → 0 ошибок

### Сжатие изображений (2026-03-21)
- `sharp`: WebP + масштабирование при загрузке (галерея, фото учителя, обложки блога)

### Telegram-уведомления (2026-03-21)
- `GET /api/bookings/count`
- Telegram Bot API при создании заявки

### Аутентификация, тесты, безопасность (2026-03-17–18)
- NextAuth.js v5, middleware защита `/bigbos/*`
- XSS-защита блога (`sanitize-html`), серверная валидация бронирований
- 47 unit-тестов (Jest) + 10 E2E-тестов (Playwright)

---

## Backlog

- Управление секциями лендинга из `/bigbos` (UI для `LandingSection`)
- Страница `/pricing` с ценами
- Страница `/about` или `/method` (500+ слов)
- IndexNow key-файл + env
- Android-приложение (React Native + Expo)
- YouTube канал
- Яндекс Бизнес + 2ГИС регистрация
