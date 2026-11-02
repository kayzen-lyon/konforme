import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { defineMessages, useMessages } from '@/i18n'

const L = defineMessages({
  fr: { loading: 'Chargement…' },
  en: { loading: 'Loading…' },
  de: { loading: 'Wird geladen…' },
  es: { loading: 'Cargando…' },
  it: { loading: 'Caricamento…' },
})

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const t = useMessages(L)
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center" role="status">
        <div className="size-12 rounded-full border-4 border-border border-t-primary-2 animate-spin" aria-hidden="true" />
        <span className="sr-only">{t.loading}</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" replace />
  }

  return <>{children}</>
}
