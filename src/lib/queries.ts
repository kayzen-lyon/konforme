import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ID, Permission, Query, Role, type Models } from 'appwrite'
import {
  account,
  DB_ID,
  functions,
  SCAN_FUNCTION_ID,
  TABLES,
  tables,
  teams,
} from '@/lib/appwrite'
import type {
  Alert,
  CriterionReview,
  Declaration,
  Membership,
  ReviewStatus,
  Scan,
  ScanIssue,
  Site,
} from '@/lib/database.types'
import { monthStartIso, PLANS, type PlanId } from '@/lib/plans'

/* ------------------------------------------------------------------ */
/* Mapping rows Appwrite → types du domaine                            */
/* ------------------------------------------------------------------ */

type Row = Models.DefaultRow

function rowToSite(r: Row): Site {
  return {
    id: r.$id,
    organization_id: r.team_id as string,
    name: r.name as string,
    url: r.url as string,
    description: (r.description as string | null) ?? null,
    monitoring_enabled: (r.monitoring_enabled as boolean) ?? false,
    monitoring_frequency: (r.monitoring_frequency as Site['monitoring_frequency']) ?? 'weekly',
    last_scan_at: (r.last_scan_at as string | null) ?? null,
    last_score: (r.last_score as number | null) ?? null,
    created_at: r.$createdAt,
  }
}

function rowToScan(r: Row): Scan {
  let pageScores: Scan['page_scores'] = null
  if (typeof r.page_scores === 'string' && r.page_scores) {
    try {
      const parsed = JSON.parse(r.page_scores)
      if (Array.isArray(parsed)) pageScores = parsed
    } catch {
      /* JSON tronqué : on ignore */
    }
  }
  return {
    id: r.$id,
    site_id: r.site_id as string,
    organization_id: r.team_id as string,
    status: r.status as Scan['status'],
    trigger: (r.trigger as Scan['trigger']) ?? 'manual',
    page_scores: pageScores,
    started_at: (r.started_at as string | null) ?? null,
    finished_at: (r.finished_at as string | null) ?? null,
    duration_ms: (r.duration_ms as number | null) ?? null,
    pages_count: (r.pages_count as number) ?? 0,
    pages_total: (r.pages_total as number) ?? (r.max_pages as number) ?? 0,
    pages_processed: (r.pages_processed as number) ?? (r.pages_count as number) ?? 0,
    issues_count: (r.issues_count as number) ?? 0,
    score: (r.score as number | null) ?? null,
    rgaa_score: (r.rgaa_score as number | null) ?? null,
    wcag_score: (r.wcag_score as number | null) ?? null,
    error: (r.error as string | null) ?? null,
    share_token: (r.share_token as string | null) ?? null,
    created_at: r.$createdAt,
    sites: { name: (r.site_name as string) ?? '—', url: (r.site_url as string) ?? '' },
  }
}

function rowToAlert(r: Row): Alert {
  return {
    id: r.$id,
    organization_id: r.team_id as string,
    site_id: r.site_id as string,
    scan_id: (r.scan_id as string | null) ?? null,
    type: (r.type as Alert['type']) ?? 'regression',
    message: (r.message as string) ?? '',
    previous_score: (r.previous_score as number | null) ?? null,
    new_score: (r.new_score as number | null) ?? null,
    read: (r.read as boolean) ?? false,
    created_at: r.$createdAt,
  }
}

function rowToIssue(r: Row): ScanIssue {
  return {
    id: r.$id,
    scan_id: r.scan_id as string,
    rule_id: r.rule_id as string,
    severity: r.severity as ScanIssue['severity'],
    category: (r.category as string | null) ?? null,
    title: r.title as string,
    description: (r.description as string | null) ?? null,
    page_url: (r.page_url as string | null) ?? null,
    selector: (r.selector as string | null) ?? null,
    html_snippet: (r.html_snippet as string | null) ?? null,
    suggested_fix: (r.suggested_fix as string | null) ?? null,
    status: (r.status as ScanIssue['status']) ?? 'open',
    created_at: r.$createdAt,
  }
}

function rowToDeclaration(r: Row): Declaration {
  return {
    id: r.$id,
    site_id: r.site_id as string,
    organization_id: r.team_id as string,
    conformity_level: r.conformity_level as Declaration['conformity_level'],
    conformity_rate: (r.conformity_rate as number | null) ?? null,
    reference_standard: (r.reference_standard as string) ?? 'RGAA-4.1.2',
    audit_method: (r.audit_method as string) ?? 'auto',
    contact_email: (r.contact_email as string | null) ?? null,
    published_at: (r.published_at as string) ?? r.$createdAt,
    created_at: r.$createdAt,
    sites: { name: (r.site_name as string) ?? '—', url: (r.site_url as string) ?? '' },
  }
}

function rowToCriterionReview(r: Row): CriterionReview {
  return {
    id: r.$id,
    site_id: r.site_id as string,
    organization_id: r.team_id as string,
    criterion_id: r.criterion_id as string,
    status: r.status as CriterionReview['status'],
    note: (r.note as string | null) ?? null,
    reviewed_at: (r.reviewed_at as string) ?? r.$updatedAt,
    created_at: r.$createdAt,
  }
}

function teamPermissions(teamId: string): string[] {
  return [
    Permission.read(Role.team(teamId)),
    Permission.update(Role.team(teamId)),
    Permission.delete(Role.team(teamId)),
  ]
}

async function startScanExecution(scanId: string) {
  const workerUrl = (import.meta.env.VITE_SCAN_WORKER_URL as string | undefined)?.trim()
  if (workerUrl) {
    const { jwt } = await account.createJWT()
    const response = await fetch(`${workerUrl.replace(/\/+$/, '')}/start`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scan_id: scanId }),
    })
    const text = await response.text()
    let payload: { error?: string } = {}
    try {
      payload = JSON.parse(text) as { error?: string }
    } catch {
      if (!response.ok) throw new Error(`Le moteur d'audit a répondu avec le statut ${response.status}.`)
    }
    if (!response.ok) throw new Error(payload.error || `Le moteur d'audit a répondu avec le statut ${response.status}.`)
    return
  }

  const execution = await functions.createExecution({
    functionId: SCAN_FUNCTION_ID,
    body: JSON.stringify({ scan_id: scanId }),
    async: true,
  })
  if (execution.responseStatusCode >= 400) {
    throw new Error("Le moteur d'analyse n'a pas pu démarrer l'audit.")
  }
}

/* ------------------------------------------------------------------ */
/* Organisation courante = première team Appwrite de l'utilisateur     */
/* (créée automatiquement au premier passage)                          */
/* ------------------------------------------------------------------ */

export function useMembership() {
  return useQuery({
    queryKey: ['membership'],
    queryFn: async (): Promise<Membership | null> => {
      const me = await account.get()
      let list = await teams.list()
      if (list.teams.length === 0) {
        // Première connexion : on crée l'espace personnel (le créateur est owner)
        await teams.create({
          teamId: ID.unique(),
          name: `${me.name || me.email.split('@')[0]} — Espace personnel`,
        })
        list = await teams.list()
      }
      const team = list.teams[0]
      // Le plan de l'organisation est stocké dans les préférences de la team
      // (modifiable uniquement côté serveur lors d'un changement d'offre).
      let plan: PlanId = 'free'
      try {
        const prefs = await teams.getPrefs({ teamId: team.$id })
        if (prefs.plan === 'pro' || prefs.plan === 'enterprise') plan = prefs.plan
      } catch {
        /* prefs inaccessibles : plan gratuit par défaut */
      }
      // Essai Pro : toute nouvelle organisation profite des quotas Pro 14 jours
      const TRIAL_DAYS = 14
      const ageDays = Math.floor((Date.now() - Date.parse(team.$createdAt)) / 86_400_000)
      const trialDaysLeft = plan === 'free' ? Math.max(0, TRIAL_DAYS - ageDays) : 0
      if (trialDaysLeft > 0) plan = 'pro'
      let role: Membership['role'] = 'member'
      try {
        const memberships = await teams.listMemberships({
          teamId: team.$id,
          queries: [Query.equal('userId', me.$id)],
        })
        const roles = memberships.memberships[0]?.roles ?? []
        role = roles.includes('owner') ? 'owner' : roles.includes('admin') ? 'admin' : 'member'
      } catch {
        /* listMemberships peut être restreint : on reste 'member' */
      }
      return {
        organization_id: team.$id,
        user_id: me.$id,
        role,
        organizations: { id: team.$id, name: team.name, plan },
        trial_days_left: trialDaysLeft,
      }
    },
    staleTime: 5 * 60_000,
  })
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const me = await account.get()
      return { id: me.$id, email: me.email, full_name: me.name }
    },
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: { full_name?: string }) => {
      if (patch.full_name !== undefined) {
        await account.updateName({ name: patch.full_name })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}

export function useUpdateOrganization(orgId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (patch: { name: string }) => {
      if (!orgId) throw new Error('Organisation introuvable')
      await teams.updateName({ teamId: orgId, name: patch.name })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['membership'] }),
  })
}

/* ------------------------------------------------------------------ */
/* Sites                                                               */
/* ------------------------------------------------------------------ */

export function useSites(orgId: string | undefined) {
  return useQuery({
    queryKey: ['sites', orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<Site[]> => {
      const res = await tables.listRows({
        databaseId: DB_ID,
        tableId: TABLES.sites,
        queries: [Query.equal('team_id', orgId!), Query.orderDesc('$createdAt'), Query.limit(100)],
      })
      return res.rows.map(rowToSite)
    },
  })
}

export function useAddSite(orgId: string | undefined, plan: PlanId = 'free') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; url: string; description?: string }) => {
      if (!orgId) throw new Error('Organisation introuvable')
      const limits = PLANS[plan]
      const existing = await tables.listRows({
        databaseId: DB_ID,
        tableId: TABLES.sites,
        queries: [Query.equal('team_id', orgId), Query.limit(1)],
        total: true,
      })
      if ((existing.total ?? 0) >= limits.maxSites) {
        throw new Error(
          `Votre plan ${limits.name} est limité à ${limits.maxSites} site${limits.maxSites > 1 ? 's' : ''}. Passez au plan supérieur pour en ajouter d'autres.`,
        )
      }
      const row = await tables.createRow({
        databaseId: DB_ID,
        tableId: TABLES.sites,
        rowId: ID.unique(),
        data: {
          team_id: orgId,
          name: input.name,
          url: input.url,
          description: input.description || null,
        },
        permissions: teamPermissions(orgId),
      })
      return rowToSite(row)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sites'] }),
  })
}

export function useUpdateSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      id: string
      monitoring_enabled?: boolean
      monitoring_frequency?: Site['monitoring_frequency']
      name?: string
      description?: string | null
    }) => {
      const { id, ...data } = input
      await tables.updateRow({ databaseId: DB_ID, tableId: TABLES.sites, rowId: id, data })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sites'] }),
  })
}

export function useDeleteSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (siteId: string) => {
      await tables.deleteRow({ databaseId: DB_ID, tableId: TABLES.sites, rowId: siteId })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites'] })
      qc.invalidateQueries({ queryKey: ['scans'] })
    },
  })
}

/* ------------------------------------------------------------------ */
/* Scans                                                               */
/* ------------------------------------------------------------------ */

/** Au-delà de ce délai, un scan pending/running est considéré interrompu
 * (la fonction est plafonnée à 300 s) et marqué failed. */
const SCAN_STALE_MS = 6 * 60_000
const SCAN_STALE_ERROR =
  "Audit interrompu (délai d'exécution dépassé). Relancez l'audit — un seul à la fois par site."

function reapStaleScan(scan: Scan): Scan {
  if (
    (scan.status === 'pending' || scan.status === 'running') &&
    Date.now() - Date.parse(scan.created_at) > SCAN_STALE_MS
  ) {
    // Marque en base (fire-and-forget) et reflète immédiatement dans l'UI
    tables
      .updateRow({
        databaseId: DB_ID,
        tableId: TABLES.scans,
        rowId: scan.id,
        data: { status: 'failed', finished_at: new Date().toISOString(), error: SCAN_STALE_ERROR },
      })
      .catch(() => {})
    return { ...scan, status: 'failed', error: SCAN_STALE_ERROR }
  }
  return scan
}

export function useScans(orgId: string | undefined, siteId?: string) {
  return useQuery({
    queryKey: ['scans', orgId, siteId ?? 'all'],
    enabled: !!orgId,
    queryFn: async (): Promise<Scan[]> => {
      const queries = [
        Query.equal('team_id', orgId!),
        Query.orderDesc('$createdAt'),
        Query.limit(100),
      ]
      if (siteId) queries.push(Query.equal('site_id', siteId))
      const res = await tables.listRows({
        databaseId: DB_ID,
        tableId: TABLES.scans,
        queries,
      })
      return res.rows.map(rowToScan).map(reapStaleScan)
    },
    // Rafraîchit tant qu'un scan tourne
    refetchInterval: (query) =>
      query.state.data?.some((s) => s.status === 'pending' || s.status === 'running')
        ? 2500
        : false,
  })
}

export function useScan(scanId: string | undefined) {
  return useQuery({
    queryKey: ['scan', scanId],
    enabled: !!scanId,
    queryFn: async (): Promise<Scan | null> => {
      try {
        const row = await tables.getRow({
          databaseId: DB_ID,
          tableId: TABLES.scans,
          rowId: scanId!,
        })
        const scan = rowToScan(row)
        if (scan.status === 'done') {
          const pages: Row[] = []
          let cursor: string | undefined
          for (;;) {
            const queries = [
              Query.equal('scan_id', scan.id),
              Query.equal('status', 'done'),
              Query.limit(100),
            ]
            if (cursor) queries.push(Query.cursorAfter(cursor))
            const result = await tables.listRows({
              databaseId: DB_ID,
              tableId: TABLES.scan_pages,
              queries,
            })
            pages.push(...result.rows)
            if (result.rows.length < 100) break
            cursor = result.rows[result.rows.length - 1].$id
          }
          pages.sort((a, b) => (a.position as number) - (b.position as number) || a.$id.localeCompare(b.$id))
          scan.page_scores = pages.map((page) => ({
            url: page.page_url as string,
            score: (page.score as number | null) ?? null,
            issues: (page.issues_count as number) ?? 0,
          }))
        }
        return reapStaleScan(scan)
      } catch {
        return null
      }
    },
    refetchInterval: (query) => {
      const s = query.state.data?.status
      return s === 'pending' || s === 'running' ? 2000 : false
    },
  })
}

export function useScanIssues(scanId: string | undefined) {
  return useQuery({
    queryKey: ['scan-issues', scanId],
    enabled: !!scanId,
    queryFn: async (): Promise<ScanIssue[]> => {
      const out: ScanIssue[] = []
      let cursor: string | undefined
      // Pagination : un scan peut dépasser 100 issues
      for (;;) {
        const queries = [Query.equal('scan_id', scanId!), Query.limit(100)]
        if (cursor) queries.push(Query.cursorAfter(cursor))
        const res = await tables.listRows({
          databaseId: DB_ID,
          tableId: TABLES.scan_issues,
          queries,
        })
        out.push(...res.rows.map(rowToIssue))
        if (res.rows.length < 100) break
        cursor = res.rows[res.rows.length - 1].$id
      }
      return out
    },
  })
}

export function useUpdateIssueStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: string; status: ScanIssue['status'] }) => {
      await tables.updateRow({
        databaseId: DB_ID,
        tableId: TABLES.scan_issues,
        rowId: input.id,
        data: {
          status: input.status,
          fixed_at: input.status === 'fixed' ? new Date().toISOString() : null,
        },
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scan-issues'] }),
  })
}

/* ------------------------------------------------------------------ */
/* Alertes de régression                                               */
/* ------------------------------------------------------------------ */

export function useAlerts(orgId: string | undefined) {
  return useQuery({
    queryKey: ['alerts', orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<Alert[]> => {
      try {
        const res = await tables.listRows({
          databaseId: DB_ID,
          tableId: TABLES.alerts,
          queries: [Query.equal('team_id', orgId!), Query.orderDesc('$createdAt'), Query.limit(20)],
        })
        return res.rows.map(rowToAlert)
      } catch {
        // Table absente (base non migrée) : pas d'alertes
        return []
      }
    },
  })
}

export function useMarkAlertRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (alertId: string) => {
      await tables.updateRow({
        databaseId: DB_ID,
        tableId: TABLES.alerts,
        rowId: alertId,
        data: { read: true },
      })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}

/* ------------------------------------------------------------------ */
/* Partage public du rapport                                           */
/* ------------------------------------------------------------------ */

/** Active (jeton aléatoire) ou révoque (null) le partage public d'un scan. */
export function useSetScanShare() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { scanId: string; enable: boolean }): Promise<string | null> => {
      const token = input.enable
        ? [...crypto.getRandomValues(new Uint8Array(24))]
            .map((b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[b % 62])
            .join('')
        : null
      await tables.updateRow({
        databaseId: DB_ID,
        tableId: TABLES.scans,
        rowId: input.scanId,
        data: { share_token: token },
      })
      return token
    },
    onSuccess: (_t, v) => {
      qc.invalidateQueries({ queryKey: ['scan', v.scanId] })
      qc.invalidateQueries({ queryKey: ['scans'] })
    },
  })
}

export type SharedReport = {
  site: { name: string; url: string }
  scan: {
    created_at: string
    finished_at: string | null
    pages_count: number
    issues_count: number
    score: number | null
    rgaa_score: number | null
    wcag_score: number | null
    page_scores: { url: string; score: number | null; issues: number }[] | null
  }
  issues: ScanIssue[]
  reviews: Pick<CriterionReview, 'criterion_id' | 'status' | 'note' | 'reviewed_at'>[]
}

/** Récupère un rapport partagé (lecture publique, sans compte). */
export async function fetchSharedReport(token: string): Promise<SharedReport> {
  const exec = await functions.createExecution({
    functionId: SCAN_FUNCTION_ID,
    body: JSON.stringify({ report: { token } }),
    async: false,
  })
  const payload = JSON.parse(exec.responseBody || '{}')
  if (exec.responseStatusCode >= 400) {
    throw new Error(payload.error || 'Rapport introuvable.')
  }
  return payload as SharedReport
}

/* ------------------------------------------------------------------ */
/* Évaluations manuelles des critères RGAA (audit complet)             */
/* ------------------------------------------------------------------ */

export function useCriteriaReviews(siteId: string | undefined) {
  return useQuery({
    queryKey: ['criteria-reviews', siteId],
    enabled: !!siteId,
    queryFn: async (): Promise<CriterionReview[]> => {
      const res = await tables.listRows({
        databaseId: DB_ID,
        tableId: TABLES.criteria_reviews,
        queries: [Query.equal('site_id', siteId!), Query.limit(200)],
      })
      return res.rows.map(rowToCriterionReview)
    },
  })
}

/**
 * Enregistre (upsert) ou efface (status: null) l'évaluation manuelle d'un
 * critère RGAA pour un site.
 */
export function useSetCriterionReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      siteId: string
      teamId: string
      criterionId: string
      status: ReviewStatus | null
      note?: string
      /** Id de l'évaluation existante, si connue (mise à jour / suppression). */
      existingId?: string
    }) => {
      if (input.status === null) {
        if (input.existingId) {
          await tables.deleteRow({
            databaseId: DB_ID,
            tableId: TABLES.criteria_reviews,
            rowId: input.existingId,
          })
        }
        return
      }
      const data = {
        status: input.status,
        note: input.note ?? null,
        reviewed_at: new Date().toISOString(),
      }
      if (input.existingId) {
        await tables.updateRow({
          databaseId: DB_ID,
          tableId: TABLES.criteria_reviews,
          rowId: input.existingId,
          data,
        })
      } else {
        await tables.createRow({
          databaseId: DB_ID,
          tableId: TABLES.criteria_reviews,
          rowId: ID.unique(),
          data: {
            ...data,
            team_id: input.teamId,
            site_id: input.siteId,
            criterion_id: input.criterionId,
          },
          permissions: teamPermissions(input.teamId),
        })
      }
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['criteria-reviews', v.siteId] }),
  })
}

/** Nombre d'issues critiques ouvertes sur un ensemble de scans. */
export async function countCriticalIssues(scanIds: string[]): Promise<number> {
  if (scanIds.length === 0) return 0
  const res = await tables.listRows({
    databaseId: DB_ID,
    tableId: TABLES.scan_issues,
    queries: [
      Query.equal('scan_id', scanIds),
      Query.equal('severity', 'critical'),
      Query.equal('status', ['open', 'in_progress']),
      Query.limit(1),
    ],
    total: true,
  })
  return res.total ?? 0
}

/**
 * Lance un audit : crée le scan côté client (statut pending) puis déclenche
 * la fonction serverless `scan-site` qui l'exécute et le complète.
 */
export function useLaunchScan(plan: PlanId = 'free') {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (site: Site): Promise<{ scan_id: string }> => {
      const limits = PLANS[plan]
      // Un seul audit à la fois par site : les exécutions simultanées se
      // partagent le CPU de la fonction et finissent en timeout.
      const active = await tables.listRows({
        databaseId: DB_ID,
        tableId: TABLES.scans,
        queries: [
          Query.equal('site_id', site.id),
          Query.equal('status', ['pending', 'running']),
          Query.limit(1),
        ],
        total: true,
      })
      if ((active.total ?? 0) > 0) {
        throw new Error('Un audit est déjà en cours pour ce site — suivez-le depuis l’onglet Scans.')
      }
      const used = await tables.listRows({
        databaseId: DB_ID,
        tableId: TABLES.scans,
        queries: [
          Query.equal('team_id', site.organization_id),
          Query.greaterThanEqual('$createdAt', monthStartIso()),
          Query.limit(1),
        ],
        total: true,
      })
      if ((used.total ?? 0) >= limits.scansPerMonth) {
        throw new Error(
          `Quota mensuel atteint : ${limits.scansPerMonth} audits/mois sur le plan ${limits.name}. Le compteur se réinitialise le 1er du mois — ou passez au plan supérieur.`,
        )
      }
      const scanRow = await tables.createRow({
        databaseId: DB_ID,
        tableId: TABLES.scans,
        rowId: ID.unique(),
        data: {
          site_id: site.id,
          team_id: site.organization_id,
          status: 'pending',
          trigger: 'manual',
          site_name: site.name,
          site_url: site.url,
          started_at: new Date().toISOString(),
          max_pages: Number.isFinite(limits.pagesPerScan) ? limits.pagesPerScan : 0,
          pages_total: 0,
        },
        permissions: teamPermissions(site.organization_id),
      })
      try {
        await startScanExecution(scanRow.$id)
      } catch (e) {
        await tables.updateRow({
          databaseId: DB_ID,
          tableId: TABLES.scans,
          rowId: scanRow.$id,
          data: { status: 'failed', error: "Le moteur d'analyse est injoignable." },
        })
        const msg =
          e instanceof Error && /not found|404/i.test(e.message)
            ? "Le moteur d'analyse n'est pas encore déployé (fonction scan-site absente)."
            : "Le moteur d'analyse est injoignable. Réessayez dans quelques instants."
        throw new Error(msg, { cause: e })
      }
      return { scan_id: scanRow.$id }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scans'] })
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })
}

/* ------------------------------------------------------------------ */
/* Déclarations                                                        */
/* ------------------------------------------------------------------ */

export function useDeclarations(orgId: string | undefined) {
  return useQuery({
    queryKey: ['declarations', orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<Declaration[]> => {
      const res = await tables.listRows({
        databaseId: DB_ID,
        tableId: TABLES.declarations,
        queries: [Query.equal('team_id', orgId!), Query.orderDesc('$createdAt'), Query.limit(100)],
      })
      return res.rows.map(rowToDeclaration)
    },
  })
}

export function useCreateDeclaration(orgId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      site: Site
      conformity_level: Declaration['conformity_level']
      conformity_rate: number | null
      contact_email: string
    }) => {
      if (!orgId) throw new Error('Organisation introuvable')
      const row = await tables.createRow({
        databaseId: DB_ID,
        tableId: TABLES.declarations,
        rowId: ID.unique(),
        data: {
          team_id: orgId,
          site_id: input.site.id,
          site_name: input.site.name,
          site_url: input.site.url,
          conformity_level: input.conformity_level,
          conformity_rate: input.conformity_rate,
          contact_email: input.contact_email,
          reference_standard: 'RGAA-4.1.2',
          audit_method: 'auto',
          published_at: new Date().toISOString(),
        },
        permissions: teamPermissions(orgId),
      })
      return rowToDeclaration(row)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['declarations'] }),
  })
}
