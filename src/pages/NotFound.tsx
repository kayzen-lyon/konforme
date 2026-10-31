import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button-variants'
import { Seo } from '@/components/Seo'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    seoTitle: 'Page introuvable (404)',
    seoDescription: "Cette page n'existe pas ou a été déplacée.",
    h1: 'Page introuvable',
    text: "Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse, ou repartez de l'accueil.",
    home: "Retour à l'accueil",
    contact: 'Nous contacter',
  },
  en: {
    seoTitle: 'Page not found (404)',
    seoDescription: 'This page does not exist or has been moved.',
    h1: 'Page not found',
    text: 'This page does not exist or has been moved. Please check the address, or start again from the home page.',
    home: 'Back to home',
    contact: 'Contact us',
  },
  de: {
    seoTitle: 'Seite nicht gefunden (404)',
    seoDescription: 'Diese Seite existiert nicht oder wurde verschoben.',
    h1: 'Seite nicht gefunden',
    text: 'Diese Seite existiert nicht oder wurde verschoben. Bitte prüfen Sie die Adresse oder beginnen Sie erneut auf der Startseite.',
    home: 'Zurück zur Startseite',
    contact: 'Kontaktieren Sie uns',
  },
  es: {
    seoTitle: 'Página no encontrada (404)',
    seoDescription: 'Esta página no existe o se ha trasladado.',
    h1: 'Página no encontrada',
    text: 'Esta página no existe o se ha trasladado. Compruebe la dirección o vuelva a empezar desde la página de inicio.',
    home: 'Volver al inicio',
    contact: 'Contáctenos',
  },
  it: {
    seoTitle: 'Pagina non trovata (404)',
    seoDescription: 'Questa pagina non esiste o è stata spostata.',
    h1: 'Pagina non trovata',
    text: 'Questa pagina non esiste o è stata spostata. Verifichi l’indirizzo oppure riparta dalla pagina iniziale.',
    home: 'Torna alla pagina iniziale',
    contact: 'Ci contatti',
  },
})

export function NotFound() {
  const t = useMessages(L)
  const lang = useLang()

  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <Seo title={t.seoTitle} description={t.seoDescription} path="/404" lang={lang} noindex />
      <p className="font-display text-8xl font-extrabold tracking-[-0.04em] text-primary mb-4" aria-hidden="true">404</p>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{t.h1}</h1>
      <p className="text-text-muted mb-8">{t.text}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link to={localizePath(lang, '/')} className={buttonVariants()}>{t.home}</Link>
        <Link to={localizePath(lang, '/contact')} className={buttonVariants({ variant: 'ghost' })}>{t.contact}</Link>
      </div>
    </div>
  )
}
