import type { Organization } from '@/lib/database.types'

export type PlanId = Organization['plan']

export type Plan = {
  id: PlanId
  name: string
  /** Prix affiché (les paiements ne sont pas encore actifs — contact commercial). */
  price: string
  period: string
  tagline: string
  maxSites: number
  scansPerMonth: number
  pagesPerScan: number
  features: string[]
  cta: string
  highlighted?: boolean
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Découverte',
    price: '0 €',
    period: 'pour toujours',
    tagline: 'Évaluez l’accessibilité de votre site en quelques minutes.',
    maxSites: 1,
    scansPerMonth: 5,
    pagesPerScan: Infinity,
    features: [
      '14 jours d’essai Pro inclus',
      '1 site surveillé',
      '5 audits par mois',
      'Pages analysées sans plafond par audit',
      '≈100 règles RGAA 4.1.2 / WCAG 2.2',
      'Rapport d’audit téléchargeable',
      'Déclaration d’accessibilité générée',
    ],
    cta: 'Commencer gratuitement',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '29 €',
    period: 'par mois',
    tagline: 'Pour les agences et les sites qui visent la conformité en continu.',
    maxSites: 10,
    scansPerMonth: 100,
    pagesPerScan: Infinity,
    features: [
      '10 sites surveillés',
      '100 audits par mois',
      'Pages analysées sans plafond par audit',
      'Surveillance hebdomadaire automatique',
      'Historique, scores par page et exports',
      'Support prioritaire par e-mail',
    ],
    cta: 'Passer au plan Pro',
    highlighted: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Accompagné',
    price: 'Sur devis',
    period: 'audit manuel inclus',
    tagline: 'Audit manuel RGAA complet et accompagnement vers la conformité opposable.',
    maxSites: Infinity,
    scansPerMonth: Infinity,
    pagesPerScan: Infinity,
    features: [
      'Sites et audits illimités',
      'Audit manuel RGAA par un expert',
      'Déclaration opposable (article 47)',
      'Plan de remédiation priorisé',
      'Formation de vos équipes',
    ],
    cta: 'Nous contacter',
  },
}

/** Début du mois courant, en ISO — borne de comptage des quotas mensuels. */
export function monthStartIso(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()
}

export function scansUsedThisMonth(
  scans: { created_at: string }[] | undefined,
  now = new Date(),
): number {
  if (!scans) return 0
  const start = monthStartIso(now)
  return scans.filter((s) => s.created_at >= start).length
}
