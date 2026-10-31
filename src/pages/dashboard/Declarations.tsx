import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Seo } from '@/components/Seo'
import { useAuth } from '@/contexts/AuthContext'
import {
  useCreateDeclaration,
  useCriteriaReviews,
  useDeclarations,
  useMembership,
  useScanIssues,
  useScans,
  useSites,
} from '@/lib/queries'
import { buildDeclarationHtml, downloadDeclaration } from '@/lib/declaration'
import { computeConformity } from '@/lib/conformity'
import { CONFORMITY_META, conformityFromScore, formatDate } from '@/lib/format'
import { defineMessages, useLang, useMessages } from '@/i18n'
import type { Declaration } from '@/lib/database.types'

const L = defineMessages({
  fr: {
    seoTitle: 'Déclarations',
    seoDesc: "Déclarations d'accessibilité RGAA.",
    title: "Déclarations d'accessibilité",
    subtitle:
      "Document légal requis par l'article 47 de la loi n° 2005-102, généré depuis votre dernier audit.",
    generateTitle: 'Générer une déclaration',
    noScannedSites: 'Aucun site avec audit terminé.',
    runAuditFirst: "Lancez d'abord un audit",
    siteLabel: 'Site',
    choosePlaceholder: 'Choisir un site…',
    generating: 'Génération…',
    generateCta: 'Générer et télécharger (HTML)',
    selectSiteError: 'Sélectionnez un site ayant au moins un audit terminé.',
    generateError: 'Génération impossible.',
    modelNote:
      "Le document généré suit le modèle officiel : état de conformité, résultats des tests, retour d'information et voies de recours (Défenseur des droits). Publiez-le sur une page « /accessibilite » de votre site.",
    historyTitle: 'Historique',
    loading: 'Chargement…',
    noDeclarations: "Aucune déclaration générée pour l'instant.",
    download: 'Télécharger',
  },
  en: {
    seoTitle: 'Statements',
    seoDesc: 'RGAA accessibility statements.',
    title: 'Accessibility statements',
    subtitle:
      'Legal document required by Article 47 of French act no. 2005-102, generated from your latest audit.',
    generateTitle: 'Generate a statement',
    noScannedSites: 'No website with a completed audit.',
    runAuditFirst: 'Run an audit first',
    siteLabel: 'Website',
    choosePlaceholder: 'Choose a website…',
    generating: 'Generating…',
    generateCta: 'Generate and download (HTML)',
    selectSiteError: 'Select a website that has at least one completed audit.',
    generateError: 'Generation failed.',
    modelNote:
      'The generated document follows the official template: compliance status, test results, feedback channel and remedies (French Defender of Rights). Publish it on an “/accessibilite” page of your website.',
    historyTitle: 'History',
    loading: 'Loading…',
    noDeclarations: 'No statement generated yet.',
    download: 'Download',
  },
  de: {
    seoTitle: 'Erklärungen',
    seoDesc: 'Barrierefreiheitserklärungen nach RGAA.',
    title: 'Barrierefreiheitserklärungen',
    subtitle:
      'Rechtlich vorgeschriebenes Dokument gemäß Artikel 47 des französischen Gesetzes Nr. 2005-102, erzeugt aus Ihrem letzten Audit.',
    generateTitle: 'Erklärung erzeugen',
    noScannedSites: 'Keine Website mit abgeschlossenem Audit.',
    runAuditFirst: 'Starten Sie zuerst ein Audit',
    siteLabel: 'Website',
    choosePlaceholder: 'Website auswählen…',
    generating: 'Wird erzeugt…',
    generateCta: 'Erzeugen und herunterladen (HTML)',
    selectSiteError: 'Wählen Sie eine Website mit mindestens einem abgeschlossenen Audit aus.',
    generateError: 'Erzeugung nicht möglich.',
    modelNote:
      'Das erzeugte Dokument folgt der amtlichen Vorlage: Konformitätsstand, Testergebnisse, Rückmeldemöglichkeit und Rechtsbehelfe (französische Ombudsstelle). Veröffentlichen Sie es auf einer Seite „/accessibilite“ Ihrer Website.',
    historyTitle: 'Verlauf',
    loading: 'Wird geladen…',
    noDeclarations: 'Noch keine Erklärung erzeugt.',
    download: 'Herunterladen',
  },
  es: {
    seoTitle: 'Declaraciones',
    seoDesc: 'Declaraciones de accesibilidad RGAA.',
    title: 'Declaraciones de accesibilidad',
    subtitle:
      'Documento legal exigido por el artículo 47 de la ley francesa n.º 2005-102, generado a partir de su última auditoría.',
    generateTitle: 'Generar una declaración',
    noScannedSites: 'Ningún sitio con auditoría finalizada.',
    runAuditFirst: 'Lance primero una auditoría',
    siteLabel: 'Sitio',
    choosePlaceholder: 'Elegir un sitio…',
    generating: 'Generando…',
    generateCta: 'Generar y descargar (HTML)',
    selectSiteError: 'Seleccione un sitio que tenga al menos una auditoría finalizada.',
    generateError: 'No se ha podido generar.',
    modelNote:
      'El documento generado sigue el modelo oficial: estado de conformidad, resultados de las pruebas, canal de contacto y vías de recurso (Defensor de Derechos francés). Publíquelo en una página «/accessibilite» de su sitio.',
    historyTitle: 'Historial',
    loading: 'Cargando…',
    noDeclarations: 'Todavía no se ha generado ninguna declaración.',
    download: 'Descargar',
  },
  it: {
    seoTitle: 'Dichiarazioni',
    seoDesc: 'Dichiarazioni di accessibilità RGAA.',
    title: 'Dichiarazioni di accessibilità',
    subtitle:
      "Documento legale richiesto dall'articolo 47 della legge francese n. 2005-102, generato dal suo ultimo audit.",
    generateTitle: 'Genera una dichiarazione',
    noScannedSites: 'Nessun sito con audit completato.',
    runAuditFirst: 'Avvii prima un audit',
    siteLabel: 'Sito',
    choosePlaceholder: 'Scelga un sito…',
    generating: 'Generazione…',
    generateCta: 'Genera e scarica (HTML)',
    selectSiteError: 'Selezioni un sito con almeno un audit completato.',
    generateError: 'Generazione impossibile.',
    modelNote:
      'Il documento generato segue il modello ufficiale: stato di conformità, risultati dei test, canale di segnalazione e mezzi di ricorso (Difensore dei diritti francese). Lo pubblichi su una pagina «/accessibilite» del suo sito.',
    historyTitle: 'Cronologia',
    loading: 'Caricamento…',
    noDeclarations: 'Nessuna dichiarazione generata per il momento.',
    download: 'Scarica',
  },
})

export function Declarations() {
  const t = useMessages(L)
  const { user } = useAuth()
  const { data: membership } = useMembership()
  const orgId = membership?.organization_id
  const orgName = membership?.organizations?.name ?? 'Notre organisation'
  const { data: sites } = useSites(orgId)
  const { data: scans } = useScans(orgId)
  const { data: declarations, isLoading } = useDeclarations(orgId)
  const createDecl = useCreateDeclaration(orgId)

  const [siteId, setSiteId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const scannedSites = (sites ?? []).filter((s) =>
    scans?.some((sc) => sc.site_id === s.id && sc.status === 'done'),
  )

  // Dernier audit terminé du site sélectionné : le taux de la déclaration se
  // calcule selon la méthode officielle (critères conformes / évalués), en
  // intégrant les évaluations manuelles.
  const selectedLastScan = scans?.find((sc) => sc.site_id === siteId && sc.status === 'done')
  const { data: lastScanIssues } = useScanIssues(selectedLastScan?.id)
  const { data: reviews } = useCriteriaReviews(siteId || undefined)

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const site = sites?.find((s) => s.id === siteId)
    const lastScan = selectedLastScan
    if (!site || !lastScan) {
      setError(t.selectSiteError)
      return
    }
    const summary = computeConformity(lastScanIssues ?? [], undefined, reviews)
    // Taux officiel si calculable, sinon repli sur le score technique du scan
    const rate =
      summary.rate ?? (lastScan.score !== null ? Math.round(lastScan.score * 10) / 10 : null)
    const level = conformityFromScore(rate)
    try {
      await createDecl.mutateAsync({
        site,
        conformity_level: level,
        conformity_rate: rate,
        contact_email: user?.email ?? 'contact@kayzen-lyon.fr',
      })
      const html = buildDeclarationHtml({
        siteName: site.name,
        siteUrl: site.url,
        orgName,
        conformityLevel: level,
        conformityRate: rate,
        contactEmail: user?.email ?? 'contact@kayzen-lyon.fr',
        auditDate: lastScan.finished_at ?? lastScan.created_at,
      })
      downloadDeclaration(html, site.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : t.generateError)
    }
  }

  return (
    <div className="space-y-6">
      <Seo title={t.seoTitle} description={t.seoDesc} path="/dashboard/declarations" noindex />
      <header>
        <h1 className="text-3xl font-extrabold">{t.title}</h1>
        <p className="text-text-muted mt-1">
          {t.subtitle}
        </p>
      </header>

      <Card>
        <h2 className="text-lg font-bold mb-4">{t.generateTitle}</h2>
        {scannedSites.length === 0 ? (
          <p className="text-sm text-text-muted">
            {t.noScannedSites}{' '}
            <Link to="/dashboard/sites" className="text-link hover:underline">
              {t.runAuditFirst}
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={onGenerate} className="flex flex-wrap items-end gap-3">
            <div className="min-w-64">
              <label htmlFor="decl-site" className="block text-sm font-semibold mb-1.5">{t.siteLabel}</label>
              <select
                id="decl-site"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                required
                className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary"
              >
                <option value="">{t.choosePlaceholder}</option>
                {scannedSites.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="primary" disabled={createDecl.isPending}>
              {createDecl.isPending ? t.generating : t.generateCta}
            </Button>
          </form>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-[12px] border border-danger/40 bg-danger-bg/30 px-4 py-2.5 text-sm text-danger-soft">
            {error}
          </p>
        )}
        <p className="mt-4 text-xs text-text-dim">
          {t.modelNote}
        </p>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4">{t.historyTitle}</h2>
        {isLoading && <p role="status" className="text-sm text-text-muted">{t.loading}</p>}
        {!isLoading && (declarations?.length ?? 0) === 0 && (
          <p className="text-sm text-text-muted">{t.noDeclarations}</p>
        )}
        <ul className="divide-y divide-border/60">
          {declarations?.map((d) => (
            <DeclarationRow key={d.id} decl={d} orgName={orgName} contactEmail={user?.email ?? ''} />
          ))}
        </ul>
      </Card>
    </div>
  )
}

function DeclarationRow({
  decl,
  orgName,
  contactEmail,
}: {
  decl: Declaration
  orgName: string
  contactEmail: string
}) {
  const t = useMessages(L)
  const lang = useLang()

  function redownload() {
    const html = buildDeclarationHtml({
      siteName: decl.sites?.name ?? 'Site',
      siteUrl: decl.sites?.url ?? '',
      orgName,
      conformityLevel: decl.conformity_level,
      conformityRate: decl.conformity_rate,
      contactEmail: decl.contact_email ?? contactEmail,
      auditDate: decl.published_at,
    })
    downloadDeclaration(html, decl.sites?.name ?? 'site')
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 py-3.5">
      <div>
        <div className="font-semibold text-sm">{decl.sites?.name ?? '—'}</div>
        <div className="text-xs text-text-dim">
          {formatDate(decl.published_at, false, lang)} · {decl.reference_standard}
          {decl.conformity_rate !== null ? ` · ${decl.conformity_rate}%` : ''}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge
          className={
            decl.conformity_level === 'total'
              ? 'bg-success-bg/60 text-success-soft border-success/40'
              : decl.conformity_level === 'partial'
                ? 'bg-warning-bg/60 text-warning-soft border-warning/40'
                : 'bg-danger-bg/60 text-danger-soft border-danger/40'
          }
        >
          {CONFORMITY_META[decl.conformity_level]}
        </Badge>
        <Button size="sm" variant="ghost" onClick={redownload}>
          {t.download}
        </Button>
      </div>
    </li>
  )
}
