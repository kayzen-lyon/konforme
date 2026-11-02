import type { Lang } from '@/i18n'
import { PLANS, type PlanId } from '@/lib/plans'

/**
 * Traductions des libellés des plans (définis en français dans src/lib/plans.ts).
 * Repli systématique sur les valeurs françaises de PLANS si une clé manque.
 */

type PlanL10n = {
  name: string
  price: string
  period: string
  tagline: string
  features: string[]
  cta: string
}

const PLAN_L10N: Partial<Record<Exclude<Lang, 'fr'>, Record<PlanId, PlanL10n>>> = {
  en: {
    free: {
      name: 'Starter',
      price: '€0',
      period: 'forever',
      tagline: "Assess your website's accessibility in a few minutes.",
      features: [
        '14-day Pro trial included',
        '1 monitored site',
        '5 audits per month',
        '30 pages analysed per audit',
        '≈100 RGAA 4.1.2 / WCAG 2.2 rules',
        'Downloadable audit report',
        'Accessibility statement generated',
      ],
      cta: 'Start for free',
    },
    pro: {
      name: 'Pro',
      price: '€29',
      period: 'per month',
      tagline: 'For agencies and websites aiming for continuous compliance.',
      features: [
        '10 monitored sites',
        '100 audits per month',
        '30 pages analysed per audit',
        'Automatic weekly monitoring',
        'History, per-page scores and exports',
        'Priority email support',
      ],
      cta: 'Upgrade to Pro',
    },
    enterprise: {
      name: 'Guided',
      price: 'Custom quote',
      period: 'manual audit included',
      tagline: 'Full manual RGAA audit and expert guidance towards legally binding compliance.',
      features: [
        'Unlimited sites and audits',
        'Manual RGAA audit by an expert',
        'Legally binding statement (Article 47)',
        'Prioritised remediation plan',
        'Training for your teams',
      ],
      cta: 'Contact us',
    },
  },
  de: {
    free: {
      name: 'Einstieg',
      price: '0 €',
      period: 'für immer',
      tagline: 'Bewerten Sie die Barrierefreiheit Ihrer Website in wenigen Minuten.',
      features: [
        '14 Tage Pro-Testphase inklusive',
        '1 überwachte Website',
        '5 Audits pro Monat',
        '30 analysierte Seiten pro Audit',
        '≈100 Regeln nach RGAA 4.1.2 / WCAG 2.2',
        'Audit-Bericht zum Herunterladen',
        'Generierte Barrierefreiheitserklärung',
      ],
      cta: 'Kostenlos starten',
    },
    pro: {
      name: 'Pro',
      price: '29 €',
      period: 'pro Monat',
      tagline: 'Für Agenturen und Websites, die dauerhafte Konformität anstreben.',
      features: [
        '10 überwachte Websites',
        '100 Audits pro Monat',
        '30 analysierte Seiten pro Audit',
        'Automatische wöchentliche Überwachung',
        'Verlauf, Scores pro Seite und Exporte',
        'Bevorzugter E-Mail-Support',
      ],
      cta: 'Auf Pro upgraden',
    },
    enterprise: {
      name: 'Begleitet',
      price: 'Auf Anfrage',
      period: 'manuelles Audit inklusive',
      tagline: 'Vollständiges manuelles RGAA-Audit und Begleitung zur rechtsverbindlichen Konformität.',
      features: [
        'Unbegrenzte Websites und Audits',
        'Manuelles RGAA-Audit durch einen Experten',
        'Rechtsverbindliche Erklärung (Artikel 47)',
        'Priorisierter Maßnahmenplan',
        'Schulung Ihrer Teams',
      ],
      cta: 'Kontaktieren Sie uns',
    },
  },
  es: {
    free: {
      name: 'Inicial',
      price: '0 €',
      period: 'para siempre',
      tagline: 'Evalúe la accesibilidad de su sitio en unos minutos.',
      features: [
        '14 días de prueba Pro incluidos',
        '1 sitio supervisado',
        '5 auditorías al mes',
        '30 páginas analizadas por auditoría',
        '≈100 reglas RGAA 4.1.2 / WCAG 2.2',
        'Informe de auditoría descargable',
        'Declaración de accesibilidad generada',
      ],
      cta: 'Empiece gratis',
    },
    pro: {
      name: 'Pro',
      price: '29 €',
      period: 'al mes',
      tagline: 'Para agencias y sitios que buscan la conformidad continua.',
      features: [
        '10 sitios supervisados',
        '100 auditorías al mes',
        '30 páginas analizadas por auditoría',
        'Supervisión semanal automática',
        'Historial, puntuaciones por página y exportaciones',
        'Soporte prioritario por correo electrónico',
      ],
      cta: 'Pasar al plan Pro',
    },
    enterprise: {
      name: 'Acompañado',
      price: 'Bajo presupuesto',
      period: 'auditoría manual incluida',
      tagline: 'Auditoría manual RGAA completa y acompañamiento hacia la conformidad oponible.',
      features: [
        'Sitios y auditorías ilimitados',
        'Auditoría manual RGAA por un experto',
        'Declaración oponible (artículo 47)',
        'Plan de corrección priorizado',
        'Formación para sus equipos',
      ],
      cta: 'Contáctenos',
    },
  },
  it: {
    free: {
      name: 'Base',
      price: '0 €',
      period: 'per sempre',
      tagline: "Valuti l'accessibilità del suo sito in pochi minuti.",
      features: [
        '14 giorni di prova Pro inclusi',
        '1 sito monitorato',
        '5 audit al mese',
        '30 pagine analizzate per audit',
        '≈100 regole RGAA 4.1.2 / WCAG 2.2',
        'Report di audit scaricabile',
        'Dichiarazione di accessibilità generata',
      ],
      cta: 'Inizi gratuitamente',
    },
    pro: {
      name: 'Pro',
      price: '29 €',
      period: 'al mese',
      tagline: 'Per agenzie e siti che puntano alla conformità continua.',
      features: [
        '10 siti monitorati',
        '100 audit al mese',
        '30 pagine analizzate per audit',
        'Monitoraggio settimanale automatico',
        'Cronologia, punteggi per pagina ed esportazioni',
        'Supporto prioritario via e-mail',
      ],
      cta: 'Passi al piano Pro',
    },
    enterprise: {
      name: 'Assistito',
      price: 'Su preventivo',
      period: 'audit manuale incluso',
      tagline: 'Audit manuale RGAA completo e accompagnamento verso la conformità con valore legale.',
      features: [
        'Siti e audit illimitati',
        'Audit manuale RGAA a cura di un esperto',
        'Dichiarazione con valore legale (articolo 47)',
        'Piano di correzione prioritizzato',
        'Formazione dei suoi team',
      ],
      cta: 'Ci contatti',
    },
  },
}

function l10n(lang: Lang, planId: PlanId): PlanL10n | null {
  if (lang === 'fr') return null
  return PLAN_L10N[lang]?.[planId] ?? null
}

export function planName(lang: Lang, planId: PlanId): string {
  return l10n(lang, planId)?.name ?? PLANS[planId].name
}

export function planPrice(lang: Lang, planId: PlanId): string {
  return l10n(lang, planId)?.price ?? PLANS[planId].price
}

export function planPeriod(lang: Lang, planId: PlanId): string {
  return l10n(lang, planId)?.period ?? PLANS[planId].period
}

export function planTagline(lang: Lang, planId: PlanId): string {
  return l10n(lang, planId)?.tagline ?? PLANS[planId].tagline
}

export function planFeatures(lang: Lang, planId: PlanId): string[] {
  return l10n(lang, planId)?.features ?? PLANS[planId].features
}

export function planCta(lang: Lang, planId: PlanId): string {
  return l10n(lang, planId)?.cta ?? PLANS[planId].cta
}
