import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { useAuth } from '@/contexts/AuthContext'
import { useLaunchScan, useMembership } from '@/lib/queries'
import { scoreColor } from '@/lib/format'
import { defineMessages, useMessages } from '@/i18n'
import {
  buildPriorities,
  sitesToCsv,
  type Priority,
  type SiteHealth,
  type SiteHealthState,
} from '@/lib/dashboard'
import type { Alert } from '@/lib/database.types'

const L = defineMessages({
  fr: {
    prioTitle: 'À faire en priorité',
    prioNone: 'Tout est à jour : aucune action urgente.',
    regression: (n: number) => `${n} régression${n > 1 ? 's' : ''} de score non lue${n > 1 ? 's' : ''}`,
    critical: (n: number) => `${n} site${n > 1 ? 's' : ''} sous 50 % de conformité`,
    failed: (n: number) => `${n} site${n > 1 ? 's' : ''} dont le dernier audit a échoué`,
    never: (n: number) => `${n} site${n > 1 ? 's' : ''} jamais audité${n > 1 ? 's' : ''}`,
    stale: (n: number) => `${n} site${n > 1 ? 's' : ''} non audité${n > 1 ? 's' : ''} depuis plus de 30 jours`,
    see: 'Voir',
    tableTitle: 'Vos sites',
    export: 'Exporter en CSV',
    colSite: 'Site',
    colScore: 'Score',
    colTrend: 'Évolution',
    colLast: 'Dernier audit',
    colStatus: 'État',
    colAction: 'Action',
    launch: 'Lancer un audit',
    launching: 'Lancement…',
    never_: 'Jamais',
    daysAgo: (n: number) => (n === 0 ? "Aujourd'hui" : `Il y a ${n} j`),
    s_ok: 'À jour',
    s_running: 'En cours',
    s_failed: 'Échec',
    s_critical: 'Critique',
    s_stale: 'À relancer',
    s_never: 'À auditer',
    open: 'Ouvrir',
  },
  en: {
    prioTitle: 'Do first',
    prioNone: 'Everything is up to date: no urgent action.',
    regression: (n: number) => `${n} unread score regression${n > 1 ? 's' : ''}`,
    critical: (n: number) => `${n} site${n > 1 ? 's' : ''} below 50% compliance`,
    failed: (n: number) => `${n} site${n > 1 ? 's' : ''} with a failed latest audit`,
    never: (n: number) => `${n} site${n > 1 ? 's' : ''} never audited`,
    stale: (n: number) => `${n} site${n > 1 ? 's' : ''} not audited for over 30 days`,
    see: 'View',
    tableTitle: 'Your websites',
    export: 'Export as CSV',
    colSite: 'Site',
    colScore: 'Score',
    colTrend: 'Trend',
    colLast: 'Last audit',
    colStatus: 'Status',
    colAction: 'Action',
    launch: 'Run audit',
    launching: 'Starting…',
    never_: 'Never',
    daysAgo: (n: number) => (n === 0 ? 'Today' : `${n} d ago`),
    s_ok: 'Up to date',
    s_running: 'Running',
    s_failed: 'Failed',
    s_critical: 'Critical',
    s_stale: 'Re-run',
    s_never: 'To audit',
    open: 'Open',
  },
  de: {
    prioTitle: 'Zuerst erledigen',
    prioNone: 'Alles aktuell: keine dringende Aktion.',
    regression: (n: number) => `${n} ungelesene Score-Verschlechterung${n > 1 ? 'en' : ''}`,
    critical: (n: number) => `${n} Website${n > 1 ? 's' : ''} unter 50 % Konformität`,
    failed: (n: number) => `${n} Website${n > 1 ? 's' : ''} mit fehlgeschlagenem letztem Audit`,
    never: (n: number) => `${n} Website${n > 1 ? 's' : ''} noch nie geprüft`,
    stale: (n: number) => `${n} Website${n > 1 ? 's' : ''} seit über 30 Tagen nicht geprüft`,
    see: 'Ansehen',
    tableTitle: 'Ihre Websites',
    export: 'Als CSV exportieren',
    colSite: 'Website',
    colScore: 'Score',
    colTrend: 'Verlauf',
    colLast: 'Letztes Audit',
    colStatus: 'Status',
    colAction: 'Aktion',
    launch: 'Audit starten',
    launching: 'Start…',
    never_: 'Nie',
    daysAgo: (n: number) => (n === 0 ? 'Heute' : `Vor ${n} T.`),
    s_ok: 'Aktuell',
    s_running: 'Läuft',
    s_failed: 'Fehlgeschlagen',
    s_critical: 'Kritisch',
    s_stale: 'Neu starten',
    s_never: 'Zu prüfen',
    open: 'Öffnen',
  },
  es: {
    prioTitle: 'Prioridades',
    prioNone: 'Todo al día: ninguna acción urgente.',
    regression: (n: number) => `${n} regresión${n > 1 ? 'es' : ''} de puntuación sin leer`,
    critical: (n: number) => `${n} sitio${n > 1 ? 's' : ''} por debajo del 50 % de conformidad`,
    failed: (n: number) => `${n} sitio${n > 1 ? 's' : ''} con la última auditoría fallida`,
    never: (n: number) => `${n} sitio${n > 1 ? 's' : ''} nunca auditado${n > 1 ? 's' : ''}`,
    stale: (n: number) => `${n} sitio${n > 1 ? 's' : ''} sin auditar desde hace más de 30 días`,
    see: 'Ver',
    tableTitle: 'Sus sitios',
    export: 'Exportar a CSV',
    colSite: 'Sitio',
    colScore: 'Puntuación',
    colTrend: 'Evolución',
    colLast: 'Última auditoría',
    colStatus: 'Estado',
    colAction: 'Acción',
    launch: 'Lanzar auditoría',
    launching: 'Iniciando…',
    never_: 'Nunca',
    daysAgo: (n: number) => (n === 0 ? 'Hoy' : `Hace ${n} d`),
    s_ok: 'Al día',
    s_running: 'En curso',
    s_failed: 'Fallida',
    s_critical: 'Crítico',
    s_stale: 'Relanzar',
    s_never: 'Por auditar',
    open: 'Abrir',
  },
  it: {
    prioTitle: 'Da fare subito',
    prioNone: 'Tutto aggiornato: nessuna azione urgente.',
    regression: (n: number) => `${n} regressione${n > 1 ? 'i' : ''} di punteggio non letta${n > 1 ? 'e' : ''}`,
    critical: (n: number) => `${n} sito${n > 1 ? 'i' : ''} sotto il 50 % di conformità`,
    failed: (n: number) => `${n} sito${n > 1 ? 'i' : ''} con l'ultimo audit fallito`,
    never: (n: number) => `${n} sito${n > 1 ? 'i' : ''} mai verificato${n > 1 ? 'i' : ''}`,
    stale: (n: number) => `${n} sito${n > 1 ? 'i' : ''} non verificato${n > 1 ? 'i' : ''} da oltre 30 giorni`,
    see: 'Vedi',
    tableTitle: 'I suoi siti',
    export: 'Esporta in CSV',
    colSite: 'Sito',
    colScore: 'Punteggio',
    colTrend: 'Andamento',
    colLast: 'Ultimo audit',
    colStatus: 'Stato',
    colAction: 'Azione',
    launch: 'Avvia audit',
    launching: 'Avvio…',
    never_: 'Mai',
    daysAgo: (n: number) => (n === 0 ? 'Oggi' : `${n} g fa`),
    s_ok: 'Aggiornato',
    s_running: 'In corso',
    s_failed: 'Fallito',
    s_critical: 'Critico',
    s_stale: 'Rilancia',
    s_never: 'Da verificare',
    open: 'Apri',
  },
})

const STATE_TONE: Record<SiteHealthState, string> = {
  ok: 'text-success',
  running: 'text-primary',
  failed: 'text-danger',
  critical: 'text-danger',
  stale: 'text-warning',
  never: 'text-text-muted',
}

function downloadCsv(health: SiteHealth[]) {
  const blob = new Blob([sitesToCsv(health)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `konforme-sites-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function SitesOverview({ health, alerts }: { health: SiteHealth[]; alerts: Alert[] }) {
  const t = useMessages(L)
  const { user } = useAuth()
  const { data: membership } = useMembership()
  const launch = useLaunchScan(membership?.organizations.plan ?? 'free')
  const priorities = useMemo(() => buildPriorities(health, alerts), [health, alerts])
  const canLaunch = !!user && membership?.role !== 'viewer'

  const label = (p: Priority) =>
    p.kind === 'regression' ? t.regression(p.count) : t[p.kind](p.sites.length)
  const href = (p: Priority) =>
    p.kind === 'regression'
      ? '/dashboard/scans'
      : p.kind === 'failed'
        ? '/dashboard/scans'
        : '/dashboard/sites'

  const stateLabel: Record<SiteHealthState, string> = {
    ok: t.s_ok,
    running: t.s_running,
    failed: t.s_failed,
    critical: t.s_critical,
    stale: t.s_stale,
    never: t.s_never,
  }

  if (health.length === 0) return null

  return (
    <>
      <Card>
        <h2 className="text-lg font-bold mb-3">{t.prioTitle}</h2>
        {priorities.length === 0 ? (
          <p className="text-sm text-text-muted">{t.prioNone}</p>
        ) : (
          <ul className="space-y-2">
            {priorities.map((p) => (
              <li key={p.kind} className="flex items-center gap-3 text-sm">
                <span className="min-w-0 flex-1 text-text-soft">{label(p)}</span>
                <Link to={href(p)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  {t.see}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold">{t.tableTitle}</h2>
          <Button size="sm" variant="outline" onClick={() => downloadCsv(health)}>
            {t.export}
          </Button>
        </div>
        {launch.isError && (
          <p role="alert" className="mb-3 text-sm text-danger">
            {launch.error instanceof Error ? launch.error.message : String(launch.error)}
          </p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-muted">
                <th scope="col" className="py-2 pr-3 font-semibold">{t.colSite}</th>
                <th scope="col" className="py-2 pr-3 font-semibold">{t.colScore}</th>
                <th scope="col" className="py-2 pr-3 font-semibold">{t.colTrend}</th>
                <th scope="col" className="py-2 pr-3 font-semibold">{t.colLast}</th>
                <th scope="col" className="py-2 pr-3 font-semibold">{t.colStatus}</th>
                <th scope="col" className="py-2 font-semibold">{t.colAction}</th>
              </tr>
            </thead>
            <tbody>
              {health.map((h) => (
                <tr key={h.site.id} className="border-t border-border">
                  <th scope="row" className="py-3 pr-3 text-left font-semibold">
                    <Link to={h.latest ? `/dashboard/scans/${h.latest.id}` : '/dashboard/sites'} className="hover:underline">
                      {h.site.name}
                    </Link>
                    <div className="text-xs font-normal text-text-dim truncate max-w-[220px]">{h.site.url}</div>
                  </th>
                  <td className="py-3 pr-3 font-bold" style={h.latest ? { color: scoreColor(h.latest.score!) } : undefined}>
                    {h.latest ? `${Math.round(h.latest.score!)}%` : '—'}
                  </td>
                  <td className="py-3 pr-3">
                    {h.delta === null ? (
                      '—'
                    ) : (
                      <span className={h.delta > 0 ? 'text-success' : h.delta < 0 ? 'text-danger' : 'text-text-muted'}>
                        <span aria-hidden="true">{h.delta > 0 ? '▲' : h.delta < 0 ? '▼' : '='}</span>{' '}
                        {h.delta > 0 ? '+' : ''}
                        {h.delta}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-3 text-text-muted">
                    {h.daysSince === null ? t.never_ : t.daysAgo(h.daysSince)}
                  </td>
                  <td className={`py-3 pr-3 font-semibold ${STATE_TONE[h.state]}`}>{stateLabel[h.state]}</td>
                  <td className="py-3">
                    {canLaunch && h.state !== 'running' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={launch.isPending}
                        onClick={() => launch.mutate(h.site)}
                      >
                        {launch.isPending && launch.variables?.id === h.site.id ? t.launching : t.launch}
                      </Button>
                    ) : (
                      <Link to="/dashboard/scans" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                        {t.open}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
