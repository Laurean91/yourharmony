# YourHarmony — Административная панель `/bigbos`

> Смотри также: `parent_cabinet.md` — библиотека для родителя, связанная с `/bigbos/library`  
> Смотри также: `main_page.md` — управление лендингом из `/bigbos/landing`  
> Смотри также: `seo.md` — управление SEO-контентом из `/bigbos`

---

## Разделы административной панели

- **Дашборд** — аналитика: заявки, занятия, ученики, финансы, мини-календарь
- **Ученики** — CRUD: имя, возраст, телефон родителя, тег, заметки; модальное окно со статистикой; кнопка PDF-отчёта
- **Расписание** — недельный timeline (08:00–23:00), drag-and-drop перенос, редактирование в боковой панели, посещаемость
- **Журнал** — оценки, ДЗ (текст), прикреплённые файлы (до 10 МБ)
- **Финансы** — цены, граф. доходов по месяцам, таблица по ученикам
- **Блог** — CRUD статей, TipTap editor, Vercel Blob обложки
- **Библиотека** — загрузка файлов (PDF, EPUB, Word, MP3, изображения до 50 МБ), категории, фильтрация по группе (Все / Индивидуальное / Групповое)
- **Управление сайтом** — редактирование секций лендинга, галерея
- **Родители** (`/bigbos/parents`) — управление аккаунтами родителей: создание (логин + пароль + имя + телефон + email), смена пароля, привязка учеников, удаление

---

## История изменений — Фикс мобильного нижнего меню (2026-04-08)

### `AdminMobileBottomNav` — `fixed` позиционирование

**Проблема:** нижнее меню уходило при скролле на некоторых браузерах (iOS Safari).  
**Причина:** `position: fixed` внутри flex-контейнера (`flex flex-col`) может вести себя непредсказуемо — браузер трактует его как flex-элемент, а не как viewport-fixed.  
**Решение:** `<AdminMobileBottomNav />` вынесен за пределы основного `<div>` в `src/app/bigbos/layout.tsx` — теперь рендерится в корне `<>` фрагмента, независимо от flex-контекста.

```tsx
// было
<div className="min-h-screen flex flex-col">
  ...
  <AdminMobileBottomNav />
</div>

// стало
<>
  <div className="min-h-screen flex flex-col">
    ...
  </div>
  <AdminMobileBottomNav />
</>
```

---

## История изменений — Управление родителями + смена пароля (2026-04-08)

### `/bigbos/parents` — новые возможности
- **Кнопка «Сменить пароль»** (иконка `KeyRound`) рядом с каждым родителем
- Открывает модальное окно → учитель вводит новый пароль → `PATCH /api/admin/parents/[id]`
- Новый пароль хэшируется bcrypt на сервере, в UI не сохраняется
- API `PATCH /api/admin/parents/[id]` уже поддерживал `{ password }` — добавлен только UI

### Авторизация для родителей
- Вход по логину/паролю (создаётся учителем)
- `/parent/login` — стандартная форма логин/пароль (без magic link)
- Логин для родителя учитель задаёт при создании аккаунта в `/bigbos/parents`

---

## История изменений — Тёмная тема + мобильная навигация (2026-04-07)

### Тёмная тема на всех страницах админки

Все страницы `/bigbos/*` и компоненты теперь поддерживают тёмную тему через CSS-переменные `[data-admin-theme="dark/light"]`.

**Новые CSS-переменные** (`src/app/globals.css`):
```css
--adm-text-secondary   /* вторичный текст */
--adm-bg-input         /* фон инпутов */
--adm-border-input     /* граница инпутов */
--adm-bg-hover         /* ховер-фон */
--adm-bg-zebra         /* чётные строки таблиц */
--adm-bg-thead         /* заголовок таблицы */
--adm-border-sep       /* разделители */
```
Также добавлены глобальные переопределения для `input/select/textarea` в тёмной теме.

**Правило замен** (применено везде):
- `bg-white` / `background: '#fff'` → `var(--adm-bg-card)`
- `text-gray-800/900` → `var(--adm-text-primary)`
- `text-gray-400/500/600` → `var(--adm-text-muted)`
- `border-gray-100/200` → `var(--adm-border-card)`
- `bg-gray-50` → `var(--adm-bg-input)`

**Исправленные страницы** (серверные компоненты — только CSS-переменные через `style={{}}`):
- `finance/page.tsx`, `students/page.tsx`, `blog/page.tsx`, `blog/new/page.tsx`, `blog/[id]/edit/page.tsx`, `landing/page.tsx`, `teacher/page.tsx`

**Исправленные страницы** (клиентские — `useAdminTheme()` + CSS-переменные):
- `parents/page.tsx`, `journal/page.tsx`, `library/page.tsx`

**Исправленные компоненты**:
- `StudentCard.tsx`, `FinanceChart.tsx`, `PriceSettingsForm.tsx`, `AddStudentModal.tsx`, `StudentModal.tsx`, `DeletePostButton.tsx`, `TeacherForm.tsx`, `LandingEditor.tsx`

**Важно для серверных компонентов**: нельзя использовать `onMouseEnter`/`onMouseLeave` — вместо этого используются Tailwind-классы `hover:opacity-*` или CSS-переменные.

### Мобильная навигация — новые компоненты

**`AdminMobileTopBar.tsx`** (новый) — мобильная шапка `md:hidden`:
- Sticky, `z-40`, blur-фон
- Слева: логотип SVG + текст «Гармония» (цвет через CSS-переменные, не градиент — градиентный clip некорректно рендерится на мобильных)
- Справа: кнопка переключения темы ☀️/🌙

**`AdminMobileBottomNav.tsx`** — обновлён:
- Вкладка «Финансы» заменена на «Ещё» (`MoreHorizontal`)
- Bottom nav: `[Главная] [Ученики] [FAB] [Расписание] [Ещё]`
- «Ещё» открывает slide-up drawer с сеткой 3×2: Финансы, Журнал, Родители, Блог, Библиотека, Сайт
- Drawer: overlay с backdrop, glass-фон, закрытие по тапу

**`layout.tsx`** — добавлен `<AdminMobileTopBar />` перед `<AdminNav />`. `<main>` без лишнего `paddingTop` — sticky-элемент уже занимает место в потоке.

---

## История изменений — UX-фиксы, PDF-отчёт (2026-04-04)

### Видимость текста в полях ввода
- **Проблема**: текст в `input`, `select`, `textarea` был серым на всех страницах
- **Решение**: глобальные правила в `src/app/globals.css`:
  ```css
  input, select, textarea { color: #111827; }
  input::placeholder, textarea::placeholder { color: #9ca3af; }
  ```
- Применяется ко всей админке `/bigbos` и кабинету родителя `/parent`

### Дашборд админки — сетка Финансы + Ученики
- Блоки «Финансы» и «Мои ученики» перенесены в общий `grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5` в `src/app/bigbos/page.tsx`
- На `lg+` — рядом, на мобильном — стопкой
- `DashboardStudentGrid` сужен до `grid-cols-1 sm:grid-cols-2` (карточки в половине ширины)
- Старый отдельный блок учеников удалён

### PDF-отчёт ученика — полная переработка
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

---

## История изменений — Библиотека для учителя (2026-04-03)

### Архитектура
- **Модель**: `LibraryFile` (id, title, description, url, name, size, category, targetTag, createdAt) — новая таблица, не связана с уроками
- **Фильтрация**: `targetTag` = «Все» | «Индивидуальное» | «Групповое» — родитель видит файлы для своего ученика по тегу + общие
- **Хранение**: Vercel Blob, путь `library/{timestamp}-{filename}`, max 50 МБ
- **Категории**: Чтение, Грамматика, Аудио, Словарный запас, Разговорная речь, Другое

### Для учителя (`/bigbos/library`)
- Загрузка файлов с формой (название, описание, категория, целевая группа)
- Список файлов, сгруппированный по категориям, со статистикой
- Удаление файла (из Blob + БД)
- Пункт «Библиотека» добавлен в `AdminSidebar.tsx` (иконка `Library`)

---

## История изменений — ДЗ, файлы, расписание (2026-03-30 и ранее)

### ДЗ, файлы, PDF-отчёт, UX (2026-03-30)
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
