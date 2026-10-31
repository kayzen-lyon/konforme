import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { buildBadgeEmbedHtml, buildBadgeSvg, downloadBadgePng, downloadBadgeSvg, type BadgeVariant } from '@/lib/badge'
import { defineMessages, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    descBefore:
      'Affichez votre niveau d’accessibilité sur votre site. Le badge indique le taux mesuré',
    rateAndLevel: (rate: number, level: string) => `(${rate} % — ${level})`,
    descAfter:
      'et la date de l’audit. Formulation volontairement prudente : « audité le », jamais « certifié » — seule l’absence de non-conformités sur un audit complet (automatique + manuel) permet de revendiquer la conformité.',
    levelGood: 'bon niveau',
    levelAverage: 'niveau moyen',
    levelLow: 'niveau faible',
    styleGroup: 'Style du badge',
    variantShield: 'Étiquette',
    variantRound: 'Rond',
    previewAlt: (rate: number) => `Aperçu du badge : ${rate} % de conformité RGAA`,
    downloadSvg: 'Télécharger SVG',
    downloadPng: 'Télécharger PNG',
    copied: '✓ Copié !',
    copyEmbed: 'Copier le code d’intégration',
    embedLabel: 'Code à coller sur votre site',
  },
  en: {
    descBefore:
      'Display your accessibility level on your website. The badge shows the measured rate',
    rateAndLevel: (rate: number, level: string) => `(${rate} % — ${level})`,
    descAfter:
      'and the date of the audit. The wording is deliberately cautious: “audited on”, never “certified” — only the absence of any issue in a complete audit (automated + manual) allows you to claim compliance.',
    levelGood: 'good level',
    levelAverage: 'average level',
    levelLow: 'low level',
    styleGroup: 'Badge style',
    variantShield: 'Label',
    variantRound: 'Round',
    previewAlt: (rate: number) => `Badge preview: ${rate} % RGAA compliance`,
    downloadSvg: 'Download SVG',
    downloadPng: 'Download PNG',
    copied: '✓ Copied!',
    copyEmbed: 'Copy the embed code',
    embedLabel: 'Code to paste on your website',
  },
  de: {
    descBefore:
      'Zeigen Sie Ihr Niveau an Barrierefreiheit auf Ihrer Website. Das Badge nennt den gemessenen Grad',
    rateAndLevel: (rate: number, level: string) => `(${rate} % — ${level})`,
    descAfter:
      'und das Datum des Audits. Die Formulierung ist bewusst zurückhaltend: „geprüft am“, niemals „zertifiziert“ – erst wenn ein vollständiges Audit (automatisiert + manuell) keinerlei Mängel ergibt, dürfen Sie Konformität beanspruchen.',
    levelGood: 'gutes Niveau',
    levelAverage: 'mittleres Niveau',
    levelLow: 'niedriges Niveau',
    styleGroup: 'Stil des Badges',
    variantShield: 'Etikett',
    variantRound: 'Rund',
    previewAlt: (rate: number) => `Vorschau des Badges: ${rate} % RGAA-Konformität`,
    downloadSvg: 'SVG herunterladen',
    downloadPng: 'PNG herunterladen',
    copied: '✓ Kopiert!',
    copyEmbed: 'Einbettungscode kopieren',
    embedLabel: 'Code zum Einfügen auf Ihrer Website',
  },
  es: {
    descBefore:
      'Muestre su nivel de accesibilidad en su sitio. El distintivo indica la tasa medida',
    rateAndLevel: (rate: number, level: string) => `(${rate} % — ${level})`,
    descAfter:
      'y la fecha de la auditoría. La formulación es deliberadamente prudente: «auditado el», nunca «certificado»: solo la ausencia de incumplimientos en una auditoría completa (automática + manual) permite reivindicar la conformidad.',
    levelGood: 'buen nivel',
    levelAverage: 'nivel medio',
    levelLow: 'nivel bajo',
    styleGroup: 'Estilo del distintivo',
    variantShield: 'Etiqueta',
    variantRound: 'Redondo',
    previewAlt: (rate: number) => `Vista previa del distintivo: ${rate} % de conformidad RGAA`,
    downloadSvg: 'Descargar SVG',
    downloadPng: 'Descargar PNG',
    copied: '✓ ¡Copiado!',
    copyEmbed: 'Copiar el código de integración',
    embedLabel: 'Código para pegar en su sitio',
  },
  it: {
    descBefore:
      'Mostri il suo livello di accessibilità sul suo sito. Il badge indica il tasso misurato',
    rateAndLevel: (rate: number, level: string) => `(${rate} % — ${level})`,
    descAfter:
      "e la data dell'audit. La formulazione è volutamente prudente: « verificato il », mai « certificato » — solo l'assenza di non conformità in un audit completo (automatico + manuale) consente di rivendicare la conformità.",
    levelGood: 'buon livello',
    levelAverage: 'livello medio',
    levelLow: 'livello basso',
    styleGroup: 'Stile del badge',
    variantShield: 'Etichetta',
    variantRound: 'Tondo',
    previewAlt: (rate: number) => `Anteprima del badge: ${rate} % di conformità RGAA`,
    downloadSvg: 'Scarica SVG',
    downloadPng: 'Scarica PNG',
    copied: '✓ Copiato!',
    copyEmbed: "Copia il codice di integrazione",
    embedLabel: 'Codice da incollare sul suo sito',
  },
})

/**
 * Générateur de badge de conformité : le client affiche sur son site le taux
 * mesuré lors du dernier audit (code couleur + pourcentage + date d'audit).
 */
export function BadgeGenerator({ rate, date, siteUrl }: { rate: number; date: string; siteUrl?: string }) {
  const t = useMessages(L)
  const [variant, setVariant] = useState<BadgeVariant>('shield')
  const [copied, setCopied] = useState(false)

  const input = useMemo(() => ({ rate, date, variant }), [rate, date, variant])
  const svg = useMemo(() => buildBadgeSvg(input), [input])
  const embed = useMemo(() => buildBadgeEmbedHtml(input, siteUrl), [input, siteUrl])
  const level = rate >= 85 ? t.levelGood : rate >= 50 ? t.levelAverage : t.levelLow

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(embed)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard indisponible : le textarea reste sélectionnable à la main */
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        {t.descBefore}{' '}
        <strong className="text-text">{t.rateAndLevel(Math.round(rate), level)}</strong>{' '}
        {t.descAfter}
      </p>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.styleGroup}>
        {(['shield', 'round'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            aria-pressed={variant === v}
            className={
              variant === v
                ? 'rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary'
                : 'rounded-full border border-border-strong px-3 py-1.5 text-xs font-semibold text-text-muted hover:bg-raise hover:text-text'
            }
          >
            {v === 'shield' ? t.variantShield : t.variantRound}
          </button>
        ))}
      </div>

      <div
        className="flex items-center justify-center rounded-[12px] border border-border bg-bg py-8"
        role="img"
        aria-label={t.previewAlt(Math.round(rate))}
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" onClick={() => downloadBadgeSvg(input)}>
          {t.downloadSvg}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void downloadBadgePng(input)}>
          {t.downloadPng}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void copyEmbed()}>
          {copied ? t.copied : t.copyEmbed}
        </Button>
      </div>

      <div>
        <label htmlFor="badge-embed" className="mb-1 block text-xs font-bold uppercase tracking-wider text-text-muted">
          {t.embedLabel}
        </label>
        <textarea
          id="badge-embed"
          readOnly
          value={embed}
          rows={3}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-[12px] border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-text-soft"
        />
      </div>
    </div>
  )
}
