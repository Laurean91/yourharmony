# YourHarmony — Документация проекта

Детский языковой клуб «Гармония» — сайт с лендингом, системой бронирования, блогом и панелью администратора.

**Продакшн:** https://yourharmony-english.ru  
**API:** https://api.yourharmony-english.ru/docs

---

## Документация по разделам

Документация разбита на специализированные файлы в `docs/sections/`. Загружай только нужный раздел, чтобы экономить контекст.

| Файл | Содержимое |
|------|-----------|
| [`docs/sections/general.md`](docs/sections/general.md) | Стек, структура проекта, схема БД, переменные окружения, API (FastAPI + Next.js), деплой, Docker, CI/CD, запуск локально, Android-план, backlog |
| [`docs/sections/main_page.md`](docs/sections/main_page.md) | Лендинг (секции, ISR, CMS), страница преподавателя `/teacher`, navbar, история изменений публичных страниц |
| [`docs/sections/admin_panel.md`](docs/sections/admin_panel.md) | Административная панель `/bigbos`: дашборд, ученики, расписание, журнал, финансы, блог, библиотека, тёмная тема, мобильная навигация, PDF-отчёты |
| [`docs/sections/parent_cabinet.md`](docs/sections/parent_cabinet.md) | Кабинет родителя `/parent`: профиль ребёнка, звёздная карта, оценки, посещаемость, фото, литература, мобильный нав |
| [`docs/sections/seo.md`](docs/sections/seo.md) | SEO: score 67/100, Schema.org, ISR, нерешённые проблемы по приоритетам (CRITICAL/HIGH/MEDIUM/LOW) |
