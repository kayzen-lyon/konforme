/* eslint-disable react-refresh/only-export-components -- hook useAuth co-localisé avec le provider */
import * as React from 'react'
import { AuthenticationFactor, ID, OAuthProvider } from 'appwrite'
import { account, appwriteConfigured, type AppUser } from '@/lib/appwrite'

const NOT_CONFIGURED_MSG =
  "Le backend n'est pas encore configuré (projet Appwrite manquant). Contactez l'administrateur du site."

function assertConfigured() {
  if (!appwriteConfigured) throw new Error(NOT_CONFIGURED_MSG)
}

type AuthState = {
  user: AppUser | null
  loading: boolean
  /** Mot de passe validé, en attente du code reçu par email (2e facteur). */
  mfaRequired: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>
  sendVerificationEmail: () => Promise<void>
  confirmEmailVerification: (userId: string, secret: string) => Promise<void>
  sendMfaCode: () => Promise<void>
  verifyMfaCode: (code: string) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = React.createContext<AuthState | undefined>(undefined)

type SessionState = { user: AppUser | null; mfaRequired: boolean }

/** Lit la session courante ; distingue « non connecté » de « 2e facteur requis ». */
async function readSession(): Promise<SessionState> {
  try {
    const me = await account.get()
    return {
      user: { id: me.$id, email: me.email, name: me.name, emailVerified: me.emailVerification },
      mfaRequired: false,
    }
  } catch (e) {
    const type = (e as { type?: string } | null)?.type
    return { user: null, mfaRequired: type === 'user_more_factors_required' }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AppUser | null>(null)
  const [mfaRequired, setMfaRequired] = React.useState(false)
  const challengeId = React.useRef<string | null>(null)
  // Backend non configuré : pas de session à restaurer, on démarre déjà « chargé »
  const [loading, setLoading] = React.useState(appwriteConfigured)

  const apply = React.useCallback((s: SessionState) => {
    setUser(s.user)
    setMfaRequired(s.mfaRequired)
  }, [])

  const refresh = React.useCallback(async () => {
    if (!appwriteConfigured) {
      apply({ user: null, mfaRequired: false })
      return
    }
    apply(await readSession())
  }, [apply])

  React.useEffect(() => {
    if (!appwriteConfigured) return
    let mounted = true
    readSession()
      .then((s) => {
        if (mounted) apply(s)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [apply])
  const signInWithGoogle = React.useCallback(async () => {
    assertConfigured()
    const origin = window.location.origin
    // Flux « token » (et non session-cookie) : le cookie de session Appwrite
    // est un cookie tiers depuis notre domaine, bloqué par Chrome/Safari.
    // Appwrite renvoie userId+secret sur /auth/callback, où la session est
    // créée en XHR (mécanisme de secours localStorage du SDK, fiable).
    account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: `${origin}/auth/callback`,
      failure: `${origin}/login?error=oauth`,
    })
  }, [])

  const sendMfaCode = React.useCallback(async () => {
    assertConfigured()
    const challenge = await account.createMFAChallenge({ factor: AuthenticationFactor.Email })
    challengeId.current = challenge.$id
  }, [])

  const verifyMfaCode = React.useCallback(
    async (code: string) => {
      assertConfigured()
      if (!challengeId.current) await sendMfaCode()
      await account.updateMFAChallenge({ challengeId: challengeId.current as string, otp: code.trim() })
      challengeId.current = null
      await refresh()
    },
    [refresh, sendMfaCode],
  )

  const signInWithEmail = React.useCallback(
    async (email: string, password: string) => {
      assertConfigured()
      await account.createEmailPasswordSession({ email, password })
      const s = await readSession()
      if (s.user && s.user.emailVerified) {
        // Compte vérifié : le 2e facteur par email est obligatoire. On l'active
        // (comptes existants) puis on exige le code avant d'ouvrir l'accès.
        await account.updateMFA({ mfa: true })
        setUser(null)
        setMfaRequired(true)
        await sendMfaCode()
        return
      }
      apply(s)
      if (s.mfaRequired) await sendMfaCode()
    },
    [apply, sendMfaCode],
  )

  const sendVerificationEmail = React.useCallback(async () => {
    assertConfigured()
    await account.createVerification({ url: `${window.location.origin}/verify-email` })
  }, [])

  const confirmEmailVerification = React.useCallback(
    async (userId: string, secret: string) => {
      assertConfigured()
      await account.updateVerification({ userId, secret })
      // Email prouvé : on active le 2e facteur par email, puis on repasse
      // par la connexion pour saisir le code.
      await account.updateMFA({ mfa: true })
      await account.deleteSession({ sessionId: 'current' }).catch(() => {})
      apply({ user: null, mfaRequired: false })
    },
    [apply],
  )

  const signUpWithEmail = React.useCallback(
    async (name: string, email: string, password: string) => {
      assertConfigured()
      await account.create({ userId: ID.unique(), email, password, name })
      await account.createEmailPasswordSession({ email, password })
      // Session limitée : l'accès au tableau de bord reste bloqué tant que
      // l'adresse email n'est pas confirmée.
      await account.createVerification({ url: `${window.location.origin}/verify-email` })
      await refresh()
    },
    [refresh],
  )

  const signOut = React.useCallback(async () => {
    try {
      await account.deleteSession({ sessionId: 'current' })
    } finally {
      setUser(null)
      setMfaRequired(false)
    }
  }, [])

  const value: AuthState = {
    user,
    loading,
    mfaRequired,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendVerificationEmail,
    confirmEmailVerification,
    sendMfaCode,
    verifyMfaCode,
    signOut,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
