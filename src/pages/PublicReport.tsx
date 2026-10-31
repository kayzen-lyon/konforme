import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScoreRing } from '@/components/ScoreRing'
import { Seo } from '@/components/Seo'
import { RgaaCriteriaList } from '@/components/report/RgaaCriteriaList'
import { computeConformity } from '@/lib/conformity'
import type { CriterionReview, Severity } from '@/lib/database.types'
import { formatDate, scoreColor, severityLabel, SEVERITY_META } from '@/lib/format'
import { fetchSharedReport } from '@/lib/queries'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'
import { localizeIssueTitle } from '@/i18n/rules-i18n'

const SEVERITY_ORDER: Severity[] = ['critical', 'serious', 'moderate', 'minor']

const L = defineMessages({
  fr: {
    loadingReport: 'Chargement du rapport',
    notFoundSeoTitle: 'Rapport introuvable',
    notFoundSeoDesc: "Ce lien de partage n'est plus valide.",
    notFoundTitle: 'Rapport introuvable',
    notFoundDesc: 'Ce lien de partage est invalide ou a été révoqué par le propriétaire du rapport.',
    notFoundCta: 'Auditer mon propre site gratuitement',
    seoTitle: (name: string) => `Rapport d'accessibilité — ${name}`,
    seoDesc: "Rapport d'audit d'accessibilité RGAA partagé en lecture seule.",
    kicker: "Rapport d'audit partagé · lecture seule",
    auditLine: (date: string, n: number) =>
      `· Audit RGAA 4.1.2 du ${date} · ${n} page${n > 1 ? 's' : ''} analysée${n > 1 ? 's' : ''}`,
    ringGlobal: 'Taux de conformité global',
    cardGlobal: 'Conformité globale',
    ringRgaa: 'Score RGAA 4.1.2',
    ringWcag: 'Score WCAG 2.2 AA',
    cardWcag: 'WCAG 2.2 AA',
    ringOfficial: 'Taux de conformité RGAA sur les critères évalués',
    cardOfficial: 'Taux RGAA officiel',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} conformes · ${nc} NC · ${av} à vérifier`,
    pageScoresTitle: 'Score par page',
    pageIssues: (n: number) => `${n} issue${n > 1 ? 's' : ''}`,
    criteriaTitle: 'Les 106 critères du RGAA 4.1.2',
    criteriaIntro:
      'Statut de chaque critère selon la méthode officielle. Survolez le « ? » pour une explication en langage courant.',
    openIssuesTitle: 'Non-conformités ouvertes',
    noOpenIssues: '🎉 Aucune non-conformité ouverte sur les règles automatisables.',
    footerText:
      "Ce rapport a été généré avec Konforme — audit d'accessibilité RGAA / EAA automatisé, évaluation manuelle intégrée et déclaration légale.",
    footerCta: 'Auditer mon site gratuitement',
  },
  en: {
    loadingReport: 'Loading the report',
    notFoundSeoTitle: 'Report not found',
    notFoundSeoDesc: 'This sharing link is no longer valid.',
    notFoundTitle: 'Report not found',
    notFoundDesc: 'This sharing link is invalid or has been revoked by the owner of the report.',
    notFoundCta: 'Audit my own website for free',
    seoTitle: (name: string) => `Accessibility report — ${name}`,
    seoDesc: 'RGAA accessibility audit report shared in read-only mode.',
    kicker: 'Shared audit report · read-only',
    auditLine: (date: string, n: number) =>
      `· RGAA 4.1.2 audit of ${date} · ${n} page${n > 1 ? 's' : ''} analysed`,
    ringGlobal: 'Overall compliance rate',
    cardGlobal: 'Overall compliance',
    ringRgaa: 'RGAA 4.1.2 score',
    ringWcag: 'WCAG 2.2 AA score',
    cardWcag: 'WCAG 2.2 AA',
    ringOfficial: 'RGAA compliance rate across the assessed criteria',
    cardOfficial: 'Official RGAA rate',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} compliant · ${nc} non-compliant · ${av} to check`,
    pageScoresTitle: 'Score per page',
    pageIssues: (n: number) => `${n} issue${n > 1 ? 's' : ''}`,
    criteriaTitle: 'The 106 criteria of RGAA 4.1.2',
    criteriaIntro:
      'Status of each criterion following the official method. Hover over the “?” for a plain-language explanation.',
    openIssuesTitle: 'Open issues',
    noOpenIssues: '🎉 No open issue on the automatable rules.',
    footerText:
      'This report was generated with Konforme — automated RGAA / EAA accessibility audits, built-in manual assessment and legal accessibility statement.',
    footerCta: 'Audit my website for free',
  },
  de: {
    loadingReport: 'Bericht wird geladen',
    notFoundSeoTitle: 'Bericht nicht gefunden',
    notFoundSeoDesc: 'Dieser Freigabelink ist nicht mehr gültig.',
    notFoundTitle: 'Bericht nicht gefunden',
    notFoundDesc:
      'Dieser Freigabelink ist ungültig oder wurde von der Inhaberin bzw. dem Inhaber des Berichts widerrufen.',
    notFoundCta: 'Meine eigene Website kostenlos prüfen',
    seoTitle: (name: string) => `Bericht zur Barrierefreiheit — ${name}`,
    seoDesc: 'RGAA-Bericht zur Barrierefreiheit, schreibgeschützt geteilt.',
    kicker: 'Geteilter Auditbericht · schreibgeschützt',
    auditLine: (date: string, n: number) =>
      `· RGAA-4.1.2-Audit vom ${date} · ${n} Seite${n > 1 ? 'n' : ''} analysiert`,
    ringGlobal: 'Gesamtkonformitätsgrad',
    cardGlobal: 'Gesamtkonformität',
    ringRgaa: 'RGAA-4.1.2-Score',
    ringWcag: 'WCAG-2.2-AA-Score',
    cardWcag: 'WCAG 2.2 AA',
    ringOfficial: 'RGAA-Konformitätsgrad der bewerteten Kriterien',
    cardOfficial: 'Offizieller RGAA-Grad',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} konform · ${nc} nicht konform · ${av} zu prüfen`,
    pageScoresTitle: 'Score je Seite',
    pageIssues: (n: number) => `${n} ${n > 1 ? 'Mängel' : 'Mangel'}`,
    criteriaTitle: 'Die 106 Kriterien des RGAA 4.1.2',
    criteriaIntro:
      'Status jedes Kriteriums nach der offiziellen Methode. Fahren Sie über das „?“, um eine allgemein verständliche Erläuterung zu erhalten.',
    openIssuesTitle: 'Offene Mängel',
    noOpenIssues: '🎉 Kein offener Mangel bei den automatisierbaren Regeln.',
    footerText:
      'Dieser Bericht wurde mit Konforme erstellt — automatisierte Audits zur Barrierefreiheit nach RGAA / EAA, integrierte manuelle Bewertung und rechtliche Erklärung.',
    footerCta: 'Meine Website kostenlos prüfen',
  },
  es: {
    loadingReport: 'Cargando el informe',
    notFoundSeoTitle: 'Informe no encontrado',
    notFoundSeoDesc: 'Este enlace de uso compartido ya no es válido.',
    notFoundTitle: 'Informe no encontrado',
    notFoundDesc:
      'Este enlace de uso compartido no es válido o ha sido revocado por el propietario del informe.',
    notFoundCta: 'Auditar mi propio sitio gratis',
    seoTitle: (name: string) => `Informe de accesibilidad — ${name}`,
    seoDesc: 'Informe de auditoría de accesibilidad RGAA compartido en modo de solo lectura.',
    kicker: 'Informe de auditoría compartido · solo lectura',
    auditLine: (date: string, n: number) =>
      `· Auditoría RGAA 4.1.2 del ${date} · ${n} página${n > 1 ? 's' : ''} analizada${n > 1 ? 's' : ''}`,
    ringGlobal: 'Tasa de conformidad global',
    cardGlobal: 'Conformidad global',
    ringRgaa: 'Puntuación RGAA 4.1.2',
    ringWcag: 'Puntuación WCAG 2.2 AA',
    cardWcag: 'WCAG 2.2 AA',
    ringOfficial: 'Tasa de conformidad RGAA sobre los criterios evaluados',
    cardOfficial: 'Tasa RGAA oficial',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} conformes · ${nc} no conformes · ${av} por verificar`,
    pageScoresTitle: 'Puntuación por página',
    pageIssues: (n: number) => `${n} incidencia${n > 1 ? 's' : ''}`,
    criteriaTitle: 'Los 106 criterios del RGAA 4.1.2',
    criteriaIntro:
      'Estado de cada criterio según el método oficial. Pase el cursor sobre el «?» para obtener una explicación en lenguaje sencillo.',
    openIssuesTitle: 'Incumplimientos abiertos',
    noOpenIssues: '🎉 Ningún incumplimiento abierto en las reglas automatizables.',
    footerText:
      'Este informe se ha generado con Konforme — auditoría de accesibilidad RGAA / EAA automatizada, evaluación manual integrada y declaración legal.',
    footerCta: 'Auditar mi sitio gratis',
  },
  it: {
    loadingReport: 'Caricamento del report',
    notFoundSeoTitle: 'Report non trovato',
    notFoundSeoDesc: 'Questo link di condivisione non è più valido.',
    notFoundTitle: 'Report non trovato',
    notFoundDesc:
      'Questo link di condivisione non è valido oppure è stato revocato dal proprietario del report.',
    notFoundCta: 'Verifica gratuitamente il mio sito',
    seoTitle: (name: string) => `Report di accessibilità — ${name}`,
    seoDesc: 'Report di audit di accessibilità RGAA condiviso in sola lettura.',
    kicker: 'Report di audit condiviso · sola lettura',
    auditLine: (date: string, n: number) =>
      `· Audit RGAA 4.1.2 del ${date} · ${n} ${n > 1 ? 'pagine analizzate' : 'pagina analizzata'}`,
    ringGlobal: 'Tasso di conformità complessivo',
    cardGlobal: 'Conformità complessiva',
    ringRgaa: 'Punteggio RGAA 4.1.2',
    ringWcag: 'Punteggio WCAG 2.2 AA',
    cardWcag: 'WCAG 2.2 AA',
    ringOfficial: 'Tasso di conformità RGAA sui criteri valutati',
    cardOfficial: 'Tasso RGAA ufficiale',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} conformi · ${nc} non conformi · ${av} da verificare`,
    pageScoresTitle: 'Punteggio per pagina',
    pageIssues: (n: number) => `${n} problem${n > 1 ? 'i' : 'a'}`,
    criteriaTitle: 'I 106 criteri del RGAA 4.1.2',
    criteriaIntro:
      'Stato di ogni criterio secondo il metodo ufficiale. Passi il puntatore sul « ? » per una spiegazione in linguaggio semplice.',
    openIssuesTitle: 'Non conformità aperte',
    noOpenIssues: '🎉 Nessuna non conformità aperta sulle regole automatizzabili.',
    footerText:
      "Questo report è stato generato con Konforme — audit di accessibilità RGAA / EAA automatizzato, valutazione manuale integrata e dichiarazione legale.",
    footerCta: 'Verifica gratuitamente il mio sito',
  },
})

/**
 * Rapport d'audit partagé en lecture seule (lien public /r/:token).
 * Permet à une agence ou un prestataire de partager le rapport avec son
 * client, ou à une entreprise de le transmettre à un donneur d'ordre —
 * sans créer de compte.
 */
export function PublicReport() {
  const { token } = useParams<{ token: string }>()
  const t = useMessages(L)
  const lang = useLang()
  const { data, isLoading, error } = useQuery({
    queryKey: ['shared-report', token],
    enabled: !!token,
    retry: 1,
    queryFn: () => fetchSharedReport(token!),
  })

  const reviews: CriterionReview[] = useMemo(
    () =>
      (data?.reviews ?? []).map((r) => ({
        id: `pub-${r.criterion_id}`,
        site_id: '',
        organization_id: '',
        criterion_id: r.criterion_id,
        status: r.status,
        note: r.note,
        reviewed_at: r.reviewed_at,
        created_at: r.reviewed_at,
      })),
    [data],
  )
  const conformity = useMemo(
    () => computeConformity(data?.issues ?? [], undefined, reviews),
    [data, reviews],
  )

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-14 space-y-6" role="status" aria-label={t.loadingReport}>
        <Skeleton className="h-16 w-2/3" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <Seo title={t.notFoundSeoTitle} description={t.notFoundSeoDesc} path="/r" noindex localized />
        <h1 className="text-2xl font-bold mb-3">{t.notFoundTitle}</h1>
        <p className="text-text-muted mb-6">
          {t.notFoundDesc}
        </p>
        <Link to={localizePath(lang, '/')} className={buttonVariants()}>{t.notFoundCta}</Link>
      </div>
    )
  }

  const open = data.issues.filter((i) => i.status === 'open' || i.status === 'in_progress')

  return (
    <div className="mx-auto max-w-5xl px-6 py-14 space-y-6">
      <Seo
        title={t.seoTitle(data.site.name)}
        description={t.seoDesc}
        path={`/r/${token}`}
        noindex
        localized
      />

      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-link mb-2">
          {t.kicker}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">
          {data.site.name}
        </h1>
        <p className="text-text-muted mt-1">
          {data.site.url && (
            <a href={data.site.url} target="_blank" rel="noreferrer" className="underline hover:text-text">
              {data.site.url}
            </a>
          )}{' '}
          {t.auditLine(formatDate(data.scan.created_at, true, lang), data.scan.pages_count)}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-5">
          <ScoreRing score={data.scan.score} label={t.ringGlobal} />
          <div className="text-sm font-semibold">{t.cardGlobal}</div>
        </Card>
        <Card className="flex items-center gap-5">
          <ScoreRing score={data.scan.rgaa_score} size={72} label={t.ringRgaa} />
          <div className="text-sm font-semibold">RGAA 4.1.2</div>
        </Card>
        <Card className="flex items-center gap-5">
          <ScoreRing score={data.scan.wcag_score} size={72} label={t.ringWcag} />
          <div className="text-sm font-semibold">{t.cardWcag}</div>
        </Card>
        <Card className="flex items-center gap-5">
          <ScoreRing score={conformity.rate} size={72} label={t.ringOfficial} />
          <div>
            <div className="text-sm font-semibold">{t.cardOfficial}</div>
            <p className="text-xs text-text-dim mt-1">
              {t.conformityCounts(conformity.ok, conformity.nonConformes, conformity.aVerifier)}
            </p>
          </div>
        </Card>
      </div>

      {(data.scan.page_scores?.length ?? 0) > 1 && (
        <Card>
          <h2 className="text-lg font-bold mb-4">{t.pageScoresTitle}</h2>
          <ul className="space-y-2">
            {data.scan.page_scores!.map((p) => (
              <li key={p.url} className="flex items-center gap-3 rounded-[12px] border border-border px-4 py-2.5 text-sm">
                <span className="shrink-0 font-bold tabular-nums w-12 text-right" style={{ color: scoreColor(p.score) }}>
                  {p.score !== null ? `${Math.round(p.score)}%` : '—'}
                </span>
                <span className="flex-1 min-w-0 truncate text-text-soft">{p.url}</span>
                <span className="shrink-0 text-xs text-text-dim">{t.pageIssues(p.issues)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-bold mb-1">{t.criteriaTitle}</h2>
        <p className="text-xs text-text-dim mb-5">
          {t.criteriaIntro}
        </p>
        <RgaaCriteriaList issues={data.issues} reviews={reviews} />
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4">
          {t.openIssuesTitle} <span className="text-text-dim font-normal">({open.length})</span>
        </h2>
        {open.length === 0 ? (
          <p className="text-sm text-text-muted py-6 text-center">
            {t.noOpenIssues}
          </p>
        ) : (
          <ul className="space-y-2">
            {SEVERITY_ORDER.flatMap((sev) =>
              open
                .filter((i) => i.severity === sev)
                .map((i) => (
                  <li key={i.id} className="flex items-center gap-3 rounded-[12px] border border-border px-4 py-2.5 text-sm">
                    <Badge className={`${SEVERITY_META[i.severity].className} shrink-0`}>
                      {severityLabel(lang, i.severity)}
                    </Badge>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{localizeIssueTitle(lang, i)}</span>
                      <span className="block truncate text-xs text-text-dim">
                        {i.rule_id}
                        {i.page_url ? ` · ${i.page_url}` : ''}
                      </span>
                    </span>
                  </li>
                )),
            )}
          </ul>
        )}
      </Card>

      <Card className="text-center py-8">
        <p className="text-sm text-text-muted mb-4">
          {t.footerText}
        </p>
        <Link to={localizePath(lang, '/')} className={buttonVariants()}>{t.footerCta}</Link>
      </Card>
    </div>
  )
}
