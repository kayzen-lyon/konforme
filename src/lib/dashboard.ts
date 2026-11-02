import type { Alert, Scan, Severity, Site } from '@/lib/database.types'

export const STALE_DAYS = 30
export const LOW_SCORE = 50

export type SiteHealthState = 'never' | 'running' | 'failed' | 'critical' | 'stale' | 'ok'

export type SiteHealth = {
  site: Site
  latest: Scan | null
  /** Écart de score avec l'audit terminé précédent (points), null si indisponible. */
  delta: number | null
  state: SiteHealthState
  daysSince: number | null
}

const DAY_MS = 86_400_000

function byRecent(a: Scan, b: Scan) {
  return a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0
}

/** Santé de chaque site à partir de ses scans (liste quelconque, tous statuts). */
export function buildSiteHealth(sites: Site[], scans: Scan[], now = Date.now()): SiteHealth[] {
  return sites.map((site) => {
    const mine = scans.filter((s) => s.site_id === site.id).sort(byRecent)
    const done = mine.filter((s) => s.status === 'done' && s.score !== null)
    const latest = done[0] ?? null
    const previous = done[1] ?? null
    const delta = latest && previous ? Math.round((latest.score! - previous.score!) * 10) / 10 : null
    const daysSince = latest ? Math.floor((now - Date.parse(latest.created_at)) / DAY_MS) : null
    const active = mine.some((s) => s.status === 'pending' || s.status === 'running')

    let state: SiteHealthState = 'ok'
    if (active) state = 'running'
    else if (!latest) state = mine[0]?.status === 'failed' ? 'failed' : 'never'
    else if (latest.score! < LOW_SCORE) state = 'critical'
    else if (daysSince !== null && daysSince >= STALE_DAYS) state = 'stale'
    return { site, latest, delta, state, daysSince }
  })
}

/** Moyenne des derniers scores et écart moyen avec les audits précédents. */
export function summarize(health: SiteHealth[]) {
  const scored = health.filter((h) => h.latest)
  const avg = scored.length
    ? Math.round(scored.reduce((a, h) => a + h.latest!.score!, 0) / scored.length)
    : null
  const deltas = scored.map((h) => h.delta).filter((d): d is number => d !== null)
  const avgDelta = deltas.length
    ? Math.round((deltas.reduce((a, b) => a + b, 0) / deltas.length) * 10) / 10
    : null
  return { avg, avgDelta }
}

export type Priority =
  | { kind: 'regression'; count: number }
  | { kind: 'never'; sites: Site[] }
  | { kind: 'failed'; sites: Site[] }
  | { kind: 'critical'; sites: Site[] }
  | { kind: 'stale'; sites: Site[] }

/** Actions recommandées, de la plus urgente à la moins urgente. */
export function buildPriorities(health: SiteHealth[], alerts: Alert[]): Priority[] {
  const out: Priority[] = []
  const unread = alerts.filter((a) => !a.read).length
  if (unread > 0) out.push({ kind: 'regression', count: unread })
  const pick = (state: SiteHealthState) => health.filter((h) => h.state === state).map((h) => h.site)
  for (const kind of ['critical', 'failed', 'never', 'stale'] as const) {
    const sites = pick(kind)
    if (sites.length > 0) out.push({ kind, sites })
  }
  return out
}

export type RecurringIssue = { rule_id: string; title: string; severity: Severity; count: number }

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, serious: 1, moderate: 2, minor: 3 }

export function topRecurringIssues(
  issues: { rule_id: string; title: string; severity: Severity }[],
  limit = 5,
): RecurringIssue[] {
  const map = new Map<string, RecurringIssue>()
  for (const i of issues) {
    const cur = map.get(i.rule_id)
    if (cur) cur.count++
    else map.set(i.rule_id, { rule_id: i.rule_id, title: i.title, severity: i.severity, count: 1 })
  }
  return [...map.values()]
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.count - a.count)
    .slice(0, limit)
}

function csvCell(v: string | number | null) {
  const s = v === null ? '' : String(v)
  // Neutralise l'injection de formule Excel/Sheets
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",;\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** Export CSV de la synthèse des sites (séparateur « ; », ouvert directement par Excel FR). */
export function sitesToCsv(health: SiteHealth[]): string {
  const header = ['Site', 'URL', 'Score (%)', 'Évolution (pts)', 'Dernier audit', 'Pages', 'Non-conformités']
  const rows = health.map((h) => [
    h.site.name,
    h.site.url,
    h.latest?.score ?? null,
    h.delta,
    h.latest?.created_at.slice(0, 10) ?? null,
    h.latest?.pages_count ?? null,
    h.latest?.issues_count ?? null,
  ])
  return '\uFEFF' + [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n')
}
