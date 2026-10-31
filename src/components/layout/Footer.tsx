import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    product: 'Produit',
    company: 'Entreprise',
    legal: 'Légal',
    home: 'Accueil',
    dashboard: 'Tableau de bord',
    blog: 'Blog',
    rgaa: 'RGAA',
    guide: 'Guide EAA / RGAA',
    glossary: 'Glossaire RGAA',
    developers: 'API & CI (développeurs)',
    about: 'À propos',
    contact: 'Contact',
    statement: "Déclaration d'accessibilité",
    legalNotice: 'Mentions légales',
    terms: 'CGU',
    sales: 'CGV',
    privacy: 'Confidentialité',
    gdpr: 'RGPD',
    cookies: 'Cookies',
    tagline:
      "Plateforme d'accessibilité web RGAA 4.1.2 & WCAG 2.2 automatisée par IA. Édité par KAYZEN.",
    rights: (year: number) => `© ${year} KAYZEN — Tous droits réservés.`,
    vat: 'TVA non applicable, art. L. 233-3 du CIBS',
    madeBy: 'Fièrement réalisé par',
  },
  en: {
    product: 'Product',
    company: 'Company',
    legal: 'Legal',
    home: 'Home',
    dashboard: 'Dashboard',
    blog: 'Blog',
    rgaa: 'RGAA',
    guide: 'EAA / RGAA guide',
    glossary: 'RGAA glossary',
    developers: 'API & CI (developers)',
    about: 'About',
    contact: 'Contact',
    statement: 'Accessibility statement',
    legalNotice: 'Legal notice',
    terms: 'Terms of use',
    sales: 'Terms of sale',
    privacy: 'Privacy',
    gdpr: 'GDPR',
    cookies: 'Cookies',
    tagline:
      'AI-automated web accessibility platform for RGAA 4.1.2 & WCAG 2.2. Published by KAYZEN.',
    rights: (year: number) => `© ${year} KAYZEN — All rights reserved.`,
    vat: 'VAT not applicable, art. L. 233-3 of the French CIBS',
    madeBy: 'Proudly built by',
  },
  de: {
    product: 'Produkt',
    company: 'Unternehmen',
    legal: 'Rechtliches',
    home: 'Startseite',
    dashboard: 'Dashboard',
    blog: 'Blog',
    rgaa: 'RGAA',
    guide: 'EAA-/RGAA-Leitfaden',
    glossary: 'RGAA-Glossar',
    developers: 'API & CI (für Entwickler)',
    about: 'Über uns',
    contact: 'Kontakt',
    statement: 'Erklärung zur Barrierefreiheit',
    legalNotice: 'Impressum',
    terms: 'Nutzungsbedingungen',
    sales: 'Verkaufsbedingungen',
    privacy: 'Datenschutz',
    gdpr: 'DSGVO',
    cookies: 'Cookies',
    tagline:
      'KI-automatisierte Plattform für digitale Barrierefreiheit nach RGAA 4.1.2 & WCAG 2.2. Herausgegeben von KAYZEN.',
    rights: (year: number) => `© ${year} KAYZEN — Alle Rechte vorbehalten.`,
    vat: 'Keine Umsatzsteuer gemäß Art. L. 233-3 des französischen CIBS',
    madeBy: 'Mit Sorgfalt umgesetzt von',
  },
  es: {
    product: 'Producto',
    company: 'Empresa',
    legal: 'Legal',
    home: 'Inicio',
    dashboard: 'Panel de control',
    blog: 'Blog',
    rgaa: 'RGAA',
    guide: 'Guía EAA / RGAA',
    glossary: 'Glosario RGAA',
    developers: 'API y CI (desarrolladores)',
    about: 'Quiénes somos',
    contact: 'Contacto',
    statement: 'Declaración de accesibilidad',
    legalNotice: 'Aviso legal',
    terms: 'Condiciones de uso',
    sales: 'Condiciones de venta',
    privacy: 'Privacidad',
    gdpr: 'RGPD',
    cookies: 'Cookies',
    tagline:
      'Plataforma de accesibilidad web RGAA 4.1.2 y WCAG 2.2 automatizada con IA. Editada por KAYZEN.',
    rights: (year: number) => `© ${year} KAYZEN — Todos los derechos reservados.`,
    vat: 'IVA no aplicable, art. L. 233-3 del CIBS francés',
    madeBy: 'Desarrollado con orgullo por',
  },
  it: {
    product: 'Prodotto',
    company: 'Azienda',
    legal: 'Note legali',
    home: 'Home',
    dashboard: 'Dashboard',
    blog: 'Blog',
    rgaa: 'RGAA',
    guide: 'Guida EAA / RGAA',
    glossary: 'Glossario RGAA',
    developers: 'API e CI (sviluppatori)',
    about: 'Chi siamo',
    contact: 'Contatti',
    statement: 'Dichiarazione di accessibilità',
    legalNotice: 'Note legali',
    terms: 'Condizioni d’uso',
    sales: 'Condizioni di vendita',
    privacy: 'Privacy',
    gdpr: 'GDPR',
    cookies: 'Cookie',
    tagline:
      'Piattaforma di accessibilità web RGAA 4.1.2 e WCAG 2.2 automatizzata con IA. Edita da KAYZEN.',
    rights: (year: number) => `© ${year} KAYZEN — Tutti i diritti riservati.`,
    vat: 'IVA non applicabile, art. L. 233-3 del CIBS francese',
    madeBy: 'Realizzato con cura da',
  },
})

export function Footer() {
  const t = useMessages(L)
  const lang = useLang()

  const SECTIONS = [
    {
      title: t.product,
      links: [
        { to: '/', label: t.home },
        { to: '/dashboard', label: t.dashboard },
        { to: '/blog', label: t.blog },
        { to: '/rgaa', label: t.rgaa },
        { to: '/guide-accessibilite', label: t.guide },
        { to: '/glossaire', label: t.glossary },
        { to: '/developpeurs', label: t.developers },
      ],
    },
    {
      title: t.company,
      links: [
        { to: '/a-propos', label: t.about },
        { to: '/contact', label: t.contact },
        { to: '/accessibilite', label: t.statement },
      ],
    },
    {
      title: t.legal,
      links: [
        { to: '/legal/mentions-legales', label: t.legalNotice },
        { to: '/legal/cgu', label: t.terms },
        { to: '/legal/cgv', label: t.sales },
        { to: '/legal/confidentialite', label: t.privacy },
        { to: '/legal/rgpd', label: t.gdpr },
        { to: '/legal/cookies', label: t.cookies },
      ],
    },
  ]

  return (
    <footer className="mt-24 bg-navy text-on-navy" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo onDark />
            <p className="mt-4 text-sm text-white/75 max-w-xs leading-relaxed">
              {t.tagline}
            </p>
            <p className="mt-4 text-xs text-white/70">
              6 rue Pierre Termier, 69009 Lyon
              <br />
              SIREN 493 857 262 — {t.vat}
            </p>
          </div>
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h3 className="font-display text-xs font-bold uppercase tracking-[0.16em] text-gold mb-4">
                {s.title}
              </h3>
              <ul className="space-y-2.5">
                {s.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to.startsWith('/dashboard') ? l.to : localizePath(lang, l.to)}
                      className="text-sm text-white/75 hover:text-white hover:underline underline-offset-4"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/70 md:flex-row md:items-center md:justify-between">
          <p>{t.rights(new Date().getFullYear())}</p>
          <p>
            {t.madeBy}{' '}
            <a href="https://www.kayzen-lyon.com" rel="noopener" target="_blank" className="font-semibold text-gold hover:underline">
              Kayzen Web
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
