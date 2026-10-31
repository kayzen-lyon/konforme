import type { ReactNode } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    skipToContent: 'Aller au contenu principal',
    bannerLabel: 'Annonce',
    banner: "Quel est le score d'accessibilité de votre site ? Testez-le gratuitement en 20 secondes →",
  },
  en: {
    skipToContent: 'Skip to main content',
    bannerLabel: 'Announcement',
    banner: "What is your website's accessibility score? Test it free in 20 seconds →",
  },
  de: {
    skipToContent: 'Zum Hauptinhalt springen',
    bannerLabel: 'Hinweis',
    banner: 'Wie barrierefrei ist Ihre Website? Testen Sie sie kostenlos in 20 Sekunden →',
  },
  es: {
    skipToContent: 'Ir al contenido principal',
    bannerLabel: 'Anuncio',
    banner: '¿Cuál es la puntuación de accesibilidad de su sitio? Pruébelo gratis en 20 segundos →',
  },
  it: {
    skipToContent: 'Vai al contenuto principale',
    bannerLabel: 'Annuncio',
    banner: 'Qual è il punteggio di accessibilità del suo sito? Lo verifichi gratis in 20 secondi →',
  },
})

/** `children` remplace l'Outlet (404 d'un préfixe de langue inconnu). */
export function PublicLayout({ children }: { children?: ReactNode }) {
  const t = useMessages(L)
  const lang = useLang()
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only fixed top-0 left-0 z-50 bg-gold text-[#1f2937] font-bold px-4 py-2 rounded-br-[12px]"
      >
        {t.skipToContent}
      </a>
      {/* Bandeau d'annonce bleu nuit, lien or : même facture que kayzen-lyon.com */}
      <aside aria-label={t.bannerLabel} className="on-navy bg-[#132944] px-4 py-2.5 text-center text-xs sm:text-sm text-white/90">
        <Link
          to={`${localizePath(lang, '/')}#checker`}
          className="font-display font-semibold text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
        >
          {t.banner}
        </Link>
      </aside>
      <Header />
      <main id="main" className="flex-1">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  )
}
