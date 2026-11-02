import type { Lang } from '@/i18n'
import type { CriterionReview, ScanIssue } from '@/lib/database.types'
import { criterionForRule, RGAA_CRITERIA, RGAA_TOPICS, type RgaaCriterion } from '@/lib/rgaa'

/**
 * Statut d'un critère RGAA, selon la méthode officielle
 * (https://accessibilite.numerique.gouv.fr/methode/) :
 *  - `non_conforme`   : au moins une non-conformité ouverte détectée par le
 *                       moteur, ou verdict manuel « non conforme » ;
 *  - `ok`             : conforme — aucune non-conformité détectée sur un
 *                       critère entièrement automatisable, ou verdict
 *                       manuel « conforme » ;
 *  - `non_applicable` : verdict manuel « non applicable » (exclu du taux) ;
 *  - `a_verifier`     : critère non automatisable, pas encore évalué
 *                       manuellement.
 *
 * Le taux de conformité suit la règle officielle :
 * conformes / (conformes + non conformes), les non-applicables étant exclus.
 */
export type CriterionStatus = 'ok' | 'non_conforme' | 'non_applicable' | 'a_verifier'

export type CriterionResult = {
  criterion: RgaaCriterion
  status: CriterionStatus
  /** Non-conformités ouvertes ou en cours rattachées au critère. */
  openIssues: ScanIssue[]
  /** Non-conformités traitées (corrigées / faux positifs). */
  resolvedIssues: ScanIssue[]
  /** Évaluation manuelle enregistrée pour ce critère, le cas échéant. */
  review: CriterionReview | null
}

export type TopicSummary = {
  topic: (typeof RGAA_TOPICS)[number]
  results: CriterionResult[]
  nonConformes: number
  ok: number
  aVerifier: number
  nonApplicables: number
}

export type ConformitySummary = {
  topics: TopicSummary[]
  results: CriterionResult[]
  /** Critères avec un verdict (auto ou manuel) : ok + non conformes. */
  tested: number
  nonConformes: number
  ok: number
  aVerifier: number
  nonApplicables: number
  /**
   * Taux de conformité officiel : ok / (ok + non conformes), en %.
   * `null` si aucun critère n'a de verdict.
   */
  rate: number | null
}

function isOpen(issue: ScanIssue): boolean {
  return issue.status === 'open' || issue.status === 'in_progress'
}

/**
 * Calcule le statut des 106 critères RGAA à partir des issues d'un scan et
 * des évaluations manuelles du site. Passer `pageUrl` pour restreindre les
 * issues à une page (les évaluations manuelles restent valables site entier).
 *
 * Priorités par critère :
 *  1. des non-conformités machine ouvertes → non conforme (l'évaluation
 *     manuelle ne peut pas contredire un constat outillé : corrigez ou
 *     marquez l'issue en faux positif) ;
 *  2. verdict manuel (conforme / non conforme / non applicable) ;
 *  3. critère entièrement automatisable sans non-conformité → conforme ;
 *  4. critère partiellement automatisable ou manuel sans revue → à vérifier.
 */
export function computeConformity(
  issues: ScanIssue[],
  pageUrl?: string,
  reviews?: CriterionReview[],
): ConformitySummary {
  const scoped = pageUrl ? issues.filter((i) => i.page_url === pageUrl) : issues

  const byCriterion = new Map<string, { open: ScanIssue[]; resolved: ScanIssue[] }>()
  for (const issue of scoped) {
    const criterion = criterionForRule(issue.rule_id)
    if (!criterion) continue
    let entry = byCriterion.get(criterion.id)
    if (!entry) {
      entry = { open: [], resolved: [] }
      byCriterion.set(criterion.id, entry)
    }
    if (isOpen(issue)) entry.open.push(issue)
    else entry.resolved.push(issue)
  }

  const reviewByCriterion = new Map<string, CriterionReview>()
  for (const r of reviews ?? []) reviewByCriterion.set(r.criterion_id, r)

  const results: CriterionResult[] = RGAA_CRITERIA.map((criterion) => {
    const entry = byCriterion.get(criterion.id)
    const openIssues = entry?.open ?? []
    const resolvedIssues = entry?.resolved ?? []
    const review = reviewByCriterion.get(criterion.id) ?? null
    let status: CriterionStatus
    if (openIssues.length > 0) status = 'non_conforme'
    else if (review) {
      status =
        review.status === 'conforme' ? 'ok' : review.status === 'non_conforme' ? 'non_conforme' : 'non_applicable'
    } else if (criterion.coverage === 'auto') status = 'ok'
    else status = 'a_verifier'
    return { criterion, status, openIssues, resolvedIssues, review }
  })

  const count = (list: CriterionResult[], status: CriterionStatus) =>
    list.filter((r) => r.status === status).length

  const topics: TopicSummary[] = RGAA_TOPICS.map((topic) => {
    const topicResults = results.filter((r) => r.criterion.topic === topic.id)
    return {
      topic,
      results: topicResults,
      nonConformes: count(topicResults, 'non_conforme'),
      ok: count(topicResults, 'ok'),
      aVerifier: count(topicResults, 'a_verifier'),
      nonApplicables: count(topicResults, 'non_applicable'),
    }
  })

  const nonConformes = count(results, 'non_conforme')
  const ok = count(results, 'ok')
  const aVerifier = count(results, 'a_verifier')
  const nonApplicables = count(results, 'non_applicable')
  const tested = ok + nonConformes

  return {
    topics,
    results,
    tested,
    nonConformes,
    ok,
    aVerifier,
    nonApplicables,
    rate: tested > 0 ? Math.round((ok / tested) * 1000) / 10 : null,
  }
}

export const CRITERION_STATUS_META: Record<
  CriterionStatus,
  { label: string; shortLabel: string; className: string }
> = {
  ok: {
    label: 'Conforme',
    shortLabel: 'Conforme',
    className: 'bg-success-bg/60 text-success-soft border-success/40',
  },
  non_conforme: {
    label: 'Non conforme',
    shortLabel: 'Non conforme',
    className: 'bg-danger-bg/60 text-danger-soft border-danger/40',
  },
  non_applicable: {
    label: 'Non applicable',
    shortLabel: 'Non applicable',
    className: 'bg-raise text-text-muted border-border-strong',
  },
  a_verifier: {
    label: 'À vérifier manuellement',
    shortLabel: 'À vérifier',
    className: 'bg-warning-bg/60 text-warning-soft border-warning/40',
  },
}

/* ------------------------------------------------------------------ */
/* Libellés localisés (les *_META restent en français pour les exports) */
/* ------------------------------------------------------------------ */

const CRITERION_STATUS_L10N: Record<Lang, Record<CriterionStatus, { label: string; shortLabel: string }>> = {
  fr: {
    ok: { label: 'Conforme', shortLabel: 'Conforme' },
    non_conforme: { label: 'Non conforme', shortLabel: 'Non conforme' },
    non_applicable: { label: 'Non applicable', shortLabel: 'Non applicable' },
    a_verifier: { label: 'À vérifier manuellement', shortLabel: 'À vérifier' },
  },
  en: {
    ok: { label: 'Compliant', shortLabel: 'Compliant' },
    non_conforme: { label: 'Non-compliant', shortLabel: 'Non-compliant' },
    non_applicable: { label: 'Not applicable', shortLabel: 'Not applicable' },
    a_verifier: { label: 'Manual check required', shortLabel: 'To check' },
  },
  de: {
    ok: { label: 'Konform', shortLabel: 'Konform' },
    non_conforme: { label: 'Nicht konform', shortLabel: 'Nicht konform' },
    non_applicable: { label: 'Nicht anwendbar', shortLabel: 'Nicht anwendbar' },
    a_verifier: { label: 'Manuelle Prüfung erforderlich', shortLabel: 'Zu prüfen' },
  },
  es: {
    ok: { label: 'Conforme', shortLabel: 'Conforme' },
    non_conforme: { label: 'No conforme', shortLabel: 'No conforme' },
    non_applicable: { label: 'No aplicable', shortLabel: 'No aplicable' },
    a_verifier: { label: 'Requiere verificación manual', shortLabel: 'Por verificar' },
  },
  it: {
    ok: { label: 'Conforme', shortLabel: 'Conforme' },
    non_conforme: { label: 'Non conforme', shortLabel: 'Non conforme' },
    non_applicable: { label: 'Non applicabile', shortLabel: 'Non applicabile' },
    a_verifier: { label: 'Richiede verifica manuale', shortLabel: 'Da verificare' },
  },
}

const COVERAGE_L10N: Record<Lang, Record<RgaaCriterion['coverage'], string>> = {
  fr: {
    auto: 'Testé automatiquement',
    partial: 'Testé partiellement (compléter par une revue manuelle)',
    manual: 'Nécessite une vérification humaine',
  },
  en: {
    auto: 'Tested automatically',
    partial: 'Partially tested (complete with a manual review)',
    manual: 'Requires a human check',
  },
  de: {
    auto: 'Automatisch geprüft',
    partial: 'Teilweise geprüft (durch manuelle Prüfung ergänzen)',
    manual: 'Erfordert eine manuelle Prüfung',
  },
  es: {
    auto: 'Comprobado automáticamente',
    partial: 'Comprobado parcialmente (complete con una revisión manual)',
    manual: 'Requiere una verificación humana',
  },
  it: {
    auto: 'Verificato automaticamente',
    partial: 'Verificato parzialmente (da completare con una revisione manuale)',
    manual: 'Richiede una verifica umana',
  },
}

export function criterionStatusL10n(
  lang: Lang,
  status: CriterionStatus,
): { label: string; shortLabel: string } {
  return (CRITERION_STATUS_L10N[lang] ?? CRITERION_STATUS_L10N.fr)[status]
}

export function coverageLabel(lang: Lang, coverage: RgaaCriterion['coverage']): string {
  return (COVERAGE_L10N[lang] ?? COVERAGE_L10N.fr)[coverage]
}

export const COVERAGE_META: Record<RgaaCriterion['coverage'], string> = {
  auto: 'Testé automatiquement',
  partial: 'Testé partiellement (compléter par une revue manuelle)',
  manual: 'Nécessite une vérification humaine',
}
