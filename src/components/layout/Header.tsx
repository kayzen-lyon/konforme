import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { defineMessages, LANG_LABELS, LANGS, localizePath, unlocalizePath, useLang, useMessages } from '@/i18n'
import { useState, useRef, useEffect } from 'react'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const NAV_PATHS = ['/', '/tarifs', '/blog', '/rgaa', '/guide-accessibilite', '/a-propos'] as const

const L = defineMessages({
  fr: {
    nav: {
      home: 'Accueil',
      pricing: 'Tarifs',
      blog: 'Blog',
      rgaa: 'RGAA',
      guide: 'Guide EAA',
      about: 'À propos',
    },
    homeAria: 'Konforme accueil',
    mainNav: 'Navigation principale',
    mobileNav: 'Navigation mobile',
    contact: 'Contact',
    dashboard: 'Tableau de bord',
    signOut: 'Sortir',
    signIn: 'Connexion',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    drawerTitle: 'Konforme · KAYZEN',
    close: 'Fermer',
    qr: { site: 'Site', vcard: 'vCard', maps: 'Maps', reviews: 'Avis' },
    qrAlt: (label: string) => `QR code vers ${label}`,
    downloadVcard: 'Télécharger la vCard',
    mapsRoute: 'Itinéraire Maps',
    seeReviews: 'Voir les avis',
  },
  en: {
    nav: {
      home: 'Home',
      pricing: 'Pricing',
      blog: 'Blog',
      rgaa: 'RGAA',
      guide: 'EAA guide',
      about: 'About',
    },
    homeAria: 'Konforme home',
    mainNav: 'Main navigation',
    mobileNav: 'Mobile navigation',
    contact: 'Contact',
    dashboard: 'Dashboard',
    signOut: 'Sign out',
    signIn: 'Sign in',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    drawerTitle: 'Konforme · KAYZEN',
    close: 'Close',
    qr: { site: 'Website', vcard: 'vCard', maps: 'Maps', reviews: 'Reviews' },
    qrAlt: (label: string) => `QR code to ${label}`,
    downloadVcard: 'Download the vCard',
    mapsRoute: 'Directions on Maps',
    seeReviews: 'Read the reviews',
  },
  de: {
    nav: {
      home: 'Startseite',
      pricing: 'Preise',
      blog: 'Blog',
      rgaa: 'RGAA',
      guide: 'EAA-Leitfaden',
      about: 'Über uns',
    },
    homeAria: 'Konforme Startseite',
    mainNav: 'Hauptnavigation',
    mobileNav: 'Mobile Navigation',
    contact: 'Kontakt',
    dashboard: 'Dashboard',
    signOut: 'Abmelden',
    signIn: 'Anmelden',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    drawerTitle: 'Konforme · KAYZEN',
    close: 'Schließen',
    qr: { site: 'Website', vcard: 'vCard', maps: 'Maps', reviews: 'Bewertungen' },
    qrAlt: (label: string) => `QR-Code zu ${label}`,
    downloadVcard: 'vCard herunterladen',
    mapsRoute: 'Route in Maps',
    seeReviews: 'Bewertungen ansehen',
  },
  es: {
    nav: {
      home: 'Inicio',
      pricing: 'Precios',
      blog: 'Blog',
      rgaa: 'RGAA',
      guide: 'Guía EAA',
      about: 'Quiénes somos',
    },
    homeAria: 'Konforme inicio',
    mainNav: 'Navegación principal',
    mobileNav: 'Navegación móvil',
    contact: 'Contacto',
    dashboard: 'Panel de control',
    signOut: 'Salir',
    signIn: 'Iniciar sesión',
    openMenu: 'Abrir el menú',
    closeMenu: 'Cerrar el menú',
    drawerTitle: 'Konforme · KAYZEN',
    close: 'Cerrar',
    qr: { site: 'Sitio web', vcard: 'vCard', maps: 'Maps', reviews: 'Opiniones' },
    qrAlt: (label: string) => `Código QR hacia ${label}`,
    downloadVcard: 'Descargar la vCard',
    mapsRoute: 'Cómo llegar en Maps',
    seeReviews: 'Ver las opiniones',
  },
  it: {
    nav: {
      home: 'Home',
      pricing: 'Prezzi',
      blog: 'Blog',
      rgaa: 'RGAA',
      guide: 'Guida EAA',
      about: 'Chi siamo',
    },
    homeAria: 'Konforme home',
    mainNav: 'Navigazione principale',
    mobileNav: 'Navigazione mobile',
    contact: 'Contatti',
    dashboard: 'Dashboard',
    signOut: 'Esci',
    signIn: 'Accedi',
    openMenu: 'Apri il menu',
    closeMenu: 'Chiudi il menu',
    drawerTitle: 'Konforme · KAYZEN',
    close: 'Chiudi',
    qr: { site: 'Sito web', vcard: 'vCard', maps: 'Maps', reviews: 'Recensioni' },
    qrAlt: (label: string) => `Codice QR verso ${label}`,
    downloadVcard: 'Scarica la vCard',
    mapsRoute: 'Indicazioni su Maps',
    seeReviews: 'Leggi le recensioni',
  },
})

/** Sélecteur de langue : bascule la page COURANTE dans la langue choisie
 * (le français reste à la racine, les autres langues sont préfixées). */
function LangSelect({ className }: { className?: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const lang = useLang()
  return (
    <label className={cn('items-center text-sm text-text', className)}>
      <span className="sr-only">Langue du site / Site language</span>
      <select
        value={lang}
        onChange={(e) => {
          const next = e.target.value as (typeof LANGS)[number]
          const { path } = unlocalizePath(location.pathname)
          navigate(localizePath(next, path))
        }}
        className="h-10 cursor-pointer rounded-full border-0 bg-transparent px-2.5 font-display text-sm font-semibold text-text hover:bg-raise"
      >
        {LANGS.map((l) => (
          <option key={l} value={l}>
            {LANG_LABELS[l]}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Header() {
  const { user, signOut } = useAuth()
  const t = useMessages(L)
  const lang = useLang()
  const [contactOpen, setContactOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const lastFocus = useRef<HTMLElement | null>(null)
  const drawerFirstBtn = useRef<HTMLButtonElement | null>(null)

  const NAV: { to: string; label: string }[] = [
    { to: NAV_PATHS[0], label: t.nav.home },
    { to: NAV_PATHS[1], label: t.nav.pricing },
    { to: NAV_PATHS[2], label: t.nav.blog },
    { to: NAV_PATHS[3], label: t.nav.rgaa },
    { to: NAV_PATHS[4], label: t.nav.guide },
    { to: NAV_PATHS[5], label: t.nav.about },
  ]

  useEffect(() => {
    if (!contactOpen) return
    lastFocus.current = document.activeElement as HTMLElement
    drawerFirstBtn.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setContactOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lastFocus.current?.focus?.()
    }
  }, [contactOpen])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to={localizePath(lang, '/')} className="flex items-center rounded-lg" aria-label={t.homeAria}>
          <Logo />
        </Link>

        <nav className="hidden xl:flex items-center gap-1" aria-label={t.mainNav}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={localizePath(lang, n.to)}
              end={n.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative px-3 py-2 font-display text-[0.95rem] font-medium text-text transition-colors hover:text-primary',
                  "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary after:origin-left after:scale-x-0 after:transition-transform hover:after:scale-x-100",
                  isActive && 'text-primary after:scale-x-100'
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-controls="kf-contact-drawer"
            aria-expanded={contactOpen}
            aria-label={t.contact}
            title={t.contact}
            onClick={() => setContactOpen(true)}
            className="hidden md:inline-flex size-10 items-center justify-center rounded-full text-text hover:text-primary hover:bg-raise transition-colors"
          >
            {/* QR code : ouvre la carte de contact (QR site, vCard, Maps, avis) */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <path d="M14 14h3v3M21 14v.01M14 21h.01M17.5 21H21v-3.5" />
            </svg>
          </button>
          <LangSelect className="hidden sm:flex" />
          <ThemeToggle className="hidden sm:inline-flex" />

          {/* Sous 640 px : logo + menu seulement, le reste passe dans le menu */}
          {user ? (
            <>
              <Link to="/dashboard" className={cn(buttonVariants({ size: 'sm' }), 'ml-1.5 hidden sm:inline-flex')}>
                {t.dashboard}
              </Link>
              <Button size="sm" variant="ghost" className="hidden sm:inline-flex" onClick={() => signOut()}>
                {t.signOut}
              </Button>
            </>
          ) : (
            <Link to="/login" className={cn(buttonVariants({ size: 'sm' }), 'ml-1.5 hidden sm:inline-flex')}>
              {t.signIn}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}

          <button
            type="button"
            className="xl:hidden inline-flex size-10 items-center justify-center rounded-full text-text hover:bg-raise"
            aria-label={menuOpen ? t.closeMenu : t.openMenu}
            aria-expanded={menuOpen}
            aria-controls="kf-mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="kf-mobile-nav" className="xl:hidden border-t border-border bg-bg px-4 py-3" aria-label={t.mobileNav}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={localizePath(lang, n.to)}
              end={n.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-[12px] px-3 py-2.5 font-display font-medium text-text hover:bg-raise',
                  isActive && 'text-primary bg-primary/5'
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => { setMenuOpen(false); setContactOpen(true) }}
            className="mt-1 block w-full rounded-[12px] px-3 py-2.5 text-left font-display font-medium text-text hover:bg-raise md:hidden"
          >
            {t.contact}
          </button>
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3 sm:hidden">
            <LangSelect className="flex" />
            <ThemeToggle />
          </div>
          <div className="mt-3 grid gap-2 sm:hidden">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={cn(buttonVariants(), 'w-full')}>
                  {t.dashboard}
                </Link>
                <Button variant="ghost" className="w-full" onClick={() => { setMenuOpen(false); signOut() }}>
                  {t.signOut}
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className={cn(buttonVariants(), 'w-full')}>
                {t.signIn}
              </Link>
            )}
          </div>
        </nav>
      )}

      {/* Contact drawer */}
      {contactOpen && (
        <div role="presentation" className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-bg/70 backdrop-blur-md"
            onClick={() => setContactOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="kf-contact-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kf-contact-title"
            className="absolute right-0 top-0 h-full w-full max-w-md border-l border-border bg-surface shadow-card overflow-y-auto"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 id="kf-contact-title" className="font-bold text-lg">{t.drawerTitle}</h2>
              <button
                ref={drawerFirstBtn}
                type="button"
                aria-label={t.close}
                onClick={() => setContactOpen(false)}
                className="size-10 rounded-full hover:bg-raise inline-flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </header>
            <div className="p-5 space-y-4">
              <p className="text-sm text-text-soft leading-relaxed">
                6 rue Pierre Termier, 69009 Lyon —{' '}
                <a className="text-link hover:underline" href="tel:+33487776861">+33 (0)4 87 77 68 61</a>
                <br />
                <a className="text-link hover:underline" href="mailto:contact@kayzen-lyon.fr">contact@kayzen-lyon.fr</a>
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t.qr.site, src: '/contact/qr-site.svg' },
                  { label: t.qr.vcard, src: '/contact/qr-vcard.svg' },
                  { label: t.qr.maps, src: '/contact/qr-maps.svg' },
                  { label: t.qr.reviews, src: '/contact/qr-avis.svg' },
                ].map((qr) => (
                  <figure key={qr.label} className="rounded-[12px] border border-border bg-white p-2.5 text-center">
                    <img src={qr.src} alt={t.qrAlt(qr.label)} loading="lazy" className="aspect-square w-full" />
                    <figcaption className="mt-1.5 font-display text-[0.65rem] font-bold uppercase tracking-wider text-[#1f2937]">
                      {qr.label}
                    </figcaption>
                  </figure>
                ))}
              </div>

              <div className="grid gap-2">
                <a className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-display text-sm font-bold text-on-primary hover:bg-primary-2" href="/contact/kayzen-konforme.vcf" download>
                  {t.downloadVcard}
                </a>
                <a className="inline-flex h-12 items-center justify-center rounded-full border-2 border-text/15 px-6 font-display text-sm font-bold hover:bg-raise" href="https://www.google.com/maps/search/?api=1&query=KAYZEN+6+rue+Pierre+Termier+69009+Lyon" rel="noopener" target="_blank">
                  {t.mapsRoute}
                </a>
                <a className="inline-flex h-12 items-center justify-center rounded-full border-2 border-text/15 px-6 font-display text-sm font-bold hover:bg-raise" href="https://www.google.com/search?q=KAYZEN+Lyon+avis" rel="noopener" target="_blank">
                  {t.seeReviews}
                </a>
              </div>
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
