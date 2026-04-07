# YourHarmony — SEO

> Смотри также: `main_page.md` — ISR настройки лендинга, FAQSection JSON-LD  
> Смотри также: `general.md` — Стек (next/image, CSP заголовок в next.config.ts)

---

## SEO Health Score: 67/100 (аудит 2026-03-29)

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

## История изменений — SEO

### SEO-оптимизация (2026-03-21)
- ISR (`revalidate`) вместо `force-dynamic`
- CSP заголовок в `next.config.ts`
- On-demand ревалидация при изменении постов блога

### Обновление Schema (2026-03-22)
- Schema: `foundingDate: 2023`, суббота 12:00–18:00

---

## Backlog SEO

- Страница `/pricing` с ценами
- Страница `/about` или `/method` (500+ слов)
- IndexNow key-файл + env
- Яндекс Бизнес + 2ГИС регистрация
- YouTube канал
