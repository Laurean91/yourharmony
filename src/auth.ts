import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

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
    Credentials({
      credentials: {
        username: { label: 'Логин', type: 'text' },
        password: { label: 'Пароль', type: 'password' },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined
        const password = credentials?.password as string | undefined

        if (!username || !password) return null

        // 1. Check teacher (env-based)
        const adminUser = process.env.ADMIN_USER
        const adminPassword = process.env.ADMIN_PASSWORD
        if (adminUser && adminPassword && username === adminUser && password === adminPassword) {
          return { id: '0', name: 'Admin', role: 'TEACHER' }
        }

        // 2. Check parent (DB-based)
        const user = await prisma.user.findUnique({
          where: { username },
          include: { parent: true },
        })

        if (!user) return null

        const passwordMatch = await bcrypt.compare(password, user.passwordHash)
        if (!passwordMatch) return null

        const role = user.role === 'TEACHER' ? 'TEACHER' : 'PARENT'
        return {
          id: user.id,
          name: user.parent?.name ?? username,
          role,
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
