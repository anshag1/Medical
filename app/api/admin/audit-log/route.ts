import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = 20

  try {
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          admin: { select: { name: true, email: true } },
        },
      }),
      prisma.auditLog.count(),
    ])

    return NextResponse.json({
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Failed to fetch audit logs:', err)
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}
