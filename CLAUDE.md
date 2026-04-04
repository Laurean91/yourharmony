# YourHarmony — Документация проекта

Детский языковой клуб «Гармония» — сайт с лендингом, системой бронирования, блогом и панелью администратора.

**Продакшн:** https://yourharmony-english.ru  
**API:** https://api.yourharmony-english.ru/docs

---

## Стек

### Frontend / Web
- **Next.js 16** (App Router, Server Components, Server Actions)
- **Prisma** + **PostgreSQL 16**
- **Tailwind CSS**
- **NextAuth.js v5** — аутентификация по логину/паролю
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

**Индексы:** `Booking(createdAt, status)`, `Post(isPublished, categoryId, createdAt)`, `Lesson(date)`, `LessonStudent(lessonId, studentId)`, `LibraryFile(targetTag)`

---

## Переменные окружения

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `POSTGRES_URL` | Альтернативная строка подключения |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL (Docker Compose) |
| `AUTH_SECRET` | Секрет NextAuth.js (`openssl rand -hex 32`) |
| `ADMIN_USER` | Логин для `/bigbos` |
| `ADMIN_PASSWORD` | Пароль для `/bigbos` |
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

## Административная панель `/bigbos`

- **Дашборд** — аналитика: заявки, занятия, ученики, финансы, мини-календарь
- **Ученики** — CRUD: имя, возраст, телефон родителя, тег, заметки; модальное окно со статистикой; кнопка PDF-отчёта
- **Расписание** — недельный timeline (08:00–23:00), drag-and-drop перенос, редактирование в боковой панели, посещаемость
- **Журнал** — оценки, ДЗ (текст), прикреплённые файлы (до 10 МБ)
- **Финансы** — цены, граф. доходов по месяцам, таблица по ученикам
- **Блог** — CRUD статей, TipTap editor, Vercel Blob обложки
- **Библиотека** — загрузка файлов (PDF, EPUB, Word, MP3, изображения до 50 МБ), категории, фильтрация по группе (Все / Индивидуальное / Групповое)
- **Управление сайтом** — редактирование секций лендинга, галерея

---

## Кабинет родителя `/parent`

- Вход по логину/паролю родителя (отдельно от `/bigbos`)
- **Дашборд** — приветствие, профиль ученика (аватар с кольцом прогресса, уровень, бейджи), быстрые тизеры «Звёздная карта» + «Литература» под профилем
- **Расписание** — будущие уроки с ДЗ (жёлтый блок)
- **Успеваемость** — прошедшие уроки с оценками, ДЗ, прикреплёнными файлами
- **Посещаемость** — статистика, pie chart, список уроков
- **Звёздная карта** — рейтинг учеников на интерактивной галактической карте
- **Литература** — библиотека материалов от учителя (фильтр по категории, скачивание)
- Мобильная оптимизация: bottom nav 6 пунктов (иконки 18px, text 8px), touch targets ≥44px, safe-area-inset

---

## Лендинг (публичный)

Секции (в порядке): `LandingHero` → `BlogPreview` → `LandingTop` → `TeacherSection` → `HowItWorksSection` → `TestimonialsSection` → `CtaSection` → `FAQSection` → `LandingContacts`

- Каждую секцию можно отключить из CMS
- `src/lib/landingTypes.ts` — типы и дефолты всех секций
- `FAQSection` — FAQPage JSON-LD schema
- ISR: главная `revalidate = 3600`, блог `revalidate = 60`, статья `revalidate = 300`

---

## Страница преподавателя `/teacher`

- Блоки: «Образование и квалификация», «Подход к обучению»
- Каждый блок toggleable из `/bigbos/teacher`
- JSON-LD: `Person` + `BreadcrumbList`

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
2. SSH на VPS → `git pull` → `docker compose up -d --build`
3. Prisma-миграции через сервис `migrator` (`db push --skip-generate`)
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

## SEO

**Health Score: 67/100** (аудит 2026-03-29)

### Что сделано
- ISR на всех публичных страницах (не `force-dynamic`)
- Полный набор Schema.org (9 типов: LocalBusiness, Course, Person, BlogPosting, FAQPage, BreadcrumbList, Review, HowTo, WebSite)
- HSTS 2 года с preload, CSP заголовок в `next.config.ts`
- `llms.txt` с FAQ, testimonials, регалиями учителя
- Canonical теги на каждой странице
- `next/image` с `priority`, `sizes`, `fill` везде
- IndexNow архитектура (нужен key-файл)
- Telegram и email уведомления о заявках

### Нерешённые проблемы (приоритет)

**CRITICAL:**
- IndexNow key-файл отсутствует в `public/` → все уведомления Bing/Yandex падают
- Course schema без `offers` → нет Course Rich Results
- JS-счётчик сбрасывается в 0 при гидрации (`LandingClient.tsx` — useCounter)

**HIGH:**
- Нет цен на сайте (родители ищут "английский для детей Москва цена")
- FAQ-ответы 30-50 слов → нужно 100-150 слов
- Person.url: `/#teacher` → `/teacher` в `page.tsx`
- `reviewCount: '6'` → `reviewCount: 6` в `layout.tsx`
- Автор в блоге без CELTA badge и ссылки на `/teacher`

**MEDIUM:**
- Страница `/about` или `/method` (500+ слов о методике)
- Зарегистрировать Яндекс Бизнес + 2ГИС → добавить в `sameAs`
- `HowTo` schema для раздела "Как начать"
- Юридическая информация ИП/ООО в Footer и `/documents`
- `SITE_URL` дублируется в 6 файлах → вынести в `src/lib/config.ts`

**LOW:**
- Удалить `public/og-image.webp` (dead asset)
- `setTimeout` в `BookingModal` без cleanup
- YouTube канал

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

## История изменений

### UX-фиксы, PDF-отчёт на сервере (2026-04-04)

#### Видимость текста в полях ввода
- **Проблема**: текст в `input`, `select`, `textarea` был серым на всех страницах
- **Решение**: глобальные правила в `src/app/globals.css`:
  ```css
  input, select, textarea { color: #111827; }
  input::placeholder, textarea::placeholder { color: #9ca3af; }
  ```
- Применяется ко всей админке `/bigbos` и кабинету родителя `/parent`

#### Кнопка «Записаться» на лендинге
- Убрана белая обводка `ring-2 ring-white/30` с кнопки Hero в `src/components/LandingClient.tsx`

#### Дашборд админки — сетка Финансы + Ученики
- Блоки «Финансы» и «Мои ученики» перенесены в общий `grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5` в `src/app/bigbos/page.tsx`
- На `lg+` — рядом, на мобильном — стопкой
- `DashboardStudentGrid` сужен до `grid-cols-1 sm:grid-cols-2` (карточки в половине ширины)
- Старый отдельный блок учеников удалён

#### PDF-отчёт ученика — полная переработка
- **Проблема 1**: `PrintButton` вызывал `window.print()` → открывался диалог принтера вместо скачивания
- **Проблема 2**: `html2canvas` падал с ошибкой `"Attempting to parse an unsupported color function 'lab'"` — Tailwind v4 использует `oklch()`/`lab()` цвета, несовместимые с `html2canvas`
- **Проблема 3**: Кириллица в PDF отображалась иероглифами — встроенные PDF-шрифты (`Helvetica`) не содержат кириллические глифы

**Решение**: серверная генерация PDF через `@react-pdf/renderer`:
- `src/app/api/admin/students/[id]/report/route.tsx` — новый Route Handler (`GET`)
- Шрифт Roboto с кириллицей зарегистрирован через `Font.register()`:
  ```ts
  Font.register({
    family: 'Roboto',
    fonts: [
      { src: path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf'), fontWeight: 400 },
      { src: path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf'),    fontWeight: 700 },
    ],
  })
  ```
- Шрифты: `public/fonts/Roboto-Regular.ttf` (503 КБ) и `public/fonts/Roboto-Bold.ttf` (502 КБ) — **должны быть в git и задеплоены на VPS**
- `PrintButton.tsx` переписан как `<a href="/api/admin/students/{id}/report" download="...">` — браузер скачивает без диалога
- Ответ: `Content-Type: application/pdf` + `Content-Disposition: attachment; filename*=UTF-8''...`
- Жирный текст требует явного `fontWeight: 700` в `@react-pdf/renderer` (helper: `const bold = { fontFamily: 'Roboto', fontWeight: 700 } as const`)

### Полезная литература — библиотека файлов (2026-04-03)

#### Архитектура
- **Модель**: `LibraryFile` (id, title, description, url, name, size, category, targetTag, createdAt) — новая таблица, не связана с уроками
- **Фильтрация**: `targetTag` = «Все» | «Индивидуальное» | «Групповое» — родитель видит файлы для своего ученика по тегу + общие
- **Хранение**: Vercel Blob, путь `library/{timestamp}-{filename}`, max 50 МБ
- **Категории**: Чтение, Грамматика, Аудио, Словарный запас, Разговорная речь, Другое

#### Для учителя (`/bigbos/library`)
- Загрузка файлов с формой (название, описание, категория, целевая группа)
- Список файлов, сгруппированный по категориям, со статистикой
- Удаление файла (из Blob + БД)
- Пункт «Библиотека» добавлен в `AdminSidebar.tsx` (иконка `Library`)

#### Для родителя (`/parent/library`)
- Карточный grid 2 колонки с пастельными градиентами (детерминированный цвет по хэшу названия)
- Фильтры по категории (горизонтальный scroll)
- Вкладка «Литература / Книги» добавлена в боковой и мобильный нав

#### Дашборд родителя
- Тизер «Звёздная карта» + тизер «Литература» — единый `grid-cols-2` под профилями учеников
- Оба в едином стиле: белые карточки, изумрудный бордер, мягкие иконки-пузыри
- Тизер литературы показывается только если в библиотеке есть файлы

#### Мобильный нав
- 6 пунктов: Главная, Расписание, Оценки, Посещения, Звёзды, Книги
- Иконки уменьшены 20→18px, текст 9→8px для комфортного размещения

### Кабинет родителя — профиль ребёнка, звёздная карта (2026-04-03)

#### Профиль ребёнка на главной (`/parent`)
- **Вариант A — аватар с кольцом прогресса**: SVG-кольцо вокруг аватара (посещаемость), `RADIUS=42 strokeWidth=4` (аватар `inset-[12px]` — точно внутри кольца). Streak-бейдж (серия уроков подряд) снизу-справа
- **Вариант B — уровень + бейджи**: прогресс-бар до следующего уровня (Начинающий→Исследователь→Продвинутый→Мастер), бейджи достижений («Первый урок», «10 уроков», «Серия N», «Отличник», «3 пятёрки подряд»)
- Звёздная миниатюра-тизер: карточка в стиле страницы (белая, изумрудная рамка) — «иллюминатор» с 3 планетами слева, число звёзд ребёнка справа, ссылка на `/parent/stars`

#### Загрузка фото ребёнка
- **Схема**: `Student.photoUrl String?` (новое поле, требует `prisma db push` на VPS)
- **API**: `POST /api/parent/student/[studentId]/photo` — проверяет что ученик принадлежит родителю, сжимает до 400×400 WebP через `sharp`, сохраняет в Vercel Blob `students/{id}/photo-{ts}.webp`. `DELETE` — удаляет из Blob и БД
- **Компонент**: `src/components/StudentPhotoUpload.tsx` — клик на аватар → `<input type="file">`, оверлей с камерой/спиннером, кнопка удаления, тултип ошибки
- Приватность: фото показывается только своему родителю, у чужих учеников — только инициалы

#### Звёздная карта (`/parent/stars`)
- **Страница**: `src/app/parent/stars/page.tsx` — Server Component, `revalidate=300`
- **Компонент**: `src/components/GalaxyMap.tsx` — клиентский, тёмный космос + SVG звёздное поле (80 точек), туманности, планеты 60–120px (размер ∝ звёздам)
- **Формула звёзд**: посещение +10, оценка 5→+15, 4→+10, 3→+5, 2→+2
- **Цвета планет**: 0–49 синий, 50–149 бирюзовый, 150–299 фиолетовый, 300+ золотой
- **Своя планета**: пульсирующее фиолетово-оранжевое свечение + двойное кольцо
- **Приватность**: чужие ученики — только имя (без фамилии, без фото)
- **Навигация**: вкладка «Звёзды» (`Sparkles`) добавлена в sidebar и мобильный bottom nav

#### Мобильные фиксы (320px–390px)
- Bottom nav 5 пунктов: короткие mobile-метки (`Оценки`, `Посещения`), иконки 20px, `text-[9px] truncate`
- Level row: `shrink-0` на бейдже, `truncate` на подсказке, `ml-2 shrink-0` на счётчике, текст `ещё N ур.` вместо `до следующего: N ур.`

### Визуальные улучшения, Docker фиксы, Navbar (2026-04-03)
- **Логотип** (`public/logo.svg`): правильный SVG (два прямоугольника: фиолетовый + оранжевый, белые звёзды)
- **OG-изображение**: заменены `og-image.png/webp` на новые с правильным брендингом
- **Кабинет родителя** — visual polish: dot-grid фон, изумрудный border в сайдбаре, staggered анимация карточек, анимированные орбы на login
- **Navbar**: кнопка-иконка `UserCircle` (градиент фиолетовый→оранжевый) ведёт на `/parent`
- **Docker**: `db push --skip-generate` вместо `migrate deploy`; `nextjs` зависит от `migrator: condition: service_completed_successfully`
- **Suspense** обёртки для `/parent/attendance`, `/parent/grades`, `/parent/schedule` (требование Next.js 16)
- `npx tsc --noEmit` → 0 ошибок

### ДЗ, файлы, PDF-отчёт, UX (2026-03-30 и ранее)
- **Домашние задания**: поле `homework` в `Lesson`, UI учителя (жёлтый блок), отображение у родителя
- **Прикреплённые файлы**: модель `LessonFile`, Vercel Blob (`homework/{lessonId}/filename`), upload/delete API
- **PDF-отчёт**: `/bigbos/students/[id]/report` — Server Component с печатной вёрсткой A4, кнопка в StudentModal
- **Toast / Skeleton / EmptyState** — на всех страницах
- **Мобильная оптимизация** — 320px–390px, touch targets ≥44px

### Страница преподавателя, финансы, drag-and-drop (2026-03-23)
- `/teacher` — блоки «Образование», «Подход», JSON-LD Person
- Редактирование занятий и drag-and-drop в расписании
- FastAPI finance модуль + Next.js finance API
- OpenAPI спецификация обновлена

### UX-улучшения форм (2026-03-23)
- Снято ограничение возраста в форме записи
- Кастомный чекбокс согласия на обработку данных
- Удалён блок «Автор» в блоге
- Удалены неиспользуемые компоненты `PostCard.tsx`, `WelcomeGate.tsx`, `WelcomeOverlay.tsx`

### Обновление текстов (2026-03-22)
- Возраст: «от 4 лет» везде
- Расписание: групповые — суббота 12:00; онлайн — по согласованию
- Убрано ложное обещание «бесплатного пробного занятия»
- Schema: `foundingDate: 2023`, суббота 12:00–18:00

### SEO-оптимизация (2026-03-21)
- ISR (`revalidate`) вместо `force-dynamic`
- CSP заголовок в `next.config.ts`
- On-demand ревалидация при изменении постов блога

### Сжатие изображений (2026-03-21)
- `sharp`: WebP + масштабирование при загрузке (галерея, фото учителя, обложки блога)

### Telegram-уведомления (2026-03-21)
- `GET /api/bookings/count`
- Telegram Bot API при создании заявки

### Логотип + мобильные фиксы (2026-03-20)
- SVG-логотип в `Navbar.tsx` и `Footer.tsx`
- Карусель TestimonialsSection адаптирована для мобильного

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
