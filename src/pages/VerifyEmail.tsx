import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { Seo } from '@/components/Seo'
import { useAuth } from '@/contexts/AuthContext'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    seoTitle: 'Confirmez votre email — Konforme',
    title: 'Confirmez votre adresse email',
    intro: 'Nous avons envoyé un lien de confirmation à',
    help: 'Cliquez sur le lien reçu (vérifiez les courriers indésirables) pour prouver que cette adresse vous appartient. Ouvrez-le dans ce même navigateur.',
    checking: 'Confirmation en cours…',
    done: 'Adresse confirmée. Reconnectez-vous : un code de vérification vous sera envoyé par email.',
    toLogin: 'Se connecter',
    resend: 'Renvoyer l’email de confirmation',
    resent: 'Email de confirmation renvoyé.',
    invalid: 'Lien invalide ou expiré. Demandez un nouvel email de confirmation après connexion.',
    errRate: 'Trop de demandes. Réessayez dans quelques minutes.',
    signOut: 'Se déconnecter',
  },
  en: {
    seoTitle: 'Confirm your email — Konforme',
    title: 'Confirm your email address',
    intro: 'We sent a confirmation link to',
    help: 'Click the link you received (check your spam folder) to prove you own this address. Open it in this same browser.',
    checking: 'Confirming…',
    done: 'Address confirmed. Sign in again: a verification code will be emailed to you.',
    toLogin: 'Sign in',
    resend: 'Resend confirmation email',
    resent: 'Confirmation email sent again.',
    invalid: 'Invalid or expired link. Request a new confirmation email after signing in.',
    errRate: 'Too many requests. Try again in a few minutes.',
    signOut: 'Sign out',
  },
  de: {
    seoTitle: 'E-Mail bestätigen — Konforme',
    title: 'Bestätigen Sie Ihre E-Mail-Adresse',
    intro: 'Wir haben einen Bestätigungslink gesendet an',
    help: 'Klicken Sie auf den erhaltenen Link (auch Spam prüfen), um zu bestätigen, dass die Adresse Ihnen gehört. Öffnen Sie ihn im selben Browser.',
    checking: 'Bestätigung läuft…',
    done: 'Adresse bestätigt. Melden Sie sich erneut an: Ein Verifizierungscode wird per E-Mail gesendet.',
    toLogin: 'Anmelden',
    resend: 'Bestätigungs-E-Mail erneut senden',
    resent: 'Bestätigungs-E-Mail erneut gesendet.',
    invalid: 'Ungültiger oder abgelaufener Link. Fordern Sie nach der Anmeldung eine neue E-Mail an.',
    errRate: 'Zu viele Anfragen. Bitte versuchen Sie es in einigen Minuten erneut.',
    signOut: 'Abmelden',
  },
  es: {
    seoTitle: 'Confirme su email — Konforme',
    title: 'Confirme su dirección de email',
    intro: 'Hemos enviado un enlace de confirmación a',
    help: 'Haga clic en el enlace recibido (revise el spam) para demostrar que esta dirección es suya. Ábralo en este mismo navegador.',
    checking: 'Confirmando…',
    done: 'Dirección confirmada. Vuelva a iniciar sesión: se le enviará un código de verificación por email.',
    toLogin: 'Iniciar sesión',
    resend: 'Reenviar el email de confirmación',
    resent: 'Email de confirmación reenviado.',
    invalid: 'Enlace no válido o caducado. Solicite un nuevo email tras iniciar sesión.',
    errRate: 'Demasiadas solicitudes. Inténtelo de nuevo en unos minutos.',
    signOut: 'Cerrar sesión',
  },
  it: {
    seoTitle: 'Confermi la sua email — Konforme',
    title: 'Confermi il suo indirizzo email',
    intro: 'Abbiamo inviato un link di conferma a',
    help: 'Clicchi sul link ricevuto (controlli lo spam) per dimostrare che l’indirizzo è suo. Lo apra in questo stesso browser.',
    checking: 'Conferma in corso…',
    done: 'Indirizzo confermato. Acceda di nuovo: riceverà un codice di verifica via email.',
    toLogin: 'Accedi',
    resend: 'Invia di nuovo l’email di conferma',
    resent: 'Email di conferma inviata di nuovo.',
    invalid: 'Link non valido o scaduto. Richieda una nuova email dopo l’accesso.',
    errRate: 'Troppe richieste. Riprovi tra qualche minuto.',
    signOut: 'Esci',
  },
})

export function VerifyEmail() {
  const { user, loading, confirmEmailVerification, sendVerificationEmail, signOut } = useAuth()
  const t = useMessages(L)
  const lang = useLang()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'checking' | 'done' | 'invalid'>(() => {
    const p = new URLSearchParams(window.location.search)
    return p.get('userId') && p.get('secret') ? 'checking' : 'idle'
  })
  const [info, setInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (loading || started.current) return
    const params = new URLSearchParams(window.location.search)
    const userId = params.get('userId')
    const secret = params.get('secret')
    if (userId && secret) {
      started.current = true
      confirmEmailVerification(userId, secret)
        .then(() => setStatus('done'))
        .catch(() => setStatus('invalid'))
    } else if (!user) {
      navigate('/login', { replace: true })
    } else if (user.emailVerified) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, user, confirmEmailVerification, navigate])

  async function resend() {
    setError(null)
    setInfo(null)
    try {
      await sendVerificationEmail()
      setInfo(t.resent)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setError(/rate limit/i.test(msg) ? t.errRate : msg)
    }
  }

  return (
    <main id="main" className="min-h-screen grid place-items-center bg-surface-2 px-4 sm:px-6 py-10">
      <Seo title={t.seoTitle} description={t.help} path="/verify-email" noindex />
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to={localizePath(lang, '/')}>
            <Logo />
          </Link>
        </div>
        <Card className="p-8 md:p-10 shadow-card text-center">
          <h1 className="text-3xl font-extrabold mb-4">{t.title}</h1>
          {status === 'checking' && <p role="status" className="text-text-muted">{t.checking}</p>}
          {status === 'done' && (
            <>
              <p role="status" className="text-text-muted mb-6">{t.done}</p>
              <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/login', { replace: true })}>
                {t.toLogin}
              </Button>
            </>
          )}
          {status === 'invalid' && (
            <p role="alert" className="rounded-[12px] border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger-soft">
              {t.invalid}
            </p>
          )}
          {(status === 'idle' || status === 'invalid') && user && (
            <>
              <p className="text-sm text-text-muted mb-2">
                {t.intro} <strong className="text-text">{user.email}</strong>.
              </p>
              <p className="text-sm text-text-muted mb-6">{t.help}</p>
              {error && <p role="alert" className="mb-3 text-sm text-danger-soft">{error}</p>}
              {info && <p role="status" className="mb-3 text-sm text-text-muted">{info}</p>}
              <Button variant="primary" size="lg" className="w-full" onClick={resend}>
                {t.resend}
              </Button>
              <button type="button" onClick={() => void signOut()} className="mt-4 text-sm text-text-muted underline underline-offset-2">
                {t.signOut}
              </button>
            </>
          )}
        </Card>
      </div>
    </main>
  )
}
