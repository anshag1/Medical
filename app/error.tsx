'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-4xl font-bold text-destructive">Something went wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-xs text-left bg-muted p-4 rounded-md overflow-auto max-h-40">
            {error.message}
          </pre>
        )}
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
