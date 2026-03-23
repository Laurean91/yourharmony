import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Клуб «Гармония» API',
    version: '1.0.0',
    description: 'API для работы с заявками, занятиями и финансами.',
  },
  servers: [{ url: 'https://yourharmony-english.ru' }],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description: 'Значение переменной `FASTAPI_SECRET_KEY`',
      },
    },
    schemas: {
      Booking: {
        type: 'object',
        properties: {
          id:         { type: 'string', format: 'uuid', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          parentName: { type: 'string', example: 'Иванова Мария' },
          childAge:   { type: 'integer', example: 7 },
          phone:      { type: 'string', example: '+7 999 123-45-67' },
          status:     { type: 'string', enum: ['Новая', 'В работе', 'Завершена'], example: 'Новая' },
          createdAt:  { type: 'string', format: 'date-time', example: '2026-03-21T10:00:00.000Z' },
        },
      },
      LessonStudent: {
        type: 'object',
        properties: {
          studentId: { type: 'string', format: 'uuid' },
          attended:  { type: 'boolean' },
          student: {
            type: 'object',
            properties: {
              id:   { type: 'string', format: 'uuid' },
              name: { type: 'string', example: 'Иванов Иван' },
              tag:  { type: 'string', example: 'Индивидуальное' },
            },
          },
        },
      },
      Lesson: {
        type: 'object',
        properties: {
          id:        { type: 'string', format: 'uuid', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
          date:      { type: 'string', format: 'date-time', example: '2026-03-25T10:00:00.000Z' },
          title:     { type: 'string', nullable: true, example: 'Фонетика' },
          tag:       { type: 'string', example: 'Индивидуальное' },
          notes:     { type: 'string', nullable: true },
          price:     { type: 'number', nullable: true, example: 1500 },
          createdAt: { type: 'string', format: 'date-time' },
          students:  { type: 'array', items: { $ref: '#/components/schemas/LessonStudent' } },
        },
      },
      Prices: {
        type: 'object',
        properties: {
          individual: { type: 'number', example: 1500, description: 'Цена индивидуального занятия (руб.)' },
          group:      { type: 'number', example: 800,  description: 'Цена группового занятия (руб.)' },
        },
      },
      MonthlyRevenue: {
        type: 'object',
        properties: {
          month:      { type: 'string', example: 'мар 26', description: 'Месяц в формате «ммм ГГ»' },
          individual: { type: 'number', example: 15000 },
          group:      { type: 'number', example: 6400 },
        },
      },
      StudentRevenue: {
        type: 'object',
        properties: {
          studentId: { type: 'string', format: 'uuid' },
          name:      { type: 'string', example: 'Иванов Иван' },
          tag:       { type: 'string', example: 'Индивидуальное' },
          attended:  { type: 'integer', example: 12, description: 'Посещённых занятий за всё время' },
          total:     { type: 'number', example: 18000, description: 'Суммарная выручка по ученику (руб.)' },
        },
      },
      FinanceStats: {
        type: 'object',
        properties: {
          monthlyRevenue: { type: 'array', items: { $ref: '#/components/schemas/MonthlyRevenue' }, description: 'Доходы по месяцам за последние 12 месяцев' },
          studentRevenue: { type: 'array', items: { $ref: '#/components/schemas/StudentRevenue' }, description: 'Выручка по ученикам, отсортирована по убыванию' },
          totalThisMonth: { type: 'number', example: 21400, description: 'Общая выручка за текущий месяц' },
          totalIndividual:{ type: 'number', example: 15000, description: 'Из них — индивидуальные' },
          totalGroup:     { type: 'number', example: 6400,  description: 'Из них — групповые' },
        },
      },
      ReportBreakdownItem: {
        type: 'object',
        properties: {
          label:      { type: 'string', example: '01 мар', description: 'День («01 мар») или месяц («мар 26»)' },
          individual: { type: 'number', example: 3000 },
          group:      { type: 'number', example: 1600 },
          total:      { type: 'number', example: 4600 },
        },
      },
      FinanceReport: {
        type: 'object',
        properties: {
          period:     { type: 'string', example: 'month', description: 'Название периода или «custom»' },
          from:       { type: 'string', format: 'date', example: '2026-03-01' },
          to:         { type: 'string', format: 'date', example: '2026-03-23' },
          total:      { type: 'number', example: 21400 },
          individual: { type: 'number', example: 15000 },
          group:      { type: 'number', example: 6400 },
          breakdown:  { type: 'array', items: { $ref: '#/components/schemas/ReportBreakdownItem' } },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
      },
    },
  },
  paths: {
    '/api/bookings': {
      get: {
        summary: 'Список заявок',
        description: 'Возвращает все заявки, отсортированные по дате создания (новые первыми). Поддерживает фильтрацию по статусу.',
        tags: ['Заявки'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            description: 'Фильтр по статусу заявки',
            schema: { type: 'string', enum: ['Новая', 'В работе', 'Завершена'] },
          },
        ],
        responses: {
          '200': {
            description: 'Успешный ответ',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Booking' } },
              },
            },
          },
          '401': {
            description: 'Не авторизован — неверный или отсутствующий токен',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
    '/api/lessons/{id}': {
      patch: {
        summary: 'Редактировать занятие',
        description: 'Обновляет поля занятия. Все поля опциональны. Если передан `studentIds` — список учеников синхронизируется (добавляются новые, удаляются отсутствующие; посещаемость уже добавленных сохраняется).',
        tags: ['Занятия'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  date:       { type: 'string', format: 'date-time', example: '2026-03-25T10:00:00.000Z', description: 'Новые дата и время занятия' },
                  title:      { type: 'string', nullable: true, example: 'Фонетика' },
                  tag:        { type: 'string', example: 'Индивидуальное', description: '«Индивидуальное» или «Группа»' },
                  notes:      { type: 'string', nullable: true },
                  price:      { type: 'number', nullable: true, example: 1500 },
                  studentIds: { type: 'array', items: { type: 'string', format: 'uuid' }, description: 'Полный новый список ID учеников (если передан — заменяет текущий)' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Обновлённое занятие с учениками',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Lesson' } } },
          },
          '400': { description: 'Невалидные данные', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Занятие не найдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/lessons/{id}/move': {
      patch: {
        summary: 'Перенести занятие',
        description: 'Изменяет только дату и время занятия. Удобно для drag-and-drop переноса в расписании.',
        tags: ['Занятия'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['date'],
                properties: {
                  date: { type: 'string', format: 'date-time', example: '2026-03-26T14:00:00.000Z' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Занятие с обновлённой датой',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Lesson' } } },
          },
          '400': { description: 'Невалидные данные', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Занятие не найдено', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/finance/report': {
      get: {
        summary: 'Отчёт о доходах за период',
        description: 'Возвращает суммарные доходы и разбивку по дням/месяцам за выбранный период. Раздельно считает индивидуальные и групповые занятия.\n\nМожно передать либо `period`, либо `from`+`to` для произвольного диапазона.',
        tags: ['Финансы'],
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'period',
            in: 'query',
            required: false,
            description: 'Предустановленный период. Игнорируется, если переданы `from`/`to`.',
            schema: { type: 'string', enum: ['today', 'week', 'month', '3months', '6months', 'year', 'all'], default: 'month' },
          },
          {
            name: 'from',
            in: 'query',
            required: false,
            description: 'Начало диапазона (YYYY-MM-DD). Требует `to`.',
            schema: { type: 'string', format: 'date', example: '2026-01-01' },
          },
          {
            name: 'to',
            in: 'query',
            required: false,
            description: 'Конец диапазона (YYYY-MM-DD). Требует `from`.',
            schema: { type: 'string', format: 'date', example: '2026-03-23' },
          },
          {
            name: 'groupBy',
            in: 'query',
            required: false,
            description: 'Группировка разбивки. По умолчанию `day` если диапазон ≤ 31 дня, иначе `month`.',
            schema: { type: 'string', enum: ['day', 'month'] },
          },
        ],
        responses: {
          '200': {
            description: 'Отчёт за период',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FinanceReport' },
              },
            },
          },
          '400': { description: 'Невалидные даты', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/finance/students/{id}/report': {
      get: {
        summary: 'Отчёт по отдельному ученику',
        description: 'Те же параметры и структура ответа, что у `/api/finance/report`, но данные отфильтрованы по конкретному ученику. В ответ добавлено поле `student`.',
        tags: ['Финансы'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          {
            name: 'period',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['today', 'week', 'month', '3months', '6months', 'year', 'all'], default: 'month' },
          },
          { name: 'from', in: 'query', required: false, schema: { type: 'string', format: 'date' } },
          { name: 'to',   in: 'query', required: false, schema: { type: 'string', format: 'date' } },
          { name: 'groupBy', in: 'query', required: false, schema: { type: 'string', enum: ['day', 'month'] } },
        ],
        responses: {
          '200': {
            description: 'Отчёт по ученику',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/FinanceReport' },
                    {
                      type: 'object',
                      properties: {
                        student: {
                          type: 'object',
                          properties: {
                            id:   { type: 'string', format: 'uuid' },
                            name: { type: 'string', example: 'Иванов Иван' },
                            tag:  { type: 'string', example: 'Индивидуальное' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          '401': { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '404': { description: 'Ученик не найден', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/finance/stats': {
      get: {
        summary: 'Финансовая статистика',
        description: 'Возвращает доходы по месяцам (последние 12 месяцев), выручку по ученикам и итоги текущего месяца. Учитываются только посещённые занятия.',
        tags: ['Финансы'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Статистика',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/FinanceStats' } } },
          },
          '401': { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/finance/prices': {
      get: {
        summary: 'Текущие цены на занятия',
        tags: ['Финансы'],
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Цены',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Prices' } } },
          },
          '401': { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      patch: {
        summary: 'Обновить цены на занятия',
        tags: ['Финансы'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['individual', 'group'],
                properties: {
                  individual: { type: 'number', example: 1500 },
                  group:      { type: 'number', example: 800 },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Обновлённые цены',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Prices' } } },
          },
          '400': { description: 'Невалидные данные', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          '401': { description: 'Не авторизован', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/bookings/count': {
      get: {
        summary: 'Количество новых заявок',
        description: 'Возвращает количество заявок со статусом «Новая». Не требует авторизации.',
        tags: ['Заявки'],
        responses: {
          '200': {
            description: 'Успешный ответ',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    count: { type: 'integer', example: 3 },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
}

export function GET() {
  return NextResponse.json(spec)
}
