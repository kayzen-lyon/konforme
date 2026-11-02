import { lazy, Suspense, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Seo } from '@/components/Seo'
import { useAuth } from '@/contexts/AuthContext'
import { countCriticalIssues, useAlerts, useMarkAlertRead, useMembership, useScans, useSites } from '@/lib/queries'
import { scoreColor } from '@/lib/format'
import { defineMessages, useLang, useMessages } from '@/i18n'
import type { ScorePoint } from '@/components/ScoreChart'
import { SitesOverview } from '@/components/SitesOverview'
import { buildSiteHealth } from '@/lib/dashboard'

const ScoreChart = lazy(() => import('@/components/ScoreChart'))

const L = defineMessages({
  fr: {
    seoTitle: 'Tableau de bord',
    seoDesc: "État de l'accessibilité de vos sites.",
    hello: 'Bonjour,',
    fallbackName: 'à vous',
    subtitle: "Voici l'état de l'accessibilité de vos sites.",
    addSite: '+ Ajouter un site',
    alertsLabel: 'Alertes de régression',
    viewReport: 'Voir le rapport',
    markRead: 'Marquer comme lue',
    kpiSitesLabel: 'Sites surveillés',
    kpiSitesHintYes: 'Sites suivis par Konforme',
    kpiSitesHintNo: 'Ajoutez votre premier site',
    kpiScoreLabel: 'Score moyen',
    kpiScoreHintYes: 'Dernier audit par site',
    kpiScoreHintNo: 'Lancez votre premier scan',
    kpiIssuesLabel: 'Issues critiques',
    kpiIssuesHint: 'À corriger en priorité',
    kpiEaaLabel: 'Conformité EAA',
    kpiEaaHint: 'Statut global (WCAG 2.2)',
    eaaTotal: 'Conforme',
    eaaPartial: 'Partielle',
    eaaNone: 'Non conforme',
    chartTitle: 'Évolution du score',
    chartDesc: (n: number) => `Taux de conformité des ${n} derniers audits.`,
    startTitle: 'Démarrez votre audit',
    startDesc: 'Quatre étapes pour mettre vos sites en conformité RGAA & WCAG.',
    step1Title: 'Ajoutez votre premier site',
    step1Desc: 'URL et nom du site, en 30 secondes.',
    step2Title: 'Lancez un scan complet',
    step2Desc: "Jusqu'à 5 pages analysées sur ~30 règles RGAA 4.1.2 / WCAG 2.2.",
    step3Title: 'Corrigez avec les suggestions',
    step3Desc: 'Chaque non-conformité vient avec le code concerné et la correction.',
    step4Title: 'Générez votre déclaration légale',
    step4Desc: "Document conforme à l'article 47 de la loi de 2005, prêt à publier.",
    startCta: 'Ajouter un site',
  },
  en: {
    seoTitle: 'Dashboard',
    seoDesc: 'The accessibility status of your websites.',
    hello: 'Hello,',
    fallbackName: 'there',
    subtitle: 'Here is the accessibility status of your websites.',
    addSite: '+ Add a website',
    alertsLabel: 'Regression alerts',
    viewReport: 'View report',
    markRead: 'Mark as read',
    kpiSitesLabel: 'Monitored websites',
    kpiSitesHintYes: 'Websites tracked by Konforme',
    kpiSitesHintNo: 'Add your first website',
    kpiScoreLabel: 'Average score',
    kpiScoreHintYes: 'Latest audit per website',
    kpiScoreHintNo: 'Run your first scan',
    kpiIssuesLabel: 'Critical issues',
    kpiIssuesHint: 'Fix these first',
    kpiEaaLabel: 'EAA compliance',
    kpiEaaHint: 'Overall status (WCAG 2.2)',
    eaaTotal: 'Compliant',
    eaaPartial: 'Partial',
    eaaNone: 'Non-compliant',
    chartTitle: 'Score over time',
    chartDesc: (n: number) => `Compliance rate across the last ${n} audits.`,
    startTitle: 'Start your audit',
    startDesc: 'Four steps to bring your websites into RGAA & WCAG compliance.',
    step1Title: 'Add your first website',
    step1Desc: 'Website URL and name, in 30 seconds.',
    step2Title: 'Run a full scan',
    step2Desc: 'Up to 5 pages analysed against ~30 RGAA 4.1.2 / WCAG 2.2 rules.',
    step3Title: 'Fix issues with the suggestions',
    step3Desc: 'Every issue comes with the offending code and the fix to apply.',
    step4Title: 'Generate your legal statement',
    step4Desc: 'A document compliant with Article 47 of the 2005 French act, ready to publish.',
    startCta: 'Add a website',
  },
  de: {
    seoTitle: 'Dashboard',
    seoDesc: 'Der Stand der Barrierefreiheit Ihrer Websites.',
    hello: 'Guten Tag,',
    fallbackName: 'willkommen',
    subtitle: 'Hier sehen Sie den Stand der Barrierefreiheit Ihrer Websites.',
    addSite: '+ Website hinzufügen',
    alertsLabel: 'Regressionswarnungen',
    viewReport: 'Bericht ansehen',
    markRead: 'Als gelesen markieren',
    kpiSitesLabel: 'Überwachte Websites',
    kpiSitesHintYes: 'Von Konforme überwachte Websites',
    kpiSitesHintNo: 'Fügen Sie Ihre erste Website hinzu',
    kpiScoreLabel: 'Durchschnittlicher Score',
    kpiScoreHintYes: 'Letztes Audit je Website',
    kpiScoreHintNo: 'Starten Sie Ihren ersten Scan',
    kpiIssuesLabel: 'Kritische Probleme',
    kpiIssuesHint: 'Vorrangig zu beheben',
    kpiEaaLabel: 'EAA-Konformität',
    kpiEaaHint: 'Gesamtstatus (WCAG 2.2)',
    eaaTotal: 'Konform',
    eaaPartial: 'Teilweise',
    eaaNone: 'Nicht konform',
    chartTitle: 'Score-Entwicklung',
    chartDesc: (n: number) => `Konformitätsgrad der letzten ${n} Audits.`,
    startTitle: 'Starten Sie Ihr Audit',
    startDesc: 'Vier Schritte, um Ihre Websites RGAA- und WCAG-konform zu machen.',
    step1Title: 'Fügen Sie Ihre erste Website hinzu',
    step1Desc: 'URL und Name der Website – in 30 Sekunden.',
    step2Title: 'Starten Sie einen vollständigen Scan',
    step2Desc: 'Bis zu 5 Seiten, geprüft anhand von rund 30 Regeln nach RGAA 4.1.2 / WCAG 2.2.',
    step3Title: 'Beheben Sie die Mängel mit den Vorschlägen',
    step3Desc: 'Zu jedem Mangel erhalten Sie den betroffenen Code und die passende Korrektur.',
    step4Title: 'Erzeugen Sie Ihre rechtliche Erklärung',
    step4Desc: 'Ein Dokument gemäß Artikel 47 des französischen Gesetzes von 2005, bereit zur Veröffentlichung.',
    startCta: 'Website hinzufügen',
  },
  es: {
    seoTitle: 'Panel de control',
    seoDesc: 'El estado de accesibilidad de sus sitios web.',
    hello: 'Hola,',
    fallbackName: 'qué tal',
    subtitle: 'Este es el estado de accesibilidad de sus sitios web.',
    addSite: '+ Añadir un sitio',
    alertsLabel: 'Alertas de regresión',
    viewReport: 'Ver el informe',
    markRead: 'Marcar como leída',
    kpiSitesLabel: 'Sitios supervisados',
    kpiSitesHintYes: 'Sitios supervisados por Konforme',
    kpiSitesHintNo: 'Añada su primer sitio',
    kpiScoreLabel: 'Puntuación media',
    kpiScoreHintYes: 'Última auditoría por sitio',
    kpiScoreHintNo: 'Lance su primer análisis',
    kpiIssuesLabel: 'Incidencias críticas',
    kpiIssuesHint: 'Corríjalas de forma prioritaria',
    kpiEaaLabel: 'Conformidad EAA',
    kpiEaaHint: 'Estado global (WCAG 2.2)',
    eaaTotal: 'Conforme',
    eaaPartial: 'Parcial',
    eaaNone: 'No conforme',
    chartTitle: 'Evolución de la puntuación',
    chartDesc: (n: number) => `Tasa de conformidad de las ${n} últimas auditorías.`,
    startTitle: 'Comience su auditoría',
    startDesc: 'Cuatro pasos para poner sus sitios en conformidad con RGAA y WCAG.',
    step1Title: 'Añada su primer sitio',
    step1Desc: 'URL y nombre del sitio, en 30 segundos.',
    step2Title: 'Lance un análisis completo',
    step2Desc: 'Hasta 5 páginas analizadas con unas 30 reglas RGAA 4.1.2 / WCAG 2.2.',
    step3Title: 'Corrija con las sugerencias',
    step3Desc: 'Cada incumplimiento incluye el código afectado y la corrección que debe aplicar.',
    step4Title: 'Genere su declaración legal',
    step4Desc: 'Documento conforme al artículo 47 de la ley francesa de 2005, listo para publicar.',
    startCta: 'Añadir un sitio',
  },
  it: {
    seoTitle: 'Cruscotto',
    seoDesc: "Lo stato di accessibilità dei suoi siti.",
    hello: 'Buongiorno,',
    fallbackName: 'benvenuto',
    subtitle: "Ecco lo stato di accessibilità dei suoi siti.",
    addSite: '+ Aggiungi un sito',
    alertsLabel: 'Avvisi di regressione',
    viewReport: 'Vedi il report',
    markRead: 'Segna come letto',
    kpiSitesLabel: 'Siti monitorati',
    kpiSitesHintYes: 'Siti monitorati da Konforme',
    kpiSitesHintNo: 'Aggiunga il suo primo sito',
    kpiScoreLabel: 'Punteggio medio',
    kpiScoreHintYes: 'Ultimo audit per sito',
    kpiScoreHintNo: 'Avvii la sua prima scansione',
    kpiIssuesLabel: 'Problemi critici',
    kpiIssuesHint: 'Da correggere con priorità',
    kpiEaaLabel: 'Conformità EAA',
    kpiEaaHint: 'Stato complessivo (WCAG 2.2)',
    eaaTotal: 'Conforme',
    eaaPartial: 'Parziale',
    eaaNone: 'Non conforme',
    chartTitle: 'Andamento del punteggio',
    chartDesc: (n: number) => `Tasso di conformità degli ultimi ${n} audit.`,
    startTitle: 'Avvii il suo audit',
    startDesc: 'Quattro passaggi per rendere i suoi siti conformi a RGAA e WCAG.',
    step1Title: 'Aggiunga il suo primo sito',
    step1Desc: 'URL e nome del sito, in 30 secondi.',
    step2Title: 'Avvii una scansione completa',
    step2Desc: 'Fino a 5 pagine analizzate su circa 30 regole RGAA 4.1.2 / WCAG 2.2.',
    step3Title: 'Corregga con i suggerimenti',
    step3Desc: 'Ogni non conformità è accompagnata dal codice interessato e dalla correzione.',
    step4Title: 'Generi la sua dichiarazione legale',
    step4Desc: "Documento conforme all'articolo 47 della legge francese del 2005, pronto da pubblicare.",
    startCta: 'Aggiungi un sito',
  },
})

export function DashboardHome() {
  const { user } = useAuth()
  const t = useMessages(L)
  const lang = useLang()
  const name = user?.name?.split(' ')[0] || t.fallbackName
  const { data: membership } = useMembership()
  const orgId = membership?.organization_id
  const { data: sites } = useSites(orgId)
  const { data: scans } = useScans(orgId)
  const { data: alerts } = useAlerts(orgId)
  const markRead = useMarkAlertRead()
  const unreadAlerts = useMemo(() => (alerts ?? []).filter((a) => !a.read), [alerts])

  const doneScans = useMemo(() => (scans ?? []).filter((s) => s.status === 'done'), [scans])

  // Issues critiques ouvertes sur le dernier scan terminé de chaque site
  const latestIds = useMemo(
    () => latestScanPerSite(doneScans).map((s) => s.id),
    [doneScans],
  )
  const { data: criticalCount } = useQuery({
    queryKey: ['critical-count', orgId, latestIds.join(',')],
    enabled: latestIds.length > 0,
    queryFn: () => countCriticalIssues(latestIds),
  })

  const stats = useMemo(() => {
    const latest = latestScanPerSite(doneScans)
    const scores = latest.map((s) => s.score).filter((s): s is number => s !== null)
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
    return {
      sitesCount: sites?.length ?? 0,
      avgScore: avg,
    }
  }, [sites, doneScans])

  const eaa =
    stats.avgScore === null
      ? null
      : stats.avgScore >= 100
        ? t.eaaTotal
        : stats.avgScore >= 50
          ? t.eaaPartial
          : t.eaaNone

  const chartData: ScorePoint[] = useMemo(
    () =>
      [...doneScans]
        .reverse()
        .filter((s) => s.score !== null)
        .slice(-20)
        .map((s) => ({
          date: new Intl.DateTimeFormat(lang, { day: '2-digit', month: '2-digit' }).format(
            new Date(s.created_at),
          ),
          score: Math.round(s.score!),
          site: s.sites?.name ?? '',
        })),
    [doneScans, lang],
  )

  const hasSites = (sites?.length ?? 0) > 0
  const health = useMemo(() => buildSiteHealth(sites ?? [], scans ?? []), [sites, scans])

  return (
    <div className="space-y-8">
      <Seo title={t.seoTitle} description={t.seoDesc} path="/dashboard" noindex />
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">
            {t.hello} <span className="gradient-text">{name}</span>
          </h1>
          <p className="text-text-muted mt-1">{t.subtitle}</p>
        </div>
        <Link to="/dashboard/sites" className={buttonVariants()}>{t.addSite}</Link>
      </header>

      {unreadAlerts.length > 0 && (
        <section aria-label={t.alertsLabel} className="space-y-2">
          {unreadAlerts.map((a) => (
            <div
              key={a.id}
              role="alert"
              className="flex flex-wrap items-center gap-3 rounded-[12px] border border-danger/40 bg-danger-bg/25 px-4 py-3"
            >
              <span aria-hidden="true" className="text-lg">⚠️</span>
              <span className="min-w-0 flex-1 text-sm text-text-soft">{a.message}</span>
              {a.scan_id && (
                <Link to={`/dashboard/scans/${a.scan_id}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>{t.viewReport}</Link>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={markRead.isPending}
                onClick={() => markRead.mutate(a.id)}
              >
                {t.markRead}
              </Button>
            </div>
          ))}
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={t.kpiSitesLabel}
          value={String(stats.sitesCount)}
          hint={hasSites ? t.kpiSitesHintYes : t.kpiSitesHintNo}
          accent="var(--color-primary)"
        />
        <KpiCard
          label={t.kpiScoreLabel}
          value={stats.avgScore !== null ? `${stats.avgScore}%` : '—'}
          hint={stats.avgScore !== null ? t.kpiScoreHintYes : t.kpiScoreHintNo}
          accent={stats.avgScore !== null ? scoreColor(stats.avgScore) : 'var(--color-accent)'}
        />
        <KpiCard
          label={t.kpiIssuesLabel}
          value={String(criticalCount ?? 0)}
          hint={t.kpiIssuesHint}
          accent="var(--color-danger)"
        />
        <KpiCard
          label={t.kpiEaaLabel}
          value={eaa ?? '—'}
          hint={t.kpiEaaHint}
          accent="var(--color-success)"
        />
      </div>

      <SitesOverview health={health} alerts={alerts ?? []} />

      {chartData.length >= 2 && (
        <Card>
          <h2 className="text-lg font-bold mb-1">{t.chartTitle}</h2>
          <p className="text-sm text-text-muted mb-4">
            {t.chartDesc(chartData.length)}
          </p>
          <Suspense fallback={<div className="h-[260px] rounded-[12px] bg-raise animate-pulse" aria-hidden="true" />}>
            <ScoreChart data={chartData} />
          </Suspense>
        </Card>
      )}

      {!hasSites && (
        <Card>
          <h2 className="text-lg font-bold mb-1">{t.startTitle}</h2>
          <p className="text-sm text-text-muted mb-6">
            {t.startDesc}
          </p>
          <ol className="space-y-3">
            {[
              { title: t.step1Title, desc: t.step1Desc },
              { title: t.step2Title, desc: t.step2Desc },
              { title: t.step3Title, desc: t.step3Desc },
              { title: t.step4Title, desc: t.step4Desc },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-4 items-start">
                <span
                  className="size-8 shrink-0 rounded-[12px] bg-primary flex items-center justify-center text-on-primary text-sm font-bold"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-text">{step.title}</h3>
                  <p className="text-sm text-text-muted">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-6">
            <Link to="/dashboard/sites" className={buttonVariants()}>{t.startCta}</Link>
          </div>
        </Card>
      )}
    </div>
  )
}

/** Garde le scan terminé le plus récent de chaque site. */
function latestScanPerSite<T extends { site_id: string; created_at: string }>(scans: T[]): T[] {
  const bySite = new Map<string, T>()
  for (const s of scans) {
    const cur = bySite.get(s.site_id)
    if (!cur || s.created_at > cur.created_at) bySite.set(s.site_id, s)
  }
  return [...bySite.values()]
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string
  value: string
  hint: string
  accent: string
}) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div
        aria-hidden="true"
        className="absolute -top-12 -right-12 size-28 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
      <div className="text-xs font-semibold uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-text-dim">{hint}</div>
    </Card>
  )
}
