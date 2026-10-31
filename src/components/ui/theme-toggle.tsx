import { useState } from 'react'
import { getCurrentTheme, setTheme, type Theme } from '@/lib/theme'
import { defineMessages, useMessages } from '@/i18n'
import { cn } from '@/lib/utils'

const L = defineMessages({
  fr: { toLight: 'Activer le thème clair', toDark: 'Activer le thème sombre', light: 'Thème clair', dark: 'Thème sombre' },
  en: { toLight: 'Switch to light theme', toDark: 'Switch to dark theme', light: 'Light theme', dark: 'Dark theme' },
  de: { toLight: 'Helles Design aktivieren', toDark: 'Dunkles Design aktivieren', light: 'Helles Design', dark: 'Dunkles Design' },
  es: { toLight: 'Activar el tema claro', toDark: 'Activar el tema oscuro', light: 'Tema claro', dark: 'Tema oscuro' },
  it: { toLight: 'Attiva il tema chiaro', toDark: 'Attiva il tema scuro', light: 'Tema chiaro', dark: 'Tema scuro' },
})

export function ThemeToggle({ className }: { className?: string }) {
  const t = useMessages(L)
  const [theme, setThemeState] = useState<Theme>(() => getCurrentTheme())
  const next: Theme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      aria-label={next === 'light' ? t.toLight : t.toDark}
      title={next === 'light' ? t.light : t.dark}
      onClick={() => {
        setTheme(next)
        setThemeState(next)
      }}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full text-text hover:text-primary hover:bg-raise transition-colors',
        className
      )}
    >
      {theme === 'dark' ? (
        /* Soleil : on propose de passer en clair */
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        /* Lune : on propose de passer en sombre */
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      )}
    </button>
  )
}
