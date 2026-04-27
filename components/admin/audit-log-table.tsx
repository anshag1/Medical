import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import type { AuditLog } from '@/types'

const actionVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'> = {
  CREATE: 'success',
  UPDATE: 'warning',
  DELETE: 'destructive',
  LOGIN: 'default',
  LOGIN_FAILED: 'destructive',
}

interface AuditLogTableProps {
  logs: AuditLog[]
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No audit log entries yet.</p>
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start justify-between gap-4 rounded-md border p-3 text-sm"
        >
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant={actionVariant[log.action] ?? 'outline'} className="text-xs">
                {log.action}
              </Badge>
              <span className="font-medium truncate">{log.target}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              By {log.admin.name} ({log.admin.email})
              {log.ip && ` · IP: ${log.ip}`}
            </div>
            {log.details && (
              <p className="text-xs text-muted-foreground truncate">{log.details}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            {formatDateTime(log.createdAt)}
          </span>
        </div>
      ))}
    </div>
  )
}
