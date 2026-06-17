'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '1rem',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h1>
          {process.env.NODE_ENV === 'development' && (
            <pre
              style={{
                background: '#f3f4f6',
                borderRadius: '0.5rem',
                padding: '1rem',
                maxWidth: '600px',
                overflow: 'auto',
                textAlign: 'left',
                fontSize: '0.75rem',
              }}
            >
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          )}
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              background: 'white',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
