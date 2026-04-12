# YourHarmony — Публичные страницы

> Смотри также: `seo.md` — ISR, Schema.org, IndexNow для всех публичных страниц  
> Смотри также: `admin_panel.md` — управление лендингом из `/bigbos/landing`

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

## История изменений — публичные страницы

### Кнопка «Записаться» на лендинге (2026-04-04)
- Убрана белая обводка `ring-2 ring-white/30` с кнопки Hero в `src/components/LandingClient.tsx`

### Navbar — мобильное меню redesign (2026-04-12)
- **Кнопка бургера**: SVG-кнопка 36×36px, три линии (фиолетовая/лиловая/оранжевая) морфируются в X через `motion.line` координаты; стеклянный фон с `backdrop-filter: blur(8px)`, без браузерного outline (`WebkitTapHighlightColor: transparent`)
- **Popup-меню**: всплывающее окно 256px под кнопкой справа (не полноэкранный overlay); glassmorphism-фон с gradient indigo→white→orange, `border-radius: 16px`, shadow; staggered анимация ссылок снизу вверх (spring); gradient divider; CTA-кнопка; декоративная звёздочка; закрытие по клику снаружи и Escape
- **Анимации**: `popupMenu` variant — `scale 0.92→1 + y -8→0`; `menuItem` — `y 8→0 + blur(3px)→blur(0)`; stagger 55ms; exit 180ms

### Navbar (2026-04-03)
- Кнопка-иконка `UserCircle` (градиент фиолетовый→оранжевый) ведёт на `/parent`
- **Логотип** (`public/logo.svg`): правильный SVG (два прямоугольника: фиолетовый + оранжевый, белые звёзды)
- **OG-изображение**: заменены `og-image.png/webp` на новые с правильным брендингом

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

### Логотип + мобильные фиксы (2026-03-20)
- SVG-логотип в `Navbar.tsx` и `Footer.tsx`
- Карусель TestimonialsSection адаптирована для мобильного
