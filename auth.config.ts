import type { NextAuthConfig } from 'next-auth'

// Must have empty providers — Credentials provider is NOT Edge-compatible.
// Full provider config lives in auth.ts (Node.js only).
export default {
  providers: [],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAdminPath = nextUrl.pathname.startsWith('/admin')
      const isLoginPage = nextUrl.pathname === '/admin/login'

      if (isAdminPath && !isLoginPage) {
        return isLoggedIn
      }
      return true
    },
  },
} satisfies NextAuthConfig
