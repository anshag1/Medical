import { prisma } from '@/lib/prisma'

interface AuditOptions {
  adminId: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGIN_FAILED'
  target: string
  details?: string
  ip?: string
  userAgent?: string
}

export async function createAuditLog(opts: AuditOptions): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminId: opts.adminId,
        action: opts.action,
        target: opts.target,
        details: opts.details,
        ip: opts.ip,
        userAgent: opts.userAgent,
      },
    })
  } catch {
    // Audit log failure must never break the main operation
    console.error('Failed to write audit log:', opts)
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? '127.0.0.1'
}
