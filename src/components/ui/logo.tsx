import { defineMessages, useMessages } from '@/i18n'
import { cn } from '@/lib/utils'

const L = defineMessages({
  fr: { tagline: 'La conformité EAA', by: 'by' },
  en: { tagline: 'EAA compliance', by: 'by' },
  de: { tagline: 'EAA-Konformität', by: 'by' },
  es: { tagline: 'La conformidad EAA', by: 'by' },
  it: { tagline: 'La conformità EAA', by: 'by' },
})

/**
 * Marque Konforme, alignée sur les produits KAYZEN (Kayzen Security, Kayzen VPN) :
 * phénix KAYZEN + « KONFORME » en Outfit capitales, baseline
 * « La conformité EAA by KAYZEN » en petites capitales rouille.
 *
 * `onDark` : version pour les bandes bleu nuit (pied de page).
 */
export function Logo({
  className,
  withText = true,
  withTagline = true,
  onDark = false,
  size = 44,
}: {
  className?: string
  withText?: boolean
  withTagline?: boolean
  onDark?: boolean
  size?: number
}) {
  const t = useMessages(L)
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {withText && (
        <span className="inline-flex flex-col leading-none" dir="ltr">
          <span
            className={cn(
              'font-display text-xl font-bold uppercase tracking-[-0.02em]',
              onDark ? 'text-on-navy' : 'text-text'
            )}
          >
            Konforme
          </span>
          {withTagline && (
            <span
              className={cn(
                'mt-1 font-display text-[0.625rem] font-bold uppercase tracking-[0.14em] whitespace-nowrap',
                onDark ? 'text-gold' : 'text-link'
              )}
            >
              {t.tagline} <span className="font-semibold normal-case tracking-normal">{t.by}</span> KAYZEN
            </span>
          )}
        </span>
      )}
    </span>
  )
}

/** Phénix KAYZEN seul (avatar, en-têtes compacts). Décoratif : le nom l'accompagne toujours. */
export function LogoMark({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/kayzen-logo.webp"
      alt=""
      width={size}
      height={size}
      decoding="sync"
      className={cn('shrink-0', className)}
    />
  )
}
