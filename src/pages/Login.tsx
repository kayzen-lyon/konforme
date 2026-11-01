import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { useAuth } from '@/contexts/AuthContext'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'
import { Seo } from '@/components/Seo'

type Mode = 'signin' | 'signup'

// Le bouton Google n'est proposé que si le provider est configuré côté
// Appwrite (sinon la redirection OAuth aboutit sur une erreur 412 plein
// écran). Mettre VITE_GOOGLE_AUTH=on une fois le provider activé.
const GOOGLE_AUTH_ENABLED = import.meta.env.VITE_GOOGLE_AUTH === 'on'

const L = defineMessages({
  fr: {
    seoTitle: 'Connexion',
    seoDesc: 'Connectez-vous à votre tableau de bord Konforme.',
    homeAria: '(accueil)',
    titleSignin: 'Bienvenue',
    titleSignup: 'Créer un compte',
    subtitleSignin: "Connectez-vous pour accéder à votre tableau de bord d'accessibilité",
    subtitleSignup: '14 jours d’essai Pro inclus — sans carte bancaire',
    name: 'Nom complet',
    namePlaceholder: 'Prénom Nom',
    email: 'Email',
    emailPlaceholder: 'vous@exemple.fr',
    password: 'Mot de passe',
    passwordHelp: '8 caractères minimum.',
    submitSignin: 'Se connecter',
    submitSignup: 'Créer mon compte',
    loadingSignin: 'Connexion…',
    loadingSignup: 'Création…',
    noAccount: 'Pas encore de compte ?',
    toSignup: 'Créer un compte',
    haveAccount: 'Déjà inscrit ?',
    toSignin: 'Se connecter',
    or: 'ou',
    googleRedirect: 'Redirection...',
    googleContinue: 'Continuer avec Google',
    termsPrefix: 'En continuant vous acceptez nos',
    terms: 'CGU',
    termsMiddle: 'et notre',
    privacy: 'politique de confidentialité',
    backHome: '← Retour à l’accueil',
    oauthCancelled:
      'La connexion Google a été annulée ou a échoué. Réessayez, ou utilisez votre email et mot de passe.',
    oauthCallback:
      "La connexion Google n'a pas pu aboutir (session non créée). Réessayez, ou utilisez votre email et mot de passe.",
    oauthProvider:
      'La connexion Google n’est pas configurée côté serveur. L’administrateur doit vérifier le fournisseur Google et son URL de redirection dans Appwrite.',
    oauthDetail: (msg: string) => `Connexion Google impossible : ${msg}`,
    oauthGeneric: 'La connexion Google a échoué. Utilisez votre email et mot de passe.',
    errCredentials: 'Email ou mot de passe incorrect.',
    errPasswordLength: 'Le mot de passe doit faire au moins 8 caractères.',
    errExists: 'Un compte existe déjà avec cet email — connectez-vous.',
    errRateLimit: 'Trop de tentatives. Réessayez dans quelques minutes.',
    errBackend: "Le backend n'est pas encore configuré (projet Appwrite manquant).",
    errUnknown: 'Erreur inconnue',
  },
  en: {
    seoTitle: 'Sign in',
    seoDesc: 'Sign in to your Konforme dashboard.',
    homeAria: '(home)',
    titleSignin: 'Welcome',
    titleSignup: 'Create an account',
    subtitleSignin: 'Sign in to access your accessibility dashboard',
    subtitleSignup: '14-day Pro trial included — no credit card required',
    name: 'Full name',
    namePlaceholder: 'First name Last name',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    passwordHelp: '8 characters minimum.',
    submitSignin: 'Sign in',
    submitSignup: 'Create my account',
    loadingSignin: 'Signing in…',
    loadingSignup: 'Creating…',
    noAccount: 'No account yet?',
    toSignup: 'Create an account',
    haveAccount: 'Already registered?',
    toSignin: 'Sign in',
    or: 'or',
    googleRedirect: 'Redirecting...',
    googleContinue: 'Continue with Google',
    termsPrefix: 'By continuing you accept our',
    terms: 'Terms of use',
    termsMiddle: 'and our',
    privacy: 'privacy policy',
    backHome: '← Back to home',
    oauthCancelled:
      'Google sign-in was cancelled or failed. Try again, or use your email and password.',
    oauthCallback:
      'Google sign-in could not be completed (no session was created). Try again, or use your email and password.',
    oauthProvider:
      'Google sign-in is not configured on the server. The administrator must check the Google provider and its redirect URL in Appwrite.',
    oauthDetail: (msg: string) => `Google sign-in failed: ${msg}`,
    oauthGeneric: 'Google sign-in failed. Please use your email and password.',
    errCredentials: 'Incorrect email or password.',
    errPasswordLength: 'The password must be at least 8 characters long.',
    errExists: 'An account already exists with this email — please sign in.',
    errRateLimit: 'Too many attempts. Try again in a few minutes.',
    errBackend: 'The backend is not configured yet (Appwrite project missing).',
    errUnknown: 'Unknown error',
  },
  de: {
    seoTitle: 'Anmelden',
    seoDesc: 'Melden Sie sich in Ihrem Konforme-Dashboard an.',
    homeAria: '(Startseite)',
    titleSignin: 'Willkommen',
    titleSignup: 'Konto erstellen',
    subtitleSignin: 'Melden Sie sich an, um auf Ihr Dashboard für Barrierefreiheit zuzugreifen',
    subtitleSignup: '14 Tage Pro-Testphase inklusive — ohne Kreditkarte',
    name: 'Vollständiger Name',
    namePlaceholder: 'Vorname Nachname',
    email: 'E-Mail',
    emailPlaceholder: 'sie@beispiel.de',
    password: 'Passwort',
    passwordHelp: 'Mindestens 8 Zeichen.',
    submitSignin: 'Anmelden',
    submitSignup: 'Mein Konto erstellen',
    loadingSignin: 'Anmeldung…',
    loadingSignup: 'Wird erstellt…',
    noAccount: 'Noch kein Konto?',
    toSignup: 'Konto erstellen',
    haveAccount: 'Bereits registriert?',
    toSignin: 'Anmelden',
    or: 'oder',
    googleRedirect: 'Weiterleitung...',
    googleContinue: 'Mit Google fortfahren',
    termsPrefix: 'Mit dem Fortfahren akzeptieren Sie unsere',
    terms: 'Nutzungsbedingungen',
    termsMiddle: 'und unsere',
    privacy: 'Datenschutzerklärung',
    backHome: '← Zurück zur Startseite',
    oauthCancelled:
      'Die Google-Anmeldung wurde abgebrochen oder ist fehlgeschlagen. Versuchen Sie es erneut oder verwenden Sie E-Mail und Passwort.',
    oauthCallback:
      'Die Google-Anmeldung konnte nicht abgeschlossen werden (keine Sitzung erstellt). Versuchen Sie es erneut oder verwenden Sie E-Mail und Passwort.',
    oauthProvider:
      'Die Google-Anmeldung ist serverseitig nicht konfiguriert. Der Administrator muss den Google-Anbieter und dessen Weiterleitungs-URL in Appwrite prüfen.',
    oauthDetail: (msg: string) => `Google-Anmeldung nicht möglich: ${msg}`,
    oauthGeneric: 'Die Google-Anmeldung ist fehlgeschlagen. Verwenden Sie E-Mail und Passwort.',
    errCredentials: 'E-Mail-Adresse oder Passwort ist falsch.',
    errPasswordLength: 'Das Passwort muss mindestens 8 Zeichen lang sein.',
    errExists: 'Mit dieser E-Mail-Adresse besteht bereits ein Konto — bitte melden Sie sich an.',
    errRateLimit: 'Zu viele Versuche. Versuchen Sie es in einigen Minuten erneut.',
    errBackend: 'Das Backend ist noch nicht konfiguriert (Appwrite-Projekt fehlt).',
    errUnknown: 'Unbekannter Fehler',
  },
  es: {
    seoTitle: 'Iniciar sesión',
    seoDesc: 'Inicie sesión en su panel de control Konforme.',
    homeAria: '(inicio)',
    titleSignin: 'Bienvenido',
    titleSignup: 'Crear una cuenta',
    subtitleSignin: 'Inicie sesión para acceder a su panel de accesibilidad',
    subtitleSignup: '14 días de prueba Pro incluidos — sin tarjeta bancaria',
    name: 'Nombre completo',
    namePlaceholder: 'Nombre Apellidos',
    email: 'Correo electrónico',
    emailPlaceholder: 'usted@ejemplo.es',
    password: 'Contraseña',
    passwordHelp: '8 caracteres como mínimo.',
    submitSignin: 'Iniciar sesión',
    submitSignup: 'Crear mi cuenta',
    loadingSignin: 'Conectando…',
    loadingSignup: 'Creando…',
    noAccount: '¿Todavía no tiene cuenta?',
    toSignup: 'Crear una cuenta',
    haveAccount: '¿Ya está registrado?',
    toSignin: 'Iniciar sesión',
    or: 'o',
    googleRedirect: 'Redirigiendo...',
    googleContinue: 'Continuar con Google',
    termsPrefix: 'Al continuar acepta nuestras',
    terms: 'Condiciones de uso',
    termsMiddle: 'y nuestra',
    privacy: 'política de privacidad',
    backHome: '← Volver al inicio',
    oauthCancelled:
      'La conexión con Google se ha cancelado o ha fallado. Vuelva a intentarlo o utilice su correo electrónico y contraseña.',
    oauthCallback:
      'La conexión con Google no ha podido completarse (sesión no creada). Vuelva a intentarlo o utilice su correo electrónico y contraseña.',
    oauthProvider:
      'El inicio de sesión con Google no está configurado en el servidor. El administrador debe comprobar el proveedor de Google y su URL de redirección en Appwrite.',
    oauthDetail: (msg: string) => `Conexión con Google imposible: ${msg}`,
    oauthGeneric:
      'La conexión con Google ha fallado. Utilice su correo electrónico y contraseña.',
    errCredentials: 'Correo electrónico o contraseña incorrectos.',
    errPasswordLength: 'La contraseña debe tener al menos 8 caracteres.',
    errExists: 'Ya existe una cuenta con este correo electrónico — inicie sesión.',
    errRateLimit: 'Demasiados intentos. Vuelva a intentarlo dentro de unos minutos.',
    errBackend: 'El backend todavía no está configurado (falta el proyecto Appwrite).',
    errUnknown: 'Error desconocido',
  },
  it: {
    seoTitle: 'Accesso',
    seoDesc: 'Acceda alla sua dashboard Konforme.',
    homeAria: '(home)',
    titleSignin: 'Benvenuto',
    titleSignup: 'Creare un account',
    subtitleSignin: 'Acceda per entrare nella sua dashboard di accessibilità',
    subtitleSignup: '14 giorni di prova Pro inclusi — senza carta di credito',
    name: 'Nome completo',
    namePlaceholder: 'Nome Cognome',
    email: 'Email',
    emailPlaceholder: 'lei@esempio.it',
    password: 'Password',
    passwordHelp: 'Almeno 8 caratteri.',
    submitSignin: 'Accedi',
    submitSignup: 'Crea il mio account',
    loadingSignin: 'Accesso…',
    loadingSignup: 'Creazione…',
    noAccount: 'Non ha ancora un account?',
    toSignup: 'Creare un account',
    haveAccount: 'Già registrato?',
    toSignin: 'Accedi',
    or: 'oppure',
    googleRedirect: 'Reindirizzamento...',
    googleContinue: 'Continua con Google',
    termsPrefix: 'Continuando accetta le nostre',
    terms: 'Condizioni d’uso',
    termsMiddle: 'e la nostra',
    privacy: 'informativa sulla privacy',
    backHome: '← Torna alla home',
    oauthCancelled:
      'L’accesso con Google è stato annullato o non è riuscito. Riprovi, oppure utilizzi email e password.',
    oauthCallback:
      'L’accesso con Google non è andato a buon fine (sessione non creata). Riprovi, oppure utilizzi email e password.',
    oauthProvider:
      'L’accesso con Google non è configurato sul server. L’amministratore deve verificare il provider Google e il relativo URL di reindirizzamento in Appwrite.',
    oauthDetail: (msg: string) => `Accesso con Google impossibile: ${msg}`,
    oauthGeneric: 'L’accesso con Google non è riuscito. Utilizzi email e password.',
    errCredentials: 'Email o password non corretti.',
    errPasswordLength: 'La password deve contenere almeno 8 caratteri.',
    errExists: 'Esiste già un account con questa email — effettui l’accesso.',
    errRateLimit: 'Troppi tentativi. Riprovi tra qualche minuto.',
    errBackend: 'Il backend non è ancora configurato (progetto Appwrite mancante).',
    errUnknown: 'Errore sconosciuto',
  },
})

type Messages = (typeof L)['fr']

export function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, user } = useAuth()
  const t = useMessages(L)
  const lang = useLang()
  const [mode, setMode] = useState<Mode>('signin')
  // Retour d'un flux OAuth interrompu : erreur explicite. Appwrite remplace
  // parfois notre ?error=oauth par un objet JSON décrivant l'échec provider.
  const [error, setError] = useState<string | null>(() => {
    const oauthError = new URLSearchParams(window.location.search).get('error')
    if (!oauthError) return null
    if (oauthError === 'oauth') return t.oauthCancelled
    if (oauthError === 'callback') return t.oauthCallback
    try {
      const parsed = JSON.parse(oauthError) as { type?: string; message?: string }
      if (parsed.type === 'user_oauth2_provider_failure') {
        return t.oauthProvider
      }
      if (parsed.message) return t.oauthDetail(parsed.message)
    } catch {
      /* paramètre inattendu : message générique */
    }
    return t.oauthGeneric
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    const password = String(fd.get('password') ?? '')
    const name = String(fd.get('name') ?? '').trim()
    try {
      if (mode === 'signup') {
        await signUpWithEmail(name || email.split('@')[0], email, password)
      } else {
        await signInWithEmail(email, password)
      }
      // La redirection est gérée par l'effet sur `user`
    } catch (e) {
      setError(friendlyAuthError(e, t))
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
      // OAuth : redirection complète, rien d'autre à faire ici
    } catch (e) {
      setError(friendlyAuthError(e, t))
      setGoogleLoading(false)
    }
  }

  return (
    <main id="main" className="min-h-screen grid place-items-center bg-surface-2 px-4 sm:px-6 py-10">
      <Seo title={t.seoTitle} description={t.seoDesc} path="/login" noindex />
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link to={localizePath(lang, '/')}>
            <Logo />
            <span className="sr-only"> {t.homeAria}</span>
          </Link>
        </div>

        <Card className="p-8 md:p-10 shadow-card">
          <h1 className="text-3xl font-extrabold text-center mb-2">
            {mode === 'signin' ? t.titleSignin : t.titleSignup}
          </h1>
          <p className="text-center text-sm text-text-muted mb-6">
            {mode === 'signin' ? t.subtitleSignin : t.subtitleSignup}
          </p>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="block font-display text-sm font-semibold mb-2">
                  {t.name}
                </label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary placeholder:text-text-dim"
                  placeholder={t.namePlaceholder}
                />
              </div>
            )}
            <div>
              <label htmlFor="auth-email" className="block font-display text-sm font-semibold mb-2">
                {t.email}
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary placeholder:text-text-dim"
                placeholder={t.emailPlaceholder}
              />
            </div>
            <div>
              <label htmlFor="auth-password" className="block font-display text-sm font-semibold mb-2">
                {t.password}
              </label>
              <input
                id="auth-password"
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                aria-describedby={mode === 'signup' ? 'auth-password-help' : undefined}
                className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary"
              />
              {mode === 'signup' && (
                <p id="auth-password-help" className="mt-1 text-xs text-text-dim">
                  {t.passwordHelp}
                </p>
              )}
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-[12px] border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm text-danger-soft"
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} variant="primary" size="lg" className="w-full">
              {loading ? (
                <>
                  <span className="size-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                  {mode === 'signin' ? t.loadingSignin : t.loadingSignup}
                </>
              ) : mode === 'signin' ? (
                t.submitSignin
              ) : (
                t.submitSignup
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-text-muted">
            {mode === 'signin' ? (
              <>
                {t.noAccount}{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null) }}
                  className="text-link font-semibold underline underline-offset-2 hover:decoration-2"
                >
                  {t.toSignup}
                </button>
              </>
            ) : (
              <>
                {t.haveAccount}{' '}
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null) }}
                  className="text-link font-semibold underline underline-offset-2 hover:decoration-2"
                >
                  {t.toSignin}
                </button>
              </>
            )}
          </p>

          {GOOGLE_AUTH_ENABLED && (
            <>
              <div className="my-5 flex items-center gap-3" role="presentation">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-text-dim">{t.or}</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              <Button
                onClick={handleGoogle}
                disabled={googleLoading}
                variant="ghost"
                size="lg"
                className="w-full"
              >
                {googleLoading ? (
                  <>
                    <span className="size-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                    {t.googleRedirect}
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    {t.googleContinue}
                  </>
                )}
              </Button>
            </>
          )}

          <p className="mt-6 text-center text-xs text-text-dim leading-relaxed">
            {t.termsPrefix}{' '}
            <Link to={localizePath(lang, '/legal/cgu')} className="text-link underline underline-offset-2 hover:decoration-2">
              {t.terms}
            </Link>{' '}
            {t.termsMiddle}{' '}
            <Link to={localizePath(lang, '/legal/confidentialite')} className="text-link underline underline-offset-2 hover:decoration-2">
              {t.privacy}
            </Link>
            .
          </p>
        </Card>

        <div className="mt-6 text-center text-sm text-text-muted">
          <Link to={localizePath(lang, '/')} className="hover:text-text">
            {t.backHome}
          </Link>
        </div>
      </div>
    </main>
  )
}

/** Traduit les erreurs Appwrite les plus courantes en message actionnable. */
function friendlyAuthError(e: unknown, t: Messages): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (/invalid credentials|invalid email|password/i.test(msg) && !/at least/i.test(msg))
    return t.errCredentials
  if (/at least 8|password.*length/i.test(msg)) return t.errPasswordLength
  if (/already exists|user_already_exists/i.test(msg)) return t.errExists
  if (/rate limit/i.test(msg)) return t.errRateLimit
  if (/project.*not.*found|missing.*project/i.test(msg)) return t.errBackend
  return msg || t.errUnknown
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  )
}
