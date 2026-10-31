/**
 * Génération du badge de conformité accessibilité (SVG autonome).
 *
 * Le badge affiche le taux de conformité mesuré lors du dernier audit avec un
 * code couleur, la date de l'audit et une formulation prudente (« audité le »,
 * jamais « certifié ») : un audit automatique ne couvre pas les 106 critères.
 *
 * Le badge est traduit en 5 langues (fr/en/de/es/it) : le paramètre `lang` est
 * toujours optionnel et vaut 'fr' par défaut.
 */

import type { Lang } from '@/i18n'

export type BadgeVariant = 'shield' | 'round'

export type BadgeInput = {
  /** Taux de conformité (0-100) à afficher. */
  rate: number
  /** Date de l'audit (ISO). */
  date: string
  variant: BadgeVariant
}

type BadgeL10n = {
  dateLocale: string
  /** Libellé principal du badge (marque « RGAA » non traduite). */
  label: string
  /** Séparateur « libellé → valeur » (le français insère une espace avant le deux-points). */
  sep: string
  /** Pourcentage formaté (le français insère une espace avant le %). */
  pct: (rate: number) => string
  /** Pourcentage suivi du mot « conformité », pour le texte alternatif. */
  pctCompliance: (rate: number) => string
  /** « audité le <date> » — formulation prudente, jamais « certifié ». */
  auditedOn: (date: string) => string
  levelGood: string
  levelMedium: string
  levelLow: string
  /** Texte alternatif complet du code d'intégration. */
  embedAlt: (rate: number, date: string) => string
}

const BADGE_L10N: Record<Lang, BadgeL10n> = {
  fr: {
    dateLocale: 'fr-FR',
    label: 'Accessibilité RGAA',
    sep: ' : ',
    pct: (rate) => `${rate} %`,
    pctCompliance: (rate) => `${rate} % de conformité`,
    auditedOn: (date) => `audité le ${date}`,
    levelGood: 'Bon niveau',
    levelMedium: 'Niveau moyen',
    levelLow: 'Niveau faible',
    embedAlt: (rate, date) =>
      `Accessibilité RGAA : ${rate} % de conformité — audité le ${date} avec Konforme`,
  },
  en: {
    dateLocale: 'en-GB',
    label: 'RGAA accessibility',
    sep: ': ',
    pct: (rate) => `${rate}%`,
    pctCompliance: (rate) => `${rate}% compliance`,
    auditedOn: (date) => `audited on ${date}`,
    levelGood: 'Good level',
    levelMedium: 'Average level',
    levelLow: 'Low level',
    embedAlt: (rate, date) =>
      `RGAA accessibility: ${rate}% compliance — audited on ${date} with Konforme`,
  },
  de: {
    dateLocale: 'de-DE',
    label: 'RGAA-Barrierefreiheit',
    sep: ': ',
    pct: (rate) => `${rate} %`,
    pctCompliance: (rate) => `${rate} % Konformität`,
    auditedOn: (date) => `geprüft am ${date}`,
    levelGood: 'Gutes Niveau',
    levelMedium: 'Mittleres Niveau',
    levelLow: 'Niedriges Niveau',
    embedAlt: (rate, date) =>
      `RGAA-Barrierefreiheit: ${rate} % Konformität — geprüft am ${date} mit Konforme`,
  },
  es: {
    dateLocale: 'es-ES',
    label: 'Accesibilidad RGAA',
    sep: ': ',
    pct: (rate) => `${rate} %`,
    pctCompliance: (rate) => `${rate} % de conformidad`,
    auditedOn: (date) => `auditado el ${date}`,
    levelGood: 'Buen nivel',
    levelMedium: 'Nivel medio',
    levelLow: 'Nivel bajo',
    embedAlt: (rate, date) =>
      `Accesibilidad RGAA: ${rate} % de conformidad — auditado el ${date} con Konforme`,
  },
  it: {
    dateLocale: 'it-IT',
    label: 'Accessibilità RGAA',
    sep: ': ',
    pct: (rate) => `${rate} %`,
    pctCompliance: (rate) => `${rate} % di conformità`,
    auditedOn: (date) => `verificato il ${date}`,
    levelGood: 'Buon livello',
    levelMedium: 'Livello medio',
    levelLow: 'Livello basso',
    embedAlt: (rate, date) =>
      `Accessibilità RGAA: ${rate} % di conformità — verificato il ${date} con Konforme`,
  },
}

function t(lang: Lang): BadgeL10n {
  return BADGE_L10N[lang] ?? BADGE_L10N.fr
}

export function badgeColor(rate: number, lang: Lang = 'fr'): { bg: string; label: string } {
  const T = t(lang)
  if (rate >= 85) return { bg: '#15803d', label: T.levelGood }
  if (rate >= 50) return { bg: '#b45309', label: T.levelMedium }
  return { bg: '#b91c1c', label: T.levelLow }
}

function fmtDate(iso: string, lang: Lang = 'fr'): string {
  return new Intl.DateTimeFormat(t(lang).dateLocale, { dateStyle: 'medium' }).format(new Date(iso))
}

const FONT = `font-family="system-ui,-apple-system,'Segoe UI',Roboto,sans-serif"`

/** Badge horizontal type « shield » : Accessibilité RGAA | 87 %. */
function shieldSvg(rate: number, date: string, lang: Lang): string {
  const T = t(lang)
  const { bg } = badgeColor(rate, lang)
  const value = T.pct(Math.round(rate))
  const label = T.label
  const sub = T.auditedOn(fmtDate(date, lang))
  const leftW = 128
  const rightW = 58
  const w = leftW + rightW
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="42" viewBox="0 0 ${w} 42" role="img" aria-label="${label}${T.sep}${value}, ${sub}">
  <title>${label}${T.sep}${value} — ${sub}</title>
  <rect width="${w}" height="42" rx="8" fill="#132944"/>
  <rect x="${leftW}" width="${rightW}" height="42" rx="8" fill="${bg}"/>
  <rect x="${leftW}" width="10" height="42" fill="${bg}"/>
  <g ${FONT} text-anchor="middle">
    <text x="${leftW / 2}" y="19" font-size="11.5" font-weight="600" fill="#ffffff">${label}</text>
    <text x="${leftW / 2}" y="33" font-size="9" fill="#c3c9de">${sub}</text>
    <text x="${leftW + rightW / 2}" y="26.5" font-size="15" font-weight="700" fill="#ffffff">${value}</text>
  </g>
</svg>`
}

/** Badge rond : pourcentage au centre, anneau de progression coloré. */
function roundSvg(rate: number, date: string, lang: Lang): string {
  const T = t(lang)
  const { bg } = badgeColor(rate, lang)
  const label = T.label
  const sub = T.auditedOn(fmtDate(date, lang))
  const r = 26
  const c = 2 * Math.PI * r
  const filled = (c * Math.min(Math.max(rate, 0), 100)) / 100
  return `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72" role="img" aria-label="${label}${T.sep}${T.pctCompliance(Math.round(rate))}, ${sub}">
  <title>${label}${T.sep}${T.pct(Math.round(rate))} — ${sub}</title>
  <circle cx="36" cy="36" r="34" fill="#132944"/>
  <circle cx="36" cy="36" r="${r}" fill="none" stroke="#2c4466" stroke-width="6"/>
  <circle cx="36" cy="36" r="${r}" fill="none" stroke="${bg}" stroke-width="6" stroke-linecap="round"
    stroke-dasharray="${filled.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 36 36)"/>
  <g ${FONT} text-anchor="middle" fill="#ffffff">
    <text x="36" y="35" font-size="15" font-weight="700">${Math.round(rate)}<tspan font-size="9">%</tspan></text>
    <text x="36" y="47" font-size="7.5" fill="#c3c9de">RGAA</text>
  </g>
</svg>`
}

export function buildBadgeSvg({ rate, date, variant }: BadgeInput, lang: Lang = 'fr'): string {
  return variant === 'round' ? roundSvg(rate, date, lang) : shieldSvg(rate, date, lang)
}

/** Snippet HTML autonome (SVG inliné en data URI) à coller sur le site du client. */
export function buildBadgeEmbedHtml(
  input: BadgeInput,
  reportUrl?: string,
  lang: Lang = 'fr',
): string {
  const svg = buildBadgeSvg(input, lang)
  const src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
  const alt = t(lang).embedAlt(Math.round(input.rate), fmtDate(input.date, lang))
  const img = `<img src="${src}" alt="${alt}" width="${input.variant === 'round' ? 72 : 186}" height="${input.variant === 'round' ? 72 : 42}" loading="lazy">`
  return reportUrl ? `<a href="${reportUrl}" title="${alt}">${img}</a>` : img
}

export function downloadBadgeSvg(
  input: BadgeInput,
  filename = 'badge-accessibilite.svg',
  lang: Lang = 'fr',
) {
  const blob = new Blob([buildBadgeSvg(input, lang)], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Export PNG (rendu du SVG sur canvas, échelle 2× pour la netteté). */
export async function downloadBadgePng(
  input: BadgeInput,
  filename = 'badge-accessibilite.png',
  lang: Lang = 'fr',
) {
  const svg = buildBadgeSvg(input, lang)
  const scale = 2
  const [w, h] = input.variant === 'round' ? [72, 72] : [186, 42]
  const img = new Image()
  img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })
  const canvas = document.createElement('canvas')
  canvas.width = w * scale
  canvas.height = h * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.drawImage(img, 0, 0, w * scale, h * scale)
  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}
