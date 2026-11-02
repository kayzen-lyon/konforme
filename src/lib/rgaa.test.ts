import { describe, expect, it } from 'vitest'
import { criterionForRule, RGAA_CRITERIA, RGAA_TOPICS } from './rgaa'
import { computeConformity } from './conformity'
import type { CriterionReview, ScanIssue } from './database.types'
import officialCriteria from '@/content/rgaa/criteres.json'

/** Nombre officiel de critères par thématique dans le RGAA 4.1. */
const OFFICIAL_COUNTS: Record<number, number> = {
  1: 9, 2: 2, 3: 3, 4: 13, 5: 8, 6: 2, 7: 5, 8: 10, 9: 4, 10: 14, 11: 13, 12: 11, 13: 12,
}

/** Les identifiants de règles émis par le moteur (functions/scan-site/src/main.js). */
const ENGINE_RULE_IDS = [
  'RGAA 1.1 / WCAG 1.1.1',
  'RGAA 1.3 / WCAG 1.1.1',
  'RGAA 8.3 / WCAG 3.1.1',
  'RGAA 8.5 / WCAG 2.4.2',
  'RGAA 9.1 / WCAG 1.3.1',
  'RGAA 11.1 / WCAG 3.3.2',
  'RGAA 11.10 / WCAG 3.3.2',
  'RGAA 6.2 / WCAG 2.4.4',
  'RGAA 6.1 / WCAG 2.4.4',
  'RGAA 11.9 / WCAG 4.1.2',
  'RGAA 8.2 / HTML valide',
  'RGAA 2.1 / WCAG 4.1.2',
  'RGAA 5.6 / WCAG 1.3.1',
  'RGAA 13.2 / WCAG 3.2.5',
  'RGAA 13.1 / WCAG 2.2.1',
  'WCAG 1.4.4 / Zoom',
  'RGAA 12.8 / WCAG 2.4.3',
  'RGAA 4.10 / WCAG 1.4.2',
  'RGAA 4.3 / WCAG 1.2.2',
  'RGAA 12.6 / Landmarks',
  'RGAA 12.7 / WCAG 2.4.1',
  'WCAG 4.1.2 / aria-hidden',
  'RGAA 11.6 / WCAG 1.3.1',
  'RGAA 10.1 / Présentation',
  'RGAA 6.1 / Lien-image',
  'RGAA 1.1 / WCAG 1.1.1 (area)',
  'RGAA 1.1 / WCAG 1.1.1 (input image)',
  'RGAA 1.1 / WCAG 1.1.1 (svg)',
  'RGAA 9.1 / WCAG 1.3.1 (titre vide)',
  'RGAA 11.1 / WCAG 3.3.2 (label orphelin)',
  'RGAA 7.3 / WCAG 2.1.1',
  'WCAG 3.2.2 / Formulaire',
  'RGAA 8.2 / Listes',
  'WCAG 1.4.10 / Viewport',
  'RGAA 1.3 / Alt trop long',
  'WCAG 1.3.5 / Autocomplete',
]

function issue(overrides: Partial<ScanIssue>): ScanIssue {
  return {
    id: 'i1',
    scan_id: 's1',
    rule_id: 'RGAA 1.1 / WCAG 1.1.1',
    severity: 'critical',
    category: 'Images',
    title: 'Image sans alternative textuelle',
    description: null,
    page_url: 'https://example.com/',
    selector: null,
    html_snippet: null,
    suggested_fix: null,
    status: 'open',
    created_at: '2026-07-01T00:00:00.000Z',
    ...overrides,
  } as ScanIssue
}

describe('référentiel RGAA 4.1.2', () => {
  it('contient exactement 106 critères', () => {
    expect(RGAA_CRITERIA).toHaveLength(106)
  })

  it('contient 13 thématiques avec le bon nombre de critères chacune', () => {
    expect(RGAA_TOPICS).toHaveLength(13)
    for (const topic of RGAA_TOPICS) {
      const count = RGAA_CRITERIA.filter((c) => c.topic === topic.id).length
      expect(count, `thématique ${topic.id} (${topic.name})`).toBe(OFFICIAL_COUNTS[topic.id])
    }
  })

  it('a des identifiants uniques et des explications vulgarisées partout', () => {
    const ids = new Set(RGAA_CRITERIA.map((c) => c.id))
    expect(ids.size).toBe(106)
    for (const c of RGAA_CRITERIA) {
      expect(c.plain.length, `critère ${c.id}`).toBeGreaterThan(40)
      expect(c.wcag.length, `critère ${c.id}`).toBeGreaterThan(0)
    }
  })

  it('associe chaque règle du moteur à un critère RGAA', () => {
    for (const ruleId of ENGINE_RULE_IDS) {
      expect(criterionForRule(ruleId), ruleId).not.toBeNull()
    }
  })

  it('associe la règle « RGAA 8.2 / Listes » au critère 9.3 (structure des listes)', () => {
    expect(criterionForRule('RGAA 8.2 / Listes')?.id).toBe('9.3')
  })

  it('associe les règles axe connues et ignore les inconnues sans planter', () => {
    expect(criterionForRule('axe:td-headers-attr')?.id).toBe('5.7')
    expect(criterionForRule('axe:definition-list')?.id).toBe('9.3')
    expect(criterionForRule('axe:une-regle-inconnue')).toBeNull()
  })

  it('correspond exactement au référentiel officiel de la DINUM (criteres.json)', () => {
    type OfficialTopic = { number: number; topic: string; criteria: { criterium: { number: number } }[] }
    const topics = (officialCriteria as { topics: OfficialTopic[] }).topics
    const officialIds = topics.flatMap((t) => t.criteria.map((c) => `${t.number}.${c.criterium.number}`))
    expect(officialIds).toHaveLength(106)
    expect(RGAA_CRITERIA.map((c) => c.id).sort()).toEqual([...officialIds].sort())
  })
})

describe('computeConformity', () => {
  it('classe non conforme un critère avec une issue ouverte', () => {
    const summary = computeConformity([issue({})])
    const c11 = summary.results.find((r) => r.criterion.id === '1.1')!
    expect(c11.status).toBe('non_conforme')
    expect(summary.nonConformes).toBe(1)
  })

  it('repasse le critère en validé quand toutes ses issues sont traitées', () => {
    const summary = computeConformity([issue({ status: 'fixed' })])
    expect(summary.results.find((r) => r.criterion.id === '1.1')!.status).toBe('ok')
    expect(summary.nonConformes).toBe(0)
  })

  it('classe à vérifier les critères non automatisables', () => {
    const summary = computeConformity([])
    expect(summary.results.find((r) => r.criterion.id === '3.2')!.status).toBe('a_verifier')
    expect(summary.aVerifier).toBeGreaterThan(50)
  })

  it('ne déclare pas conformes les critères seulement partiellement automatisés', () => {
    const summary = computeConformity([])
    expect(summary.results.find((r) => r.criterion.id === '1.2')!.status).toBe('a_verifier')
    expect(summary.results.find((r) => r.criterion.id === '2.2')!.status).toBe('a_verifier')
  })

  it('garde à vérifier un critère partiel même si une alerte est résolue', () => {
    const summary = computeConformity([
      issue({ rule_id: 'RGAA 1.2 / WCAG 1.1.1', status: 'fixed' }),
    ])
    expect(summary.results.find((r) => r.criterion.id === '1.2')!.status).toBe('a_verifier')
  })

  it('restreint l’analyse à une page quand pageUrl est fourni', () => {
    const issues = [
      issue({ page_url: 'https://example.com/a' }),
      issue({ id: 'i2', rule_id: 'RGAA 2.1 / WCAG 4.1.2', page_url: 'https://example.com/b' }),
    ]
    const summary = computeConformity(issues, 'https://example.com/a')
    expect(summary.results.find((r) => r.criterion.id === '1.1')!.status).toBe('non_conforme')
    expect(summary.results.find((r) => r.criterion.id === '2.1')!.status).toBe('ok')
  })

  it('calcule le taux sur les seuls critères testés', () => {
    const summary = computeConformity([])
    expect(summary.rate).toBe(100)
    expect(summary.tested).toBe(summary.ok)
  })

  it('applique les évaluations manuelles selon la méthode officielle', () => {
    const review = (criterionId: string, status: CriterionReview['status']): CriterionReview => ({
      id: `r-${criterionId}`,
      site_id: 'site1',
      organization_id: 'team1',
      criterion_id: criterionId,
      status,
      note: null,
      reviewed_at: '2026-07-01T00:00:00.000Z',
      created_at: '2026-07-01T00:00:00.000Z',
    })
    const summary = computeConformity([], undefined, [
      review('3.2', 'conforme'),
      review('4.1', 'non_conforme'),
      review('13.7', 'non_applicable'),
    ])
    expect(summary.results.find((r) => r.criterion.id === '3.2')!.status).toBe('ok')
    expect(summary.results.find((r) => r.criterion.id === '4.1')!.status).toBe('non_conforme')
    expect(summary.results.find((r) => r.criterion.id === '13.7')!.status).toBe('non_applicable')
    // Le taux exclut les non-applicables : conformes / (conformes + NC)
    expect(summary.rate).toBe(Math.round((summary.ok / (summary.ok + 1)) * 1000) / 10)
  })

  it('fait primer une non-conformité machine sur un verdict manuel « conforme »', () => {
    const summary = computeConformity([issue({})], undefined, [
      {
        id: 'r1', site_id: 's', organization_id: 't', criterion_id: '1.1',
        status: 'conforme', note: null,
        reviewed_at: '2026-07-01T00:00:00.000Z', created_at: '2026-07-01T00:00:00.000Z',
      },
    ])
    expect(summary.results.find((r) => r.criterion.id === '1.1')!.status).toBe('non_conforme')
  })
})
