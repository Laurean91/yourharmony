# YourHarmony — SEO

> Смотри также: `main_page.md` — кэширование лендинга, FAQSection JSON-LD  
> Смотри также: `general.md` — Стек (next/image, CSP заголовок в next.config.ts)

---

## SEO Health Score: 67/100 (аудит 2026-03-29)

### Что сделано
- Публичные страницы рендерятся по запросу (`force-dynamic`), чтение из базы кэшируется по тегам — см. «Кэширование публичных страниц» ниже
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

## История изменений — SEO

### Отказ от ISR в пользу кэша данных (2026-08-29)
- Публичные страницы переведены на `force-dynamic`, чтение из базы обёрнуто в `unstable_cache` с тегами
- Причина: ISR-снимок делался при сборке образа, где база недоступна, и на прод уезжали дефолты из `landingTypes.ts` вместо контента из админки

### SEO-оптимизация (2026-03-21)
- ISR (`revalidate`) вместо `force-dynamic` *(отменено 2026-08-29, см. выше)*
- CSP заголовок в `next.config.ts`
- On-demand ревалидация при изменении постов блога

### Обновление Schema (2026-03-22)
- Schema: `foundingDate: 2023`, суббота 12:00–18:00

---

## Кэширование публичных страниц

Публичные страницы — `/`, `/teacher`, `/blog`, `/blog/[slug]` — объявлены как
`export const dynamic = 'force-dynamic'` и рендерятся на каждый запрос.

**Почему не ISR.** Статический снимок создавался на этапе `docker compose build`,
где базы данных нет: `.env` исключён через `.dockerignore`, а `DATABASE_URL`
задаётся только в `docker-compose.yml` при запуске контейнера. Читатели
(`getSectionSettings`, `getTeacherProfile`, `getPosts`) ловили ошибку подключения
и возвращали дефолты, поэтому в образ попадал HTML с дефолтным контентом. После
деплоя посетители видели его, пока ISR не перегенерирует страницу — на лендинге
это до часа. Со стороны выглядело как «правки из админки пропали».

**Чем заменено.** Запросы к базе обёрнуты в `unstable_cache` с тегами
(`site-settings`, `teacher-profile`, `posts`) в `src/app/actions.ts`, поэтому
рендер по запросу не добавляет нагрузки на базу. Серверные экшены админки
вызывают `updateTag` — Next 16 даёт этому семантику read-your-own-writes, правка
видна сразу после сохранения.

**Что важно помнить.** Изменения, внесённые в базу мимо админки (например,
напрямую через `psql`), кэш не увидит — сбрасывается он только через `updateTag`
или перезапуск контейнера. Читатели теперь пишут ошибку в лог, а не подставляют
дефолты молча: если на странице внезапно появился дефолтный текст, смотри
`docker compose logs nextjs`.

---

## Backlog SEO

- Страница `/pricing` с ценами
- Страница `/about` или `/method` (500+ слов)
- IndexNow key-файл + env
- Яндекс Бизнес + 2ГИС регистрация
- YouTube канал
