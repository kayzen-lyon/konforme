import { lazy, Suspense, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'

const ScoreChart = lazy(() => import('@/components/ScoreChart'))
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button-variants'
import { Seo } from '@/components/Seo'
import { Skeleton } from '@/components/ui/skeleton'
import { useMembership, useScans, useSites } from '@/lib/queries'
import { formatDate, formatDuration, scoreColor, STATUS_META } from '@/lib/format'
import { defineMessages, useLang, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    seoTitle: 'Scans',
    seoDesc: "Historique des audits d'accessibilité.",
    title: 'Scans',
    subtitle: "Historique des audits d'accessibilité.",
    filterLabel: 'Filtrer par site',
    allSites: 'Tous les sites',
    loading: 'Chargement des scans',
    emptyTitle: "Aucun audit pour l'instant",
    emptyDesc: 'Lancez votre premier audit depuis la page Sites.',
    emptyCta: 'Aller aux sites',
    chartTitle: 'Évolution du score',
    chartDesc: (n: number) => `Taux de conformité des ${n} derniers audits terminés de ce site.`,
    tableCaption: "Historique des audits d'accessibilité",
    colSite: 'Site',
    colDate: 'Date',
    colStatus: 'Statut',
    colScore: 'Score',
    colIssues: 'Issues',
    colPages: 'Pages',
    colDuration: 'Durée',
    colActions: 'Actions',
    report: 'Rapport',
    reportSr: (site: string, date: string) => ` du scan de ${site} du ${date}`,
    errorShort: 'Erreur',
    follow: 'Suivre',
    followSr: (site: string) => ` le scan en cours de ${site}`,
  },
  en: {
    seoTitle: 'Scans',
    seoDesc: 'History of your accessibility audits.',
    title: 'Scans',
    subtitle: 'History of your accessibility audits.',
    filterLabel: 'Filter by website',
    allSites: 'All websites',
    loading: 'Loading scans',
    emptyTitle: 'No audits yet',
    emptyDesc: 'Run your first audit from the Websites page.',
    emptyCta: 'Go to websites',
    chartTitle: 'Score over time',
    chartDesc: (n: number) => `Compliance rate across the last ${n} completed audits of this website.`,
    tableCaption: 'History of accessibility audits',
    colSite: 'Website',
    colDate: 'Date',
    colStatus: 'Status',
    colScore: 'Score',
    colIssues: 'Issues',
    colPages: 'Pages',
    colDuration: 'Duration',
    colActions: 'Actions',
    report: 'Report',
    reportSr: (site: string, date: string) => ` of the ${site} scan from ${date}`,
    errorShort: 'Error',
    follow: 'Follow',
    followSr: (site: string) => ` the scan in progress for ${site}`,
  },
  de: {
    seoTitle: 'Scans',
    seoDesc: 'Verlauf Ihrer Barrierefreiheits-Audits.',
    title: 'Scans',
    subtitle: 'Verlauf Ihrer Barrierefreiheits-Audits.',
    filterLabel: 'Nach Website filtern',
    allSites: 'Alle Websites',
    loading: 'Scans werden geladen',
    emptyTitle: 'Noch keine Audits',
    emptyDesc: 'Starten Sie Ihr erstes Audit auf der Seite „Websites“.',
    emptyCta: 'Zu den Websites',
    chartTitle: 'Score-Entwicklung',
    chartDesc: (n: number) =>
      `Konformitätsgrad der letzten ${n} abgeschlossenen Audits dieser Website.`,
    tableCaption: 'Verlauf der Barrierefreiheits-Audits',
    colSite: 'Website',
    colDate: 'Datum',
    colStatus: 'Status',
    colScore: 'Score',
    colIssues: 'Probleme',
    colPages: 'Seiten',
    colDuration: 'Dauer',
    colActions: 'Aktionen',
    report: 'Bericht',
    reportSr: (site: string, date: string) => ` des Scans von ${site} vom ${date}`,
    errorShort: 'Fehler',
    follow: 'Verfolgen',
    followSr: (site: string) => ` des laufenden Scans von ${site}`,
  },
  es: {
    seoTitle: 'Análisis',
    seoDesc: 'Historial de sus auditorías de accesibilidad.',
    title: 'Análisis',
    subtitle: 'Historial de sus auditorías de accesibilidad.',
    filterLabel: 'Filtrar por sitio',
    allSites: 'Todos los sitios',
    loading: 'Cargando los análisis',
    emptyTitle: 'Todavía no hay auditorías',
    emptyDesc: 'Lance su primera auditoría desde la página Sitios.',
    emptyCta: 'Ir a los sitios',
    chartTitle: 'Evolución de la puntuación',
    chartDesc: (n: number) =>
      `Tasa de conformidad de las ${n} últimas auditorías finalizadas de este sitio.`,
    tableCaption: 'Historial de las auditorías de accesibilidad',
    colSite: 'Sitio',
    colDate: 'Fecha',
    colStatus: 'Estado',
    colScore: 'Puntuación',
    colIssues: 'Incidencias',
    colPages: 'Páginas',
    colDuration: 'Duración',
    colActions: 'Acciones',
    report: 'Informe',
    reportSr: (site: string, date: string) => ` del análisis de ${site} del ${date}`,
    errorShort: 'Error',
    follow: 'Seguir',
    followSr: (site: string) => ` el análisis en curso de ${site}`,
  },
  it: {
    seoTitle: 'Scansioni',
    seoDesc: 'Cronologia dei suoi audit di accessibilità.',
    title: 'Scansioni',
    subtitle: 'Cronologia dei suoi audit di accessibilità.',
    filterLabel: 'Filtra per sito',
    allSites: 'Tutti i siti',
    loading: 'Caricamento delle scansioni',
    emptyTitle: 'Nessun audit per il momento',
    emptyDesc: 'Avvii il suo primo audit dalla pagina Siti.',
    emptyCta: 'Vai ai siti',
    chartTitle: 'Andamento del punteggio',
    chartDesc: (n: number) => `Tasso di conformità degli ultimi ${n} audit completati di questo sito.`,
    tableCaption: 'Cronologia degli audit di accessibilità',
    colSite: 'Sito',
    colDate: 'Data',
    colStatus: 'Stato',
    colScore: 'Punteggio',
    colIssues: 'Problemi',
    colPages: 'Pagine',
    colDuration: 'Durata',
    colActions: 'Azioni',
    report: 'Report',
    reportSr: (site: string, date: string) => ` della scansione di ${site} del ${date}`,
    errorShort: 'Errore',
    follow: 'Segui',
    followSr: (site: string) => ` la scansione in corso di ${site}`,
  },
})

export function Scans() {
  const t = useMessages(L)
  const lang = useLang()
  const { data: membership } = useMembership()
  const orgId = membership?.organization_id
  const [params, setParams] = useSearchParams()
  const siteFilter = params.get('site') ?? undefined
  const { data: scans, isLoading } = useScans(orgId, siteFilter)
  const { data: sites } = useSites(orgId)

  // Historique du score pour le site filtré (du plus ancien au plus récent)
  const chartData = useMemo(
    () =>
      (scans ?? [])
        .filter((s) => s.status === 'done' && s.score !== null)
        .slice()
        .reverse()
        .map((s) => ({
          date: new Intl.DateTimeFormat(lang, { day: '2-digit', month: 'short' }).format(new Date(s.created_at)),
          score: Math.round(s.score!),
          site: s.sites?.name ?? '',
        })),
    [scans, lang],
  )

  return (
    <div className="space-y-6">
      <Seo title={t.seoTitle} description={t.seoDesc} path="/dashboard/scans" noindex />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{t.title}</h1>
          <p className="text-text-muted mt-1">{t.subtitle}</p>
        </div>
        <div>
          <label htmlFor="site-filter" className="sr-only">{t.filterLabel}</label>
          <select
            id="site-filter"
            value={siteFilter ?? ''}
            onChange={(e) => {
              const v = e.target.value
              setParams(v ? { site: v } : {})
            }}
            className="rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary"
          >
            <option value="">{t.allSites}</option>
            {sites?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </header>

      {isLoading && (
        <div className="space-y-3" role="status" aria-label={t.loading}>
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      )}

      {!isLoading && (scans?.length ?? 0) === 0 && (
        <Card className="text-center py-14">
          <h2 className="text-lg font-bold mb-2">{t.emptyTitle}</h2>
          <p className="text-sm text-text-muted mb-6">
            {t.emptyDesc}
          </p>
          <Link to="/dashboard/sites" className={buttonVariants()}>{t.emptyCta}</Link>
        </Card>
      )}

      {siteFilter && chartData.length >= 2 && (
        <Card>
          <h2 className="text-lg font-bold mb-2">{t.chartTitle}</h2>
          <p className="text-xs text-text-dim mb-3">
            {t.chartDesc(chartData.length)}
          </p>
          <Suspense fallback={<Skeleton className="h-64" />}>
            <ScoreChart data={chartData} />
          </Suspense>
        </Card>
      )}

      {(scans?.length ?? 0) > 0 && (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">{t.tableCaption}</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-text-muted">
                <th scope="col" className="px-5 py-3.5 font-semibold">{t.colSite}</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">{t.colDate}</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">{t.colStatus}</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">{t.colScore}</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">{t.colIssues}</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">{t.colPages}</th>
                <th scope="col" className="px-5 py-3.5 font-semibold">{t.colDuration}</th>
                <th scope="col" className="px-5 py-3.5 font-semibold"><span className="sr-only">{t.colActions}</span></th>
              </tr>
            </thead>
            <tbody>
              {scans!.map((scan) => {
                const st = STATUS_META[scan.status]
                return (
                  <tr key={scan.id} className="border-b border-border/60 last:border-0 hover:bg-white/[0.03]">
                    <td className="px-5 py-3.5 font-medium">{scan.sites?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-text-muted">{formatDate(scan.created_at, true, lang)}</td>
                    <td className="px-5 py-3.5"><Badge className={st.className}>{st.label}</Badge></td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: scoreColor(scan.score) }}>
                      {scan.score !== null ? `${Math.round(scan.score)}%` : '—'}
                    </td>
                    <td className="px-5 py-3.5">{scan.status === 'done' ? scan.issues_count : '—'}</td>
                    <td className="px-5 py-3.5">{scan.status === 'done' ? scan.pages_count : '—'}</td>
                    <td className="px-5 py-3.5 text-text-muted">{formatDuration(scan.duration_ms)}</td>
                    <td className="px-5 py-3.5">
                      {scan.status === 'done' ? (
                        <Link
                          to={`/dashboard/scans/${scan.id}`}
                          className="text-link font-semibold underline underline-offset-2 hover:decoration-2"
                        >
                          {t.report}<span className="sr-only">{t.reportSr(scan.sites?.name ?? '', formatDate(scan.created_at, false, lang))}</span>
                        </Link>
                      ) : scan.status === 'failed' ? (
                        <span className="text-xs text-danger-soft" title={scan.error ?? undefined}>
                          {scan.error ? scan.error.slice(0, 60) : t.errorShort}
                        </span>
                      ) : (
                        <Link
                          to={`/dashboard/scans/${scan.id}`}
                          className="text-primary-soft font-semibold hover:underline"
                        >
                          {t.follow}<span className="sr-only">{t.followSr(scan.sites?.name ?? '')}</span>
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
