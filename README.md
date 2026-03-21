# Гармония — Языковой клуб

Сайт и панель управления для языкового клуба. Публичная часть — лендинг с формой записи и блогом. Административная часть — полноценная CRM для преподавателя.

Включает отдельный **RESTful API** (FastAPI) для интеграций и внешнего доступа к данным.

---

## Стек

### Frontend / Web
- **Next.js 16** (App Router, Server Components, Server Actions)
- **Prisma** + **PostgreSQL** (Prisma Accelerate)
- **Tailwind CSS**
- **NextAuth.js v5** — аутентификация по логину/паролю
- **Vercel Blob** — хранение изображений
- **Resend** — email-уведомления о новых заявках
- **Recharts** — графики аналитики и финансов

### REST API (`api/`)
- **Python 3.13** + **FastAPI 0.115**
- **SQLAlchemy 2.0** async + **asyncpg** — работает с той же БД
- **Pydantic v2** — валидация входящих данных
- **JWT (HS256)** — access (30 мин) + refresh (7 дней) токены
- **pytest** + **httpx** — unit и integration тесты

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
│   │   │   ├── landing/          # Управление сайтом
│   │   │   └── login/            # Страница входа
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
└── prisma/
    └── schema.prisma
```

---

## REST API

Самостоятельный сервис на FastAPI, использующий ту же PostgreSQL базу данных. Предоставляет полный RESTful доступ ко всем модулям.

### Модули и эндпоинты

| Метод | Путь | Описание | Auth |
|-------|------|----------|------|
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

### Запуск API

```bash
cd api
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" "sqlalchemy[asyncio]" asyncpg \
            pydantic pydantic-settings "python-jose[cryptography]" \
            "passlib[bcrypt]" python-multipart

# Добавить в .env:
# FASTAPI_SECRET_KEY=<openssl rand -hex 32>

PYTHONPATH=.. uvicorn api.main:app --reload --port 8000
```

Документация: **http://localhost:8000/docs**

### Тесты API

```bash
cd api
pip install pytest pytest-asyncio httpx anyio aiosqlite pytest-cov

PYTHONPATH=.. pytest tests/ -v --cov=api
```

---

## Административная панель `/bigbos`

### Дашборд
- Аналитика: график заявок за 6 месяцев, занятий за неделю/месяц, новых учеников
- Мини-блок финансов: доход текущего месяца с разбивкой по типам
- Мини-календарь занятий в режиме просмотра
- Таблица новых заявок с датой, изменением статуса и удалением
- Краткий список учеников

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

## Запуск локально

### Next.js

```bash
npm install
```

Создать `.env`:
```env
DATABASE_URL=...
AUTH_SECRET=...
ADMIN_USER=...
ADMIN_PASSWORD=...
BLOB_READ_WRITE_TOKEN=...
RESEND_API_KEY=...
NOTIFICATION_EMAIL=...
FASTAPI_SECRET_KEY=...
```

```bash
npx prisma db push
npm run dev
```

Открыть [http://localhost:3000](http://localhost:3000)

### REST API

```bash
cd api
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi "uvicorn[standard]" "sqlalchemy[asyncio]" asyncpg \
            pydantic pydantic-settings "python-jose[cryptography]" \
            "passlib[bcrypt]" python-multipart
PYTHONPATH=.. uvicorn api.main:app --reload --port 8000
```

Открыть [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Деплой

Проект задеплоен на [Vercel](https://vercel.com). При пуше в `main` деплой происходит автоматически.
