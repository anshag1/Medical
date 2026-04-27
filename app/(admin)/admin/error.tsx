'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[Admin Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      {process.env.NODE_ENV === 'development' && (
        <pre className="text-xs text-left bg-muted rounded-md p-4 max-w-xl overflow-auto">
          {error.message}
        </pre>
      )}
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  )
}
