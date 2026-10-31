/* Génère public/sitemap.xml : toutes les pages publiques dans les 5 langues
 * (fr à la racine, en/de/es/it préfixées), avec les liens alternates hreflang.
 * Usage : node scripts/generate-sitemap.cjs */
const fs = require('node:fs')
const path = require('node:path')

const SITE_URL = 'https://konforme.kayzen-lyon.com'
const TODAY = new Date().toISOString().slice(0, 10)
const LANGS = ['fr', 'en', 'de', 'es', 'it']

// Ids des 106 critères RGAA 4.1.2 (thématique → nombre de critères)
const TOPIC_COUNTS = { 1: 9, 2: 2, 3: 3, 4: 13, 5: 8, 6: 2, 7: 5, 8: 10, 9: 4, 10: 14, 11: 13, 12: 11, 13: 12 }
const criterionIds = Object.entries(TOPIC_COUNTS).flatMap(([topic, count]) =>
  Array.from({ length: count }, (_, i) => `${topic}.${i + 1}`),
)

/** Chemins non préfixés (la version française). */
const PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/rgaa', priority: '0.9', changefreq: 'monthly' },
  { path: '/guide-accessibilite', priority: '0.9', changefreq: 'monthly' },
  { path: '/glossaire', priority: '0.8', changefreq: 'monthly' },
  { path: '/developpeurs', priority: '0.8', changefreq: 'monthly' },
  { path: '/tarifs', priority: '0.9', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/european-accessibility-act-2025-obligations', priority: '0.7' },
  { path: '/blog/rgaa-vs-wcag-differences', priority: '0.7' },
  { path: '/blog/10-erreurs-accessibilite-les-plus-courantes', priority: '0.7' },
  { path: '/a-propos', priority: '0.6' },
  { path: '/contact', priority: '0.6' },
  { path: '/accessibilite', priority: '0.4' },
  { path: '/legal/mentions-legales', priority: '0.3' },
  { path: '/legal/cgu', priority: '0.3' },
  { path: '/legal/cgv', priority: '0.3' },
  { path: '/legal/confidentialite', priority: '0.3' },
  { path: '/legal/rgpd', priority: '0.3' },
  { path: '/legal/cookies', priority: '0.3' },
  ...criterionIds.map((id) => ({ path: `/rgaa/critere/${id}`, priority: '0.7', changefreq: 'monthly' })),
]

/** Le français reste à la racine, les autres langues sont préfixées. */
function localize(lang, p) {
  if (lang === 'fr') return p
  return p === '/' ? `/${lang}` : `/${lang}${p}`
}

function loc(p) {
  return `${SITE_URL}${p === '/' ? '/' : p}`
}

const entries = []
for (const page of PAGES) {
  for (const lang of LANGS) {
    const alternates = LANGS.map(
      (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${loc(localize(l, page.path))}"/>`,
    )
    alternates.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${loc(page.path)}"/>`)
    entries.push(`  <url>
    <loc>${loc(localize(lang, page.path))}</loc>
    <lastmod>${TODAY}</lastmod>${page.changefreq ? `\n    <changefreq>${page.changefreq}</changefreq>` : ''}
    <priority>${page.priority}</priority>
${alternates.join('\n')}
  </url>`)
  }
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`

fs.writeFileSync(path.join(__dirname, '..', 'public', 'sitemap.xml'), xml, 'utf8')
console.log(
  `sitemap.xml généré : ${entries.length} URL (${PAGES.length} pages × ${LANGS.length} langues, dont ${criterionIds.length} fiches critères)`,
)
