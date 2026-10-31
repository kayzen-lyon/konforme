import { Suspense } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import { defineMessages, useMessages } from '@/i18n'
import { cn } from '@/lib/utils'

const L = defineMessages({
  fr: {
    nav: {
      overview: 'Vue d’ensemble',
      sites: 'Sites',
      scans: 'Scans',
      declarations: 'Déclarations',
      settings: 'Paramètres',
    },
    navLabel: 'Navigation tableau de bord',
    guest: 'Invité',
    signOut: 'Se déconnecter',
    exit: 'Sortir',
    loading: 'Chargement…',
  },
  en: {
    nav: {
      overview: 'Overview',
      sites: 'Sites',
      scans: 'Scans',
      declarations: 'Statements',
      settings: 'Settings',
    },
    navLabel: 'Dashboard navigation',
    guest: 'Guest',
    signOut: 'Sign out',
    exit: 'Sign out',
    loading: 'Loading…',
  },
  de: {
    nav: {
      overview: 'Übersicht',
      sites: 'Websites',
      scans: 'Scans',
      declarations: 'Erklärungen',
      settings: 'Einstellungen',
    },
    navLabel: 'Dashboard-Navigation',
    guest: 'Gast',
    signOut: 'Abmelden',
    exit: 'Abmelden',
    loading: 'Wird geladen…',
  },
  es: {
    nav: {
      overview: 'Vista general',
      sites: 'Sitios',
      scans: 'Análisis',
      declarations: 'Declaraciones',
      settings: 'Ajustes',
    },
    navLabel: 'Navegación del panel',
    guest: 'Invitado',
    signOut: 'Cerrar sesión',
    exit: 'Salir',
    loading: 'Cargando…',
  },
  it: {
    nav: {
      overview: 'Panoramica',
      sites: 'Siti',
      scans: 'Scansioni',
      declarations: 'Dichiarazioni',
      settings: 'Impostazioni',
    },
    navLabel: 'Navigazione della dashboard',
    guest: 'Ospite',
    signOut: 'Disconnettersi',
    exit: 'Esci',
    loading: 'Caricamento…',
  },
})

const NAV = [
  { to: '/dashboard', key: 'overview', icon: HomeIcon },
  { to: '/dashboard/sites', key: 'sites', icon: SitesIcon },
  { to: '/dashboard/scans', key: 'scans', icon: ScanIcon },
  { to: '/dashboard/declarations', key: 'declarations', icon: DocIcon },
  { to: '/dashboard/settings', key: 'settings', icon: GearIcon },
] as const

export function DashboardLayout() {
  const { user, signOut } = useAuth()
  const t = useMessages(L)
  const initial = (user?.name?.[0] || user?.email?.[0] || 'K').toUpperCase()

  return (
    <div className="min-h-screen flex bg-surface-2">
      <aside className="hidden md:flex w-72 shrink-0 flex-col border-r border-border bg-surface sticky top-0 h-screen">
        <div className="px-5 h-20 flex items-center border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1" aria-label={t.navLabel}>
          {NAV.map((n) => {
            const Icon = n.icon
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/dashboard'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-full px-4 py-2.5 font-display text-[0.95rem] font-medium text-text-muted hover:text-text hover:bg-raise transition-colors',
                    isActive && 'bg-primary/10 text-primary font-semibold hover:text-primary'
                  )
                }
              >
                <Icon />
                {t.nav[n.key]}
              </NavLink>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 rounded-[16px] p-3 bg-surface-2">
            <div className="size-10 rounded-full bg-primary flex items-center justify-center font-display text-on-primary font-bold shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">
                {user?.name || user?.email?.split('@')[0] || t.guest}
              </div>
              <div className="text-xs text-text-dim truncate">{user?.email}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" variant="ghost" className="flex-1" onClick={() => signOut()}>
              {t.signOut}
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 backdrop-blur-md px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="sm" variant="ghost" onClick={() => signOut()}>
              {t.exit}
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10 max-w-7xl w-full mx-auto">
          <Suspense
            fallback={
              <div className="min-h-[40vh] grid place-items-center" role="status">
                <div className="size-10 rounded-full border-4 border-border border-t-primary animate-spin" aria-hidden="true" />
                <span className="sr-only">{t.loading}</span>
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}
function SitesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  )
}
function ScanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M3 12h18" />
    </svg>
  )
}
function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6M9 9h2" />
    </svg>
  )
}
function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 008 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 8a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
