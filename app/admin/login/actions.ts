'use server'

import { signIn } from '@/auth'
import { AuthError } from 'next-auth'
import { headers } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export interface LoginState {
  error?: string
  rateLimited?: boolean
  success?: boolean
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Invalid email or password' }
  }

  const { email, password } = parsed.data

  const headersList = headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
    headersList.get('x-real-ip') ??
    '127.0.0.1'

  // Rate-limit: 5 failed attempts per IP OR 10 per email in 15 minutes
  // Checking both prevents spoofed-IP bypass and targeted account brute-force
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000)
  const [ipFailedCount, emailFailedCount] = await Promise.all([
    prisma.loginAttempt.count({
      where: { ip, success: false, createdAt: { gte: fifteenMinsAgo } },
    }),
    prisma.loginAttempt.count({
      where: { email, success: false, createdAt: { gte: fifteenMinsAgo } },
    }),
  ])

  if (ipFailedCount >= 5 || emailFailedCount >= 10) {
    return { error: 'Too many failed attempts. Please try again in 15 minutes.', rateLimited: true }
  }

  try {
    await signIn('credentials', { email, password, redirect: false })
  } catch (error) {
    // NEXT_REDIRECT means NextAuth signed in successfully and wants to redirect.
    // The session cookie is already set at this point — we swallow the redirect
    // and let the client navigate via router.push so startTransition works correctly.
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
      await prisma.loginAttempt
        .create({ data: { ip, email, success: true } })
        .catch((e) => console.error('Failed to record login attempt:', e))
      return { success: true }
    }

    if (error instanceof AuthError) {
      const admin = await prisma.adminUser.findUnique({ where: { email } }).catch(() => null)
      await Promise.all([
        prisma.loginAttempt.create({ data: { ip, email, success: false } }),
        admin
          ? createAuditLog({
              adminId: admin.id,
              action: 'LOGIN_FAILED',
              target: `Admin: ${email}`,
              ip,
              userAgent: headersList.get('user-agent') ?? undefined,
            })
          : Promise.resolve(),
      ]).catch((e) => console.error('Failed to record failed login:', e))

      return { error: 'Invalid email or password' }
    }

    throw error
  }

  // signIn succeeded without throwing (redirect: false path)
  await prisma.loginAttempt
    .create({ data: { ip, email, success: true } })
    .catch((e) => console.error('Failed to record login attempt:', e))
  return { success: true }
}
