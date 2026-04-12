import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAuthEvent } from '@/lib/auth-log'

declare module 'next-auth' {
  interface User {
    role: 'TEACHER' | 'PARENT'
  }
  interface Session {
    user: {
      id: string
      name: string
      role: 'TEACHER' | 'PARENT'
    }
  }
  interface JWT {
    role?: 'TEACHER' | 'PARENT'
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // Провайдер 1: обычный логин (пароль)
    Credentials({
      id: 'credentials',
      credentials: {
        username: { label: 'Логин', type: 'text' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        const username = (credentials?.username as string | undefined)?.toLowerCase().trim()
        const password = credentials?.password as string | undefined

        if (!username || !password) return null

        const user = await prisma.user.findUnique({
          where: { username },
          include: { parent: true },
        })

        if (!user) {
          await logAuthEvent('LOGIN_FAIL')
          return null
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatch) {
          await logAuthEvent('LOGIN_FAIL', user.id)
          return null
        }

        await logAuthEvent('LOGIN_SUCCESS', user.id)

        return {
          id: user.id,
          name: user.parent?.name ?? username,
          role: user.role === 'TEACHER' ? 'TEACHER' : 'PARENT',
        }
      },
    }),

    // Провайдер 2: magic link (используется только verify endpoint'ом)
    Credentials({
      id: 'magic-link',
      credentials: {
        userId: { type: 'text' },
        token: { type: 'text' },
      },
      async authorize(credentials) {
        const userId = credentials?.userId as string | undefined
        const token = credentials?.token as string | undefined

        if (!userId || !token) return null

        // Верифицируем что токен валиден и принадлежит этому пользователю
        const magicToken = await prisma.magicToken.findUnique({ where: { token } })

        if (
          !magicToken ||
          magicToken.usedAt ||
          magicToken.expiresAt < new Date()
        ) return null

        const user = await prisma.user.findFirst({
          where: { id: userId, role: 'PARENT', email: magicToken.email },
          include: { parent: true },
        })

        if (!user) return null

        return {
          id: user.id,
          name: user.parent?.name ?? user.username,
          role: 'PARENT',
        }
      },
    }),
  ],
  pages: {
    signIn: '/bigbos/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.sub = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub ?? ''
      session.user.role = (token.role ?? 'PARENT') as 'TEACHER' | 'PARENT'
      return session
    },
  },
})
