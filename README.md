# YourHarmony — Языковой клуб

Сайт и панель управления для языкового клуба. Публичная часть — лендинг с формой записи и блогом. Административная часть — полноценная CRM для преподавателя.

Включает отдельный **RESTful API** (FastAPI) для интеграций и внешнего доступа к данным.

**Продакшн:** https://yourharmony-english.ru
**API:** https://api.yourharmony-english.ru/docs

---

## Стек

### Frontend / Web
- **Next.js 16** (App Router, Server Components, Server Actions)
- **Prisma** + **PostgreSQL 16**
- **Tailwind CSS**
- **NextAuth.js v5** — аутентификация по логину/паролю
- **Vercel Blob** — хранение изображений
- **Resend** — email-уведомления о новых заявках
- **Recharts** — графики аналитики и финансов

### REST API (`api/`)
- **Python 3.12** + **FastAPI 0.115**
- **SQLAlchemy 2.0** async + **asyncpg** — работает с той же БД
- **Pydantic v2** — валидация входящих данных
- **JWT (HS256)** — access (30 мин) + refresh (7 дней) токены
- **pytest** + **httpx** — unit и integration тесты

### Инфраструктура
- **Docker Compose** — оркестрация всех сервисов
- **Nginx** — реверс-прокси, SSL termination
- **Let's Encrypt** — SSL-сертификаты (certbot)
- **VPS Beget** — хостинг (Ubuntu)
- **GitHub Actions** — CI/CD (TypeScript check → деплой по SSH)

---

## Структура проекта

```
yourharmony/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Лендинг (публичный)
│   │   ├── blog/                 # Блог (публичный)
│   │   ├── teacher/              # Страница преподавателя /teacher (публичная)
│   │   ├── api/                  # Next.js Route Handlers
│   │   │   ├── finance/          # GET /api/finance/stats|report|prices, PATCH /api/finance/prices
│   │   │   │   └── students/[id]/report/   # GET /api/finance/students/{id}/report
│   │   │   ├── lessons/[id]/     # PATCH /api/lessons/{id}
│   │   │   │   └── move/         # PATCH /api/lessons/{id}/move
│   │   │   └── openapi/          # GET /api/openapi — OpenAPI 3.0 спецификация
│   │   ├── api-docs/             # ReDoc UI для OpenAPI спецификации
│   │   ├── bigbos/               # Административная панель
│   │   │   ├── layout.tsx        # Лейаут с сайдбаром (адаптивный)
│   │   │   ├── page.tsx          # Дашборд
│   │   │   ├── students/         # Управление учениками
│   │   │   ├── schedule/         # Недельное расписание занятий
│   │   │   ├── finance/          # Финансовая аналитика
│   │   │   ├── blog/             # Управление блогом
│   │   │   ├── teacher/          # Редактирование профиля и страницы преподавателя
│   │   │   └── landing/          # Управление сайтом
│   │   └── actions.ts            # Все server actions
│   ├── components/
│   │   ├── WeekSchedule.tsx      # Недельный timeline 08:00–23:00 (drag-and-drop, edit)
│   │   ├── LessonCalendar.tsx    # Мини-календарь
│   │   ├── StudentCard.tsx       # Карточка ученика
│   │   ├── FinanceChart.tsx      # График доходов (recharts)
│   │   ├── TeacherForm.tsx       # Форма редактирования профиля + страницы преподавателя
│   │   └── ...
│   └── lib/
│       ├── prisma.ts
│       ├── landingTypes.ts
│       └── financeReport.ts      # Утилита построения финансовых отчётов
├── api/                          # REST API (FastAPI)
│   ├── main.py                   # FastAPI app
│   ├── models/                   # SQLAlchemy ORM модели (+ SiteSettings)
│   ├── schemas/                  # Pydantic схемы (+ finance.py)
│   ├── repositories/             # DB-запросы (+ finance.py)
│   ├── services/                 # Бизнес-логика (+ finance.py)
│   ├── controllers/              # Обработка запросов (+ finance.py)
│   ├── routers/                  # HTTP маршруты (+ finance.py)
│   ├── middleware/               # Обработчик ошибок
│   └── tests/                    # Unit + integration тесты
├── scripts/
│   └── gen-og.mjs                # Генерация public/og-image.webp из logo.png (sharp)
├── nginx/
│   ├── nginx.conf                # Основной конфиг Nginx
│   └── conf.d/yourharmony.conf   # Виртуальные хосты + SSL
├── Dockerfile                    # Multi-stage: deps → builder → migrator → runner
├── api/Dockerfile                # FastAPI образ
├── docker-compose.yml            # postgres, migrator, nextjs, fastapi, nginx
└── prisma/
    └── schema.prisma
```

---

## Запуск локально

### Переменные окружения

Создать `.env` в корне проекта:

```env
POSTGRES_PASSWORD=yourpassword
DATABASE_URL=postgresql://yourharmony:yourpassword@localhost:5432/yourharmony?schema=public
POSTGRES_URL=postgresql://yourharmony:yourpassword@localhost:5432/yourharmony
AUTH_SECRET=                    # openssl rand -hex 32
ADMIN_USER=admin
ADMIN_PASSWORD=yourpassword
BLOB_READ_WRITE_TOKEN=          # Vercel Blob токен (или пусто)
RESEND_API_KEY=                 # Resend API ключ (или пусто)
NOTIFICATION_EMAIL=you@example.com
FASTAPI_SECRET_KEY=             # openssl rand -hex 32
```

### Next.js

```bash
npm install
npx prisma db push
npm run dev
# http://localhost:3000
```

### REST API

```bash
cd api
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" "sqlalchemy[asyncio]" asyncpg \
            pydantic pydantic-settings "python-jose[cryptography]" \
            "passlib[bcrypt]" python-multipart

uvicorn main:app --reload --port 8000
# http://localhost:8000/docs
```

### Тесты API

```bash
cd api
pip install pytest pytest-asyncio httpx anyio aiosqlite pytest-cov
pytest tests/ -v --cov=api
```

---

## Деплой (VPS)

### Архитектура

```
Internet → Nginx :80/:443 → Next.js  :3000
                          → FastAPI  :8000
                PostgreSQL :5432 (внутренняя сеть Docker)
```

### CI/CD

При каждом `git push` в `main` GitHub Actions автоматически:
1. Запускает TypeScript-проверку (`tsc --noEmit`)
2. Подключается по SSH к VPS
3. `git pull origin main`
4. `docker compose up -d --build`
5. Запускает Prisma-миграции через сервис `migrator`
6. Проверяет health check Next.js (:3000) и FastAPI (:8000/api/v1/health)

### Первичная настройка VPS

```bash
# 1. Установить Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy && newgrp docker

# 2. Получить SSL (после настройки DNS A-записей)
sudo certbot certonly --standalone \
  -d yourharmony-english.ru \
  -d www.yourharmony-english.ru \
  -d api.yourharmony-english.ru

# 3. Клонировать репозиторий
git clone git@github.com:Laurean91/yourharmony.git /home/deploy/yourharmony
cd /home/deploy/yourharmony

# 4. Создать .env с продакшн значениями
nano .env

# 5. Первый запуск
docker compose up -d --build
```

### GitHub Secrets

| Secret | Описание |
|--------|----------|
| `VPS_HOST` | IP адрес VPS |
| `VPS_SSH_KEY` | Приватный SSH ключ для подключения к VPS |

### Полезные команды на VPS

```bash
# Статус сервисов
docker compose ps

# Логи в реальном времени
docker compose logs -f
docker compose logs -f nextjs

# Перезапуск отдельного сервиса
docker compose restart nextjs

# Резервная копия БД
docker compose exec postgres pg_dump -U yourharmony yourharmony > backup_$(date +%Y%m%d).sql

# Обновить SSL сертификат вручную
sudo certbot renew && docker compose restart nginx
```

---

## API

Проект имеет два независимых API.

### FastAPI (`api/`) — полнофункциональный REST

Аутентификация: **JWT** (`POST /api/v1/auth/login`). Все защищённые маршруты требуют `Authorization: Bearer <token>`.

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
| GET | `/api/v1/health` | Health check | — |
| POST | `/api/v1/auth/login` | Получить JWT токены | — |
| POST | `/api/v1/auth/refresh` | Обновить access token | — |
| GET | `/api/v1/blog/posts` | Список постов (пагинация) | — |
| GET | `/api/v1/blog/posts/{id}` | Пост по ID | — |
| GET | `/api/v1/blog/posts/slug/{slug}` | Пост по slug | — |
| POST | `/api/v1/blog/posts` | Создать пост | ✓ |
| PUT/PATCH | `/api/v1/blog/posts/{id}` | Обновить пост | ✓ |
| DELETE | `/api/v1/blog/posts/{id}` | Удалить пост | ✓ |
| GET | `/api/v1/blog/categories` | Список категорий | — |
| POST | `/api/v1/blog/categories` | Создать категорию | ✓ |
| GET | `/api/v1/students` | Список учеников | ✓ |
| GET | `/api/v1/students/{id}` | Ученик по ID | ✓ |
| POST | `/api/v1/students` | Создать ученика | ✓ |
| PUT | `/api/v1/students/{id}` | Обновить ученика | ✓ |
| DELETE | `/api/v1/students/{id}` | Удалить ученика | ✓ |
| GET | `/api/v1/schedule/lessons` | Список занятий (фильтры: дата, тег) | ✓ |
| GET | `/api/v1/schedule/lessons/{id}` | Занятие по ID | ✓ |
| POST | `/api/v1/schedule/lessons` | Создать занятие | ✓ |
| PUT | `/api/v1/schedule/lessons/{id}` | Обновить занятие | ✓ |
| DELETE | `/api/v1/schedule/lessons/{id}` | Удалить занятие | ✓ |
| POST | `/api/v1/schedule/lessons/{id}/enroll` | Записать ученика | ✓ |
| PATCH | `/api/v1/schedule/lessons/{id}/enrollments/{studentId}` | Отметить посещаемость | ✓ |
| DELETE | `/api/v1/schedule/lessons/{id}/enrollments/{studentId}` | Отменить запись | ✓ |
| GET | `/api/v1/finance/stats` | Статистика: 12 мес + топ учеников | ✓ |
| GET | `/api/v1/finance/prices` | Текущие цены на занятия | ✓ |
| PATCH | `/api/v1/finance/prices` | Обновить цены | ✓ |
| GET | `/api/v1/finance/report` | Отчёт за период (`?period=month\|3months\|6months\|year\|all\|today\|week` или `?from=&to=&groupBy=day\|month`) | ✓ |
| GET | `/api/v1/finance/students/{id}/report` | Отчёт по ученику за период | ✓ |

### Next.js API (`src/app/api/`) — интеграции

Аутентификация: **Bearer-токен** из `FASTAPI_SECRET_KEY`. OpenAPI-спецификация: `GET /api/openapi`, UI: `/api-docs`.

| Метод | Путь | Описание |
|-------|------|----------|
| PATCH | `/api/lessons/{id}` | Редактировать занятие (поля + список учеников) |
| PATCH | `/api/lessons/{id}/move` | Перенести занятие на другую дату/время |
| GET | `/api/finance/stats` | Финансовая статистика (12 мес) |
| GET | `/api/finance/report` | Отчёт за период (`?period=`, `?from=&to=`, `?groupBy=`) |
| GET | `/api/finance/prices` | Текущие цены |
| PATCH | `/api/finance/prices` | Обновить цены |
| GET | `/api/finance/students/{id}/report` | Отчёт по конкретному ученику |
| GET | `/api/bookings/count` | Кол-во новых заявок (без авторизации) |

---

## База данных (Prisma)

| Модель | Описание |
|--------|----------|
| `Booking` | Заявки с лендинга |
| `Student` | Ученики |
| `Lesson` | Занятия (дата, тег, цена) |
| `LessonStudent` | Связь занятий и учеников + посещаемость (`attended`) |
| `Post` | Статьи блога |
| `Category` | Категории блога |
| `TeacherProfile` | Профиль преподавателя (singleton) |
| `Photo` | Галерея |
| `SiteSettings` | Настройки лендинга + цены занятий |

---

## Административная панель `/bigbos`

### Дашборд
- Аналитика: график заявок за 6 месяцев, занятий за неделю/месяц, новых учеников
- Мини-блок финансов: доход текущего месяца с разбивкой по типам
- Мини-календарь занятий в режиме просмотра
- Таблица новых заявок с датой, изменением статуса и удалением

### Мои ученики `/bigbos/students`
- CRUD учеников: имя, возраст, телефон родителя, тег, заметки
- Фильтрация по тегу
- Модальное окно с полной информацией и статистикой посещаемости

### Расписание `/bigbos/schedule`
- Недельный timeline в стиле Google Calendar (08:00–23:00)
- 7 колонок (Пн–Вс), навигация по неделям
- Цветные блоки: фиолетовый = индивидуальное, оранжевый = групповое
- **Редактирование занятия** из боковой панели (дата, время, тип, тема, ученики, заметки)
- **Drag-and-drop** перенос занятий: тащить блок на другой слот, подсветка целевого слота
- Посещаемость: карточки-кнопки с аватаром (инициалы), счётчик, спиннер при сохранении
- Мобильная версия: горизонтальный скролл + панель деталей снизу

### Финансы `/bigbos/finance`
- Настройка стоимости занятий (индивидуальное / групповое)
- График доходов по месяцам с разбивкой инд./групп. (переключатель 3/6/12 мес)
- Таблица доходов по ученикам на основе посещаемости

### Блог `/bigbos/blog`
- Создание и редактирование статей (TipTap редактор)
- Управление категориями, публикация / черновик

### Управление сайтом `/bigbos/landing`
- Редактирование секций лендинга (Hero, CTA, Форматы, Отзывы, FAQ и др.)
- Профиль преподавателя, галерея фотографий

### Преподаватель `/bigbos/teacher`
- Редактирование профиля: имя, bio, фото, badges
- Редактирование блоков страницы `/teacher`: «Образование и квалификация», «Подход к обучению»
- Переключатели показа/скрытия каждого блока

---

## Публичная страница преподавателя `/teacher`

- Герой: фото, имя, bio, badges
- Блок «Образование и квалификация» (карточки с иконкой, заголовком, описанием)
- Блок «Подход к обучению» (карточки с заголовком и текстом)
- Каждый блок можно скрыть из админки
- JSON-LD: `Person` + `BreadcrumbList` схемы
- Ссылка «Подробнее →» на главной странице в секции `TeacherSection`

---

## История изменений

### Страница преподавателя + редактирование, финансы API, drag-and-drop (2026-03-23)

- **Публичная страница `/teacher`** — профиль преподавателя с блоками «Образование» и «Подход», JSON-LD Person schema
- **Редактирование страницы `/teacher` из админки** — блоки сохраняются в `SiteSettings`, toggle показа/скрытия
- **Редактирование занятий** в расписании: форма в боковой панели с предзаполненными данными
- **Drag-and-drop перенос занятий**: блок занятия перетаскивается на другой слот, оптимистичное обновление UI
- **Посещаемость**: переработан UI — карточки-кнопки с инициалами, счётчик, спиннер
- **Фиксы финансов**: исправлен тег группового занятия (`"Группа"` vs `"Групповое"`), числовое сравнение месяцев вместо locale-строк
- **FastAPI finance модуль** (`api/routers/finance.py`): stats, prices, report с группировкой по дням/месяцам, отчёт по ученику
- **Next.js finance API** (`src/app/api/finance/`): те же эндпоинты через Bearer-токен, `src/lib/financeReport.ts` как общая утилита
- **Next.js lessons API** (`PATCH /api/lessons/{id}`, `PATCH /api/lessons/{id}/move`) — редактирование и перенос занятий
- **OpenAPI спецификация** обновлена: схемы `Lesson`, `FinanceReport`, `StudentRevenue` и все новые пути; ReDoc UI на `/api-docs`
- **Очистка репозитория**: удалены `.next_trash_*/`, `.swc/`, `tsconfig.tsbuildinfo`, `playwright-report/`, `test-results/`, `screenshots/`; добавлен `.swc/` в `.gitignore`
