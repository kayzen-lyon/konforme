import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { Seo } from '@/components/Seo'
import { useAuth } from '@/contexts/AuthContext'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    seoTitle: 'Vérification en deux étapes — Konforme',
    title: 'Vérification en deux étapes',
    intro: 'Un code à usage unique vient de vous être envoyé par email. Saisissez-le pour finaliser la connexion.',
    code: 'Code reçu par email',
    submit: 'Valider le code',
    loading: 'Vérification…',
    resend: 'Renvoyer un code',
    resent: 'Un nouveau code a été envoyé.',
    cancel: 'Annuler et se déconnecter',
    errInvalid: 'Code invalide ou expiré.',
    errRate: 'Trop de tentatives. Réessayez dans quelques minutes.',
    home: 'Retour à l’accueil',
  },
  en: {
    seoTitle: 'Two-step verification — Konforme',
    title: 'Two-step verification',
    intro: 'A one-time code has just been emailed to you. Enter it to finish signing in.',
    code: 'Code received by email',
    submit: 'Verify code',
    loading: 'Verifying…',
    resend: 'Resend code',
    resent: 'A new code has been sent.',
    cancel: 'Cancel and sign out',
    errInvalid: 'Invalid or expired code.',
    errRate: 'Too many attempts. Try again in a few minutes.',
    home: 'Back to home',
  },
  de: {
    seoTitle: 'Zwei-Schritt-Verifizierung — Konforme',
    title: 'Zwei-Schritt-Verifizierung',
    intro: 'Wir haben Ihnen soeben einen Einmalcode per E-Mail gesendet. Geben Sie ihn ein, um die Anmeldung abzuschließen.',
    code: 'Per E-Mail erhaltener Code',
    submit: 'Code bestätigen',
    loading: 'Überprüfung…',
    resend: 'Code erneut senden',
    resent: 'Ein neuer Code wurde gesendet.',
    cancel: 'Abbrechen und abmelden',
    errInvalid: 'Ungültiger oder abgelaufener Code.',
    errRate: 'Zu viele Versuche. Bitte versuchen Sie es in einigen Minuten erneut.',
    home: 'Zurück zur Startseite',
  },
  es: {
    seoTitle: 'Verificación en dos pasos — Konforme',
    title: 'Verificación en dos pasos',
    intro: 'Acabamos de enviarle un código de un solo uso por email. Introdúzcalo para finalizar el inicio de sesión.',
    code: 'Código recibido por email',
    submit: 'Validar el código',
    loading: 'Verificando…',
    resend: 'Reenviar el código',
    resent: 'Se ha enviado un nuevo código.',
    cancel: 'Cancelar y cerrar sesión',
    errInvalid: 'Código no válido o caducado.',
    errRate: 'Demasiados intentos. Inténtelo de nuevo en unos minutos.',
    home: 'Volver al inicio',
  },
  it: {
    seoTitle: 'Verifica in due passaggi — Konforme',
    title: 'Verifica in due passaggi',
    intro: 'Le abbiamo appena inviato un codice monouso via email. Lo inserisca per completare l’accesso.',
    code: 'Codice ricevuto via email',
    submit: 'Convalida il codice',
    loading: 'Verifica in corso…',
    resend: 'Invia di nuovo il codice',
    resent: 'È stato inviato un nuovo codice.',
    cancel: 'Annulla ed esci',
    errInvalid: 'Codice non valido o scaduto.',
    errRate: 'Troppi tentativi. Riprovi tra qualche minuto.',
    home: 'Torna alla home',
  },
})

export function MfaStep() {
  const { verifyMfaCode, sendMfaCode, signOut } = useAuth()
  const t = useMessages(L)
  const lang = useLang()
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Rechargement de la page : aucun code actif, on en envoie un.
  useEffect(() => {
    void sendMfaCode().catch(() => {})
  }, [sendMfaCode])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    const code = String(new FormData(e.currentTarget).get('code') ?? '')
    try {
      await verifyMfaCode(code)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(/rate limit/i.test(msg) ? t.errRate : t.errInvalid)
      setLoading(false)
    }
  }

  async function resend() {
    setError(null)
    setInfo(null)
    try {
      await sendMfaCode()
      setInfo(t.resent)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(/rate limit/i.test(msg) ? t.errRate : t.errInvalid)
    }
  }

  return (
    <main id="main" className="min-h-screen grid place-items-center bg-surface-2 px-4 sm:px-6 py-10">
      <Seo title={t.seoTitle} description={t.intro} path="/login" noindex />
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to={localizePath(lang, '/')}>
            <Logo />
          </Link>
        </div>
        <Card className="p-8 md:p-10 shadow-card">
          <h1 className="text-3xl font-extrabold text-center mb-2">{t.title}</h1>
          <p className="text-center text-sm text-text-muted mb-6">{t.intro}</p>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="mfa-code" className="block font-display text-sm font-semibold mb-2">
                {t.code}
              </label>
              <input
                id="mfa-code"
                name="code"
                type="text"
                required
                autoFocus
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-center text-2xl tracking-[0.4em] text-text focus-visible:border-primary"
              />
            </div>
            {error && (
              <p role="alert" className="rounded-[12px] border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger-soft">
                {error}
              </p>
            )}
            {info && (
              <p role="status" className="text-sm text-text-muted">
                {info}
              </p>
            )}
            <Button type="submit" disabled={loading} variant="primary" size="lg" className="w-full">
              {loading ? t.loading : t.submit}
            </Button>
          </form>
          <div className="mt-4 flex flex-col items-center gap-2 text-sm">
            <button type="button" onClick={resend} className="text-link font-semibold underline underline-offset-2">
              {t.resend}
            </button>
            <button type="button" onClick={() => void signOut()} className="text-text-muted underline underline-offset-2">
              {t.cancel}
            </button>
          </div>
        </Card>
      </div>
    </main>
  )
}
