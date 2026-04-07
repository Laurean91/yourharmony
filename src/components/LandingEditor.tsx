'use client'

import { useState } from 'react'
import { updateSectionSettings, uploadPhoto, deletePhoto } from '../app/actions'
import type {
  HeroSettings, FeaturesSettings, FormatsSettings, ContactsSettings,
  HowItWorksSettings, TestimonialsSettings, CtaSettings, FaqSettings,
  Testimonial, FaqItem,
} from '../lib/landingTypes'
import TeacherForm from './TeacherForm'
import { useAdminTheme } from '@/contexts/AdminThemeContext'

/* ───────── Shared styles ───────── */
const inputBaseCls = 'w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400'
const inputStyle: React.CSSProperties = {
  background: 'var(--adm-bg-input)',
  border: '1px solid var(--adm-border-input)',
  color: 'var(--adm-text-primary)',
}
const textareaBaseCls = `${inputBaseCls} resize-y min-h-[80px]`
const labelStyle: React.CSSProperties = { color: 'var(--adm-text-primary)' }
const sectionStyle: React.CSSProperties = {
  background: 'var(--adm-bg-card)',
  border: '1px solid var(--adm-border-card)',
  borderRadius: 16,
  padding: 24,
  boxShadow: 'var(--adm-shadow-card)',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1" style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <span className="text-sm font-medium" style={{ color: enabled ? 'var(--adm-text-primary)' : 'var(--adm-text-muted)' }}>
        {enabled ? 'Блок включён' : 'Блок выключен'}
      </span>
      <div
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-purple-600' : 'bg-gray-400'}`}
      >
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </div>
    </label>
  )
}

function EnabledBanner({ enabled }: { enabled: boolean }) {
  if (enabled) return null
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
      Этот блок скрыт на сайте. Включите его выше, чтобы он отображался посетителям.
    </div>
  )
}

function SaveBar({ saving, saved, onSave }: { saving: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-4 mt-6" style={{ borderTop: '1px solid var(--adm-border-card)' }}>
      <button
        onClick={onSave}
        disabled={saving}
        className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-colors text-sm"
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
      {saved && <span className="text-green-500 text-sm font-medium">✓ Сохранено</span>}
    </div>
  )
}

function SectionHeader({ title, subtitle, enabled, onToggle }: { title: string; subtitle: string; enabled: boolean; onToggle: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--adm-border-card)' }}>
      <div>
        <p className="font-semibold" style={{ color: 'var(--adm-text-primary)' }}>{title}</p>
        <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>{subtitle}</p>
      </div>
      <Toggle enabled={enabled} onChange={onToggle} />
    </div>
  )
}

function useSave() {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async (fn: () => Promise<void>) => {
    setSaving(true)
    setSaved(false)
    await fn()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return { saving, saved, save }
}

/* ───────── Tab: Hero ───────── */
function HeroForm({ initial }: { initial: HeroSettings }) {
  const [d, setD] = useState(initial)
  const { saving, saved, save } = useSave()

  return (
    <div className="space-y-4">
      <Field label="Заголовок">
        <input className={inputBaseCls} style={inputStyle} value={d.title} onChange={e => setD({ ...d, title: e.target.value })} />
      </Field>
      <Field label="Подзаголовок">
        <textarea className={textareaBaseCls} style={inputStyle} value={d.subtitle} onChange={e => setD({ ...d, subtitle: e.target.value })} />
      </Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Учеников (число)">
          <input type="number" className={inputBaseCls} style={inputStyle} value={d.studentsCount} onChange={e => setD({ ...d, studentsCount: Number(e.target.value) })} />
        </Field>
        <Field label="Лет работаем">
          <input type="number" className={inputBaseCls} style={inputStyle} value={d.yearsCount} onChange={e => setD({ ...d, yearsCount: Number(e.target.value) })} />
        </Field>
        <Field label="Оценка (напр. 5.0)">
          <input type="number" step="0.1" min="0" max="5" className={inputBaseCls} style={inputStyle} value={d.rating} onChange={e => setD({ ...d, rating: Number(e.target.value) })} />
        </Field>
      </div>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('hero', d))} />
    </div>
  )
}

/* ───────── Tab: Contacts ───────── */
function ContactsForm({ initial, onEnabledChange }: { initial: ContactsSettings; onEnabledChange: (v: boolean) => void }) {
  const [d, setD] = useState({ enabled: true, ...initial })
  const { saving, saved, save } = useSave()
  const enabled = d.enabled !== false

  return (
    <div className="space-y-4">
      <SectionHeader title="Контакты" subtitle="Адрес, телефон, Telegram" enabled={enabled}
        onToggle={v => { setD({ ...d, enabled: v }); onEnabledChange(v) }} />
      <EnabledBanner enabled={enabled} />
      <Field label="Описание">
        <textarea className={textareaBaseCls} style={inputStyle} value={d.description} onChange={e => setD({ ...d, description: e.target.value })} />
      </Field>
      <Field label="Адрес">
        <input className={inputBaseCls} style={inputStyle} value={d.address} onChange={e => setD({ ...d, address: e.target.value })} />
      </Field>
      <Field label="Телефон">
        <input className={inputBaseCls} style={inputStyle} value={d.phone} onChange={e => setD({ ...d, phone: e.target.value })} />
      </Field>
      <Field label="Ссылка на Telegram">
        <input className={inputBaseCls} style={inputStyle} value={d.telegramUrl} onChange={e => setD({ ...d, telegramUrl: e.target.value })} />
      </Field>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('contacts', d))} />
    </div>
  )
}

/* ───────── Tab: CTA ───────── */
function CtaForm({ initial, onEnabledChange }: { initial: CtaSettings; onEnabledChange: (v: boolean) => void }) {
  const [d, setD] = useState({ enabled: true, ...initial })
  const { saving, saved, save } = useSave()
  const enabled = d.enabled !== false

  return (
    <div className="space-y-4">
      <SectionHeader title="CTA — призыв к действию" subtitle="Баннер с кнопкой записи" enabled={enabled}
        onToggle={v => { setD({ ...d, enabled: v }); onEnabledChange(v) }} />
      <EnabledBanner enabled={enabled} />
      <Field label="Заголовок">
        <input className={inputBaseCls} style={inputStyle} value={d.headline} onChange={e => setD({ ...d, headline: e.target.value })} />
      </Field>
      <Field label="Подтекст">
        <textarea className={textareaBaseCls} style={inputStyle} value={d.subtext} onChange={e => setD({ ...d, subtext: e.target.value })} />
      </Field>
      <Field label="Ссылка на Telegram">
        <input className={inputBaseCls} style={inputStyle} value={d.telegramUrl} onChange={e => setD({ ...d, telegramUrl: e.target.value })} />
      </Field>
      <Field label="Мелкий текст внизу">
        <input className={inputBaseCls} style={inputStyle} value={d.footer} onChange={e => setD({ ...d, footer: e.target.value })} />
      </Field>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('cta', d))} />
    </div>
  )
}

/* ───────── Tab: Features ───────── */
function FeaturesForm({ initial, onEnabledChange }: { initial: FeaturesSettings; onEnabledChange: (v: boolean) => void }) {
  const [d, setD] = useState({ enabled: true, ...initial })
  const { saving, saved, save } = useSave()
  const enabled = d.enabled !== false

  const updateItem = (i: number, field: 'title' | 'text', val: string) => {
    const items = d.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    setD({ ...d, items })
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Преимущества" subtitle="«Почему выбирают нас» — карточки" enabled={enabled}
        onToggle={v => { setD({ ...d, enabled: v }); onEnabledChange(v) }} />
      <EnabledBanner enabled={enabled} />
      <Field label="Описание клуба (абзац над карточками)">
        <textarea className={textareaBaseCls} style={inputStyle} value={d.description} onChange={e => setD({ ...d, description: e.target.value })} />
      </Field>
      {d.items.map((item, i) => (
        <div key={i} className="space-y-3" style={sectionStyle}>
          <p className="text-xs font-bold uppercase tracking-wider text-purple-500">Карточка {i + 1}</p>
          <Field label="Заголовок карточки">
            <input className={inputBaseCls} style={inputStyle} value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} />
          </Field>
          <Field label="Текст карточки">
            <textarea className={textareaBaseCls} style={inputStyle} value={item.text} onChange={e => updateItem(i, 'text', e.target.value)} />
          </Field>
        </div>
      ))}
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('features', d))} />
    </div>
  )
}

/* ───────── Tab: Formats ───────── */
function FormatsForm({ initial, onEnabledChange }: { initial: FormatsSettings; onEnabledChange: (v: boolean) => void }) {
  const [d, setD] = useState({ enabled: true, ...initial })
  const { saving, saved, save } = useSave()
  const enabled = d.enabled !== false

  const updateBullet = (type: 'group' | 'individual', i: number, val: string) => {
    if (type === 'group') {
      const bullets = d.groupBullets.map((b, idx) => idx === i ? val : b)
      setD({ ...d, groupBullets: bullets })
    } else {
      const bullets = d.individualBullets.map((b, idx) => idx === i ? val : b)
      setD({ ...d, individualBullets: bullets })
    }
  }

  const addBullet = (type: 'group' | 'individual') => {
    if (type === 'group') setD({ ...d, groupBullets: [...d.groupBullets, ''] })
    else setD({ ...d, individualBullets: [...d.individualBullets, ''] })
  }

  const removeBullet = (type: 'group' | 'individual', i: number) => {
    if (type === 'group') setD({ ...d, groupBullets: d.groupBullets.filter((_, idx) => idx !== i) })
    else setD({ ...d, individualBullets: d.individualBullets.filter((_, idx) => idx !== i) })
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Форматы занятий" subtitle="Групповые и индивидуальные" enabled={enabled}
        onToggle={v => { setD({ ...d, enabled: v }); onEnabledChange(v) }} />
      <EnabledBanner enabled={enabled} />
      <Field label="Подзаголовок раздела">
        <textarea className={textareaBaseCls} style={inputStyle} value={d.subtitle} onChange={e => setD({ ...d, subtitle: e.target.value })} />
      </Field>

      {/* Групповые */}
      <div className="space-y-3" style={sectionStyle}>
        <p className="text-xs font-bold uppercase tracking-wider text-purple-500">Групповые занятия (офлайн)</p>
        <Field label="Заголовок">
          <input className={inputBaseCls} style={inputStyle} value={d.groupTitle} onChange={e => setD({ ...d, groupTitle: e.target.value })} />
        </Field>
        <Field label="Описание">
          <textarea className={textareaBaseCls} style={inputStyle} value={d.groupDescription} onChange={e => setD({ ...d, groupDescription: e.target.value })} />
        </Field>
        <p className="block text-sm font-medium mb-1" style={labelStyle}>Пункты списка</p>
        {d.groupBullets.map((b, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputBaseCls} style={inputStyle} value={b} onChange={e => updateBullet('group', i, e.target.value)} />
            <button onClick={() => removeBullet('group', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">✕</button>
          </div>
        ))}
        <button onClick={() => addBullet('group')} className="text-sm text-purple-500 hover:text-purple-700 font-medium">+ Добавить пункт</button>
      </div>

      {/* Индивидуальные */}
      <div className="space-y-3" style={sectionStyle}>
        <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Индивидуальные занятия (онлайн)</p>
        <Field label="Заголовок">
          <input className={inputBaseCls} style={inputStyle} value={d.individualTitle} onChange={e => setD({ ...d, individualTitle: e.target.value })} />
        </Field>
        <Field label="Описание">
          <textarea className={textareaBaseCls} style={inputStyle} value={d.individualDescription} onChange={e => setD({ ...d, individualDescription: e.target.value })} />
        </Field>
        <p className="block text-sm font-medium mb-1" style={labelStyle}>Пункты списка</p>
        {d.individualBullets.map((b, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputBaseCls} style={inputStyle} value={b} onChange={e => updateBullet('individual', i, e.target.value)} />
            <button onClick={() => removeBullet('individual', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">✕</button>
          </div>
        ))}
        <button onClick={() => addBullet('individual')} className="text-sm text-orange-500 hover:text-orange-700 font-medium">+ Добавить пункт</button>
      </div>

      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('formats', d))} />
    </div>
  )
}

/* ───────── Tab: How it works ───────── */
function HowItWorksForm({ initial, onEnabledChange }: { initial: HowItWorksSettings; onEnabledChange: (v: boolean) => void }) {
  const [d, setD] = useState({ enabled: true, ...initial })
  const { saving, saved, save } = useSave()
  const enabled = d.enabled !== false

  const updateItem = (i: number, field: 'title' | 'text', val: string) => {
    const items = d.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    setD({ ...d, items })
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Как начать" subtitle="Шаги от заявки до занятий" enabled={enabled}
        onToggle={v => { setD({ ...d, enabled: v }); onEnabledChange(v) }} />
      <EnabledBanner enabled={enabled} />
      {d.items.map((item, i) => (
        <div key={i} className="space-y-3" style={sectionStyle}>
          <p className="text-xs font-bold uppercase tracking-wider text-purple-500">Шаг {i + 1}</p>
          <Field label="Заголовок шага">
            <input className={inputBaseCls} style={inputStyle} value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} />
          </Field>
          <Field label="Описание шага">
            <textarea className={textareaBaseCls} style={inputStyle} value={item.text} onChange={e => updateItem(i, 'text', e.target.value)} />
          </Field>
        </div>
      ))}
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('howItWorks', d))} />
    </div>
  )
}

/* ───────── Tab: Testimonials ───────── */
function TestimonialsForm({ initial, onEnabledChange }: { initial: TestimonialsSettings; onEnabledChange: (v: boolean) => void }) {
  const [d, setD] = useState({ enabled: true, ...initial })
  const { saving, saved, save } = useSave()
  const enabled = d.enabled !== false

  const update = (i: number, field: keyof Testimonial, val: string) => {
    const items = d.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    setD({ ...d, items })
  }

  const add = () => setD({ ...d, items: [...d.items, { name: '', child: '', duration: '', text: '' }] })
  const remove = (i: number) => setD({ ...d, items: d.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-6">
      <SectionHeader title="Отзывы" subtitle="Карусель отзывов родителей" enabled={enabled}
        onToggle={v => { setD({ ...d, enabled: v }); onEnabledChange(v) }} />
      <EnabledBanner enabled={enabled} />
      {d.items.map((item, i) => (
        <div key={i} className="space-y-3" style={sectionStyle}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Отзыв {i + 1}</p>
            <button onClick={() => remove(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Удалить</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Имя">
              <input className={inputBaseCls} style={inputStyle} value={item.name} onChange={e => update(i, 'name', e.target.value)} />
            </Field>
            <Field label="Ребёнок (напр. «Саша, 8 лет»)">
              <input className={inputBaseCls} style={inputStyle} value={item.child} onChange={e => update(i, 'child', e.target.value)} />
            </Field>
            <Field label="Длительность (напр. «6 месяцев»)">
              <input className={inputBaseCls} style={inputStyle} value={item.duration} onChange={e => update(i, 'duration', e.target.value)} />
            </Field>
          </div>
          <Field label="Текст отзыва">
            <textarea className={textareaBaseCls} style={inputStyle} value={item.text} onChange={e => update(i, 'text', e.target.value)} rows={3} />
          </Field>
        </div>
      ))}
      <button onClick={add} className="w-full py-3 rounded-2xl text-sm font-medium transition-colors"
        style={{ border: '2px dashed rgba(249,115,22,0.5)', color: '#f97316' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.05)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        + Добавить отзыв
      </button>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('testimonials', d))} />
    </div>
  )
}

/* ───────── Tab: FAQ ───────── */
function FaqForm({ initial, onEnabledChange }: { initial: FaqSettings; onEnabledChange: (v: boolean) => void }) {
  const [d, setD] = useState({ enabled: true, ...initial })
  const { saving, saved, save } = useSave()
  const enabled = d.enabled !== false

  const update = (i: number, field: keyof FaqItem, val: string) => {
    const items = d.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    setD({ ...d, items })
  }

  const add = () => setD({ ...d, items: [...d.items, { q: '', a: '' }] })
  const remove = (i: number) => setD({ ...d, items: d.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <SectionHeader title="FAQ" subtitle="Часто задаваемые вопросы" enabled={enabled}
        onToggle={v => { setD({ ...d, enabled: v }); onEnabledChange(v) }} />
      <EnabledBanner enabled={enabled} />
      {d.items.map((item, i) => (
        <div key={i} className="space-y-3" style={sectionStyle}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-500">Вопрос {i + 1}</p>
            <button onClick={() => remove(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Удалить</button>
          </div>
          <Field label="Вопрос">
            <input className={inputBaseCls} style={inputStyle} value={item.q} onChange={e => update(i, 'q', e.target.value)} />
          </Field>
          <Field label="Ответ">
            <textarea className={textareaBaseCls} style={inputStyle} value={item.a} onChange={e => update(i, 'a', e.target.value)} rows={3} />
          </Field>
        </div>
      ))}
      <button onClick={add} className="w-full py-3 rounded-2xl text-sm font-medium transition-colors"
        style={{ border: '2px dashed rgba(124,58,237,0.4)', color: '#7c3aed' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.05)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        + Добавить вопрос
      </button>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('faq', d))} />
    </div>
  )
}

/* ───────── Tab: Gallery ───────── */
interface Photo { id: string; url: string }

function GalleryForm({ photos }: { photos: Photo[] }) {
  return (
    <div className="space-y-6">
      <form action={uploadPhoto} className="flex flex-col sm:flex-row gap-2">
        <input type="file" name="file" accept="image/*" required
          className="rounded-xl flex-1 text-sm p-2"
          style={{ border: '1px solid var(--adm-border-input)', background: 'var(--adm-bg-input)', color: 'var(--adm-text-primary)' }} />
        <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-xl font-medium hover:bg-purple-700 whitespace-nowrap text-sm">
          Загрузить
        </button>
      </form>
      {photos.length === 0 && (
        <p className="text-sm text-center py-6" style={{ color: 'var(--adm-text-muted)' }}>Фотографий пока нет</p>
      )}
      <div className="grid grid-cols-3 gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative group rounded-xl overflow-hidden aspect-square"
            style={{ border: '1px solid var(--adm-border-card)' }}>
            <img src={p.url} className="w-full h-full object-cover" alt="" />
            <form action={deletePhoto.bind(null, p.id, p.url)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <button type="submit" className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                Удалить
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────── Main Editor ───────── */
const TABS = [
  { label: 'Hero', key: 'hero' },
  { label: 'Контакты', key: 'contacts' },
  { label: 'CTA', key: 'cta' },
  { label: 'Преимущества', key: 'features' },
  { label: 'Форматы', key: 'formats' },
  { label: 'Как начать', key: 'howItWorks' },
  { label: 'Отзывы', key: 'testimonials' },
  { label: 'FAQ', key: 'faq' },
  { label: 'Преподаватель', key: 'teacher' },
  { label: 'Галерея', key: 'gallery' },
] as const

type TabKey = typeof TABS[number]['key']
type EnabledTabKey = Exclude<TabKey, 'hero' | 'teacher' | 'gallery'>

interface TeacherProfile { name: string; bio: string; photoUrl: string | null; badges: string }

type Props = {
  hero: HeroSettings
  contacts: ContactsSettings
  cta: CtaSettings
  features: FeaturesSettings
  formats: FormatsSettings
  howItWorks: HowItWorksSettings
  testimonials: TestimonialsSettings
  faq: FaqSettings
  teacher: TeacherProfile
  photos: Photo[]
}

export default function LandingEditor(props: Props) {
  const [tab, setTab] = useState(0)
  const { theme } = useAdminTheme()
  const isDark = theme === 'dark'

  const [enabledMap, setEnabledMap] = useState<Record<EnabledTabKey, boolean>>({
    contacts: props.contacts.enabled !== false,
    cta: props.cta.enabled !== false,
    features: props.features.enabled !== false,
    formats: props.formats.enabled !== false,
    howItWorks: props.howItWorks.enabled !== false,
    testimonials: props.testimonials.enabled !== false,
    faq: props.faq.enabled !== false,
  })

  const toggle = (key: EnabledTabKey) => (v: boolean) =>
    setEnabledMap(m => ({ ...m, [key]: v }))

  return (
    <div>
      {/* Tab nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t, i) => {
          const isEnabled = t.key in enabledMap ? enabledMap[t.key as EnabledTabKey] : true
          const active = tab === i
          return (
            <button
              key={t.key}
              onClick={() => setTab(i)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: active ? '#7c3aed' : 'var(--adm-bg-card)',
                color: active ? '#ffffff' : 'var(--adm-text-muted)',
                border: active ? 'none' : '1px solid var(--adm-border-card)',
                boxShadow: active ? '0 2px 8px rgba(124,58,237,0.3)' : 'none',
              }}
            >
              {t.label}
              {!isEnabled && (
                <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white/60' : 'bg-amber-400'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div>
        {tab === 0 && <HeroForm initial={props.hero} />}
        {tab === 1 && <ContactsForm initial={props.contacts} onEnabledChange={toggle('contacts')} />}
        {tab === 2 && <CtaForm initial={props.cta} onEnabledChange={toggle('cta')} />}
        {tab === 3 && <FeaturesForm initial={props.features} onEnabledChange={toggle('features')} />}
        {tab === 4 && <FormatsForm initial={props.formats} onEnabledChange={toggle('formats')} />}
        {tab === 5 && <HowItWorksForm initial={props.howItWorks} onEnabledChange={toggle('howItWorks')} />}
        {tab === 6 && <TestimonialsForm initial={props.testimonials} onEnabledChange={toggle('testimonials')} />}
        {tab === 7 && <FaqForm initial={props.faq} onEnabledChange={toggle('faq')} />}
        {tab === 8 && <TeacherForm teacher={props.teacher} />}
        {tab === 9 && <GalleryForm photos={props.photos} />}
      </div>
    </div>
  )
}
