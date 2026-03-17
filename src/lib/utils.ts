/** Форматирует дату на русском языке */
export const formatDate = (date: Date, showYear = true) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    ...(showYear && { year: 'numeric' }),
  }).format(new Date(date))

/** Плавная прокрутка к секции по якорю вида "#section-id" */
export function scrollToSection(href: string, offset = 80) {
  const targetId = href.replace('#', '')
  const elem = document.getElementById(targetId)
  if (!elem) return
  const bodyRect = document.body.getBoundingClientRect().top
  const elemRect = elem.getBoundingClientRect().top
  const offsetPosition = elemRect - bodyRect - offset
  window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
}
