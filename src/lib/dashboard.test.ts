import { describe, expect, it } from 'vitest'
import type { Alert, Scan, Site } from '@/lib/database.types'
import { buildPriorities, buildSiteHealth, sitesToCsv, summarize, topRecurringIssues } from '@/lib/dashboard'

const NOW = Date.parse('2026-11-02T12:00:00Z')
const site = (id: string, name = id): Site =>
  ({ id, name, url: `https://${id}.fr`, organization_id: 'o' }) as Site
const scan = (p: Partial<Scan>): Scan =>
  ({ status: 'done', score: 80, pages_count: 3, issues_count: 4, created_at: '2026-11-01T10:00:00Z', ...p }) as Scan

describe('buildSiteHealth', () => {
  it('calcule l’évolution entre les deux derniers audits terminés', () => {
    const [h] = buildSiteHealth(
      [site('a')],
      [
        scan({ id: '1', site_id: 'a', score: 60, created_at: '2026-10-20T00:00:00Z' }),
        scan({ id: '2', site_id: 'a', score: 72.5, created_at: '2026-11-01T00:00:00Z' }),
      ],
      NOW,
    )
    expect(h.delta).toBe(12.5)
    expect(h.state).toBe('ok')
  })

  it('classe les états', () => {
    const health = buildSiteHealth(
      [site('never'), site('fail'), site('run'), site('low'), site('old'), site('ok')],
      [
        scan({ id: '1', site_id: 'fail', status: 'failed', score: null }),
        scan({ id: '2', site_id: 'run', status: 'running', score: null }),
        scan({ id: '3', site_id: 'low', score: 30 }),
        scan({ id: '4', site_id: 'old', score: 90, created_at: '2026-09-01T00:00:00Z' }),
        scan({ id: '5', site_id: 'ok' }),
      ],
      NOW,
    )
    expect(health.map((h) => h.state)).toEqual(['never', 'failed', 'running', 'critical', 'stale', 'ok'])
  })
})

describe('summarize / priorities', () => {
  it('moyenne et priorités', () => {
    const health = buildSiteHealth(
      [site('a'), site('b')],
      [scan({ id: '1', site_id: 'a', score: 40 }), scan({ id: '2', site_id: 'b', score: 80 })],
      NOW,
    )
    expect(summarize(health).avg).toBe(60)
    const p = buildPriorities(health, [{ read: false } as Alert, { read: true } as Alert])
    expect(p.map((x) => x.kind)).toEqual(['regression', 'critical'])
  })
})

describe('topRecurringIssues', () => {
  it('trie par sévérité puis fréquence', () => {
    const top = topRecurringIssues([
      { rule_id: 'a', title: 'A', severity: 'minor' },
      { rule_id: 'a', title: 'A', severity: 'minor' },
      { rule_id: 'b', title: 'B', severity: 'critical' },
    ])
    expect(top[0].rule_id).toBe('b')
    expect(top[1].count).toBe(2)
  })
})

describe('sitesToCsv', () => {
  it('neutralise les formules et échappe les champs', () => {
    const h = buildSiteHealth([site('a', '=HYPERLINK("x")')], [], NOW)
    const csv = sitesToCsv(h)
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`)
    expect(csv.startsWith('\uFEFFSite;')).toBe(true)
  })
})
