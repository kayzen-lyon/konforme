import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import {
  computeConformity,
  coverageLabel,
  criterionStatusL10n,
  CRITERION_STATUS_META,
  type CriterionResult,
  type CriterionStatus,
} from '@/lib/conformity'
import type { CriterionReview, ReviewStatus, ScanIssue } from '@/lib/database.types'
import { severityLabel, SEVERITY_META } from '@/lib/format'
import { rgaaCriterionUrl } from '@/lib/rgaa'
import { defineMessages, useLang, useMessages, type Lang } from '@/i18n'
import { localizeCriterion, localizeTopic } from '@/i18n/rgaa-i18n'
import { localizeIssueTitle } from '@/i18n/rules-i18n'
import { NewWindowHint } from '@/components/ui/new-window'

export type ReviewInput = {
  criterionId: string
  status: ReviewStatus | null
  note?: string
  existingId?: string
}

const L = defineMessages({
  fr: {
    ratePrefix: 'Taux de conformité RGAA :',
    rateDetail: (ok: number, tested: number) =>
      `(${ok} conformes / ${tested} critères évalués, méthode officielle).`,
    remainingBefore: 'Encore',
    remainingAfter: 'critères à évaluer manuellement.',
    noneEvaluated: 'Aucun critère n’a encore pu être évalué sur cet échantillon.',
    filterGroup: 'Filtrer les critères par statut',
    filterAll: 'Tous les critères',
    filterNonConforme: 'Non conformes',
    filterOk: 'Conformes',
    filterAVerifier: 'À vérifier',
    filterNonApplicable: 'Non applicables',
    ncCount: (n: number) => `${n} NC`,
    okCount: (n: number) => `${n} conforme${n > 1 ? 's' : ''}`,
    toCheckCount: (n: number) => `${n} à vérifier`,
    naCount: (n: number) => `${n} NA`,
    tooltipLabel: (id: string) => `Comprendre le critère ${id}`,
    tooltipTitle: 'Pourquoi c’est important',
    manuallyReviewed: 'évalué manuellement',
    issuesCount: (n: number) => `${n} non-conformité${n > 1 ? 's' : ''}`,
    assess: 'Évaluer',
    detail: 'Détail',
    handled: 'Traitée',
    reviewTitle: 'Évaluation manuelle (méthode RGAA)',
    reviewGroup: (id: string) => `Évaluer le critère ${id}`,
    reset: 'Réinitialiser',
    noteLabel: 'Note (facultative — utile pour justifier une dérogation ou un « non applicable ») :',
    notePlaceholder: 'Ex. : aucun contenu multimédia sur le site.',
    blockedByIssues:
      "Ce critère a des non-conformités détectées par le moteur : corrigez-les (ou marquez-les en faux positif) avant de l'évaluer manuellement.",
    officialText: (id: string) =>
      `Texte officiel du critère ${id} et ses tests (accessibilite.numerique.gouv.fr) ↗`,
  },
  en: {
    ratePrefix: 'RGAA compliance rate:',
    rateDetail: (ok: number, tested: number) =>
      `(${ok} compliant / ${tested} criteria assessed, official method).`,
    remainingBefore: 'Still',
    remainingAfter: 'criteria to assess manually.',
    noneEvaluated: 'No criterion could be assessed on this sample yet.',
    filterGroup: 'Filter the criteria by status',
    filterAll: 'All criteria',
    filterNonConforme: 'Non-compliant',
    filterOk: 'Compliant',
    filterAVerifier: 'To check',
    filterNonApplicable: 'Not applicable',
    ncCount: (n: number) => `${n} non-compliant`,
    okCount: (n: number) => `${n} compliant`,
    toCheckCount: (n: number) => `${n} to check`,
    naCount: (n: number) => `${n} N/A`,
    tooltipLabel: (id: string) => `Understand criterion ${id}`,
    tooltipTitle: 'Why it matters',
    manuallyReviewed: 'assessed manually',
    issuesCount: (n: number) => `${n} issue${n > 1 ? 's' : ''}`,
    assess: 'Assess',
    detail: 'Details',
    handled: 'Handled',
    reviewTitle: 'Manual assessment (RGAA method)',
    reviewGroup: (id: string) => `Assess criterion ${id}`,
    reset: 'Reset',
    noteLabel: 'Note (optional — useful to justify an exemption or a “not applicable”):',
    notePlaceholder: 'E.g. no multimedia content on this website.',
    blockedByIssues:
      'This criterion has issues detected by the engine: fix them (or mark them as false positives) before assessing it manually.',
    officialText: (id: string) =>
      `Official text of criterion ${id} and its tests (accessibilite.numerique.gouv.fr) ↗`,
  },
  de: {
    ratePrefix: 'RGAA-Konformitätsgrad:',
    rateDetail: (ok: number, tested: number) =>
      `(${ok} konform / ${tested} bewertete Kriterien, offizielle Methode).`,
    remainingBefore: 'Noch',
    remainingAfter: 'Kriterien manuell zu bewerten.',
    noneEvaluated: 'Für diese Stichprobe konnte noch kein Kriterium bewertet werden.',
    filterGroup: 'Kriterien nach Status filtern',
    filterAll: 'Alle Kriterien',
    filterNonConforme: 'Nicht konform',
    filterOk: 'Konform',
    filterAVerifier: 'Zu prüfen',
    filterNonApplicable: 'Nicht anwendbar',
    ncCount: (n: number) => `${n} nicht konform`,
    okCount: (n: number) => `${n} konform`,
    toCheckCount: (n: number) => `${n} zu prüfen`,
    naCount: (n: number) => `${n} n. a.`,
    tooltipLabel: (id: string) => `Kriterium ${id} verstehen`,
    tooltipTitle: 'Warum das wichtig ist',
    manuallyReviewed: 'manuell bewertet',
    issuesCount: (n: number) => `${n} ${n > 1 ? 'Mängel' : 'Mangel'}`,
    assess: 'Bewerten',
    detail: 'Details',
    handled: 'Bearbeitet',
    reviewTitle: 'Manuelle Bewertung (RGAA-Methode)',
    reviewGroup: (id: string) => `Kriterium ${id} bewerten`,
    reset: 'Zurücksetzen',
    noteLabel:
      'Notiz (optional – nützlich, um eine Ausnahme oder ein „nicht anwendbar“ zu begründen):',
    notePlaceholder: 'Z. B.: keine multimedialen Inhalte auf der Website.',
    blockedByIssues:
      'Für dieses Kriterium hat die Engine Mängel festgestellt: Beheben Sie sie (oder markieren Sie sie als Falschmeldung), bevor Sie es manuell bewerten.',
    officialText: (id: string) =>
      `Offizieller Text des Kriteriums ${id} und seiner Tests (accessibilite.numerique.gouv.fr) ↗`,
  },
  es: {
    ratePrefix: 'Tasa de conformidad RGAA:',
    rateDetail: (ok: number, tested: number) =>
      `(${ok} conformes / ${tested} criterios evaluados, método oficial).`,
    remainingBefore: 'Aún quedan',
    remainingAfter: 'criterios por evaluar manualmente.',
    noneEvaluated: 'Todavía no se ha podido evaluar ningún criterio en esta muestra.',
    filterGroup: 'Filtrar los criterios por estado',
    filterAll: 'Todos los criterios',
    filterNonConforme: 'No conformes',
    filterOk: 'Conformes',
    filterAVerifier: 'Por verificar',
    filterNonApplicable: 'No aplicables',
    ncCount: (n: number) => `${n} no conformes`,
    okCount: (n: number) => `${n} conforme${n > 1 ? 's' : ''}`,
    toCheckCount: (n: number) => `${n} por verificar`,
    naCount: (n: number) => `${n} N/A`,
    tooltipLabel: (id: string) => `Comprender el criterio ${id}`,
    tooltipTitle: 'Por qué es importante',
    manuallyReviewed: 'evaluado manualmente',
    issuesCount: (n: number) => `${n} incumplimiento${n > 1 ? 's' : ''}`,
    assess: 'Evaluar',
    detail: 'Detalle',
    handled: 'Tratado',
    reviewTitle: 'Evaluación manual (método RGAA)',
    reviewGroup: (id: string) => `Evaluar el criterio ${id}`,
    reset: 'Restablecer',
    noteLabel:
      'Nota (opcional: útil para justificar una excepción o un «no aplicable»):',
    notePlaceholder: 'Ej.: ningún contenido multimedia en el sitio.',
    blockedByIssues:
      'Este criterio presenta incumplimientos detectados por el motor: corríjalos (o márquelos como falso positivo) antes de evaluarlo manualmente.',
    officialText: (id: string) =>
      `Texto oficial del criterio ${id} y sus pruebas (accessibilite.numerique.gouv.fr) ↗`,
  },
  it: {
    ratePrefix: 'Tasso di conformità RGAA:',
    rateDetail: (ok: number, tested: number) =>
      `(${ok} conformi / ${tested} criteri valutati, metodo ufficiale).`,
    remainingBefore: 'Restano ancora',
    remainingAfter: 'criteri da valutare manualmente.',
    noneEvaluated: 'Nessun criterio ha ancora potuto essere valutato su questo campione.',
    filterGroup: 'Filtra i criteri per stato',
    filterAll: 'Tutti i criteri',
    filterNonConforme: 'Non conformi',
    filterOk: 'Conformi',
    filterAVerifier: 'Da verificare',
    filterNonApplicable: 'Non applicabili',
    ncCount: (n: number) => `${n} non conformi`,
    okCount: (n: number) => `${n} conform${n > 1 ? 'i' : 'e'}`,
    toCheckCount: (n: number) => `${n} da verificare`,
    naCount: (n: number) => `${n} N/A`,
    tooltipLabel: (id: string) => `Comprendere il criterio ${id}`,
    tooltipTitle: 'Perché è importante',
    manuallyReviewed: 'valutato manualmente',
    issuesCount: (n: number) => `${n} non conformità`,
    assess: 'Valuta',
    detail: 'Dettaglio',
    handled: 'Trattata',
    reviewTitle: 'Valutazione manuale (metodo RGAA)',
    reviewGroup: (id: string) => `Valuta il criterio ${id}`,
    reset: 'Reimposta',
    noteLabel:
      'Nota (facoltativa — utile per motivare una deroga o un « non applicabile ») :',
    notePlaceholder: 'Es.: nessun contenuto multimediale sul sito.',
    blockedByIssues:
      "Questo criterio presenta non conformità rilevate dal motore: le corregga (o le contrassegni come falso positivo) prima di valutarlo manualmente.",
    officialText: (id: string) =>
      `Testo ufficiale del criterio ${id} e dei suoi test (accessibilite.numerique.gouv.fr) ↗`,
  },
})

/**
 * Les 106 critères du RGAA 4.1.2, regroupés par thématique, avec le statut
 * suivant la méthode officielle : conforme, non conforme, non applicable ou
 * à vérifier. Quand `onReview` est fourni, chaque critère non automatisable
 * peut être évalué manuellement (audit complet, 100 % autonome).
 */
export function RgaaCriteriaList({
  issues,
  pageUrl,
  reviews,
  onReview,
  reviewPending,
}: {
  issues: ScanIssue[]
  pageUrl?: string
  reviews?: CriterionReview[]
  onReview?: (input: ReviewInput) => void
  reviewPending?: boolean
}) {
  const t = useMessages(L)
  const lang = useLang()
  const summary = useMemo(() => computeConformity(issues, pageUrl, reviews), [issues, pageUrl, reviews])
  const [filter, setFilter] = useState<CriterionStatus | 'all'>('all')

  const filters: { key: CriterionStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: t.filterAll, count: summary.results.length },
    { key: 'non_conforme', label: t.filterNonConforme, count: summary.nonConformes },
    { key: 'ok', label: t.filterOk, count: summary.ok },
    { key: 'a_verifier', label: t.filterAVerifier, count: summary.aVerifier },
    { key: 'non_applicable', label: t.filterNonApplicable, count: summary.nonApplicables },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-muted">
          {summary.rate !== null ? (
            <>
              {t.ratePrefix} <strong className="text-text">{summary.rate} %</strong>{' '}
              {t.rateDetail(summary.ok, summary.tested)}{' '}
              {summary.aVerifier > 0 && (
                <>{t.remainingBefore} <strong className="text-text">{summary.aVerifier}</strong> {t.remainingAfter}</>
              )}
            </>
          ) : (
            t.noneEvaluated
          )}
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.filterGroup}>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={
                filter === f.key
                  ? 'rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary'
                  : 'rounded-full border border-border-strong px-3 py-1.5 text-xs font-semibold text-text-muted hover:bg-raise hover:text-text'
              }
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {summary.topics.map((tp) => {
          const visible = filter === 'all' ? tp.results : tp.results.filter((r) => r.status === filter)
          if (visible.length === 0) return null
          const topic = localizeTopic(lang, tp.topic)
          return (
            <section key={tp.topic.id} aria-labelledby={`rgaa-topic-${tp.topic.id}`}>
              <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h3 id={`rgaa-topic-${tp.topic.id}`} className="text-sm font-bold">
                  {tp.topic.id}. {topic.name}
                  <span className="ml-2 font-normal text-text-dim text-xs">{topic.description}</span>
                </h3>
                <span className="text-xs text-text-dim tabular-nums">
                  {tp.nonConformes > 0 && (
                    <>
                      <span className="text-danger-soft font-semibold">{t.ncCount(tp.nonConformes)}</span>
                      {' · '}
                    </>
                  )}
                  {t.okCount(tp.ok)} · {t.toCheckCount(tp.aVerifier)}
                  {tp.nonApplicables > 0 && <> · {t.naCount(tp.nonApplicables)}</>}
                </span>
              </header>
              <ul className="space-y-1.5">
                {visible.map((r) => (
                  <CriterionRow key={r.criterion.id} result={r} onReview={onReview} reviewPending={reviewPending} />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}

const REVIEW_OPTIONS: { status: ReviewStatus; statusKey: CriterionStatus; activeClass: string }[] = [
  { status: 'conforme', statusKey: 'ok', activeClass: 'bg-success-bg/70 text-success-soft border-success/50' },
  { status: 'non_conforme', statusKey: 'non_conforme', activeClass: 'bg-danger-bg/70 text-danger-soft border-danger/50' },
  { status: 'non_applicable', statusKey: 'non_applicable', activeClass: 'bg-raise text-text border-border-strong' },
]

function reviewOptionLabel(lang: Lang, statusKey: CriterionStatus): string {
  return criterionStatusL10n(lang, statusKey).label
}

function CriterionRow({
  result,
  onReview,
  reviewPending,
}: {
  result: CriterionResult
  onReview?: (input: ReviewInput) => void
  reviewPending?: boolean
}) {
  const t = useMessages(L)
  const lang = useLang()
  const { criterion, status, openIssues, resolvedIssues, review } = result
  const meta = CRITERION_STATUS_META[status]
  const statusLabels = criterionStatusL10n(lang, status)
  const c = localizeCriterion(lang, criterion)
  const linked = [...openIssues, ...resolvedIssues]
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState(review?.note ?? '')

  // L'évaluation manuelle ne peut pas contredire une non-conformité outillée
  const reviewable = !!onReview && openIssues.length === 0

  return (
    <li className="rounded-[12px] border border-border">
      <div className="flex items-center gap-3 px-3.5 py-2.5">
        <Badge className={`${meta.className} hidden sm:inline-flex shrink-0 w-28 justify-center`}>
          {statusLabels.shortLabel}
        </Badge>
        <span className="flex-1 min-w-0 text-sm">
          <Badge className={`${meta.className} sm:hidden mr-2`}>{statusLabels.shortLabel}</Badge>
          <span className="font-semibold text-text-soft">
            <span className="text-text-dim font-normal tabular-nums">{criterion.id}</span> {c.title}
          </span>
          <span className="ml-2 inline-flex items-center gap-1.5 align-middle">
            <Tooltip
              label={t.tooltipLabel(criterion.id)}
              content={
                <>
                  <strong className="block mb-1 text-text">{t.tooltipTitle}</strong>
                  {c.plain}
                  <span className="mt-2 block text-text-dim">{coverageLabel(lang, criterion.coverage)}.</span>
                </>
              }
            />
            <span className="rounded border border-border px-1 text-[10px] text-text-dim">{criterion.level}</span>
            <span className="text-[10px] text-text-dim whitespace-nowrap">WCAG {criterion.wcag.join(', ')}</span>
            {review && <span className="text-[10px] text-info-soft whitespace-nowrap">{t.manuallyReviewed}</span>}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-strong px-2.5 py-1 text-xs text-text-muted hover:bg-raise hover:text-text"
        >
          <span className="tabular-nums">
            {openIssues.length > 0
              ? t.issuesCount(openIssues.length)
              : onReview
                ? t.assess
                : t.detail}
          </span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {linked.length > 0 && (
            <ul className="space-y-2">
              {linked.map((i) => (
                <li key={i.id} className="flex items-center gap-2 text-xs">
                  <Badge className={`${SEVERITY_META[i.severity].className} shrink-0`}>
                    {severityLabel(lang, i.severity)}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-text-soft">{localizeIssueTitle(lang, i)}</span>
                  {i.page_url && <span className="hidden md:inline shrink-0 max-w-56 truncate text-text-dim">{i.page_url}</span>}
                  {(i.status === 'fixed' || i.status === 'false_positive') && (
                    <Badge className="bg-success-bg/60 text-success-soft border-success/40 shrink-0">{t.handled}</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}

          {reviewable && (
            <div className="rounded-[12px] border border-border bg-bg px-3.5 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                {t.reviewTitle}
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label={t.reviewGroup(criterion.id)}>
                {REVIEW_OPTIONS.map((opt) => (
                  <button
                    key={opt.status}
                    type="button"
                    disabled={reviewPending}
                    aria-pressed={review?.status === opt.status}
                    onClick={() =>
                      onReview!({
                        criterionId: criterion.id,
                        status: opt.status,
                        note: note.trim() || undefined,
                        existingId: review?.id,
                      })
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      review?.status === opt.status
                        ? opt.activeClass
                        : 'border-border-strong text-text-muted hover:bg-raise hover:text-text'
                    }`}
                  >
                    {reviewOptionLabel(lang, opt.statusKey)}
                  </button>
                ))}
                {review && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={reviewPending}
                    onClick={() => onReview!({ criterionId: criterion.id, status: null, existingId: review.id })}
                  >
                    {t.reset}
                  </Button>
                )}
              </div>
              <label htmlFor={`note-${criterion.id}`} className="mt-3 mb-1 block text-xs text-text-dim">
                {t.noteLabel}
              </label>
              <textarea
                id={`note-${criterion.id}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-[8px] border border-border bg-surface px-3 py-2 text-xs text-text-soft"
                placeholder={t.notePlaceholder}
              />
            </div>
          )}

          {!reviewable && onReview && openIssues.length > 0 && (
            <p className="text-xs text-text-dim">
              {t.blockedByIssues}
            </p>
          )}

          <a
            href={rgaaCriterionUrl(criterion.id)}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-xs text-link underline hover:text-text"
          >
            {t.officialText(criterion.id)}
            <NewWindowHint />
          </a>
        </div>
      )}
    </li>
  )
}
