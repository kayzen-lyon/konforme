import { useId, useState } from 'react'
import { defineMessages, useMessages } from '@/i18n'
import { cn } from '@/lib/utils'

const L = defineMessages({
  fr: { more: 'Plus d’informations' },
  en: { more: 'More information' },
  de: { more: 'Weitere Informationen' },
  es: { more: 'Más información' },
  it: { more: 'Maggiori informazioni' },
})

/**
 * Info-bulle accessible : déclenchée au survol ET au focus clavier,
 * refermable avec Échap (RGAA 10.13), reliée par aria-describedby.
 */
export function Tooltip({
  content,
  label,
  className,
}: {
  content: React.ReactNode
  label?: string
  className?: string
}) {
  const t = useMessages(L)
  const id = useId()
  const [open, setOpen] = useState(false)
  const buttonLabel = label ?? t.more

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={buttonLabel}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false)
        }}
        className="inline-flex size-[18px] items-center justify-center rounded-full border border-border-strong text-[10px] font-bold text-text-muted hover:text-text hover:border-primary focus-visible:outline-2 focus-visible:outline-primary"
      >
        ?
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 bottom-full z-30 mb-2 w-72 -translate-x-1/2 rounded-[12px] border border-border bg-surface px-3.5 py-3 text-xs leading-relaxed text-text-soft shadow-lift"
        >
          {content}
        </span>
      )}
    </span>
  )
}
