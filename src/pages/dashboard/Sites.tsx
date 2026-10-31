import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Badge } from '@/components/ui/badge'
import { Seo } from '@/components/Seo'
import {
  useAddSite,
  useDeleteSite,
  useLaunchScan,
  useMembership,
  useScans,
  useSites,
  useUpdateSite,
} from '@/lib/queries'
import { formatDate, scoreColor } from '@/lib/format'
import { PLANS, scansUsedThisMonth, type PlanId } from '@/lib/plans'
import { defineMessages, useLang, useMessages } from '@/i18n'
import { planName } from '@/i18n/plans-i18n'
import type { Site } from '@/lib/database.types'

const L = defineMessages({
  fr: {
    seoTitle: 'Sites',
    seoDesc: 'Gérez les sites surveillés par Konforme.',
    title: 'Sites',
    subtitle: "Ajoutez un site puis lancez un audit d'accessibilité.",
    planPrefix: 'Plan',
    trialLeft: (n: number) => `(essai — ${n} j restants)`,
    sitesWord: (n: number) => `site${n > 1 ? 's' : ''}`,
    auditsThisMonth: 'audits ce mois-ci',
    close: 'Fermer',
    addSite: '+ Ajouter un site',
    limitReached: (plan: string) => `Vous avez atteint la limite de votre plan ${plan}.`,
    discoverPro: 'Découvrir le plan Pro',
    loadingSites: 'Chargement des sites…',
    emptyTitle: 'Aucun site pour le moment',
    emptyDesc:
      "Ajoutez l'URL de votre site pour lancer votre premier audit RGAA / WCAG. L'analyse couvre jusqu'à 5 pages et dure environ une minute.",
    emptyCta: 'Ajouter mon premier site',
    listLabel: 'Liste des sites',
    formTitle: 'Nouveau site',
    nameLabel: 'Nom du site',
    namePlaceholder: 'Mon site vitrine',
    nameTooShort: 'Nom trop court (2 caractères minimum)',
    urlLabel: "URL de la page d'accueil",
    urlPlaceholder: 'https://exemple.fr',
    urlInvalid: 'URL invalide — incluez le protocole, ex. https://exemple.fr',
    urlProtocol: 'Seuls http(s) sont acceptés',
    addFailed: "Impossible d'ajouter le site.",
    unknownError: 'erreur inconnue',
    scanNotStarted: (reason: string) => `Site ajouté, mais l'audit n'a pas pu démarrer : ${reason}`,
    adding: 'Ajout…',
    addAndScan: 'Ajouter et lancer un audit',
    cancel: 'Annuler',
    newWindow: ' (nouvelle fenêtre)',
    lastAudit: 'Dernier audit :',
    monitoring: 'Surveillance hebdomadaire automatique',
    scanError: 'Erreur au lancement du scan',
    scanRunning: 'Audit en cours — suivre',
    launching: 'Lancement…',
    launchScan: 'Lancer un audit',
    history: 'Historique',
    confirmDelete: 'Confirmer la suppression',
    delete: 'Supprimer',
  },
  en: {
    seoTitle: 'Websites',
    seoDesc: 'Manage the websites monitored by Konforme.',
    title: 'Websites',
    subtitle: 'Add a website, then run an accessibility audit.',
    planPrefix: 'Plan',
    trialLeft: (n: number) => `(trial — ${n} days left)`,
    sitesWord: (n: number) => `website${n > 1 ? 's' : ''}`,
    auditsThisMonth: 'audits this month',
    close: 'Close',
    addSite: '+ Add a website',
    limitReached: (plan: string) => `You have reached the limit of your ${plan} plan.`,
    discoverPro: 'Discover the Pro plan',
    loadingSites: 'Loading websites…',
    emptyTitle: 'No websites yet',
    emptyDesc:
      'Add your website URL to run your first RGAA / WCAG audit. The analysis covers up to 5 pages and takes about a minute.',
    emptyCta: 'Add my first website',
    listLabel: 'List of websites',
    formTitle: 'New website',
    nameLabel: 'Website name',
    namePlaceholder: 'My showcase website',
    nameTooShort: 'Name too short (2 characters minimum)',
    urlLabel: 'Home page URL',
    urlPlaceholder: 'https://example.com',
    urlInvalid: 'Invalid URL — include the protocol, e.g. https://example.com',
    urlProtocol: 'Only http(s) is accepted',
    addFailed: 'The website could not be added.',
    unknownError: 'unknown error',
    scanNotStarted: (reason: string) => `Website added, but the audit could not start: ${reason}`,
    adding: 'Adding…',
    addAndScan: 'Add and run an audit',
    cancel: 'Cancel',
    newWindow: ' (new window)',
    lastAudit: 'Last audit:',
    monitoring: 'Automatic weekly monitoring',
    scanError: 'Error while starting the scan',
    scanRunning: 'Audit in progress — follow',
    launching: 'Starting…',
    launchScan: 'Run an audit',
    history: 'History',
    confirmDelete: 'Confirm deletion',
    delete: 'Delete',
  },
  de: {
    seoTitle: 'Websites',
    seoDesc: 'Verwalten Sie die von Konforme überwachten Websites.',
    title: 'Websites',
    subtitle: 'Fügen Sie eine Website hinzu und starten Sie ein Barrierefreiheits-Audit.',
    planPrefix: 'Tarif',
    trialLeft: (n: number) => `(Testphase — noch ${n} Tage)`,
    sitesWord: (n: number) => (n > 1 ? 'Websites' : 'Website'),
    auditsThisMonth: 'Audits in diesem Monat',
    close: 'Schließen',
    addSite: '+ Website hinzufügen',
    limitReached: (plan: string) => `Sie haben das Limit Ihres Tarifs ${plan} erreicht.`,
    discoverPro: 'Den Pro-Tarif entdecken',
    loadingSites: 'Websites werden geladen…',
    emptyTitle: 'Noch keine Website',
    emptyDesc:
      'Fügen Sie die URL Ihrer Website hinzu, um Ihr erstes RGAA-/WCAG-Audit zu starten. Die Analyse umfasst bis zu 5 Seiten und dauert etwa eine Minute.',
    emptyCta: 'Meine erste Website hinzufügen',
    listLabel: 'Liste der Websites',
    formTitle: 'Neue Website',
    nameLabel: 'Name der Website',
    namePlaceholder: 'Meine Unternehmenswebsite',
    nameTooShort: 'Name zu kurz (mindestens 2 Zeichen)',
    urlLabel: 'URL der Startseite',
    urlPlaceholder: 'https://beispiel.de',
    urlInvalid: 'Ungültige URL — geben Sie das Protokoll an, z. B. https://beispiel.de',
    urlProtocol: 'Nur http(s) wird akzeptiert',
    addFailed: 'Die Website konnte nicht hinzugefügt werden.',
    unknownError: 'unbekannter Fehler',
    scanNotStarted: (reason: string) =>
      `Website hinzugefügt, das Audit konnte jedoch nicht gestartet werden: ${reason}`,
    adding: 'Wird hinzugefügt…',
    addAndScan: 'Hinzufügen und Audit starten',
    cancel: 'Abbrechen',
    newWindow: ' (neues Fenster)',
    lastAudit: 'Letztes Audit:',
    monitoring: 'Automatische wöchentliche Überwachung',
    scanError: 'Fehler beim Starten des Scans',
    scanRunning: 'Audit läuft — verfolgen',
    launching: 'Wird gestartet…',
    launchScan: 'Audit starten',
    history: 'Verlauf',
    confirmDelete: 'Löschen bestätigen',
    delete: 'Löschen',
  },
  es: {
    seoTitle: 'Sitios',
    seoDesc: 'Gestione los sitios supervisados por Konforme.',
    title: 'Sitios',
    subtitle: 'Añada un sitio y lance una auditoría de accesibilidad.',
    planPrefix: 'Plan',
    trialLeft: (n: number) => `(prueba — quedan ${n} días)`,
    sitesWord: (n: number) => `sitio${n > 1 ? 's' : ''}`,
    auditsThisMonth: 'auditorías este mes',
    close: 'Cerrar',
    addSite: '+ Añadir un sitio',
    limitReached: (plan: string) => `Ha alcanzado el límite de su plan ${plan}.`,
    discoverPro: 'Descubrir el plan Pro',
    loadingSites: 'Cargando los sitios…',
    emptyTitle: 'Todavía no hay ningún sitio',
    emptyDesc:
      'Añada la URL de su sitio para lanzar su primera auditoría RGAA / WCAG. El análisis cubre hasta 5 páginas y dura aproximadamente un minuto.',
    emptyCta: 'Añadir mi primer sitio',
    listLabel: 'Lista de sitios',
    formTitle: 'Nuevo sitio',
    nameLabel: 'Nombre del sitio',
    namePlaceholder: 'Mi sitio corporativo',
    nameTooShort: 'Nombre demasiado corto (2 caracteres como mínimo)',
    urlLabel: 'URL de la página de inicio',
    urlPlaceholder: 'https://ejemplo.es',
    urlInvalid: 'URL no válida — incluya el protocolo, p. ej. https://ejemplo.es',
    urlProtocol: 'Solo se aceptan http(s)',
    addFailed: 'No se ha podido añadir el sitio.',
    unknownError: 'error desconocido',
    scanNotStarted: (reason: string) => `Sitio añadido, pero la auditoría no ha podido iniciarse: ${reason}`,
    adding: 'Añadiendo…',
    addAndScan: 'Añadir y lanzar una auditoría',
    cancel: 'Cancelar',
    newWindow: ' (nueva ventana)',
    lastAudit: 'Última auditoría:',
    monitoring: 'Supervisión semanal automática',
    scanError: 'Error al iniciar el análisis',
    scanRunning: 'Auditoría en curso — seguir',
    launching: 'Iniciando…',
    launchScan: 'Lanzar una auditoría',
    history: 'Historial',
    confirmDelete: 'Confirmar la eliminación',
    delete: 'Eliminar',
  },
  it: {
    seoTitle: 'Siti',
    seoDesc: 'Gestisca i siti monitorati da Konforme.',
    title: 'Siti',
    subtitle: 'Aggiunga un sito e avvii un audit di accessibilità.',
    planPrefix: 'Piano',
    trialLeft: (n: number) => `(prova — ${n} giorni rimanenti)`,
    sitesWord: (n: number) => (n > 1 ? 'siti' : 'sito'),
    auditsThisMonth: 'audit questo mese',
    close: 'Chiudi',
    addSite: '+ Aggiungi un sito',
    limitReached: (plan: string) => `Ha raggiunto il limite del suo piano ${plan}.`,
    discoverPro: 'Scopra il piano Pro',
    loadingSites: 'Caricamento dei siti…',
    emptyTitle: 'Nessun sito per il momento',
    emptyDesc:
      "Aggiunga l'URL del suo sito per avviare il primo audit RGAA / WCAG. L'analisi copre fino a 5 pagine e dura circa un minuto.",
    emptyCta: 'Aggiungi il mio primo sito',
    listLabel: 'Elenco dei siti',
    formTitle: 'Nuovo sito',
    nameLabel: 'Nome del sito',
    namePlaceholder: 'Il mio sito vetrina',
    nameTooShort: 'Nome troppo corto (minimo 2 caratteri)',
    urlLabel: 'URL della home page',
    urlPlaceholder: 'https://esempio.it',
    urlInvalid: 'URL non valido — includa il protocollo, ad es. https://esempio.it',
    urlProtocol: 'Sono accettati solo http(s)',
    addFailed: 'Impossibile aggiungere il sito.',
    unknownError: 'errore sconosciuto',
    scanNotStarted: (reason: string) => `Sito aggiunto, ma l'audit non è potuto partire: ${reason}`,
    adding: 'Aggiunta in corso…',
    addAndScan: 'Aggiungi e avvia un audit',
    cancel: 'Annulla',
    newWindow: ' (nuova finestra)',
    lastAudit: 'Ultimo audit:',
    monitoring: 'Monitoraggio settimanale automatico',
    scanError: "Errore all'avvio della scansione",
    scanRunning: 'Audit in corso — segui',
    launching: 'Avvio in corso…',
    launchScan: 'Avvia un audit',
    history: 'Cronologia',
    confirmDelete: "Conferma l'eliminazione",
    delete: 'Elimina',
  },
})

type Msgs = (typeof L)['fr']

function buildSiteSchema(t: Msgs) {
  return z.object({
    name: z.string().trim().min(2, t.nameTooShort),
    url: z
      .string()
      .trim()
      .url(t.urlInvalid)
      .refine((u) => u.startsWith('http://') || u.startsWith('https://'), t.urlProtocol),
  })
}

export function Sites() {
  const t = useMessages(L)
  const lang = useLang()
  const { data: membership, isLoading: orgLoading } = useMembership()
  const orgId = membership?.organization_id
  const plan: PlanId = membership?.organizations.plan ?? 'free'
  const { data: sites, isLoading } = useSites(orgId)
  const { data: scans } = useScans(orgId)
  const [formOpen, setFormOpen] = useState(false)

  const limits = PLANS[plan]
  const usedScans = scansUsedThisMonth(scans)
  const siteLimitReached = (sites?.length ?? 0) >= limits.maxSites

  // Scan actif (pending/running) par site : bloque le double lancement
  const activeBySite = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of scans ?? []) {
      if (s.status === 'pending' || s.status === 'running') map.set(s.site_id, s.id)
    }
    return map
  }, [scans])

  // Quand un audit se termine (le nombre d'actifs baisse), rafraîchit les
  // cartes des sites (dernier score / dernière date)
  const qc = useQueryClient()
  const prevActive = useRef(0)
  useEffect(() => {
    if (activeBySite.size < prevActive.current) {
      qc.invalidateQueries({ queryKey: ['sites'] })
    }
    prevActive.current = activeBySite.size
  }, [activeBySite.size, qc])

  return (
    <div className="space-y-6">
      <Seo title={t.seoTitle} description={t.seoDesc} path="/dashboard/sites" noindex />
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{t.title}</h1>
          <p className="text-text-muted mt-1">{t.subtitle}</p>
          {sites && (
            <p className="text-xs text-text-dim mt-1.5">
              {t.planPrefix} {planName(lang, plan)}
              {(membership?.trial_days_left ?? 0) > 0 && (
                <span className="text-link"> {t.trialLeft(membership!.trial_days_left)}</span>
              )}{' '}
              · {sites.length}/{Number.isFinite(limits.maxSites) ? limits.maxSites : '∞'} {t.sitesWord(limits.maxSites)} ·{' '}
              {usedScans}/{Number.isFinite(limits.scansPerMonth) ? limits.scansPerMonth : '∞'} {t.auditsThisMonth}
            </p>
          )}
        </div>
        <Button variant="primary" onClick={() => setFormOpen((o) => !o)} aria-expanded={formOpen}>
          {formOpen ? t.close : t.addSite}
        </Button>
      </header>

      {siteLimitReached && !formOpen && (
        <p className="rounded-[12px] border border-info/30 bg-info-bg/30 px-4 py-2.5 text-sm text-info-soft">
          {t.limitReached(planName(lang, plan))}{' '}
          <Link to="/tarifs" className="font-semibold underline hover:text-text">
            {t.discoverPro}
          </Link>
        </p>
      )}

      {formOpen && orgId && <AddSiteForm orgId={orgId} plan={plan} onDone={() => setFormOpen(false)} />}

      {(isLoading || orgLoading) && <p role="status" className="text-text-muted">{t.loadingSites}</p>}

      {!isLoading && !orgLoading && (sites?.length ?? 0) === 0 && (
        <Card className="text-center py-14">
          <h2 className="text-lg font-bold mb-2">{t.emptyTitle}</h2>
          <p className="text-sm text-text-muted mb-6 max-w-md mx-auto">
            {t.emptyDesc}
          </p>
          <Button variant="primary" onClick={() => setFormOpen(true)}>
            {t.emptyCta}
          </Button>
        </Card>
      )}

      <ul className="grid gap-4 md:grid-cols-2" aria-label={t.listLabel}>
        {sites?.map((site) => (
          <li key={site.id}>
            <SiteCard site={site} plan={plan} activeScanId={activeBySite.get(site.id)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function AddSiteForm({ orgId, plan, onDone }: { orgId: string; plan: PlanId; onDone: () => void }) {
  const t = useMessages(L)
  const addSite = useAddSite(orgId, plan)
  const launchScan = useLaunchScan(plan)
  const navigate = useNavigate()
  const [errors, setErrors] = useState<{ name?: string; url?: string; global?: string }>({})

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const parsed = buildSiteSchema(t).safeParse({ name: fd.get('name'), url: fd.get('url') })
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors
      setErrors({ name: flat.name?.[0], url: flat.url?.[0] })
      return
    }
    setErrors({})
    let site: Site
    try {
      site = await addSite.mutateAsync(parsed.data)
    } catch (err) {
      setErrors({ global: err instanceof Error ? err.message : t.addFailed })
      return
    }
    try {
      // Lance le premier audit et emmène l'utilisateur sur le suivi en direct
      const { scan_id } = await launchScan.mutateAsync(site)
      onDone()
      navigate(`/dashboard/scans/${scan_id}`)
    } catch (err) {
      setErrors({
        global: t.scanNotStarted(err instanceof Error ? err.message : t.unknownError),
      })
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate>
        <h2 className="text-lg font-bold mb-4">{t.formTitle}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="site-name" className="block text-sm font-semibold mb-1.5">
              {t.nameLabel}
            </label>
            <input
              id="site-name"
              name="name"
              type="text"
              required
              autoComplete="off"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'site-name-error' : undefined}
              className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary placeholder:text-text-dim"
              placeholder={t.namePlaceholder}
            />
            {errors.name && (
              <p id="site-name-error" className="mt-1.5 text-sm text-danger-soft">{errors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="site-url" className="block text-sm font-semibold mb-1.5">
              {t.urlLabel}
            </label>
            <input
              id="site-url"
              name="url"
              type="url"
              required
              inputMode="url"
              aria-invalid={!!errors.url}
              aria-describedby={errors.url ? 'site-url-error' : undefined}
              className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary placeholder:text-text-dim"
              placeholder={t.urlPlaceholder}
            />
            {errors.url && (
              <p id="site-url-error" className="mt-1.5 text-sm text-danger-soft">{errors.url}</p>
            )}
          </div>
        </div>
        {errors.global && (
          <p role="alert" className="mt-4 rounded-[12px] border border-danger/40 bg-danger-bg/30 px-4 py-2.5 text-sm text-danger-soft">
            {errors.global}
          </p>
        )}
        <div className="mt-5 flex gap-3">
          <Button type="submit" variant="primary" disabled={addSite.isPending}>
            {addSite.isPending ? t.adding : t.addAndScan}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            {t.cancel}
          </Button>
        </div>
      </form>
    </Card>
  )
}

function SiteCard({ site, plan, activeScanId }: { site: Site; plan: PlanId; activeScanId?: string }) {
  const t = useMessages(L)
  const lang = useLang()
  const launchScan = useLaunchScan(plan)
  const deleteSite = useDeleteSite()
  const updateSite = useUpdateSite()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onScan() {
    setError(null)
    try {
      const { scan_id } = await launchScan.mutateAsync(site)
      // Feedback immédiat : on suit l'audit en direct
      navigate(`/dashboard/scans/${scan_id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : t.scanError)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold truncate">{site.name}</h2>
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-link hover:underline break-all"
          >
            {site.url}
            <span className="sr-only">{t.newWindow}</span>
          </a>
        </div>
        {site.last_score !== null && (
          <Badge className="border-border-strong" >
            <span aria-hidden="true" className="size-2 rounded-full" style={{ background: scoreColor(site.last_score) }} />
            {Math.round(site.last_score)}%
          </Badge>
        )}
      </div>

      <p className="mt-3 text-xs text-text-dim">
        {t.lastAudit} {formatDate(site.last_scan_at, true, lang)}
      </p>

      <label className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-text-muted">
        <input
          type="checkbox"
          role="switch"
          checked={site.monitoring_enabled}
          disabled={updateSite.isPending}
          onChange={(e) => updateSite.mutate({ id: site.id, monitoring_enabled: e.target.checked })}
          className="size-4 accent-primary"
        />
        {t.monitoring}
        {site.monitoring_enabled && <span aria-hidden="true" className="text-success">●</span>}
      </label>

      {error && (
        <p role="alert" className="mt-3 rounded-[12px] border border-danger/40 bg-danger-bg/30 px-3 py-2 text-xs text-danger-soft">
          {error}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
        {activeScanId ? (
          <Button size="sm" variant="primary" onClick={() => navigate(`/dashboard/scans/${activeScanId}`)}>
            <span aria-hidden="true" className="size-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            {t.scanRunning}
          </Button>
        ) : (
          <Button size="sm" variant="primary" onClick={onScan} disabled={launchScan.isPending}>
            {launchScan.isPending ? t.launching : t.launchScan}
          </Button>
        )}
        <Link to={`/dashboard/scans?site=${site.id}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>{t.history}</Link>
        {confirmDelete ? (
          <span className="inline-flex gap-2">
            <Button
              size="sm"
              variant="danger"
              onClick={() => deleteSite.mutate(site.id)}
              disabled={deleteSite.isPending}
            >
              {t.confirmDelete}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
              {t.cancel}
            </Button>
          </span>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
            {t.delete}
          </Button>
        )}
      </div>
    </Card>
  )
}
