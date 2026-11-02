/** Types du domaine Konforme, mappés depuis les rows Appwrite (voir src/lib/queries.ts). */

export type Severity = 'critical' | 'serious' | 'moderate' | 'minor'
export type ScanStatus = 'pending' | 'running' | 'done' | 'failed'
export type IssueStatus = 'open' | 'in_progress' | 'fixed' | 'wont_fix' | 'false_positive'
export type ConformityLevel = 'total' | 'partial' | 'non_conforme'

export type Organization = {
  id: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
}

export type Membership = {
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  organizations: Organization
  /** Jours restants de l'essai Pro offert aux nouvelles organisations (0 = terminé). */
  trial_days_left: number
}

export type Site = {
  id: string
  organization_id: string
  name: string
  url: string
  description: string | null
  monitoring_enabled: boolean
  monitoring_frequency: 'daily' | 'weekly' | 'monthly'
  last_scan_at: string | null
  last_score: number | null
  created_at: string
}

export type PageScore = { url: string; score: number | null; issues: number }

export type Scan = {
  id: string
  site_id: string
  organization_id: string
  status: ScanStatus
  trigger: 'manual' | 'scheduled' | 'api' | 'ci'
  started_at: string | null
  finished_at: string | null
  duration_ms: number | null
  pages_count: number
  pages_total: number
  pages_processed: number
  issues_count: number
  score: number | null
  rgaa_score: number | null
  wcag_score: number | null
  page_scores: PageScore[] | null
  error: string | null
  /** Jeton de partage public du rapport (null = non partagé). */
  share_token: string | null
  created_at: string
  sites?: { name: string; url: string }
}

/** Alerte créée par le moteur (régression de score après un audit). */
export type Alert = {
  id: string
  organization_id: string
  site_id: string
  scan_id: string | null
  type: 'regression'
  message: string
  previous_score: number | null
  new_score: number | null
  read: boolean
  created_at: string
}

export type ScanIssue = {
  id: string
  scan_id: string
  rule_id: string
  severity: Severity
  category: string | null
  title: string
  description: string | null
  page_url: string | null
  selector: string | null
  html_snippet: string | null
  suggested_fix: string | null
  status: IssueStatus
  created_at: string
}

/** Verdict d'une évaluation manuelle d'un critère RGAA (méthode officielle). */
export type ReviewStatus = 'conforme' | 'non_conforme' | 'non_applicable'

/**
 * Évaluation manuelle d'un critère RGAA pour un site : complète l'audit
 * automatique pour couvrir les 106 critères (audit complet, méthode RGAA).
 */
export type CriterionReview = {
  id: string
  site_id: string
  organization_id: string
  criterion_id: string
  status: ReviewStatus
  note: string | null
  reviewed_at: string
  created_at: string
}

export type Declaration = {
  id: string
  site_id: string
  organization_id: string
  conformity_level: ConformityLevel
  conformity_rate: number | null
  reference_standard: string
  audit_method: string
  contact_email: string | null
  published_at: string
  created_at: string
  sites?: { name: string; url: string }
}
