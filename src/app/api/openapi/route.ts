import { NextResponse } from 'next/server'

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'Клуб «Гармония» API',
    version: '1.0.0',
    description: 'API для работы с заявками на пробное занятие.',
  },
  servers: [{ url: 'https://yourharmony.vercel.app' }],
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
