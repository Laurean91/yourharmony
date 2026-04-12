# YourHarmony — Языковой клуб

Сайт и панель управления для детского языкового клуба. Публичная часть — лендинг с формой записи и блогом. Административная — полноценная CRM для преподавателя: ученики, расписание, финансы, управление сайтом.

Также включает отдельный **RESTful API** (FastAPI) для интеграций и внешнего доступа к данным.

**Продакшн:** https://yourharmony-english.ru  
**Документация API:** https://api.yourharmony-english.ru/docs

---

## Стек

**Frontend / Web**
- Next.js 16 (App Router, Server Components, Server Actions)
- Prisma + PostgreSQL 16
- Tailwind CSS
- NextAuth.js v5 — аутентификация
- Vercel Blob — хранение изображений
- Resend — email-уведомления
- Recharts — графики

**REST API**
- Python 3.12 + FastAPI 0.115
- SQLAlchemy 2.0 async + asyncpg (та же БД)
- Pydantic v2 — валидация
- JWT (HS256) — access + refresh токены
- pytest + httpx — тесты

**Инфраструктура**
- Docker Compose — оркестрация сервисов
- Nginx — реверс-прокси, SSL termination
- Let's Encrypt — SSL-сертификаты
- GitHub Actions — CI/CD (TypeScript check → деплой по SSH)

---

## Запуск локально

### 1. Переменные окружения

Скопируй `.env.example` в `.env` и заполни значения:

```bash
cp .env.example .env
```

Нужные переменные:

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `AUTH_SECRET` | Секрет для NextAuth (генерируется: `openssl rand -hex 32`) |
| `ADMIN_USER` / `ADMIN_PASSWORD` | Логин и пароль для входа в `/bigbos` |
| `BLOB_READ_WRITE_TOKEN` | Токен Vercel Blob (можно оставить пустым) |
| `RESEND_API_KEY` | API-ключ Resend для email (можно оставить пустым) |
| `NOTIFICATION_EMAIL` | Email для уведомлений о заявках |
| `FASTAPI_SECRET_KEY` | Секрет для JWT в FastAPI (`openssl rand -hex 32`) |

### 2. Запуск Next.js

```bash
npm install
npx prisma db push
npm run dev
# http://localhost:3000
```

### 3. Запуск REST API

```bash
cd api
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" "sqlalchemy[asyncio]" asyncpg \
            pydantic pydantic-settings "python-jose[cryptography]" \
            "passlib[bcrypt]" python-multipart

uvicorn main:app --reload --port 8000
# http://localhost:8000/docs
```

### 4. Тесты API

```bash
cd api
pip install pytest pytest-asyncio httpx anyio aiosqlite pytest-cov
pytest tests/ -v --cov=api
```

---

## Деплой

### Архитектура

```
Internet → Nginx :80/:443 → Next.js  :3000
                          → FastAPI  :8000
              PostgreSQL (внутренняя сеть Docker)
```

### CI/CD

При каждом `git push` в `main` GitHub Actions автоматически:

1. Проверяет TypeScript (`tsc --noEmit`)
2. Подключается по SSH к серверу
3. Подтягивает изменения и пересобирает Docker-образы
4. Запускает Prisma-миграции
5. Проверяет health check Next.js и FastAPI

### Необходимые GitHub Secrets

| Secret | Описание |
|---|---|
| `VPS_HOST` | Адрес сервера |
| `VPS_SSH_KEY` | Приватный SSH-ключ для деплоя |

### Полезные команды на сервере

```bash
# Статус сервисов
docker compose ps

# Логи в реальном времени
docker compose logs -f nextjs

# Перезапуск сервиса
docker compose restart nextjs

# Резервная копия БД
docker compose exec postgres pg_dump -U yourharmony yourharmony > backup_$(date +%Y%m%d).sql

# Обновить SSL-сертификат
sudo certbot renew && docker compose restart nginx
```

---

## API

Проект имеет два независимых API.

### FastAPI — полнофункциональный REST

Базовый путь: `/api/v1/`. Аутентификация: JWT Bearer-токен (`POST /api/v1/auth/login`).

Интерактивная документация доступна на `/docs` (Swagger) и `/redoc`.

**Основные группы эндпоинтов:**

- **Auth:** login, refresh token
- **Blog:** посты и категории (чтение — публично, запись — с токеном)
- **Students:** CRUD учеников (требует токен)
- **Schedule:** CRUD занятий, запись учеников, отметка посещаемости
- **Finance:** статистика доходов, управление ценами, отчёты по периодам и ученикам

### Next.js API — внутренние интеграции

Аутентификация: Bearer-токен из `FASTAPI_SECRET_KEY`. OpenAPI-спецификация: `GET /api/openapi`, UI: `/api-docs`.

| Метод | Путь | Описание |
|---|---|---|
| PATCH | `/api/lessons/{id}` | Редактировать занятие |
| PATCH | `/api/lessons/{id}/move` | Перенести занятие |
| GET | `/api/finance/stats` | Финансовая статистика |
| GET | `/api/finance/report` | Отчёт за период |
| GET/PATCH | `/api/finance/prices` | Цены на занятия |
| GET | `/api/finance/students/{id}/report` | Отчёт по ученику |
| GET | `/api/bookings/count` | Количество новых заявок |

---

## База данных

| Модель | Описание |
|---|---|
| `Booking` | Заявки с лендинга |
| `Student` | Ученики |
| `Lesson` | Занятия (дата, тег, цена) |
| `LessonStudent` | Связь занятий и учеников + посещаемость |
| `Post` | Статьи блога |
| `Category` | Категории блога |
| `TeacherProfile` | Профиль преподавателя |
| `Photo` | Галерея |
| `SiteSettings` | Настройки лендинга и цены |

---

## Административная панель `/bigbos`

- **Дашборд** — графики заявок, занятий, доходов; таблица новых заявок
- **Ученики** — CRUD с фильтрацией, модальное окно со статистикой посещаемости
- **Расписание** — недельный timeline в стиле Google Calendar, drag-and-drop перенос занятий, отметка посещаемости
- **Финансы** — настройка цен, графики доходов, таблица по ученикам
- **Блог** — TipTap-редактор, категории, черновики и публикации
- **Управление сайтом** — редактирование секций лендинга, галерея, профиль преподавателя
