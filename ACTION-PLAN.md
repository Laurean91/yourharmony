# План действий по SEO — yourharmony-english.ru
**Составлен:** 2026-03-21
**На основе:** Полного SEO-аудита (Технический, Контент, Схема, Карта сайта, Производительность, GEO)

---

## КРИТИЧНО — Исправить немедленно (блокирует индексацию)

### К1. Исправить продакшн-домен во всём проекте
**Эффект: одним деплоем исправляет canonical-теги, карту сайта, схему, robots.txt, llms.txt**

Константа `SITE_URL = 'https://yourharmony.vercel.app'` жёстко прописана в 6 файлах.
Пока Google индексирует yourharmony-english.ru, все сигналы canonical указывают на Vercel-URL.

**Шаг 1.** Добавить переменную окружения в Vercel Dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_SITE_URL = https://yourharmony-english.ru
```

**Шаг 2.** Создать `src/lib/site.ts`:
```ts
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourharmony-english.ru'
```

**Шаг 3.** Заменить `const SITE_URL = 'https://yourharmony.vercel.app'` в:
- src/app/layout.tsx (строка 21)
- src/app/page.tsx (строка 10)
- src/app/blog/page.tsx (строка 12)
- src/app/sitemap.ts (строка 6)
- src/app/robots.ts (строка 21) — URL карты сайта в возвращаемом значении

**Шаг 4.** В `src/app/blog/[slug]/page.tsx` заменить все жёстко прописанные строки домена в строках 25, 60, 70–79, 87–90 на импортированный SITE_URL.

**Шаг 5.** Обновить `public/llms.txt` — заменить yourharmony.vercel.app на yourharmony-english.ru в строках 9, 41, 47, 51, 53.

**Шаг 6.** После деплоя закрыть yourharmony.vercel.app от сканирования (добавить защиту паролем или заголовок noindex для Vercel preview-домена в настройках проекта).

---

## ВЫСОКИЙ приоритет — Исправить в течение недели

### В1. Добавить "Москва" в заголовок страницы
**Файл:** src/app/layout.tsx, строка 25
```ts
// Было
title: {
  default: 'Клуб «Гармония» | Английский для детей',
  template: '%s | Клуб «Гармония»',
},
// Стало
title: {
  default: 'Английский для детей в Москве | Клуб «Гармония»',
  template: '%s | Клуб «Гармония»',
},
```

### В2. Расширить мета-описание — использовать доступные символы
**Файл:** src/app/layout.tsx, строка 28
```ts
// Было (105 символов)
description: 'Детский языковой клуб «Гармония» — английский для детей от 6 лет. Учим язык играючи, свободно и в радость!',
// Стало (~155 символов)
description: 'Английский для детей от 6 лет в Москве. Группы до 8 детей, педагог с CELTA и IELTS 8.0. Запишитесь на бесплатное пробное занятие!',
```

### В3. Создать OG-изображение 1200×630
Создать `/public/og-image.png` размером 1200×630 пикселей (можно простую брендированную графику).
Обновить в `layout.tsx` (строка 35) и `blog/page.tsx` (строка 35):
```ts
images: [{ url: `${SITE_URL}/og-image.png`, width: 1200, height: 630, alt: 'Клуб «Гармония»' }],
```

### В4. Добавить "Блог" в навбар и футер
**Файл:** src/components/Navbar.tsx — добавить в массив пунктов навигации:
```ts
{ label: 'Блог', href: '/blog', isRoute: true }
```
**Файл:** src/components/Footer.tsx — добавить ссылку в секцию навигации.

### В5. Заменить force-dynamic на ISR на всех публичных страницах
**Файлы:** src/app/page.tsx (стр.8), src/app/blog/page.tsx (стр.10), src/app/blog/[slug]/page.tsx (стр.16)
```ts
// Убрать:
export const dynamic = 'force-dynamic'
// Добавить на page.tsx и blog/page.tsx:
export const revalidate = 60
// На blog/[slug]/page.tsx:
export const revalidate = 300
```
Затем добавить ревалидацию по запросу в серверных действиях (src/app/actions.ts):
```ts
import { revalidatePath } from 'next/cache'
// После публикации/обновления поста:
revalidatePath('/blog')
revalidatePath(`/blog/${slug}`)
revalidatePath('/') // для BlogPreview
```

### В6. Добавить заголовок Content Security Policy
**Файл:** next.config.ts — добавить в блок заголовков `/(.*)`
```ts
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
    "connect-src 'self'",
    "frame-ancestors 'self'",
  ].join('; '),
}
```

### В7. Исправить запасное значение lastModified в карте сайта
**Файл:** src/app/sitemap.ts
Заменить `new Date()` на статическую дату:
```ts
lastModified: posts[0]?.updatedAt ?? new Date('2024-01-01'),
```
Также заменить `export const dynamic = 'force-dynamic'` на `export const revalidate = 3600`.

---

## СРЕДНИЙ приоритет — Исправить в течение месяца

### С1. Добавить основное ключевое слово в H1
В админке (или напрямую в DEFAULT_HERO в actions.ts) обновить заголовок hero с "Языковой клуб «Гармония»" на "Английский для детей в Москве — клуб «Гармония»".
Поскольку заголовок управляется из БД, добавить подсказку администратору: "Заголовок должен содержать ключевое слово 'английский для детей'."

### С2. Добавить openingHoursSpecification в схему LocalBusiness
**Файл:** src/app/layout.tsx — добавить внутрь localBusinessSchema:
```ts
openingHoursSpecification: [
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '10:00',
    closes: '20:00',
  },
  {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Saturday'],
    opens: '10:00',
    closes: '15:00',
  },
],
```

### С3. Добавить отдельные сущности Review в схему LocalBusiness
Добавить минимум 3–5 объектов Review из DEFAULT_TESTIMONIALS для получения звёздочек в выдаче:
```ts
review: [
  {
    '@type': 'Review',
    author: { '@type': 'Person', name: 'Мария К.' },
    reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
    reviewBody: 'Дочь занимается уже год...',
  },
  // ...
],
```

### С4. Добавить расписание и цены в llms.txt
**Файл:** public/llms.txt — добавить новую секцию:
```markdown
## Расписание и стоимость

Занятия проходят по будням и субботам с 10:00 до 20:00.
Стоимость уточняется при записи — доступны разные форматы.
Первое занятие бесплатно.
```

### С5. Добавить FAQ и отзывы в llms.txt
Добавить в public/llms.txt секции с 8 вопросами/ответами FAQ и краткими версиями 6 отзывов родителей. Это самый цитируемый контент сайта для ИИ-поиска.

### С6. Добавить ClaudeBot в список приветствуемых ботов в llms.txt
**Файл:** public/llms.txt, строка 58
Добавить "ClaudeBot" в список рядом с GPTBot и PerplexityBot.

### С7. Добавить Яндекс.Карты, 2ГИС, VK в sameAs
**Файл:** src/app/layout.tsx
После создания профилей на этих платформах добавить их в массив sameAs:
```ts
sameAs: [
  'https://t.me/harmonyEnglish',
  'https://yandex.ru/maps/...',  // URL на Яндекс.Картах
  'https://2gis.ru/...',         // URL в 2ГИС
  'https://vk.com/...',          // Группа ВКонтакте
],
```

### С8. Сделать номер телефона кликабельным на мобильных
**Файл:** src/components/LandingClient.tsx — в секции отображения контактов обернуть номер:
```tsx
<a href="tel:+79851508300" className="hover:underline">
  +7 (985) 150-83-00
</a>
```

### С9. Добавить год основания в видимый контент
Счётчики на главной уже есть. Убедиться, что один из них показывает "2020" (год основания) или добавить "Работаем с 2020 года" в секцию преподавателя или в подзаголовок hero.
Также добавить в схему LocalBusiness в layout.tsx:
```ts
foundingDate: '2020',
```

### С10. Добавить hasCredential в схему Person
**Файл:** src/app/page.tsx — в personSchema:
```ts
hasCredential: {
  '@type': 'EducationalOccupationalCredential',
  credentialCategory: 'Certificate',
  name: 'CELTA',
  recognizedBy: {
    '@type': 'Organization',
    name: 'Cambridge Assessment English',
  },
},
```

### С11. Исправить защиту от пустого FAQPage
**Файл:** src/app/page.tsx — обернуть эмиссию схемы FAQPage:
```tsx
{faq.enabled !== false && faq.items?.length > 0 && (
  <>
    <FAQSection data={faq} />
    <script type="application/ld+json" ... />
  </>
)}
```

### С12. Исправить автора BlogPosting — использовать динамическое значение
**Файл:** src/app/blog/[slug]/page.tsx, строка 71
Заменить жёстко прописанное `name: 'Анна Сергеевна'` — передать имя преподавателя как prop или импортировать из общей константы.

### С13. Реализовать IndexNow для Яндекса
1. Сгенерировать ключ IndexNow (случайная буквенно-цифровая строка)
2. Добавить `/public/[ключ].txt` с ключом в содержимом
3. В серверном действии при публикации/обновлении поста отправить запрос:
   `https://yandex.com/indexnow?url=https://yourharmony-english.ru/blog/[slug]&key=[ключ]`

---

## НИЗКИЙ приоритет — Бэклог

### Н1. Удалить неиспользуемый шрифт Geist Mono
**Файл:** src/app/layout.tsx, строки 10–13
Убрать импорт Geist Mono и его CSS-переменную из className body.

### Н2. Добавить Twitter-карточку на главную и в список блога
**Файл:** src/app/layout.tsx и src/app/blog/page.tsx:
```ts
twitter: {
  card: 'summary_large_image',
  title: '...',
  description: '...',
  images: [`${SITE_URL}/og-image.png`],
},
```

### Н3. Уточнить заголовок страницы списка блога
**Файл:** src/app/blog/page.tsx, строка 26
Изменить: `title: 'Блог'` → `title: 'Блог об английском для детей'`

### Н4. Добавить ссылку на внешние отзывы в секцию контактов
Добавить текстовую ссылку: "Читать отзывы на Яндекс.Картах →" на страницу бизнеса в Яндекс.Картах.

### Н5. Добавить potentialAction SearchAction в схему WebSite
```ts
potentialAction: {
  '@type': 'SearchAction',
  target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
  'query-input': 'required name=search_term_string',
},
```

### Н6. Добавить contain:paint к анимированным blob-декорациям
**Файлы:** src/app/blog/page.tsx и src/app/blog/[slug]/page.tsx
Добавить `style={{ contain: 'paint' }}` к div-элементам blob.

### Н7. Добавить схему Course для групповых и индивидуальных занятий
Создать отдельную схему для каждого типа программы и добавить в page.tsx как дополнительный script-блок.

### Н8. Добавить вводный абзац на страницу списка блога
Добавить 50–80 слов над сеткой постов с объяснением, какой контент найдут родители.
Это исключает риск "тонкого контента" при малом числе публикаций.

### Н9. Проверить запасной шрифт для кириллицы
Geist Sans поддерживает только латиницу. Подтвердить намеренность системного шрифта для русского текста или переключить body-шрифт на Nunito (уже загружает кириллицу) с нужным диапазоном начертаний.

### Н10. Проверить наличие профиля преподавателя в БД
Схема Person и TeacherSection читают данные через getTeacherProfile(). Если записи нет, используются значения по умолчанию. Убедиться, что настоящее имя/биография/значки преподавателя сохранены в продакшн-БД.

---

## Порядок внедрения

| Приоритет | Задача | Трудоёмкость | Эффект |
|-----------|--------|-------------|--------|
| 1 | К1: Исправить домен SITE_URL | 1–2 ч | Критический |
| 2 | В1: Добавить Москва в title | 5 мин | Высокий |
| 3 | В2: Расширить мета-описание | 5 мин | Высокий |
| 4 | В5: Заменить force-dynamic на ISR | 1 ч | Высокий |
| 5 | В4: Добавить Блог в навбар/футер | 30 мин | Высокий |
| 6 | В3: Создать OG-изображение 1200×630 | 1 ч | Высокий |
| 7 | В6: Добавить CSP-заголовок | 1 ч | Высокий |
| 8 | В7: Исправить lastModified в карте сайта | 15 мин | Средний |
| 9 | С2: openingHoursSpecification | 30 мин | Средний |
| 10 | С3: Добавить сущности Review | 1 ч | Средний |
| 11 | С4/С5/С6: Обогатить llms.txt | 1 ч | Средний |
| 12 | С7: Добавить sameAs (после создания профилей) | 30 мин | Средний |
| 13 | С8: tel:-ссылка для телефона | 5 мин | Средний |
| 14 | С9: Год основания | 10 мин | Средний |
| 15 | С10/С11/С12: Исправления схем | 1 ч | Средний |
| 16 | С13: IndexNow | 1 ч | Средний (высокий для Яндекса) |

---

## Производительность — дополнительные задачи (из CWV-аудита)

### П-В1. Убрать force-dynamic — максимальный ROI
Подтверждено: 11 запросов к БД при каждой загрузке главной (9 через Promise.all + 2 от BlogPreview).
С ISR CDN отдаёт кэшированный HTML за ~50 мс вместо 800–1500 мс TTFB.
Инфраструктура ревалидации уже есть (revalidatePath вызывается в серверных действиях).

### П-В2. Устранить CLS в галерее — заменить motion.img на next/image
src/components/LandingClient.tsx — изображения галереи используют plain motion.img без размеров,
lazy loading и WebP. Сетка, перестраивающаяся при загрузке фото из useEffect, — подтверждённый источник CLS.
Исправление: перенести getPhotos() на серверную сторону в page.tsx, передать как prop,
использовать next/image fill внутри контейнера aspect-square.

### П-В3. Исправить анимацию box-shadow на CTA-кнопке — риск INP
globals.css — кейфреймы animate-glow-pulse анимируют box-shadow, что не композитируется
и нагружает поток рендеринга при каждом кадре. Каждое нажатие на основную CTA-кнопку во время анимации
задерживается. Заменить на анимацию opacity на псевдоэлементе ::after.

### П-В4. Исправить useCounter с setInterval на 60fps — риск INP
src/components/LandingClient.tsx — три хука useCounter используют setInterval на 60fps
в течение 1.5 секунд, каждый вызывает React setState. Три параллельных рендер-цикла на 60fps
в основном потоке. Заменить на requestAnimationFrame или Framer Motion useSpring.

### П-В5. Убрать priority с изображения TeacherSection
src/components/TeacherSection.tsx — TeacherSection расположена ниже сгиба.
Атрибут priority добавляет link rel=preload в head, конкурируя с шрифтами и реальным
LCP-ресурсом. Убрать priority, добавить loading="lazy".

### П-В6. Использовать LazyMotion с пакетом domAnimation
Обернуть LandingClient в LazyMotion features={domAnimation} и заменить motion.* на m.*
Это уменьшает бандл Framer Motion с ~90 кБ до ~17 кБ для реально используемых функций.

### П-С1. Добавить Яндекс.Метрику с отложенной загрузкой
Сейчас аналитики нет совсем. Для российского рынка Яндекс.Метрика — стандарт и даёт
реальные данные CWV из поля. Загружать с strategy="lazyOnload" через next/script.

### П-Н1. Уменьшить количество backdrop-blur на мобильных
Несколько наложенных backdrop-filter:blur() вызывают сильные тормоза на среднем Android
(доминирующий тип устройств у российских родителей). Добавить @media (prefers-reduced-motion)
и рассмотреть отключение backdrop-blur на мобильных брейкпоинтах.
