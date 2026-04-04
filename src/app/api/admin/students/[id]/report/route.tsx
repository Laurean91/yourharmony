import { NextResponse } from 'next/server'
import path from 'path'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { renderToBuffer, Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/Roboto-Regular.ttf'), fontWeight: 400 },
    { src: path.join(process.cwd(), 'public/fonts/Roboto-Bold.ttf'),    fontWeight: 700 },
  ],
})

const GRADE_LABEL: Record<number, string> = { 5: 'Отлично', 4: 'Хорошо', 3: 'Удовл.', 2: 'Неудовл.', 1: 'Плохо' }
const GRADE_COLOR: Record<number, string> = { 5: '#059669', 4: '#2563eb', 3: '#d97706', 2: '#dc2626', 1: '#9d174d' }

const bold = { fontFamily: 'Roboto', fontWeight: 700 } as const
const s = StyleSheet.create({
  page:       { fontFamily: 'Roboto', fontWeight: 400, fontSize: 9, padding: '20mm 15mm', color: '#1f2937', backgroundColor: '#ffffff' },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 10, marginBottom: 14, borderBottom: '2px solid #7c3aed' },
  brand:      { fontSize: 7, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 3 },
  h1:         { fontSize: 20, ...bold, color: '#111827', marginBottom: 3 },
  headerMeta: { fontSize: 8, color: '#6b7280' },
  headerRight:{ textAlign: 'right' },
  statsRow:   { flexDirection: 'row', gap: 6, marginBottom: 14 },
  statBox:    { flex: 1, borderRadius: 6, backgroundColor: '#fafafa', border: '1px solid #f3f4f6', padding: 8, alignItems: 'center' },
  statVal:    { fontSize: 16, ...bold, marginBottom: 2 },
  statLbl:    { fontSize: 7, color: '#9ca3af' },
  avgBox:     { flexDirection: 'row', gap: 10, borderRadius: 6, backgroundColor: '#fef9c3', border: '1px solid #fde68a', padding: 10, marginBottom: 14, alignItems: 'center' },
  avgNum:     { fontSize: 24, ...bold, color: '#d97706', textAlign: 'center' },
  avgLbl:     { fontSize: 7, color: '#92400e', textAlign: 'center' },
  avgRight:   { flex: 1 },
  avgTitle:   { fontSize: 8, ...bold, color: '#92400e', marginBottom: 4 },
  gradeTag:   { fontSize: 7, borderRadius: 3, border: '1px solid #fde68a', backgroundColor: '#ffffff', paddingHorizontal: 4, paddingVertical: 1, marginRight: 3 },
  tableLabel: { fontSize: 7, ...bold, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  thead:      { flexDirection: 'row', paddingBottom: 5, borderBottom: '2px solid #ede9fe' },
  th:         { fontSize: 7, ...bold, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 },
  tr:         { flexDirection: 'row', paddingVertical: 5, borderBottom: '1px solid #f3f4f6' },
  td:         { fontSize: 8, color: '#374151' },
  colDate:    { width: '12%' },
  colTitle:   { width: '35%' },
  colAtt:     { width: '12%', textAlign: 'center' },
  colGrade:   { width: '12%', textAlign: 'center' },
  colComment: { width: '29%' },
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, paddingTop: 10, borderTop: '1px solid #e5e7eb' },
  footerName: { fontSize: 9, ...bold, color: '#374151', marginTop: 2 },
  footerRole: { fontSize: 7, color: '#9ca3af' },
  signLine:   { borderBottom: '1px solid #9ca3af', width: 120, marginTop: 16 },
  signLbl:    { fontSize: 7, color: '#9ca3af', marginBottom: 4 },
})

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (session?.user?.role !== 'TEACHER') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { id } = await params

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      lessons: {
        include: { lesson: true },
        orderBy: { lesson: { date: 'desc' } },
        take: 60,
      },
    },
  })
  if (!student) return new NextResponse('Not Found', { status: 404 })

  const teacherProfile = await prisma.teacherProfile.findUnique({ where: { id: 'singleton' } })
  const teacherName = teacherProfile?.name ?? 'Учитель'

  const records = student.lessons.map(ls => ({
    date:     ls.lesson.date,
    title:    ls.lesson.title,
    attended: ls.attended,
    grade:    ls.grade,
    comment:  ls.comment,
  }))

  const attended = records.filter(r => r.attended).length
  const total    = records.length
  const missed   = total - attended
  const rate     = total > 0 ? Math.round((attended / total) * 100) : 0
  const graded   = records.filter(r => r.grade != null)
  const avgGrade = graded.length > 0
    ? (graded.reduce((s, r) => s + (r.grade ?? 0), 0) / graded.length).toFixed(1)
    : null

  const fmt = (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  const fmtLong = (d: Date) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  const today = fmtLong(new Date())
  const from  = records.length > 0 ? fmtLong(records[records.length - 1].date) : '—'
  const to    = records.length > 0 ? fmtLong(records[0].date) : '—'

  const doc = (
    <Document>
      <Page size="A4" style={s.page}>

        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Языковой клуб «Гармония»</Text>
            <Text style={s.h1}>{student.name}</Text>
            <Text style={s.headerMeta}>
              Группа: {student.tag}{student.age ? `  ·  Возраст: ${student.age} лет` : ''}
            </Text>
          </View>
          <View style={s.headerRight}>
            <Text style={{ ...s.headerMeta, marginBottom: 2 }}>Отчёт сформирован</Text>
            <Text style={{ ...s.headerMeta, ...bold, color: '#374151' }}>{today}</Text>
            <Text style={{ ...s.headerMeta, marginTop: 4 }}>Период: {from} — {to}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {[
            { label: 'Всего уроков',  value: String(total),    color: '#6b7280' },
            { label: 'Посещено',      value: String(attended), color: '#059669' },
            { label: 'Пропущено',     value: String(missed),   color: '#dc2626' },
            { label: 'Посещаемость',  value: `${rate}%`,       color: rate >= 80 ? '#059669' : '#d97706' },
          ].map(({ label, value, color }) => (
            <View key={label} style={s.statBox}>
              <Text style={{ ...s.statVal, color }}>{value}</Text>
              <Text style={s.statLbl}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Avg grade */}
        {avgGrade && (
          <View style={s.avgBox}>
            <View style={{ alignItems: 'center', minWidth: 60 }}>
              <Text style={s.avgNum}>{avgGrade}</Text>
              <Text style={s.avgLbl}>средний балл</Text>
            </View>
            <View style={s.avgRight}>
              <Text style={s.avgTitle}>Оценок поставлено: {graded.length} из {total}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {[5, 4, 3, 2, 1].map(g => {
                  const count = graded.filter(r => r.grade === g).length
                  if (!count) return null
                  return (
                    <Text key={g} style={{ ...s.gradeTag, color: GRADE_COLOR[g], borderColor: GRADE_COLOR[g] }}>
                      {g} — {count}×
                    </Text>
                  )
                })}
              </View>
            </View>
          </View>
        )}

        {/* Table */}
        <Text style={s.tableLabel}>Журнал уроков</Text>
        <View style={s.thead}>
          <Text style={{ ...s.th, ...s.colDate }}>Дата</Text>
          <Text style={{ ...s.th, ...s.colTitle }}>Тема</Text>
          <Text style={{ ...s.th, ...s.colAtt }}>Присут.</Text>
          <Text style={{ ...s.th, ...s.colGrade }}>Оценка</Text>
          <Text style={{ ...s.th, ...s.colComment }}>Комментарий</Text>
        </View>
        {records.map((r, i) => (
          <View key={i} style={{ ...s.tr, backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
            <Text style={{ ...s.td, ...s.colDate, color: '#9ca3af' }}>{fmt(r.date)}</Text>
            <Text style={{ ...s.td, ...s.colTitle }}>{r.title ?? '—'}</Text>
            <Text style={{ ...s.td, ...s.colAtt, color: r.attended ? '#059669' : '#dc2626' }}>
              {r.attended ? '✓' : '✗'}
            </Text>
            <Text style={{ ...s.td, ...s.colGrade, ...bold, color: r.grade ? GRADE_COLOR[r.grade] : '#d1d5db' }}>
              {r.grade != null ? String(r.grade) : '—'}
            </Text>
            <Text style={{ ...s.td, ...s.colComment, color: '#6b7280' }}>{r.comment ?? ''}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={s.footer}>
          <View>
            <Text style={s.footerRole}>Преподаватель</Text>
            <Text style={s.footerName}>{teacherName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.signLbl}>Подпись</Text>
            <View style={s.signLine} />
          </View>
        </View>

      </Page>
    </Document>
  )

  const buffer = await renderToBuffer(doc)

  const safeName = student.name.replace(/[^а-яёА-ЯЁa-zA-Z0-9 _-]/g, '').trim()
  const filename = encodeURIComponent(`Отчёт — ${safeName}.pdf`)

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${filename}`,
    },
  })
}
