import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { ScoreRing } from '@/components/ScoreRing'
import { Seo } from '@/components/Seo'
import { Skeleton } from '@/components/ui/skeleton'
import { BadgeGenerator } from '@/components/report/BadgeGenerator'
import { RgaaCriteriaList, type ReviewInput } from '@/components/report/RgaaCriteriaList'
import {
  useCriteriaReviews,
  useScan,
  useScanIssues,
  useScans,
  useSetCriterionReview,
  useSetScanShare,
  useUpdateIssueStatus,
} from '@/lib/queries'
import { functions, SCAN_FUNCTION_ID } from '@/lib/appwrite'
import { buildActionPlan, EFFORT_META, effortLabel, quickWins } from '@/lib/action-plan'
import { computeConformity } from '@/lib/conformity'
import { diffScans } from '@/lib/diff'
import {
  downloadAttestation,
  downloadAuditCsv,
  downloadAuditJson,
  downloadAuditMarkdown,
  downloadAuditReport,
  downloadJiraCsv,
  printAuditReport,
  type ReportScope,
} from '@/lib/report'
import { scoreColor } from '@/lib/format'
import { formatDate, scanStatusLabel, severityLabel, SEVERITY_META, STATUS_META } from '@/lib/format'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'
import { localizeIssueFix, localizeIssueTitle } from '@/i18n/rules-i18n'
import type { CriterionReview, Scan, ScanIssue, Severity } from '@/lib/database.types'

const SEVERITIES: Severity[] = ['critical', 'serious', 'moderate', 'minor']

type TabKey = 'issues' | 'plan' | 'evolution' | 'criteria' | 'pages' | 'badge'

const L = defineMessages({
  fr: {
    loadingReport: 'Chargement du rapport',
    notFound: 'Rapport introuvable',
    backToScans: '← Retour aux scans',
    seoTitle: "Rapport d'audit",
    seoDesc: 'Détail des non-conformités détectées.',
    breadcrumb: "Fil d'Ariane",
    scans: 'Scans',
    report: 'Rapport',
    siteFallback: 'Site',
    auditLine: (date: string, n: number) =>
      `Audit du ${date} · ${n} page${n > 1 ? 's' : ''} analysée${n > 1 ? 's' : ''}`,
    runningTitle: 'Analyse en cours…',
    runningDesc:
      'Le moteur crawle et audite les pages du site. Cette page se met à jour automatiquement.',
    failedTitle: "L'audit a échoué",
    unknownError: 'Erreur inconnue.',
    ringGlobal: 'Taux de conformité global',
    cardGlobal: 'Conformité globale',
    cardGlobalDesc: "Règles respectées / règles applicables sur l'échantillon audité.",
    ringRgaa: 'Score RGAA 4.1.2',
    cardRgaaDesc: 'Référentiel français',
    ringWcag: 'Score WCAG 2.2',
    cardWcag: 'WCAG 2.2 AA',
    cardWcagDesc: 'Standard international / EAA',
    ringOfficial: 'Taux de conformité RGAA sur les critères évalués',
    cardOfficial: 'Taux RGAA officiel',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} conformes · ${nc} NC · ${av} à vérifier`,
    naCount: (n: number) => `${n} NA`,
    tabIssues: (n: number) => `Non-conformités (${n})`,
    tabPlan: (n: number) => `Plan d'action (${n})`,
    tabEvolution: 'Évolution',
    tabCriteria: 'Les 106 critères RGAA',
    tabPages: (n: number) => `Pages (${n})`,
    tabBadge: 'Badge de conformité',
    tablist: 'Sections du rapport',
    issuesTitle: 'Non-conformités',
    filterSeverity: 'Filtrer par sévérité',
    filterAll: 'Toutes',
    hideFixed: 'Masquer les corrigées',
    noIssueAtAll: '🎉 Aucune non-conformité détectée sur les règles automatisables.',
    noIssueFiltered: 'Aucune issue ne correspond aux filtres.',
    planTitle: "Plan d'action",
    planCount: (n: number) => `(${n} correctif${n > 1 ? 's' : ''})`,
    exportTickets: 'Exporter en tickets (CSV Jira/Trello/Linear)',
    planIntro:
      "Les non-conformités regroupées par correctif à appliquer, triées par gravité puis par nombre d'occurrences.",
    quickWins: (n: number) => `${n} victoire${n > 1 ? 's' : ''} rapide${n > 1 ? 's' : ''}`,
    quickWinsTail: ": des corrections critiques qui ne demandent souvent qu'un attribut HTML.",
    planEmpty: '🎉 Aucune action en attente : toutes les non-conformités détectées sont traitées.',
    criterionSuffix: (id: string) => ` · critère ${id}`,
    occurrenceLine: (count: number, pages: number) =>
      ` · ${count} occurrence${count > 1 ? 's' : ''} sur ${pages} page${pages > 1 ? 's' : ''}`,
    evolutionTitle: "Évolution depuis l'audit précédent",
    evolutionFirst: "Premier audit de ce site : l'évolution apparaîtra dès le prochain audit.",
    evolutionLoading: 'Chargement de la comparaison…',
    evolutionComparedWith: (date: string) => `Comparaison avec l'audit du ${date}.`,
    scoreLabel: 'Score :',
    pts: 'pts',
    evolutionNew: 'nouvelles non-conformités',
    evolutionResolved: 'non-conformités résolues',
    evolutionPersisting: 'toujours présentes',
    evolutionAppearedTitle: 'Apparues depuis le dernier audit',
    evolutionResolvedTitle: 'Résolues depuis le dernier audit',
    evolutionNoChange: 'Aucun changement entre les deux audits.',
    criteriaTitle: 'Les 106 critères du RGAA 4.1.2',
    criteriaIntro:
      'Le référentiel officiel français, exigé par la directive européenne 2019/882 (EAA). Survolez le « ? » de chaque critère pour une explication en langage courant, et évaluez vous-même les critères non automatisables (« Évaluer ») pour un audit complet selon la méthode officielle.',
    pagesTitle: 'Rapport par page',
    pagesIntro:
      'Chaque page auditée dispose de son propre rapport exportable (les 106 critères + les non-conformités de la page) en Markdown, HTML ou PDF.',
    pagesEmpty: 'Aucun détail par page disponible pour cet audit.',
    pageIssues: (n: number) => `${n} issue${n > 1 ? 's' : ''}`,
    exportPageAria: (url: string) => `Exporter le rapport de ${url}`,
    badgeTitle: 'Badge de conformité',
    badgeUnavailable: "Le badge sera disponible dès qu'un taux de conformité aura pu être calculé.",
    footerNote:
      "Un audit automatique couvre les critères détectables par machine (~30 % du RGAA). Les critères « à vérifier manuellement » de l'onglet 106 critères listent précisément le travail restant. Pour une conformité totale opposable, complétez avec un audit manuel — c'est inclus dans notre offre accompagnée.",
    footerLink: 'Consulter le guide complet EAA / RGAA',
    exportGroup: 'Exporter le rapport',
    exportPdf: 'Exporter en PDF',
    exportAttestation: 'Attestation',
    shareCreating: 'Création du lien…',
    shareCta: '🔗 Partager le rapport (lien public)',
    shareCopied: '✓ Copié !',
    shareCopy: 'Copier',
    shareRevoke: 'Révoquer',
    issueHandled: 'Traitée',
    issueSelector: 'Sélecteur',
    issueSnippet: 'Code concerné',
    issueFix: 'Correction suggérée',
    aiExplain: "✦ Expliquer et corriger avec l'IA",
    aiLoading: 'L’assistant analyse votre code…',
    aiError: "L'assistant IA n'a pas répondu.",
    aiRetry: 'Réessayer',
    aiResultTitle: '✦ Explication et correctif (IA)',
    markFixed: 'Marquer corrigée',
    markFalsePositive: 'Faux positif',
    reopen: 'Rouvrir',
  },
  en: {
    loadingReport: 'Loading the report',
    notFound: 'Report not found',
    backToScans: '← Back to scans',
    seoTitle: 'Audit report',
    seoDesc: 'Details of the accessibility issues detected.',
    breadcrumb: 'Breadcrumb',
    scans: 'Scans',
    report: 'Report',
    siteFallback: 'Website',
    auditLine: (date: string, n: number) =>
      `Audit of ${date} · ${n} page${n > 1 ? 's' : ''} analysed`,
    runningTitle: 'Analysis in progress…',
    runningDesc:
      'The engine is crawling and auditing the pages of the website. This page updates automatically.',
    failedTitle: 'The audit failed',
    unknownError: 'Unknown error.',
    ringGlobal: 'Overall compliance rate',
    cardGlobal: 'Overall compliance',
    cardGlobalDesc: 'Rules passed / applicable rules across the audited sample.',
    ringRgaa: 'RGAA 4.1.2 score',
    cardRgaaDesc: 'French framework',
    ringWcag: 'WCAG 2.2 score',
    cardWcag: 'WCAG 2.2 AA',
    cardWcagDesc: 'International standard / EAA',
    ringOfficial: 'RGAA compliance rate across the assessed criteria',
    cardOfficial: 'Official RGAA rate',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} compliant · ${nc} non-compliant · ${av} to check`,
    naCount: (n: number) => `${n} N/A`,
    tabIssues: (n: number) => `Issues (${n})`,
    tabPlan: (n: number) => `Action plan (${n})`,
    tabEvolution: 'Trend',
    tabCriteria: 'The 106 RGAA criteria',
    tabPages: (n: number) => `Pages (${n})`,
    tabBadge: 'Compliance badge',
    tablist: 'Report sections',
    issuesTitle: 'Issues',
    filterSeverity: 'Filter by severity',
    filterAll: 'All',
    hideFixed: 'Hide fixed issues',
    noIssueAtAll: '🎉 No issue detected on the automatable rules.',
    noIssueFiltered: 'No issue matches the current filters.',
    planTitle: 'Action plan',
    planCount: (n: number) => `(${n} fix${n > 1 ? 'es' : ''})`,
    exportTickets: 'Export as tickets (Jira/Trello/Linear CSV)',
    planIntro:
      'Issues grouped by the fix to apply, sorted by severity and then by number of occurrences.',
    quickWins: (n: number) => `${n} quick win${n > 1 ? 's' : ''}`,
    quickWinsTail: ': critical fixes that often require nothing more than one HTML attribute.',
    planEmpty: '🎉 Nothing pending: every detected issue has been dealt with.',
    criterionSuffix: (id: string) => ` · criterion ${id}`,
    occurrenceLine: (count: number, pages: number) =>
      ` · ${count} occurrence${count > 1 ? 's' : ''} across ${pages} page${pages > 1 ? 's' : ''}`,
    evolutionTitle: 'Trend since the previous audit',
    evolutionFirst: 'First audit of this website: the trend will appear with the next audit.',
    evolutionLoading: 'Loading the comparison…',
    evolutionComparedWith: (date: string) => `Compared with the audit of ${date}.`,
    scoreLabel: 'Score:',
    pts: 'pts',
    evolutionNew: 'new issues',
    evolutionResolved: 'issues resolved',
    evolutionPersisting: 'still present',
    evolutionAppearedTitle: 'Appeared since the last audit',
    evolutionResolvedTitle: 'Resolved since the last audit',
    evolutionNoChange: 'No change between the two audits.',
    criteriaTitle: 'The 106 criteria of RGAA 4.1.2',
    criteriaIntro:
      'The official French framework, required by European directive 2019/882 (EAA). Hover over the “?” of each criterion for a plain-language explanation, and assess the non-automatable criteria yourself (“Assess”) for a complete audit following the official method.',
    pagesTitle: 'Report per page',
    pagesIntro:
      'Every audited page has its own exportable report (the 106 criteria + the issues found on that page) in Markdown, HTML or PDF.',
    pagesEmpty: 'No per-page detail available for this audit.',
    pageIssues: (n: number) => `${n} issue${n > 1 ? 's' : ''}`,
    exportPageAria: (url: string) => `Export the report for ${url}`,
    badgeTitle: 'Compliance badge',
    badgeUnavailable: 'The badge will become available as soon as a compliance rate can be computed.',
    footerNote:
      'An automated audit covers the machine-detectable criteria (~30 % of the RGAA). The “manual check required” criteria in the 106 criteria tab list precisely the work that remains. For full, legally defensible compliance, complete this with a manual audit — it is included in our assisted plan.',
    footerLink: 'Read the full EAA / RGAA guide',
    exportGroup: 'Export the report',
    exportPdf: 'Export as PDF',
    exportAttestation: 'Statement',
    shareCreating: 'Creating the link…',
    shareCta: '🔗 Share the report (public link)',
    shareCopied: '✓ Copied!',
    shareCopy: 'Copy',
    shareRevoke: 'Revoke',
    issueHandled: 'Handled',
    issueSelector: 'Selector',
    issueSnippet: 'Offending code',
    issueFix: 'Suggested fix',
    aiExplain: '✦ Explain and fix with AI',
    aiLoading: 'The assistant is analysing your code…',
    aiError: 'The AI assistant did not respond.',
    aiRetry: 'Try again',
    aiResultTitle: '✦ Explanation and fix (AI)',
    markFixed: 'Mark as fixed',
    markFalsePositive: 'False positive',
    reopen: 'Reopen',
  },
  de: {
    loadingReport: 'Bericht wird geladen',
    notFound: 'Bericht nicht gefunden',
    backToScans: '← Zurück zu den Scans',
    seoTitle: 'Auditbericht',
    seoDesc: 'Details zu den festgestellten Mängeln.',
    breadcrumb: 'Brotkrümelnavigation',
    scans: 'Scans',
    report: 'Bericht',
    siteFallback: 'Website',
    auditLine: (date: string, n: number) =>
      `Audit vom ${date} · ${n} Seite${n > 1 ? 'n' : ''} analysiert`,
    runningTitle: 'Analyse läuft…',
    runningDesc:
      'Die Engine crawlt und prüft die Seiten der Website. Diese Seite aktualisiert sich automatisch.',
    failedTitle: 'Das Audit ist fehlgeschlagen',
    unknownError: 'Unbekannter Fehler.',
    ringGlobal: 'Gesamtkonformitätsgrad',
    cardGlobal: 'Gesamtkonformität',
    cardGlobalDesc: 'Erfüllte Regeln / anwendbare Regeln in der geprüften Stichprobe.',
    ringRgaa: 'RGAA-4.1.2-Score',
    cardRgaaDesc: 'Französisches Referenzwerk',
    ringWcag: 'WCAG-2.2-Score',
    cardWcag: 'WCAG 2.2 AA',
    cardWcagDesc: 'Internationaler Standard / EAA',
    ringOfficial: 'RGAA-Konformitätsgrad der bewerteten Kriterien',
    cardOfficial: 'Offizieller RGAA-Grad',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} konform · ${nc} nicht konform · ${av} zu prüfen`,
    naCount: (n: number) => `${n} n. a.`,
    tabIssues: (n: number) => `Mängel (${n})`,
    tabPlan: (n: number) => `Maßnahmenplan (${n})`,
    tabEvolution: 'Entwicklung',
    tabCriteria: 'Die 106 RGAA-Kriterien',
    tabPages: (n: number) => `Seiten (${n})`,
    tabBadge: 'Konformitäts-Badge',
    tablist: 'Abschnitte des Berichts',
    issuesTitle: 'Mängel',
    filterSeverity: 'Nach Schweregrad filtern',
    filterAll: 'Alle',
    hideFixed: 'Behobene ausblenden',
    noIssueAtAll: '🎉 Bei den automatisierbaren Regeln wurde kein Mangel festgestellt.',
    noIssueFiltered: 'Kein Mangel entspricht den gewählten Filtern.',
    planTitle: 'Maßnahmenplan',
    planCount: (n: number) => `(${n} Korrektur${n > 1 ? 'en' : ''})`,
    exportTickets: 'Als Tickets exportieren (CSV für Jira/Trello/Linear)',
    planIntro:
      'Die Mängel, gruppiert nach der anzuwendenden Korrektur, sortiert nach Schweregrad und anschließend nach Anzahl der Vorkommen.',
    quickWins: (n: number) => `${n} ${n > 1 ? 'schnelle Erfolge' : 'schneller Erfolg'}`,
    quickWinsTail: ': kritische Korrekturen, die oft nur ein einziges HTML-Attribut erfordern.',
    planEmpty: '🎉 Keine offene Maßnahme: Alle festgestellten Mängel sind bearbeitet.',
    criterionSuffix: (id: string) => ` · Kriterium ${id}`,
    occurrenceLine: (count: number, pages: number) =>
      ` · ${count} Vorkommen auf ${pages} Seite${pages > 1 ? 'n' : ''}`,
    evolutionTitle: 'Entwicklung seit dem vorherigen Audit',
    evolutionFirst:
      'Erstes Audit dieser Website: Die Entwicklung erscheint ab dem nächsten Audit.',
    evolutionLoading: 'Vergleich wird geladen…',
    evolutionComparedWith: (date: string) => `Vergleich mit dem Audit vom ${date}.`,
    scoreLabel: 'Score:',
    pts: 'Pkt.',
    evolutionNew: 'neue Mängel',
    evolutionResolved: 'behobene Mängel',
    evolutionPersisting: 'weiterhin vorhanden',
    evolutionAppearedTitle: 'Seit dem letzten Audit neu aufgetreten',
    evolutionResolvedTitle: 'Seit dem letzten Audit behoben',
    evolutionNoChange: 'Keine Veränderung zwischen den beiden Audits.',
    criteriaTitle: 'Die 106 Kriterien des RGAA 4.1.2',
    criteriaIntro:
      'Das offizielle französische Referenzwerk, gefordert durch die europäische Richtlinie 2019/882 (EAA). Fahren Sie über das „?“ jedes Kriteriums, um eine allgemein verständliche Erläuterung zu erhalten, und bewerten Sie die nicht automatisierbaren Kriterien selbst („Bewerten“), um nach der offiziellen Methode ein vollständiges Audit zu erhalten.',
    pagesTitle: 'Bericht je Seite',
    pagesIntro:
      'Jede geprüfte Seite verfügt über einen eigenen exportierbaren Bericht (die 106 Kriterien + die Mängel der Seite) als Markdown, HTML oder PDF.',
    pagesEmpty: 'Für dieses Audit liegen keine Detailangaben je Seite vor.',
    pageIssues: (n: number) => `${n} ${n > 1 ? 'Mängel' : 'Mangel'}`,
    exportPageAria: (url: string) => `Bericht für ${url} exportieren`,
    badgeTitle: 'Konformitäts-Badge',
    badgeUnavailable:
      'Das Badge steht zur Verfügung, sobald ein Konformitätsgrad berechnet werden konnte.',
    footerNote:
      'Ein automatisiertes Audit deckt die maschinell erkennbaren Kriterien ab (rund 30 % des RGAA). Die Kriterien „manuelle Prüfung erforderlich“ im Tab mit den 106 Kriterien benennen genau die verbleibende Arbeit. Für eine vollständige, rechtssichere Konformität ergänzen Sie dies durch ein manuelles Audit – in unserem begleiteten Angebot ist es enthalten.',
    footerLink: 'Zum vollständigen EAA-/RGAA-Leitfaden',
    exportGroup: 'Bericht exportieren',
    exportPdf: 'Als PDF exportieren',
    exportAttestation: 'Erklärung',
    shareCreating: 'Link wird erstellt…',
    shareCta: '🔗 Bericht teilen (öffentlicher Link)',
    shareCopied: '✓ Kopiert!',
    shareCopy: 'Kopieren',
    shareRevoke: 'Widerrufen',
    issueHandled: 'Bearbeitet',
    issueSelector: 'Selektor',
    issueSnippet: 'Betroffener Code',
    issueFix: 'Empfohlene Korrektur',
    aiExplain: '✦ Mit KI erklären und korrigieren',
    aiLoading: 'Der Assistent analysiert Ihren Code…',
    aiError: 'Der KI-Assistent hat nicht geantwortet.',
    aiRetry: 'Erneut versuchen',
    aiResultTitle: '✦ Erläuterung und Korrektur (KI)',
    markFixed: 'Als behoben markieren',
    markFalsePositive: 'Falschmeldung',
    reopen: 'Wieder öffnen',
  },
  es: {
    loadingReport: 'Cargando el informe',
    notFound: 'Informe no encontrado',
    backToScans: '← Volver a los análisis',
    seoTitle: 'Informe de auditoría',
    seoDesc: 'Detalle de los incumplimientos detectados.',
    breadcrumb: 'Ruta de navegación',
    scans: 'Análisis',
    report: 'Informe',
    siteFallback: 'Sitio',
    auditLine: (date: string, n: number) =>
      `Auditoría del ${date} · ${n} página${n > 1 ? 's' : ''} analizada${n > 1 ? 's' : ''}`,
    runningTitle: 'Análisis en curso…',
    runningDesc:
      'El motor rastrea y audita las páginas del sitio. Esta página se actualiza automáticamente.',
    failedTitle: 'La auditoría ha fallado',
    unknownError: 'Error desconocido.',
    ringGlobal: 'Tasa de conformidad global',
    cardGlobal: 'Conformidad global',
    cardGlobalDesc: 'Reglas cumplidas / reglas aplicables en la muestra auditada.',
    ringRgaa: 'Puntuación RGAA 4.1.2',
    cardRgaaDesc: 'Referencial francés',
    ringWcag: 'Puntuación WCAG 2.2',
    cardWcag: 'WCAG 2.2 AA',
    cardWcagDesc: 'Estándar internacional / EAA',
    ringOfficial: 'Tasa de conformidad RGAA sobre los criterios evaluados',
    cardOfficial: 'Tasa RGAA oficial',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} conformes · ${nc} no conformes · ${av} por verificar`,
    naCount: (n: number) => `${n} N/A`,
    tabIssues: (n: number) => `Incumplimientos (${n})`,
    tabPlan: (n: number) => `Plan de acción (${n})`,
    tabEvolution: 'Evolución',
    tabCriteria: 'Los 106 criterios RGAA',
    tabPages: (n: number) => `Páginas (${n})`,
    tabBadge: 'Distintivo de conformidad',
    tablist: 'Secciones del informe',
    issuesTitle: 'Incumplimientos',
    filterSeverity: 'Filtrar por gravedad',
    filterAll: 'Todos',
    hideFixed: 'Ocultar los corregidos',
    noIssueAtAll: '🎉 No se ha detectado ningún incumplimiento en las reglas automatizables.',
    noIssueFiltered: 'Ningún incumplimiento coincide con los filtros.',
    planTitle: 'Plan de acción',
    planCount: (n: number) => `(${n} ${n > 1 ? 'correcciones' : 'corrección'})`,
    exportTickets: 'Exportar como tickets (CSV para Jira/Trello/Linear)',
    planIntro:
      'Los incumplimientos agrupados por corrección que debe aplicarse, ordenados por gravedad y luego por número de apariciones.',
    quickWins: (n: number) => `${n} victoria${n > 1 ? 's' : ''} rápida${n > 1 ? 's' : ''}`,
    quickWinsTail: ': correcciones críticas que a menudo solo requieren un atributo HTML.',
    planEmpty: '🎉 Ninguna acción pendiente: todos los incumplimientos detectados están tratados.',
    criterionSuffix: (id: string) => ` · criterio ${id}`,
    occurrenceLine: (count: number, pages: number) =>
      ` · ${count} ${count > 1 ? 'apariciones' : 'aparición'} en ${pages} página${pages > 1 ? 's' : ''}`,
    evolutionTitle: 'Evolución desde la auditoría anterior',
    evolutionFirst:
      'Primera auditoría de este sitio: la evolución aparecerá a partir de la próxima auditoría.',
    evolutionLoading: 'Cargando la comparación…',
    evolutionComparedWith: (date: string) => `Comparación con la auditoría del ${date}.`,
    scoreLabel: 'Puntuación:',
    pts: 'ptos',
    evolutionNew: 'nuevos incumplimientos',
    evolutionResolved: 'incumplimientos resueltos',
    evolutionPersisting: 'siguen presentes',
    evolutionAppearedTitle: 'Aparecidos desde la última auditoría',
    evolutionResolvedTitle: 'Resueltos desde la última auditoría',
    evolutionNoChange: 'Ningún cambio entre las dos auditorías.',
    criteriaTitle: 'Los 106 criterios del RGAA 4.1.2',
    criteriaIntro:
      'El referencial oficial francés, exigido por la directiva europea 2019/882 (EAA). Pase el cursor sobre el «?» de cada criterio para obtener una explicación en lenguaje sencillo y evalúe usted mismo los criterios no automatizables («Evaluar») para una auditoría completa según el método oficial.',
    pagesTitle: 'Informe por página',
    pagesIntro:
      'Cada página auditada dispone de su propio informe exportable (los 106 criterios + los incumplimientos de la página) en Markdown, HTML o PDF.',
    pagesEmpty: 'No hay detalle por página disponible para esta auditoría.',
    pageIssues: (n: number) => `${n} incidencia${n > 1 ? 's' : ''}`,
    exportPageAria: (url: string) => `Exportar el informe de ${url}`,
    badgeTitle: 'Distintivo de conformidad',
    badgeUnavailable:
      'El distintivo estará disponible en cuanto se haya podido calcular una tasa de conformidad.',
    footerNote:
      'Una auditoría automática cubre los criterios detectables por máquina (~30 % del RGAA). Los criterios «por verificar manualmente» de la pestaña de los 106 criterios indican con precisión el trabajo pendiente. Para una conformidad total y oponible, complétela con una auditoría manual: está incluida en nuestra oferta acompañada.',
    footerLink: 'Consultar la guía completa EAA / RGAA',
    exportGroup: 'Exportar el informe',
    exportPdf: 'Exportar en PDF',
    exportAttestation: 'Declaración',
    shareCreating: 'Creando el enlace…',
    shareCta: '🔗 Compartir el informe (enlace público)',
    shareCopied: '✓ ¡Copiado!',
    shareCopy: 'Copiar',
    shareRevoke: 'Revocar',
    issueHandled: 'Tratado',
    issueSelector: 'Selector',
    issueSnippet: 'Código afectado',
    issueFix: 'Corrección sugerida',
    aiExplain: '✦ Explicar y corregir con la IA',
    aiLoading: 'El asistente está analizando su código…',
    aiError: 'El asistente de IA no ha respondido.',
    aiRetry: 'Reintentar',
    aiResultTitle: '✦ Explicación y corrección (IA)',
    markFixed: 'Marcar como corregido',
    markFalsePositive: 'Falso positivo',
    reopen: 'Reabrir',
  },
  it: {
    loadingReport: 'Caricamento del report',
    notFound: 'Report non trovato',
    backToScans: '← Torna alle scansioni',
    seoTitle: 'Report di audit',
    seoDesc: 'Dettaglio delle non conformità rilevate.',
    breadcrumb: 'Percorso di navigazione',
    scans: 'Scansioni',
    report: 'Report',
    siteFallback: 'Sito',
    auditLine: (date: string, n: number) =>
      `Audit del ${date} · ${n} ${n > 1 ? 'pagine analizzate' : 'pagina analizzata'}`,
    runningTitle: 'Analisi in corso…',
    runningDesc:
      'Il motore esegue la scansione e verifica le pagine del sito. Questa pagina si aggiorna automaticamente.',
    failedTitle: "L'audit non è riuscito",
    unknownError: 'Errore sconosciuto.',
    ringGlobal: 'Tasso di conformità complessivo',
    cardGlobal: 'Conformità complessiva',
    cardGlobalDesc: 'Regole rispettate / regole applicabili sul campione verificato.',
    ringRgaa: 'Punteggio RGAA 4.1.2',
    cardRgaaDesc: 'Riferimento francese',
    ringWcag: 'Punteggio WCAG 2.2',
    cardWcag: 'WCAG 2.2 AA',
    cardWcagDesc: 'Standard internazionale / EAA',
    ringOfficial: 'Tasso di conformità RGAA sui criteri valutati',
    cardOfficial: 'Tasso RGAA ufficiale',
    conformityCounts: (ok: number, nc: number, av: number) =>
      `${ok} conformi · ${nc} non conformi · ${av} da verificare`,
    naCount: (n: number) => `${n} N/A`,
    tabIssues: (n: number) => `Non conformità (${n})`,
    tabPlan: (n: number) => `Piano d'azione (${n})`,
    tabEvolution: 'Andamento',
    tabCriteria: 'I 106 criteri RGAA',
    tabPages: (n: number) => `Pagine (${n})`,
    tabBadge: 'Badge di conformità',
    tablist: 'Sezioni del report',
    issuesTitle: 'Non conformità',
    filterSeverity: 'Filtra per gravità',
    filterAll: 'Tutte',
    hideFixed: 'Nascondi quelle corrette',
    noIssueAtAll: '🎉 Nessuna non conformità rilevata sulle regole automatizzabili.',
    noIssueFiltered: 'Nessuna non conformità corrisponde ai filtri.',
    planTitle: "Piano d'azione",
    planCount: (n: number) => `(${n} correzion${n > 1 ? 'i' : 'e'})`,
    exportTickets: 'Esporta come ticket (CSV Jira/Trello/Linear)',
    planIntro:
      'Le non conformità raggruppate per correzione da applicare, ordinate per gravità e poi per numero di occorrenze.',
    quickWins: (n: number) => `${n} vittori${n > 1 ? 'e' : 'a'} rapid${n > 1 ? 'e' : 'a'}`,
    quickWinsTail: ': correzioni critiche che spesso richiedono un solo attributo HTML.',
    planEmpty: '🎉 Nessuna azione in sospeso: tutte le non conformità rilevate sono state trattate.',
    criterionSuffix: (id: string) => ` · criterio ${id}`,
    occurrenceLine: (count: number, pages: number) =>
      ` · ${count} occorrenz${count > 1 ? 'e' : 'a'} su ${pages} pagin${pages > 1 ? 'e' : 'a'}`,
    evolutionTitle: "Andamento rispetto all'audit precedente",
    evolutionFirst:
      "Primo audit di questo sito: l'andamento apparirà a partire dal prossimo audit.",
    evolutionLoading: 'Caricamento del confronto…',
    evolutionComparedWith: (date: string) => `Confronto con l'audit del ${date}.`,
    scoreLabel: 'Punteggio:',
    pts: 'punti',
    evolutionNew: 'nuove non conformità',
    evolutionResolved: 'non conformità risolte',
    evolutionPersisting: 'ancora presenti',
    evolutionAppearedTitle: "Comparse dall'ultimo audit",
    evolutionResolvedTitle: "Risolte dall'ultimo audit",
    evolutionNoChange: 'Nessuna variazione tra i due audit.',
    criteriaTitle: 'I 106 criteri del RGAA 4.1.2',
    criteriaIntro:
      'Il riferimento ufficiale francese, richiesto dalla direttiva europea 2019/882 (EAA). Passi il puntatore sul « ? » di ogni criterio per una spiegazione in linguaggio semplice e valuti personalmente i criteri non automatizzabili (« Valuta ») per un audit completo secondo il metodo ufficiale.',
    pagesTitle: 'Report per pagina',
    pagesIntro:
      'Ogni pagina verificata dispone di un proprio report esportabile (i 106 criteri + le non conformità della pagina) in Markdown, HTML o PDF.',
    pagesEmpty: 'Nessun dettaglio per pagina disponibile per questo audit.',
    pageIssues: (n: number) => `${n} problem${n > 1 ? 'i' : 'a'}`,
    exportPageAria: (url: string) => `Esporta il report di ${url}`,
    badgeTitle: 'Badge di conformità',
    badgeUnavailable:
      'Il badge sarà disponibile non appena sarà possibile calcolare un tasso di conformità.',
    footerNote:
      "Un audit automatico copre i criteri rilevabili automaticamente (~30 % del RGAA). I criteri « da verificare manualmente » della scheda dei 106 criteri indicano con precisione il lavoro che resta da fare. Per una conformità totale e opponibile, completi l'analisi con un audit manuale: è incluso nella nostra offerta assistita.",
    footerLink: 'Consulta la guida completa EAA / RGAA',
    exportGroup: 'Esporta il report',
    exportPdf: 'Esporta in PDF',
    exportAttestation: 'Attestazione',
    shareCreating: 'Creazione del link…',
    shareCta: '🔗 Condividi il report (link pubblico)',
    shareCopied: '✓ Copiato!',
    shareCopy: 'Copia',
    shareRevoke: 'Revoca',
    issueHandled: 'Trattata',
    issueSelector: 'Selettore',
    issueSnippet: 'Codice interessato',
    issueFix: 'Correzione suggerita',
    aiExplain: "✦ Spiega e correggi con l'IA",
    aiLoading: 'L’assistente sta analizzando il suo codice…',
    aiError: "L'assistente IA non ha risposto.",
    aiRetry: 'Riprova',
    aiResultTitle: '✦ Spiegazione e correzione (IA)',
    markFixed: 'Segna come corretta',
    markFalsePositive: 'Falso positivo',
    reopen: 'Riapri',
  },
})

export function ScanDetail() {
  const { scanId } = useParams<{ scanId: string }>()
  const t = useMessages(L)
  const lang = useLang()
  const { data: scan, isLoading } = useScan(scanId)
  const { data: issues } = useScanIssues(scanId)
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all')
  const [hideFixed, setHideFixed] = useState(true)
  const [tab, setTab] = useState<TabKey>('issues')

  // À la fin d'un scan suivi en direct, recharge les issues (mises en cache vides pendant l'analyse)
  const qc = useQueryClient()
  const prevStatus = useRef(scan?.status)
  useEffect(() => {
    const was = prevStatus.current
    prevStatus.current = scan?.status
    if (scan?.status === 'done' && (was === 'pending' || was === 'running')) {
      qc.invalidateQueries({ queryKey: ['scan-issues', scanId] })
      // Le site (dernier score / date) et la liste des scans changent aussi
      qc.invalidateQueries({ queryKey: ['sites'] })
      qc.invalidateQueries({ queryKey: ['scans'] })
    }
  }, [scan?.status, scanId, qc])

  const filtered = useMemo(() => {
    let list = issues ?? []
    if (severityFilter !== 'all') list = list.filter((i) => i.severity === severityFilter)
    if (hideFixed) list = list.filter((i) => i.status !== 'fixed' && i.status !== 'false_positive')
    return [...list].sort((a, b) => SEVERITY_META[a.severity].weight - SEVERITY_META[b.severity].weight)
  }, [issues, severityFilter, hideFixed])

  const counts = useMemo(() => {
    const c: Record<Severity, number> = { critical: 0, serious: 0, moderate: 0, minor: 0 }
    for (const i of issues ?? []) if (i.status === 'open' || i.status === 'in_progress') c[i.severity]++
    return c
  }, [issues])

  const { data: reviews } = useCriteriaReviews(scan?.site_id)
  const setReview = useSetCriterionReview()

  // Audit précédent du même site (pour l'onglet Évolution)
  const { data: siteScans } = useScans(scan?.organization_id, scan?.site_id)
  const prevScan = useMemo(
    () =>
      (siteScans ?? []).find(
        (s) => s.id !== scan?.id && s.status === 'done' && s.created_at < (scan?.created_at ?? ''),
      ) ?? null,
    [siteScans, scan],
  )
  const { data: prevIssues } = useScanIssues(prevScan?.id)
  const evolution = useMemo(
    () => (prevScan && prevIssues ? diffScans(issues ?? [], prevIssues) : null),
    [issues, prevIssues, prevScan],
  )
  const conformity = useMemo(
    () => computeConformity(issues ?? [], undefined, reviews),
    [issues, reviews],
  )

  function handleReview(input: ReviewInput) {
    if (!scan) return
    setReview.mutate({
      siteId: scan.site_id,
      teamId: scan.organization_id,
      criterionId: input.criterionId,
      status: input.status,
      note: input.note,
      existingId: input.existingId,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6" role="status" aria-label={t.loadingReport}>
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
  if (!scan) {
    return (
      <Card className="text-center py-14">
        <h1 className="text-lg font-bold mb-2">{t.notFound}</h1>
        <Link to="/dashboard/scans" className={buttonVariants({ variant: 'ghost' })}>{t.backToScans}</Link>
      </Card>
    )
  }

  const st = STATUS_META[scan.status]
  const badgeRate = conformity.rate ?? scan.score

  const plan = buildActionPlan(issues ?? [])
  const wins = quickWins(plan)

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'issues', label: t.tabIssues(filtered.length) },
    { key: 'plan', label: t.tabPlan(plan.length) },
    { key: 'evolution', label: t.tabEvolution },
    { key: 'criteria', label: t.tabCriteria },
    { key: 'pages', label: t.tabPages(scan.page_scores?.length ?? 0) },
    { key: 'badge', label: t.tabBadge },
  ]

  return (
    <div className="space-y-6">
      <Seo title={t.seoTitle} description={t.seoDesc} path={`/dashboard/scans/${scan.id}`} noindex />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <nav aria-label={t.breadcrumb} className="text-sm text-text-dim mb-1">
            <Link to="/dashboard/scans" className="hover:text-text hover:underline">{t.scans}</Link>
            {' / '}
            <span aria-current="page">{t.report}</span>
          </nav>
          <h1 className="text-3xl font-extrabold">
            {scan.sites?.name ?? t.siteFallback}{' '}
            <Badge className={st.className}>{scanStatusLabel(lang, scan.status)}</Badge>
          </h1>
          <p className="text-text-muted mt-1">
            {t.auditLine(formatDate(scan.created_at, true, lang), scan.pages_count)}
          </p>
        </div>
        {scan.status === 'done' && issues && (
          <div className="flex flex-col items-end gap-2">
            <ExportMenu scan={scan} issues={issues} reviews={reviews} />
            <SharePanel scan={scan} />
          </div>
        )}
      </header>

      {(scan.status === 'pending' || scan.status === 'running') && (
        <Card role="status" className="flex items-center gap-4 border-info/40">
          <span
            aria-hidden="true"
            className="size-5 shrink-0 animate-spin rounded-full border-2 border-info border-t-transparent"
          />
          <div>
            <p className="font-semibold text-sm">{t.runningTitle}</p>
            <p className="text-xs text-text-dim">
              {t.runningDesc}
            </p>
          </div>
        </Card>
      )}

      {scan.status === 'failed' && (
        <Card role="alert" className="border-danger/40">
          <p className="font-semibold text-sm text-danger-soft">{t.failedTitle}</p>
          <p className="text-xs text-text-muted mt-1">{scan.error ?? t.unknownError}</p>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-5">
          <ScoreRing score={scan.score} label={t.ringGlobal} />
          <div>
            <div className="text-sm font-semibold">{t.cardGlobal}</div>
            <p className="text-xs text-text-dim mt-1">
              {t.cardGlobalDesc}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-5">
          <ScoreRing score={scan.rgaa_score} size={72} label={t.ringRgaa} />
          <div>
            <div className="text-sm font-semibold">RGAA 4.1.2</div>
            <p className="text-xs text-text-dim mt-1">{t.cardRgaaDesc}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-5">
          <ScoreRing score={scan.wcag_score} size={72} label={t.ringWcag} />
          <div>
            <div className="text-sm font-semibold">{t.cardWcag}</div>
            <p className="text-xs text-text-dim mt-1">{t.cardWcagDesc}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-5">
          <ScoreRing score={conformity.rate} size={72} label={t.ringOfficial} />
          <div>
            <div className="text-sm font-semibold">{t.cardOfficial}</div>
            <p className="text-xs text-text-dim mt-1">
              {t.conformityCounts(conformity.ok, conformity.nonConformes, conformity.aVerifier)}
              {conformity.nonApplicables > 0 && <> · {t.naCount(conformity.nonApplicables)}</>}
            </p>
          </div>
        </Card>
      </div>

      {scan.status === 'done' && (
        <>
          <div role="tablist" aria-label={t.tablist} className="flex flex-wrap gap-1 border-b border-border">
            {tabs.map((tb) => (
              <button
                key={tb.key}
                role="tab"
                id={`tab-${tb.key}`}
                aria-selected={tab === tb.key}
                aria-controls={`panel-${tb.key}`}
                onClick={() => setTab(tb.key)}
                className={
                  tab === tb.key
                    ? 'rounded-t-[10px] border border-border border-b-transparent bg-surface px-4 py-2.5 text-sm font-semibold text-text -mb-px'
                    : 'rounded-t-[10px] px-4 py-2.5 text-sm font-semibold text-text-muted hover:text-text'
                }
              >
                {tb.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
            {tab === 'issues' && (
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <h2 className="text-lg font-bold">
                    {t.issuesTitle} <span className="text-text-dim font-normal">({filtered.length})</span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.filterSeverity}>
                    <FilterChip active={severityFilter === 'all'} onClick={() => setSeverityFilter('all')}>
                      {t.filterAll}
                    </FilterChip>
                    {SEVERITIES.map((s) => (
                      <FilterChip key={s} active={severityFilter === s} onClick={() => setSeverityFilter(s)}>
                        {severityLabel(lang, s)} ({counts[s]})
                      </FilterChip>
                    ))}
                    <label className="ml-2 inline-flex items-center gap-2 text-sm text-text-muted">
                      <input
                        type="checkbox"
                        checked={hideFixed}
                        onChange={(e) => setHideFixed(e.target.checked)}
                        className="size-4 accent-primary"
                      />
                      {t.hideFixed}
                    </label>
                  </div>
                </div>

                {filtered.length === 0 ? (
                  <p className="text-sm text-text-muted py-8 text-center">
                    {issues?.length === 0 ? t.noIssueAtAll : t.noIssueFiltered}
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {filtered.map((issue) => (
                      <IssueRow key={issue.id} issue={issue} />
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {tab === 'plan' && (
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                  <h2 className="text-lg font-bold">
                    {t.planTitle} <span className="text-text-dim font-normal">{t.planCount(plan.length)}</span>
                  </h2>
                  <Button size="sm" variant="ghost" disabled={!issues} onClick={() => issues && downloadJiraCsv(scan, issues, lang)}>
                    {t.exportTickets}
                  </Button>
                </div>
                <p className="text-xs text-text-dim mb-5">
                  {t.planIntro}{' '}
                  {wins.length > 0 && (
                    <>
                      <strong className="text-success-soft">{t.quickWins(wins.length)}</strong>{' '}
                      {t.quickWinsTail}
                    </>
                  )}
                </p>
                {plan.length === 0 ? (
                  <p className="text-sm text-text-muted py-8 text-center">
                    {t.planEmpty}
                  </p>
                ) : (
                  <ol className="space-y-2">
                    {plan.map((a, idx) => (
                      <li key={a.ruleId} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-border px-4 py-3">
                        <span className="shrink-0 w-6 text-right text-sm font-bold text-text-dim tabular-nums">
                          {idx + 1}.
                        </span>
                        <Badge className={`${SEVERITY_META[a.severity].className} shrink-0`}>
                          {severityLabel(lang, a.severity)}
                        </Badge>
                        <span className="flex-1 min-w-48">
                          <span className="block text-sm font-semibold">
                            {localizeIssueTitle(lang, { rule_id: a.ruleId, title: a.title })}
                          </span>
                          <span className="block text-xs text-text-dim">
                            {a.ruleId}
                            {a.criterionId ? t.criterionSuffix(a.criterionId) : ''}
                            {t.occurrenceLine(a.count, a.pages.length || 1)}
                          </span>
                          {a.suggestedFix && (
                            <span className="mt-1 block text-xs text-success-soft">
                              {localizeIssueFix(lang, { rule_id: a.ruleId, suggested_fix: a.suggestedFix })}
                            </span>
                          )}
                        </span>
                        <Badge className={`${EFFORT_META[a.effort].className} shrink-0`}>
                          {effortLabel(lang, a.effort)}
                        </Badge>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
            )}

            {tab === 'evolution' && (
              <Card>
                <h2 className="text-lg font-bold mb-1">{t.evolutionTitle}</h2>
                {!prevScan ? (
                  <p className="text-sm text-text-muted py-8 text-center">
                    {t.evolutionFirst}
                  </p>
                ) : !evolution ? (
                  <p role="status" className="text-sm text-text-muted py-8 text-center">{t.evolutionLoading}</p>
                ) : (
                  <>
                    <p className="text-xs text-text-dim mb-5">
                      {t.evolutionComparedWith(formatDate(prevScan.created_at, true, lang))}
                      {scan.score !== null && prevScan.score !== null && (
                        <>
                          {' '}{t.scoreLabel}{' '}
                          <strong style={{ color: scoreColor(scan.score) }}>
                            {Math.round(prevScan.score)} % → {Math.round(scan.score)} %
                          </strong>{' '}
                          ({scan.score - prevScan.score >= 0 ? '+' : ''}
                          {Math.round((scan.score - prevScan.score) * 10) / 10} {t.pts})
                        </>
                      )}
                    </p>
                    <div className="grid gap-4 sm:grid-cols-3 mb-6">
                      <div className="rounded-[12px] border border-danger/30 bg-danger-bg/20 px-4 py-3">
                        <span className="block text-2xl font-extrabold text-danger-soft">
                          +{evolution.appeared.length}
                        </span>
                        <span className="text-sm text-text-soft">{t.evolutionNew}</span>
                      </div>
                      <div className="rounded-[12px] border border-success/30 bg-success-bg/20 px-4 py-3">
                        <span className="block text-2xl font-extrabold text-success-soft">
                          −{evolution.resolved.length}
                        </span>
                        <span className="text-sm text-text-soft">{t.evolutionResolved}</span>
                      </div>
                      <div className="rounded-[12px] border border-border px-4 py-3">
                        <span className="block text-2xl font-extrabold">{evolution.persisting.length}</span>
                        <span className="text-sm text-text-soft">{t.evolutionPersisting}</span>
                      </div>
                    </div>
                    {evolution.appeared.length > 0 && (
                      <section className="mb-5">
                        <h3 className="text-sm font-bold mb-2 text-danger-soft">{t.evolutionAppearedTitle}</h3>
                        <ul className="space-y-1.5">
                          {evolution.appeared.map((i) => (
                            <EvolutionRow key={i.id} issue={i} />
                          ))}
                        </ul>
                      </section>
                    )}
                    {evolution.resolved.length > 0 && (
                      <section>
                        <h3 className="text-sm font-bold mb-2 text-success-soft">{t.evolutionResolvedTitle}</h3>
                        <ul className="space-y-1.5">
                          {evolution.resolved.map((i) => (
                            <EvolutionRow key={i.id} issue={i} />
                          ))}
                        </ul>
                      </section>
                    )}
                    {evolution.appeared.length === 0 && evolution.resolved.length === 0 && (
                      <p className="text-sm text-text-muted py-4 text-center">
                        {t.evolutionNoChange}
                      </p>
                    )}
                  </>
                )}
              </Card>
            )}

            {tab === 'criteria' && (
              <Card>
                <h2 className="text-lg font-bold mb-1">{t.criteriaTitle}</h2>
                <p className="text-xs text-text-dim mb-5">
                  {t.criteriaIntro}
                </p>
                <RgaaCriteriaList
                  issues={issues ?? []}
                  reviews={reviews}
                  onReview={handleReview}
                  reviewPending={setReview.isPending}
                />
              </Card>
            )}

            {tab === 'pages' && (
              <Card>
                <h2 className="text-lg font-bold mb-1">
                  {t.pagesTitle} <span className="text-text-dim font-normal">({scan.page_scores?.length ?? 0})</span>
                </h2>
                <p className="text-xs text-text-dim mb-5">
                  {t.pagesIntro}
                </p>
                {(scan.page_scores?.length ?? 0) === 0 ? (
                  <p className="text-sm text-text-muted py-6 text-center">{t.pagesEmpty}</p>
                ) : (
                  <ul className="space-y-2">
                    {scan.page_scores!.map((p) => (
                      <li key={p.url} className="flex flex-wrap items-center gap-3 rounded-[12px] border border-border px-4 py-2.5 text-sm">
                        <span
                          className="shrink-0 font-bold tabular-nums w-12 text-right"
                          style={{ color: scoreColor(p.score) }}
                        >
                          {p.score !== null ? `${Math.round(p.score)}%` : '—'}
                        </span>
                        <span className="flex-1 min-w-40 truncate text-text-soft">{p.url}</span>
                        <span className="shrink-0 text-xs text-text-dim">
                          {t.pageIssues(p.issues)}
                        </span>
                        <span className="flex shrink-0 gap-1.5" role="group" aria-label={t.exportPageAria(p.url)}>
                          <Button size="sm" variant="outline" disabled={!issues} onClick={() => issues && downloadAuditMarkdown(scan, issues, { pageUrl: p.url, reviews }, lang)}>
                            MD
                          </Button>
                          <Button size="sm" variant="outline" disabled={!issues} onClick={() => issues && downloadAuditReport(scan, issues, { pageUrl: p.url, reviews }, lang)}>
                            HTML
                          </Button>
                          <Button size="sm" variant="outline" disabled={!issues} onClick={() => issues && printAuditReport(scan, issues, { pageUrl: p.url, reviews }, lang)}>
                            PDF
                          </Button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {tab === 'badge' && (
              <Card>
                <h2 className="text-lg font-bold mb-4">{t.badgeTitle}</h2>
                {badgeRate !== null ? (
                  <BadgeGenerator rate={badgeRate} date={scan.created_at} siteUrl={scan.sites?.url} />
                ) : (
                  <p className="text-sm text-text-muted">
                    {t.badgeUnavailable}
                  </p>
                )}
              </Card>
            )}
          </div>
        </>
      )}

      <p className="text-xs text-text-dim">
        {t.footerNote}{' '}
        <Link to={localizePath(lang, '/guide-accessibilite')} className="underline hover:text-text">
          {t.footerLink}
        </Link>
        .
      </p>
    </div>
  )
}

function ExportMenu({
  scan,
  issues,
  reviews,
}: {
  scan: Scan
  issues: ScanIssue[]
  reviews?: CriterionReview[]
}) {
  const t = useMessages(L)
  const lang = useLang()
  const scope: ReportScope = { reviews }
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.exportGroup}>
      <Button variant="primary" onClick={() => printAuditReport(scan, issues, scope, lang)}>
        {t.exportPdf}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => downloadAuditReport(scan, issues, scope, lang)}>
        HTML
      </Button>
      <Button variant="ghost" size="sm" onClick={() => downloadAuditMarkdown(scan, issues, scope, lang)}>
        Markdown
      </Button>
      <Button variant="ghost" size="sm" onClick={() => downloadAttestation(scan, issues, scope, lang)}>
        {t.exportAttestation}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => downloadAuditCsv(scan, issues)}>
        CSV
      </Button>
      <Button variant="ghost" size="sm" onClick={() => downloadAuditJson(scan, issues)}>
        JSON
      </Button>
    </div>
  )
}

function EvolutionRow({ issue }: { issue: ScanIssue }) {
  const lang = useLang()
  return (
    <li className="flex items-center gap-3 rounded-[12px] border border-border px-3.5 py-2 text-sm">
      <Badge className={`${SEVERITY_META[issue.severity].className} shrink-0`}>
        {severityLabel(lang, issue.severity)}
      </Badge>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{localizeIssueTitle(lang, issue)}</span>
        <span className="block truncate text-xs text-text-dim">
          {issue.rule_id}
          {issue.page_url ? ` · ${issue.page_url}` : ''}
        </span>
      </span>
    </li>
  )
}

/** Partage public du rapport : lien /r/:token en lecture seule, révocable. */
function SharePanel({ scan }: { scan: Scan }) {
  const t = useMessages(L)
  const setShare = useSetScanShare()
  const [copied, setCopied] = useState(false)
  const shareUrl = scan.share_token ? `${window.location.origin}/r/${scan.share_token}` : null

  async function copy() {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      /* clipboard indisponible */
    }
  }

  if (!shareUrl) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={setShare.isPending}
        onClick={() => setShare.mutate({ scanId: scan.id, enable: true })}
      >
        {setShare.isPending ? t.shareCreating : t.shareCta}
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <code className="max-w-72 truncate rounded-[8px] border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-text-soft">
        {shareUrl}
      </code>
      <Button size="sm" variant="outline" onClick={() => void copy()}>
        {copied ? t.shareCopied : t.shareCopy}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={setShare.isPending}
        onClick={() => setShare.mutate({ scanId: scan.id, enable: false })}
      >
        {t.shareRevoke}
      </Button>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-on-primary'
          : 'rounded-full border border-border-strong px-3 py-1.5 text-xs font-semibold text-text-muted hover:bg-raise hover:text-text'
      }
    >
      {children}
    </button>
  )
}

function IssueRow({ issue }: { issue: ScanIssue }) {
  const t = useMessages(L)
  const lang = useLang()
  const [open, setOpen] = useState(false)
  const update = useUpdateIssueStatus()
  const sev = SEVERITY_META[issue.severity]
  const isDone = issue.status === 'fixed' || issue.status === 'false_positive'
  const fix = localizeIssueFix(lang, issue)

  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done' | 'error' | 'unavailable'>('idle')
  const [aiText, setAiText] = useState('')

  async function onExplain() {
    setAiState('loading')
    try {
      const exec = await functions.createExecution({
        functionId: SCAN_FUNCTION_ID,
        body: JSON.stringify({
          explain: {
            title: issue.title,
            rule_id: issue.rule_id,
            description: issue.description,
            html_snippet: issue.html_snippet,
            selector: issue.selector,
            suggested_fix: issue.suggested_fix,
          },
        }),
        async: false,
      })
      const payload = JSON.parse(exec.responseBody || '{}')
      if (exec.responseStatusCode === 503) {
        setAiState('unavailable')
        return
      }
      if (exec.responseStatusCode >= 400 || !payload.explanation) {
        throw new Error(payload.error || 'Réponse invalide')
      }
      setAiText(payload.explanation)
      setAiState('done')
    } catch {
      setAiState('error')
    }
  }

  return (
    <li className={`rounded-[12px] border border-border ${isDone ? 'opacity-60' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03] rounded-[12px]"
      >
        <Badge className={sev.className}>{severityLabel(lang, issue.severity)}</Badge>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold text-sm truncate">{localizeIssueTitle(lang, issue)}</span>
          <span className="block text-xs text-text-dim truncate">
            {issue.rule_id}
            {issue.page_url ? ` · ${issue.page_url}` : ''}
          </span>
        </span>
        {isDone && <Badge className="bg-success-bg/60 text-success-soft border-success/40">{t.issueHandled}</Badge>}
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-4 text-sm">
          {issue.description && <p className="text-text-soft whitespace-pre-line">{issue.description}</p>}

          {issue.selector && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">{t.issueSelector}</h3>
              <code className="block rounded-[8px] bg-surface-2 border border-border px-3 py-2 text-xs text-primary-soft overflow-x-auto">
                {issue.selector}
              </code>
            </div>
          )}

          {issue.html_snippet && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">{t.issueSnippet}</h3>
              <pre tabIndex={0} className="rounded-[8px] bg-surface-2 border border-border px-3 py-2 text-xs text-text-soft overflow-x-auto">
                <code>{issue.html_snippet}</code>
              </pre>
            </div>
          )}

          {fix && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">{t.issueFix}</h3>
              <p className="rounded-[8px] border border-success/30 bg-success-bg/25 px-3 py-2 text-success-soft">
                {fix}
              </p>
            </div>
          )}

          {aiState !== 'unavailable' && (
            <div>
              {aiState === 'idle' && (
                <Button size="sm" variant="ghost" onClick={onExplain}>
                  {t.aiExplain}
                </Button>
              )}
              {aiState === 'loading' && (
                <p role="status" className="inline-flex items-center gap-2 text-xs text-text-muted">
                  <span aria-hidden="true" className="size-3.5 rounded-full border-2 border-info border-t-transparent animate-spin" />
                  {t.aiLoading}
                </p>
              )}
              {aiState === 'error' && (
                <p className="text-xs text-danger-soft">
                  {t.aiError}{' '}
                  <button type="button" onClick={onExplain} className="underline font-semibold">{t.aiRetry}</button>
                </p>
              )}
              {aiState === 'done' && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">
                    {t.aiResultTitle}
                  </h3>
                  <pre tabIndex={0} className="rounded-[8px] border border-info/30 bg-surface-2 px-3.5 py-3 text-xs text-info-soft whitespace-pre-wrap font-sans leading-relaxed overflow-x-auto">
                    {aiText}
                  </pre>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {!isDone ? (
              <>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={update.isPending}
                  onClick={() => update.mutate({ id: issue.id, status: 'fixed' })}
                >
                  {t.markFixed}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={update.isPending}
                  onClick={() => update.mutate({ id: issue.id, status: 'false_positive' })}
                >
                  {t.markFalsePositive}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                disabled={update.isPending}
                onClick={() => update.mutate({ id: issue.id, status: 'open' })}
              >
                {t.reopen}
              </Button>
            )}
          </div>
        </div>
      )}
    </li>
  )
}
