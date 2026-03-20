'use client'

import { useState } from 'react'
import { updateSectionSettings } from '../app/actions'
import type {
  HeroSettings, FeaturesSettings, FormatsSettings, ContactsSettings,
  HowItWorksSettings, TestimonialsSettings, CtaSettings, FaqSettings,
  Testimonial, FaqItem,
} from '../lib/landingTypes'

/* ───────── Shared UI ───────── */
const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white'
const textareaCls = `${inputCls} resize-y min-h-[80px]`
const labelCls = 'block text-sm font-medium text-gray-700 mb-1'
const sectionCls = 'bg-white rounded-2xl border border-gray-100 shadow-sm p-6'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

function SaveBar({ saving, saved, onSave }: { saving: boolean; saved: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-6">
      <button
        onClick={onSave}
        disabled={saving}
        className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-60 transition-colors text-sm"
      >
        {saving ? 'Сохранение...' : 'Сохранить'}
      </button>
      {saved && <span className="text-green-600 text-sm font-medium">✓ Сохранено</span>}
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
        <input className={inputCls} value={d.title} onChange={e => setD({ ...d, title: e.target.value })} />
      </Field>
      <Field label="Подзаголовок">
        <textarea className={textareaCls} value={d.subtitle} onChange={e => setD({ ...d, subtitle: e.target.value })} />
      </Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Учеников (число)">
          <input type="number" className={inputCls} value={d.studentsCount} onChange={e => setD({ ...d, studentsCount: Number(e.target.value) })} />
        </Field>
        <Field label="Лет работаем">
          <input type="number" className={inputCls} value={d.yearsCount} onChange={e => setD({ ...d, yearsCount: Number(e.target.value) })} />
        </Field>
        <Field label="Оценка (напр. 5.0)">
          <input type="number" step="0.1" min="0" max="5" className={inputCls} value={d.rating} onChange={e => setD({ ...d, rating: Number(e.target.value) })} />
        </Field>
      </div>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('hero', d))} />
    </div>
  )
}

/* ───────── Tab: Contacts ───────── */
function ContactsForm({ initial }: { initial: ContactsSettings }) {
  const [d, setD] = useState(initial)
  const { saving, saved, save } = useSave()

  return (
    <div className="space-y-4">
      <Field label="Описание">
        <textarea className={textareaCls} value={d.description} onChange={e => setD({ ...d, description: e.target.value })} />
      </Field>
      <Field label="Адрес">
        <input className={inputCls} value={d.address} onChange={e => setD({ ...d, address: e.target.value })} />
      </Field>
      <Field label="Телефон">
        <input className={inputCls} value={d.phone} onChange={e => setD({ ...d, phone: e.target.value })} />
      </Field>
      <Field label="Ссылка на Telegram">
        <input className={inputCls} value={d.telegramUrl} onChange={e => setD({ ...d, telegramUrl: e.target.value })} />
      </Field>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('contacts', d))} />
    </div>
  )
}

/* ───────── Tab: CTA ───────── */
function CtaForm({ initial }: { initial: CtaSettings }) {
  const [d, setD] = useState(initial)
  const { saving, saved, save } = useSave()

  return (
    <div className="space-y-4">
      <Field label="Заголовок">
        <input className={inputCls} value={d.headline} onChange={e => setD({ ...d, headline: e.target.value })} />
      </Field>
      <Field label="Подтекст">
        <textarea className={textareaCls} value={d.subtext} onChange={e => setD({ ...d, subtext: e.target.value })} />
      </Field>
      <Field label="Ссылка на Telegram">
        <input className={inputCls} value={d.telegramUrl} onChange={e => setD({ ...d, telegramUrl: e.target.value })} />
      </Field>
      <Field label="Мелкий текст внизу">
        <input className={inputCls} value={d.footer} onChange={e => setD({ ...d, footer: e.target.value })} />
      </Field>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('cta', d))} />
    </div>
  )
}

/* ───────── Tab: Features ───────── */
function FeaturesForm({ initial }: { initial: FeaturesSettings }) {
  const [d, setD] = useState(initial)
  const { saving, saved, save } = useSave()

  const updateItem = (i: number, field: 'title' | 'text', val: string) => {
    const items = d.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    setD({ ...d, items })
  }

  return (
    <div className="space-y-6">
      <Field label="Описание клуба (абзац над карточками)">
        <textarea className={textareaCls} value={d.description} onChange={e => setD({ ...d, description: e.target.value })} />
      </Field>
      {d.items.map((item, i) => (
        <div key={i} className={`${sectionCls} space-y-3`}>
          <p className="text-xs font-bold uppercase tracking-wider text-purple-500">Карточка {i + 1}</p>
          <Field label="Заголовок карточки">
            <input className={inputCls} value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} />
          </Field>
          <Field label="Текст карточки">
            <textarea className={textareaCls} value={item.text} onChange={e => updateItem(i, 'text', e.target.value)} />
          </Field>
        </div>
      ))}
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('features', d))} />
    </div>
  )
}

/* ───────── Tab: Formats ───────── */
function FormatsForm({ initial }: { initial: FormatsSettings }) {
  const [d, setD] = useState(initial)
  const { saving, saved, save } = useSave()

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
      <Field label="Подзаголовок раздела">
        <textarea className={textareaCls} value={d.subtitle} onChange={e => setD({ ...d, subtitle: e.target.value })} />
      </Field>

      {/* Групповые */}
      <div className={`${sectionCls} space-y-3`}>
        <p className="text-xs font-bold uppercase tracking-wider text-purple-500">Групповые занятия (офлайн)</p>
        <Field label="Заголовок">
          <input className={inputCls} value={d.groupTitle} onChange={e => setD({ ...d, groupTitle: e.target.value })} />
        </Field>
        <Field label="Описание">
          <textarea className={textareaCls} value={d.groupDescription} onChange={e => setD({ ...d, groupDescription: e.target.value })} />
        </Field>
        <p className={labelCls}>Пункты списка</p>
        {d.groupBullets.map((b, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} value={b} onChange={e => updateBullet('group', i, e.target.value)} />
            <button onClick={() => removeBullet('group', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">✕</button>
          </div>
        ))}
        <button onClick={() => addBullet('group')} className="text-sm text-purple-600 hover:text-purple-800 font-medium">+ Добавить пункт</button>
      </div>

      {/* Индивидуальные */}
      <div className={`${sectionCls} space-y-3`}>
        <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Индивидуальные занятия (онлайн)</p>
        <Field label="Заголовок">
          <input className={inputCls} value={d.individualTitle} onChange={e => setD({ ...d, individualTitle: e.target.value })} />
        </Field>
        <Field label="Описание">
          <textarea className={textareaCls} value={d.individualDescription} onChange={e => setD({ ...d, individualDescription: e.target.value })} />
        </Field>
        <p className={labelCls}>Пункты списка</p>
        {d.individualBullets.map((b, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} value={b} onChange={e => updateBullet('individual', i, e.target.value)} />
            <button onClick={() => removeBullet('individual', i)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl text-sm">✕</button>
          </div>
        ))}
        <button onClick={() => addBullet('individual')} className="text-sm text-orange-600 hover:text-orange-800 font-medium">+ Добавить пункт</button>
      </div>

      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('formats', d))} />
    </div>
  )
}

/* ───────── Tab: How it works ───────── */
function HowItWorksForm({ initial }: { initial: HowItWorksSettings }) {
  const [d, setD] = useState(initial)
  const { saving, saved, save } = useSave()

  const updateItem = (i: number, field: 'title' | 'text', val: string) => {
    const items = d.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    setD({ ...d, items })
  }

  return (
    <div className="space-y-6">
      {d.items.map((item, i) => (
        <div key={i} className={`${sectionCls} space-y-3`}>
          <p className="text-xs font-bold uppercase tracking-wider text-purple-500">Шаг {i + 1}</p>
          <Field label="Заголовок шага">
            <input className={inputCls} value={item.title} onChange={e => updateItem(i, 'title', e.target.value)} />
          </Field>
          <Field label="Описание шага">
            <textarea className={textareaCls} value={item.text} onChange={e => updateItem(i, 'text', e.target.value)} />
          </Field>
        </div>
      ))}
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('howItWorks', d))} />
    </div>
  )
}

/* ───────── Tab: Testimonials ───────── */
function TestimonialsForm({ initial }: { initial: TestimonialsSettings }) {
  const [d, setD] = useState(initial)
  const { saving, saved, save } = useSave()

  const update = (i: number, field: keyof Testimonial, val: string) => {
    const items = d.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    setD({ ...d, items })
  }

  const add = () => setD({ ...d, items: [...d.items, { name: '', child: '', duration: '', text: '' }] })
  const remove = (i: number) => setD({ ...d, items: d.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-6">
      {d.items.map((item, i) => (
        <div key={i} className={`${sectionCls} space-y-3`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Отзыв {i + 1}</p>
            <button onClick={() => remove(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Удалить</button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Имя">
              <input className={inputCls} value={item.name} onChange={e => update(i, 'name', e.target.value)} />
            </Field>
            <Field label="Ребёнок (напр. «Саша, 8 лет»)">
              <input className={inputCls} value={item.child} onChange={e => update(i, 'child', e.target.value)} />
            </Field>
            <Field label="Длительность (напр. «6 месяцев»)">
              <input className={inputCls} value={item.duration} onChange={e => update(i, 'duration', e.target.value)} />
            </Field>
          </div>
          <Field label="Текст отзыва">
            <textarea className={textareaCls} value={item.text} onChange={e => update(i, 'text', e.target.value)} rows={3} />
          </Field>
        </div>
      ))}
      <button onClick={add} className="w-full py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-2xl text-sm font-medium hover:border-orange-400 hover:bg-orange-50 transition-colors">
        + Добавить отзыв
      </button>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('testimonials', d))} />
    </div>
  )
}

/* ───────── Tab: FAQ ───────── */
function FaqForm({ initial }: { initial: FaqSettings }) {
  const [d, setD] = useState(initial)
  const { saving, saved, save } = useSave()

  const update = (i: number, field: keyof FaqItem, val: string) => {
    const items = d.items.map((it, idx) => idx === i ? { ...it, [field]: val } : it)
    setD({ ...d, items })
  }

  const add = () => setD({ ...d, items: [...d.items, { q: '', a: '' }] })
  const remove = (i: number) => setD({ ...d, items: d.items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      {d.items.map((item, i) => (
        <div key={i} className={`${sectionCls} space-y-3`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-500">Вопрос {i + 1}</p>
            <button onClick={() => remove(i)} className="text-xs text-red-500 hover:text-red-700 font-medium">Удалить</button>
          </div>
          <Field label="Вопрос">
            <input className={inputCls} value={item.q} onChange={e => update(i, 'q', e.target.value)} />
          </Field>
          <Field label="Ответ">
            <textarea className={textareaCls} value={item.a} onChange={e => update(i, 'a', e.target.value)} rows={3} />
          </Field>
        </div>
      ))}
      <button onClick={add} className="w-full py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-2xl text-sm font-medium hover:border-purple-400 hover:bg-purple-50 transition-colors">
        + Добавить вопрос
      </button>
      <SaveBar saving={saving} saved={saved} onSave={() => save(() => updateSectionSettings('faq', d))} />
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
]

type Props = {
  hero: HeroSettings
  contacts: ContactsSettings
  cta: CtaSettings
  features: FeaturesSettings
  formats: FormatsSettings
  howItWorks: HowItWorksSettings
  testimonials: TestimonialsSettings
  faq: FaqSettings
}

export default function LandingEditor(props: Props) {
  const [tab, setTab] = useState(0)

  return (
    <div>
      {/* Tab nav */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(i)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === i
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300 hover:text-purple-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === 0 && <HeroForm initial={props.hero} />}
        {tab === 1 && <ContactsForm initial={props.contacts} />}
        {tab === 2 && <CtaForm initial={props.cta} />}
        {tab === 3 && <FeaturesForm initial={props.features} />}
        {tab === 4 && <FormatsForm initial={props.formats} />}
        {tab === 5 && <HowItWorksForm initial={props.howItWorks} />}
        {tab === 6 && <TestimonialsForm initial={props.testimonials} />}
        {tab === 7 && <FaqForm initial={props.faq} />}
      </div>
    </div>
  )
}
