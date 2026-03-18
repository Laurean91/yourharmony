import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Логин', type: 'text' },
        password: { label: 'Пароль', type: 'password' },
      },
      authorize(credentials) {
        const adminUser = process.env.ADMIN_USER
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminUser || !adminPassword) return null

        if (
          credentials.username === adminUser &&
          credentials.password === adminPassword
        ) {
          return { id: '1', name: 'Admin' }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
})
