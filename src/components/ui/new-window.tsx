import { defineMessages, useMessages } from '@/i18n'

const L = defineMessages({
  fr: { text: '(nouvel onglet)' },
  en: { text: '(opens in a new tab)' },
  de: { text: '(öffnet in neuem Tab)' },
  es: { text: '(se abre en una pestaña nueva)' },
  it: { text: '(si apre in una nuova scheda)' },
})

/**
 * À placer en fin de tout lien `target="_blank"` : l'ouverture d'un nouvel
 * onglet est signalée à la vue (icône) et aux lecteurs d'écran (texte),
 * RGAA 13.2 / WCAG 3.2.5.
 */
export function NewWindowHint() {
  const t = useMessages(L)
  return (
    <>
      <svg
        viewBox="0 0 24 24"
        width="0.85em"
        height="0.85em"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="ml-1 inline-block align-[-0.05em]"
      >
        <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" />
      </svg>
      <span className="sr-only"> {t.text}</span>
    </>
  )
}
