/* eslint-disable react-refresh/only-export-components -- constantes SEO co-localisées volontairement */
import { alternatesFor, localizePath, useLang } from '@/i18n'

const SITE_URL = 'https://konforme.kayzen-lyon.com'
const SITE_NAME = 'Konforme'

type JsonLd = Record<string, unknown>

type SeoProps = {
  /** Titre de la page (le suffixe « — Konforme » est ajouté automatiquement). */
  title: string
  description: string
  /** Chemin canonique, ex. « /rgaa ». */
  path: string
  type?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: JsonLd[]
  /** Langue de la page (défaut fr). */
  lang?: string
  /** Versions linguistiques alternatives : hrefLang → chemin. */
  alternates?: Record<string, string>
  /**
   * Page publique disponible dans les 5 langues : canonical préfixé selon la
   * langue courante + hreflang automatiques (`path` reste le chemin non préfixé).
   */
  localized?: boolean
}

/**
 * Métadonnées par route. React 19 hisse nativement <title>, <meta> et <link>
 * dans le <head> du document.
 */
export function Seo({ title, description, path, type = 'website', noindex, jsonLd, lang, alternates, localized }: SeoProps) {
  const currentLang = useLang()
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`
  const effectiveLang = lang ?? (localized ? currentLang : undefined)
  const effectivePath = localized ? localizePath(currentLang, path) : path
  const effectiveAlternates = alternates ?? (localized ? alternatesFor(path) : undefined)
  const url = `${SITE_URL}${effectivePath === '/' ? '' : effectivePath}`
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {effectiveLang && <meta property="og:locale" content={effectiveLang} />}
      {effectiveAlternates &&
        Object.entries(effectiveAlternates).map(([hrefLang, p]) => (
          <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={`${SITE_URL}${p === '/' ? '' : p}`} />
        ))}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      {jsonLd?.map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
        />
      ))}
    </>
  )
}

export const ORGANIZATION_JSONLD: JsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Konforme',
  legalName: 'KAYZEN',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  email: 'contact@kayzen-lyon.fr',
  telephone: '+33487776861',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '6 rue Pierre Termier',
    postalCode: '69009',
    addressLocality: 'Lyon',
    addressCountry: 'FR',
  },
}

export const SOFTWARE_JSONLD: JsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Konforme',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: SITE_URL,
  description:
    "Plateforme SaaS d'audit d'accessibilité web : conformité RGAA 4.1.2 et WCAG 2.2, corrections assistées par IA, déclaration d'accessibilité automatique.",
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR', description: 'Audit gratuit' },
  publisher: { '@type': 'Organization', name: 'KAYZEN' },
}

export { SITE_URL }
