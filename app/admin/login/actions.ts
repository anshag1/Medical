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

  // Rate-limit: 5 failed attempts per IP in 15 minutes
  const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000)
  const failedCount = await prisma.loginAttempt.count({
    where: { ip, success: false, createdAt: { gte: fifteenMinsAgo } },
  })

  if (failedCount >= 5) {
    return { error: 'Too many failed attempts. Please try again in 15 minutes.', rateLimited: true }
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/admin/dashboard' })
  } catch (error) {
    // NEXT_REDIRECT is thrown on successful redirect — must be re-thrown
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
      await prisma.loginAttempt
        .create({ data: { ip, email, success: true } })
        .catch((e) => console.error('Failed to record login attempt:', e))
      throw error
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

  return {}
}
