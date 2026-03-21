# YourHarmony — Языковой клуб

Сайт и панель управления для языкового клуба. Публичная часть — лендинг с формой записи и блогом. Административная часть — полноценная CRM для преподавателя.

Включает отдельный **RESTful API** (FastAPI) для интеграций и внешнего доступа к данным.

**Продакшн:** https://yourharmony-english.ru
**API:** https://api.yourharmony-english.ru/docs

---

## Стек

### Frontend / Web
- **Next.js 15** (App Router, Server Components, Server Actions)
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
│   │   ├── bigbos/               # Административная панель
│   │   │   ├── layout.tsx        # Лейаут с сайдбаром (адаптивный)
│   │   │   ├── page.tsx          # Дашборд
│   │   │   ├── students/         # Управление учениками
│   │   │   ├── schedule/         # Недельное расписание занятий
│   │   │   ├── finance/          # Финансовая аналитика
│   │   │   ├── blog/             # Управление блогом
│   │   │   └── landing/          # Управление сайтом
│   │   └── actions.ts            # Все server actions
│   ├── components/
│   │   ├── WeekSchedule.tsx      # Недельный timeline 08:00–23:00
│   │   ├── LessonCalendar.tsx    # Мини-календарь
│   │   ├── StudentCard.tsx       # Карточка ученика
│   │   ├── FinanceChart.tsx      # График доходов (recharts)
│   │   └── ...
│   └── lib/
│       ├── prisma.ts
│       └── landingTypes.ts
├── api/                          # REST API (FastAPI)
│   ├── main.py                   # FastAPI app
│   ├── models/                   # SQLAlchemy ORM модели
│   ├── schemas/                  # Pydantic схемы
│   ├── repositories/             # DB-запросы
│   ├── services/                 # Бизнес-логика
│   ├── controllers/              # Обработка запросов
│   ├── routers/                  # HTTP маршруты
│   ├── middleware/               # Обработчик ошибок
│   └── tests/                    # Unit + integration тесты
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

## REST API — Эндпоинты

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
- Боковая панель посещаемости с чекбоксами
- Мобильная версия: горизонтальный скролл + панель деталей снизу

### Финансы `/bigbos/finance`
- Настройка стоимости занятий
- График доходов по месяцам (переключатель 3/6/12 мес)
- Таблица доходов по ученикам на основе посещаемости

### Блог `/bigbos/blog`
- Создание и редактирование статей (TipTap редактор)
- Управление категориями, публикация / черновик

### Управление сайтом `/bigbos/landing`
- Редактирование секций лендинга (Hero, CTA, Форматы, Отзывы, FAQ и др.)
- Профиль преподавателя, галерея фотографий
