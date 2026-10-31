import * as React from 'react'
import { storedLang, type Lang } from '@/i18n'

/** Messages de repli : le boundary est hors du contexte React i18n (classe). */
const L: Record<Lang, { title: string; body: (email: React.ReactNode) => React.ReactNode; reload: string }> = {
  fr: {
    title: 'Une erreur est survenue',
    body: (email) => (
      <>
        L'application a rencontré un problème inattendu. Rechargez la page ; si le problème persiste,
        contactez-nous à {email}.
      </>
    ),
    reload: 'Recharger la page',
  },
  en: {
    title: 'Something went wrong',
    body: (email) => (
      <>
        The application ran into an unexpected problem. Reload the page; if the problem persists,
        contact us at {email}.
      </>
    ),
    reload: 'Reload the page',
  },
  de: {
    title: 'Ein Fehler ist aufgetreten',
    body: (email) => (
      <>
        In der Anwendung ist ein unerwartetes Problem aufgetreten. Laden Sie die Seite neu; falls das
        Problem weiterhin besteht, kontaktieren Sie uns unter {email}.
      </>
    ),
    reload: 'Seite neu laden',
  },
  es: {
    title: 'Se ha producido un error',
    body: (email) => (
      <>
        La aplicación ha encontrado un problema inesperado. Recargue la página; si el problema
        persiste, escríbanos a {email}.
      </>
    ),
    reload: 'Recargar la página',
  },
  it: {
    title: 'Si è verificato un errore',
    body: (email) => (
      <>
        L'applicazione ha riscontrato un problema imprevisto. Ricarichi la pagina; se il problema
        persiste, ci contatti all'indirizzo {email}.
      </>
    ),
    reload: 'Ricarica la pagina',
  },
}

type State = { error: Error | null }

/**
 * Filet de sécurité global : évite l'écran blanc en cas d'erreur de rendu
 * et propose un rechargement. Les erreurs sont loguées en console.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Erreur de rendu Konforme :', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    // Le contexte i18n peut être indisponible (erreur haute dans l'arbre) :
    // on lit la langue mémorisée directement.
    const t = L[storedLang()] ?? L.fr
    const email = (
      <a href="mailto:contact@kayzen-lyon.fr" className="text-link underline">
        contact@kayzen-lyon.fr
      </a>
    )
    return (
      <main
        id="main"
        className="min-h-screen grid place-items-center px-6 text-center"
        role="alert"
      >
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-3">{t.title}</h1>
          <p className="text-text-muted mb-6 text-sm leading-relaxed">{t.body(email)}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-display font-bold text-on-primary hover:bg-primary-2"
          >
            {t.reload}
          </button>
        </div>
      </main>
    )
  }
}
