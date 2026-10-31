import type { Lang } from '@/i18n'
import type { CriterionReview, Scan, ScanIssue, Severity } from '@/lib/database.types'
import { computeConformity, type ConformitySummary, type CriterionStatus } from '@/lib/conformity'
import { downloadHtmlFile, escapeHtml, slugify } from '@/lib/declaration'
import { localizeIssueFix, localizeIssueTitle } from '@/i18n/rules-i18n'
import { localizeCriterion, localizeTopic } from '@/i18n/rgaa-i18n'
import type { CriterionCoverage } from '@/lib/rgaa'

const SEVERITY_ORDER: Severity[] = ['critical', 'serious', 'moderate', 'minor']

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: '#b91c1c',
  serious: '#c2410c',
  moderate: '#a16207',
  minor: '#0369a1',
}

const STATUS_COLORS = {
  ok: '#067647',
  non_conforme: '#b91c1c',
  a_verifier: '#a16207',
  non_applicable: '#6b7280',
} as const

/* ------------------------------------------------------------------ */
/* Traductions des documents exportés (autonomes : les dictionnaires    */
/* vivent ici, les *_META français de l'interface ne sont pas utilisés) */
/* ------------------------------------------------------------------ */

type ReportL10n = {
  /** Locale Intl pour les dates du document. */
  dateLocale: string
  /** Nom de repli quand le site n'a pas de nom. */
  siteFallback: string
  /** Suffixe de titre quand le rapport porte sur une seule page. */
  pageSuffix: (url: string) => string

  /* --- Rapport HTML / Markdown : en-tête --- */
  docTitle: string
  h1: string
  subtitle: (date: string) => string
  auditedPage: string
  /** Séparateur « libellé → valeur » (le français insère une espace avant le deux-points). */
  labelSep: string
  /** Pourcentage formaté (le français insère une espace avant le %, l'anglais non). */
  pct: (value: number) => string
  pagesAnalysed: (n: number) => string
  mdPagesAnalysed: (n: number) => string

  /* --- Scores --- */
  scorePage: string
  scoreRgaaTested: string
  scoreGlobal: string
  scoreCriteriaTested: string

  /* --- Sévérités et statuts --- */
  severity: Record<Severity, string>
  severityCount: (severity: Severity, n: number) => string
  status: Record<CriterionStatus, string>
  coverage: Record<CriterionCoverage, string>
  noOpenIssues: string

  /* --- Encadré réglementaire --- */
  legalBlock: string
  mdLegalLines: string[]

  /* --- Section des 106 critères --- */
  criteriaHeading: string
  criteriaRate: (rate: number) => string
  criteriaCounts: (summary: ConformitySummary) => string
  topicStats: (nonConformes: number, ok: number, aVerifier: number) => string
  thNum: string
  thCriterion: string
  thStatus: string
  thLevel: string
  levelLabel: (level: string) => string
  manualReview: (date: string) => string

  /* --- Non-conformités --- */
  issuesHeading: string
  issuesHeadingPage: string
  noIssues: string
  mdNoIssues: string
  tagFixed: string
  tagFalsePositive: string
  selectorLabel: string
  fixLabel: string
  footerBlock: string

  /* --- Markdown --- */
  mdScoresHeading: string
  mdIndicator: string
  mdValue: string
  mdRateRow: string
  mdOpenIssuesRow: string
  mdCountLines: (summary: ConformitySummary) => string[]
  mdRateSentence: (rate: number) => string
  mdWhyImportant: (criterionId: string) => string
  mdDetailHeading: string
  mdLabels: { rule: string; page: string; selector: string; description: string; fix: string }
  mdFooterLines: string[]

  /* --- Attestation --- */
  attestDocTitle: string
  attestKicker: string
  attestTitle: string
  attestParagraph: (nameHtml: string, linkHtml: string, date: string, method: string) => string
  attestMethodComplete: string
  attestMethodAuto: string
  attestMethodAutoOngoing: string
  attestRateCaption: string
  attestOk: string
  attestNonConformes: string
  attestNonApplicables: string
  attestAVerifier: string
  attestSample: string
  attestFrameworks: string
  attestPages: (n: number) => string
  attestNotice: string
  attestFooter: string

  /* --- Exports CSV --- */
  csvColumns: readonly string[]
  jiraLabels: {
    rule: string
    page: string
    selector: string
    detail: string
    fix: string
    code: string
    tags: string
  }

  /* --- Noms de fichiers --- */
  fileReport: string
  fileAttestation: string
  fileAudit: string
  fileTickets: string
}

const L10N: Record<Lang, ReportL10n> = {
  /* ----------------------------- Français ----------------------------- */
  fr: {
    dateLocale: 'fr-FR',
    siteFallback: 'Site',
    pageSuffix: (url) => ` — page ${url}`,

    docTitle: "Rapport d'audit accessibilité",
    h1: "Rapport d'audit d'accessibilité",
    subtitle: (date) => `Audit automatisé RGAA 4.1.2 / WCAG 2.2 réalisé le ${date}`,
    auditedPage: 'Page auditée',
    labelSep: ' : ',
    pct: (v) => `${v} %`,
    pagesAnalysed: (n) => `${n} page${n > 1 ? 's' : ''} analysée${n > 1 ? 's' : ''}`,
    mdPagesAnalysed: (n) => `${n} page(s) analysée(s)`,

    scorePage: 'Score de la page',
    scoreRgaaTested: 'Conformité RGAA (critères testés)',
    scoreGlobal: 'Conformité globale',
    scoreCriteriaTested: 'Critères RGAA testés',

    severity: { critical: 'Critique', serious: 'Majeur', moderate: 'Modéré', minor: 'Mineur' },
    severityCount: (sev, n) => {
      const w = { critical: 'critique', serious: 'majeur', moderate: 'modéré', minor: 'mineur' }[sev]
      return `${n} ${w}${n > 1 ? 's' : ''}`
    },
    status: {
      ok: 'Conforme',
      non_conforme: 'Non conforme',
      non_applicable: 'Non applicable',
      a_verifier: 'À vérifier',
    },
    coverage: {
      auto: 'Testé automatiquement',
      partial: 'Testé partiellement (compléter par une revue manuelle)',
      manual: 'Nécessite une vérification humaine',
    },
    noOpenIssues: 'Aucune non-conformité ouverte',

    legalBlock: `  <strong>Rappel réglementaire.</strong> Depuis le <strong>28 juin 2025</strong>, la directive européenne
  (UE) 2019/882 (European Accessibility Act) impose l'accessibilité des sites e-commerce et de nombreux
  services numériques. En France, la conformité se démontre via le <strong>RGAA 4.1.2</strong> et la DGCCRF
  contrôle activement : jusqu'à <strong>50 000 € d'amende par service non conforme</strong> et
  <strong>25 000 €</strong> en l'absence de déclaration d'accessibilité.`,
    mdLegalLines: [
      '> **Rappel réglementaire** — Depuis le 28 juin 2025, la directive (UE) 2019/882 (European',
      "> Accessibility Act) impose l'accessibilité de nombreux services numériques. La DGCCRF peut",
      "> prononcer jusqu'à 50 000 € d'amende par service non conforme et 25 000 € en l'absence de",
      "> déclaration d'accessibilité.",
    ],

    criteriaHeading: 'Les 106 critères du RGAA 4.1.2',
    criteriaRate: (rate) =>
      `Taux de conformité (méthode officielle : conformes / critères évalués, hors non-applicables) : <strong>${rate} %</strong> — `,
    criteriaCounts: (s) =>
      `${s.ok} conforme${s.ok > 1 ? 's' : ''},
      ${s.nonConformes} non conforme${s.nonConformes > 1 ? 's' : ''},
      ${s.nonApplicables} non applicable${s.nonApplicables > 1 ? 's' : ''},
      ${s.aVerifier} à vérifier manuellement.`,
    topicStats: (nc, ok, av) =>
      `${nc > 0 ? `${nc} non conforme${nc > 1 ? 's' : ''} · ` : ''}${ok} validé${ok > 1 ? 's' : ''} · ${av} à vérifier`,
    thNum: 'N°',
    thCriterion: 'Critère',
    thStatus: 'Statut',
    thLevel: 'Niveau',
    levelLabel: (level) => `Niveau ${level}`,
    manualReview: (date) => `Évaluation manuelle du ${date}`,

    issuesHeading: 'Non-conformités détectées',
    issuesHeadingPage: ' sur cette page',
    noIssues: '🎉 Aucune non-conformité détectée sur les règles automatisables.',
    mdNoIssues: 'Aucune non-conformité détectée sur les règles automatisables. 🎉',
    tagFixed: 'corrigée',
    tagFalsePositive: 'faux positif',
    selectorLabel: 'Sélecteur :',
    fixLabel: 'Correction suggérée :',
    footerBlock: `  <p>Audit automatisé : un moteur détecte une partie des critères RGAA (les autres nécessitent une
  vérification humaine, signalée « à vérifier » ci-dessus). Pour une conformité opposable, complétez par
  un audit manuel.<br>
  Rapport généré avec <a href="https://konforme.kayzen-lyon.com">Konforme</a>. Pour l'obtenir en PDF :
  Fichier → Imprimer → « Enregistrer au format PDF ».</p>`,

    mdScoresHeading: 'Scores',
    mdIndicator: 'Indicateur',
    mdValue: 'Valeur',
    mdRateRow: 'Taux de conformité RGAA (critères évalués)',
    mdOpenIssuesRow: 'Non-conformités ouvertes',
    mdCountLines: (s) => [
      `- ✅ Conformes : **${s.ok}**`,
      `- ❌ Non conformes : **${s.nonConformes}**`,
      `- ➖ Non applicables : **${s.nonApplicables}**`,
      `- 👁️ À vérifier manuellement : **${s.aVerifier}**`,
    ],
    mdRateSentence: (rate) =>
      `Taux de conformité (méthode officielle) : **${rate} %** — conformes / critères évalués, hors non-applicables.`,
    mdWhyImportant: (id) => `**Critère ${id} — pourquoi c'est important :**`,
    mdDetailHeading: 'Détail des non-conformités',
    mdLabels: {
      rule: '**Règle :**',
      page: '**Page :**',
      selector: '**Sélecteur :**',
      description: '**Description :**',
      fix: '**Correction suggérée :**',
    },
    mdFooterLines: [
      "_Audit automatisé : un moteur détecte une partie des critères RGAA ; les critères « à vérifier »",
      'nécessitent une revue humaine. Rapport généré avec [Konforme](https://konforme.kayzen-lyon.com)._',
    ],

    attestDocTitle: "Attestation d'audit d'accessibilité",
    attestKicker: 'Accessibilité numérique — RGAA 4.1.2 / WCAG 2.2 / directive (UE) 2019/882',
    attestTitle: "Attestation d'audit d'accessibilité",
    attestParagraph: (name, link, date, method) =>
      `Le site <strong>${name}</strong>${link}
a fait l'objet d'un audit d'accessibilité le <strong>${date}</strong>, réalisé avec la plateforme Konforme
selon la méthode technique du RGAA 4.1.2${method}.`,
    attestMethodComplete: ' (audit automatisé complété par une évaluation manuelle des 106 critères)',
    attestMethodAuto: ' (audit automatisé)',
    attestMethodAutoOngoing: ' (audit automatisé, évaluation manuelle en cours)',
    attestRateCaption:
      'taux de conformité RGAA sur les critères évalués<br>(critères conformes / critères évalués, hors non-applicables — méthode officielle)',
    attestOk: 'Critères conformes',
    attestNonConformes: 'Critères non conformes',
    attestNonApplicables: 'Critères non applicables',
    attestAVerifier: 'Critères restant à vérifier',
    attestSample: 'Échantillon audité',
    attestFrameworks: 'Référentiels',
    attestPages: (n) => `${n} page${n > 1 ? 's' : ''}`,
    attestNotice: `  Cette attestation rend compte de l'état du site à la date de l'audit sur l'échantillon indiqué.
  Elle ne constitue pas une certification délivrée par un organisme tiers. Le référentiel RGAA
  n'exige aucun agrément pour la réalisation des audits : l'audit peut être réalisé en interne ou
  par un tiers (modèle officiel de déclaration d'accessibilité). Un nouvel audit est recommandé
  après toute évolution majeure du site, et au moins une fois par an.`,
    attestFooter: `  Document généré par <a href="https://konforme.kayzen-lyon.com">Konforme</a> — KAYZEN.
  Pour l'imprimer en PDF : Fichier → Imprimer → « Enregistrer au format PDF ».`,

    csvColumns: ['severite', 'regle', 'categorie', 'titre', 'page', 'selecteur', 'statut', 'correction'],
    jiraLabels: {
      rule: 'Règle',
      page: 'Page',
      selector: 'Sélecteur',
      detail: 'Détail',
      fix: 'Correction suggérée',
      code: 'Code',
      tags: 'accessibilite rgaa',
    },

    fileReport: 'rapport-audit',
    fileAttestation: 'attestation-audit',
    fileAudit: 'audit',
    fileTickets: 'tickets-a11y',
  },

  /* ------------------------------ English ------------------------------ */
  en: {
    dateLocale: 'en-GB',
    siteFallback: 'Site',
    pageSuffix: (url) => ` — page ${url}`,

    docTitle: 'Accessibility audit report',
    h1: 'Accessibility audit report',
    subtitle: (date) => `Automated RGAA 4.1.2 / WCAG 2.2 audit carried out on ${date}`,
    auditedPage: 'Audited page',
    labelSep: ': ',
    pct: (v) => `${v}%`,
    pagesAnalysed: (n) => `${n} page${n > 1 ? 's' : ''} analysed`,
    mdPagesAnalysed: (n) => `${n} page(s) analysed`,

    scorePage: 'Page score',
    scoreRgaaTested: 'RGAA compliance (tested criteria)',
    scoreGlobal: 'Overall compliance',
    scoreCriteriaTested: 'RGAA criteria tested',

    severity: { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' },
    severityCount: (sev, n) => {
      const w = { critical: 'critical', serious: 'serious', moderate: 'moderate', minor: 'minor' }[sev]
      return `${n} ${w} issue${n > 1 ? 's' : ''}`
    },
    status: {
      ok: 'Compliant',
      non_conforme: 'Non-compliant',
      non_applicable: 'Not applicable',
      a_verifier: 'To check',
    },
    coverage: {
      auto: 'Tested automatically',
      partial: 'Partially tested (complete with a manual review)',
      manual: 'Requires a human check',
    },
    noOpenIssues: 'No open issues',

    legalBlock: `  <strong>Regulatory reminder.</strong> Since <strong>28 June 2025</strong>, European Directive
  (EU) 2019/882 (European Accessibility Act) has required e-commerce websites and many digital
  services to be accessible. In France, compliance is demonstrated through the <strong>RGAA 4.1.2</strong>
  and the DGCCRF actively enforces it: fines of up to <strong>€50,000 per non-compliant service</strong> and
  <strong>€25,000</strong> where no accessibility statement is published.`,
    mdLegalLines: [
      '> **Regulatory reminder** — Since 28 June 2025, Directive (EU) 2019/882 (European',
      '> Accessibility Act) has required many digital services to be accessible. In France, the DGCCRF',
      '> can impose fines of up to €50,000 per non-compliant service and €25,000 where no',
      '> accessibility statement is published.',
    ],

    criteriaHeading: 'The 106 RGAA 4.1.2 criteria',
    criteriaRate: (rate) =>
      `Compliance rate (official method: compliant criteria / assessed criteria, excluding non-applicable ones): <strong>${rate}%</strong> — `,
    criteriaCounts: (s) =>
      `${s.ok} compliant,
      ${s.nonConformes} non-compliant,
      ${s.nonApplicables} not applicable,
      ${s.aVerifier} to be checked manually.`,
    topicStats: (nc, ok, av) =>
      `${nc > 0 ? `${nc} non-compliant · ` : ''}${ok} passed · ${av} to check`,
    thNum: 'No.',
    thCriterion: 'Criterion',
    thStatus: 'Status',
    thLevel: 'Level',
    levelLabel: (level) => `Level ${level}`,
    manualReview: (date) => `Manual assessment on ${date}`,

    issuesHeading: 'Non-compliances detected',
    issuesHeadingPage: ' on this page',
    noIssues: '🎉 No non-compliance detected on the automatable rules.',
    mdNoIssues: 'No non-compliance detected on the automatable rules. 🎉',
    tagFixed: 'fixed',
    tagFalsePositive: 'false positive',
    selectorLabel: 'Selector:',
    fixLabel: 'Suggested fix:',
    footerBlock: `  <p>Automated audit: an engine detects part of the RGAA criteria (the others require a human
  check and are flagged “to check” above). For enforceable compliance, complete this report with
  a manual audit.<br>
  Report generated with <a href="https://konforme.kayzen-lyon.com">Konforme</a>. To obtain it as a PDF:
  File → Print → “Save as PDF”.</p>`,

    mdScoresHeading: 'Scores',
    mdIndicator: 'Indicator',
    mdValue: 'Value',
    mdRateRow: 'RGAA compliance rate (assessed criteria)',
    mdOpenIssuesRow: 'Open non-compliances',
    mdCountLines: (s) => [
      `- ✅ Compliant: **${s.ok}**`,
      `- ❌ Non-compliant: **${s.nonConformes}**`,
      `- ➖ Not applicable: **${s.nonApplicables}**`,
      `- 👁️ To be checked manually: **${s.aVerifier}**`,
    ],
    mdRateSentence: (rate) =>
      `Compliance rate (official method): **${rate}%** — compliant criteria / assessed criteria, excluding non-applicable ones.`,
    mdWhyImportant: (id) => `**Criterion ${id} — why it matters:**`,
    mdDetailHeading: 'Non-compliances in detail',
    mdLabels: {
      rule: '**Rule:**',
      page: '**Page:**',
      selector: '**Selector:**',
      description: '**Description:**',
      fix: '**Suggested fix:**',
    },
    mdFooterLines: [
      '_Automated audit: an engine detects part of the RGAA criteria; the criteria marked “to check”',
      'require a human review. Report generated with [Konforme](https://konforme.kayzen-lyon.com)._',
    ],

    attestDocTitle: 'Accessibility audit attestation',
    attestKicker: 'Digital accessibility — RGAA 4.1.2 / WCAG 2.2 / Directive (EU) 2019/882',
    attestTitle: 'Accessibility audit attestation',
    attestParagraph: (name, link, date, method) =>
      `The website <strong>${name}</strong>${link}
underwent an accessibility audit on <strong>${date}</strong>, carried out with the Konforme platform
following the technical method of RGAA 4.1.2${method}.`,
    attestMethodComplete: ' (automated audit supplemented by a manual assessment of the 106 criteria)',
    attestMethodAuto: ' (automated audit)',
    attestMethodAutoOngoing: ' (automated audit, manual assessment in progress)',
    attestRateCaption:
      'RGAA compliance rate on the assessed criteria<br>(compliant criteria / assessed criteria, excluding non-applicable ones — official method)',
    attestOk: 'Compliant criteria',
    attestNonConformes: 'Non-compliant criteria',
    attestNonApplicables: 'Non-applicable criteria',
    attestAVerifier: 'Criteria still to be checked',
    attestSample: 'Audited sample',
    attestFrameworks: 'Reference frameworks',
    attestPages: (n) => `${n} page${n > 1 ? 's' : ''}`,
    attestNotice: `  This attestation reports the state of the website on the audit date, for the sample indicated.
  It does not constitute a certification issued by a third-party body. The RGAA framework
  requires no accreditation to carry out audits: an audit may be performed in-house or
  by a third party (official accessibility statement template). A new audit is recommended
  after any major change to the website, and at least once a year.`,
    attestFooter: `  Document generated by <a href="https://konforme.kayzen-lyon.com">Konforme</a> — KAYZEN.
  To print it as a PDF: File → Print → “Save as PDF”.`,

    csvColumns: ['severity', 'rule', 'category', 'title', 'page', 'selector', 'status', 'fix'],
    jiraLabels: {
      rule: 'Rule',
      page: 'Page',
      selector: 'Selector',
      detail: 'Details',
      fix: 'Suggested fix',
      code: 'Code',
      tags: 'accessibility rgaa',
    },

    fileReport: 'accessibility-audit-report',
    fileAttestation: 'audit-attestation',
    fileAudit: 'audit',
    fileTickets: 'a11y-tickets',
  },

  /* ------------------------------ Deutsch ------------------------------ */
  de: {
    dateLocale: 'de-DE',
    siteFallback: 'Website',
    pageSuffix: (url) => ` — Seite ${url}`,

    docTitle: 'Bericht zur Barrierefreiheitsprüfung',
    h1: 'Bericht zur Barrierefreiheitsprüfung',
    subtitle: (date) => `Automatisierte Prüfung nach RGAA 4.1.2 / WCAG 2.2 vom ${date}`,
    auditedPage: 'Geprüfte Seite',
    labelSep: ': ',
    pct: (v) => `${v} %`,
    pagesAnalysed: (n) => `${n} Seite${n > 1 ? 'n' : ''} analysiert`,
    mdPagesAnalysed: (n) => `${n} Seite(n) analysiert`,

    scorePage: 'Seiten-Score',
    scoreRgaaTested: 'RGAA-Konformität (geprüfte Kriterien)',
    scoreGlobal: 'Gesamtkonformität',
    scoreCriteriaTested: 'Geprüfte RGAA-Kriterien',

    severity: { critical: 'Kritisch', serious: 'Schwerwiegend', moderate: 'Mittel', minor: 'Gering' },
    severityCount: (sev, n) => {
      const w = {
        critical: n > 1 ? 'kritische Verstöße' : 'kritischer Verstoß',
        serious: n > 1 ? 'schwerwiegende Verstöße' : 'schwerwiegender Verstoß',
        moderate: n > 1 ? 'mittlere Verstöße' : 'mittlerer Verstoß',
        minor: n > 1 ? 'geringfügige Verstöße' : 'geringfügiger Verstoß',
      }[sev]
      return `${n} ${w}`
    },
    status: {
      ok: 'Konform',
      non_conforme: 'Nicht konform',
      non_applicable: 'Nicht anwendbar',
      a_verifier: 'Zu prüfen',
    },
    coverage: {
      auto: 'Automatisch geprüft',
      partial: 'Teilweise geprüft (durch manuelle Prüfung ergänzen)',
      manual: 'Erfordert eine manuelle Prüfung',
    },
    noOpenIssues: 'Keine offenen Verstöße',

    legalBlock: `  <strong>Rechtlicher Hinweis.</strong> Seit dem <strong>28. Juni 2025</strong> verpflichtet die
  europäische Richtlinie (EU) 2019/882 (European Accessibility Act) E-Commerce-Websites und zahlreiche
  digitale Dienste zur Barrierefreiheit. In Frankreich wird die Konformität über den
  <strong>RGAA 4.1.2</strong> nachgewiesen, und die DGCCRF kontrolliert aktiv: bis zu
  <strong>50 000 € Bußgeld je nicht konformem Dienst</strong> und <strong>25 000 €</strong>, wenn keine
  Barrierefreiheitserklärung vorliegt.`,
    mdLegalLines: [
      '> **Rechtlicher Hinweis** — Seit dem 28. Juni 2025 verpflichtet die Richtlinie (EU) 2019/882',
      '> (European Accessibility Act) zahlreiche digitale Dienste zur Barrierefreiheit. In Frankreich kann',
      '> die DGCCRF Bußgelder von bis zu 50 000 € je nicht konformem Dienst und 25 000 € bei fehlender',
      '> Barrierefreiheitserklärung verhängen.',
    ],

    criteriaHeading: 'Die 106 Kriterien des RGAA 4.1.2',
    criteriaRate: (rate) =>
      `Konformitätsgrad (offizielle Methode: konforme Kriterien / bewertete Kriterien, ohne nicht anwendbare): <strong>${rate} %</strong> — `,
    criteriaCounts: (s) =>
      `${s.ok} konform,
      ${s.nonConformes} nicht konform,
      ${s.nonApplicables} nicht anwendbar,
      ${s.aVerifier} manuell zu prüfen.`,
    topicStats: (nc, ok, av) =>
      `${nc > 0 ? `${nc} nicht konform · ` : ''}${ok} bestanden · ${av} zu prüfen`,
    thNum: 'Nr.',
    thCriterion: 'Kriterium',
    thStatus: 'Status',
    thLevel: 'Stufe',
    levelLabel: (level) => `Stufe ${level}`,
    manualReview: (date) => `Manuelle Bewertung vom ${date}`,

    issuesHeading: 'Festgestellte Verstöße',
    issuesHeadingPage: ' auf dieser Seite',
    noIssues: '🎉 Bei den automatisiert prüfbaren Regeln wurden keine Verstöße festgestellt.',
    mdNoIssues: 'Bei den automatisiert prüfbaren Regeln wurden keine Verstöße festgestellt. 🎉',
    tagFixed: 'behoben',
    tagFalsePositive: 'Falschmeldung',
    selectorLabel: 'Selektor:',
    fixLabel: 'Empfohlene Korrektur:',
    footerBlock: `  <p>Automatisierte Prüfung: Ein Prüfmodul erkennt einen Teil der RGAA-Kriterien (die übrigen erfordern
  eine manuelle Prüfung und sind oben mit „zu prüfen“ gekennzeichnet). Für eine belastbare Konformität
  ergänzen Sie diesen Bericht bitte durch ein manuelles Audit.<br>
  Bericht erstellt mit <a href="https://konforme.kayzen-lyon.com">Konforme</a>. Als PDF sichern:
  Datei → Drucken → „Als PDF speichern“.</p>`,

    mdScoresHeading: 'Bewertungen',
    mdIndicator: 'Kennzahl',
    mdValue: 'Wert',
    mdRateRow: 'RGAA-Konformitätsgrad (bewertete Kriterien)',
    mdOpenIssuesRow: 'Offene Verstöße',
    mdCountLines: (s) => [
      `- ✅ Konform: **${s.ok}**`,
      `- ❌ Nicht konform: **${s.nonConformes}**`,
      `- ➖ Nicht anwendbar: **${s.nonApplicables}**`,
      `- 👁️ Manuell zu prüfen: **${s.aVerifier}**`,
    ],
    mdRateSentence: (rate) =>
      `Konformitätsgrad (offizielle Methode): **${rate} %** — konforme Kriterien / bewertete Kriterien, ohne nicht anwendbare.`,
    mdWhyImportant: (id) => `**Kriterium ${id} — warum das wichtig ist:**`,
    mdDetailHeading: 'Verstöße im Detail',
    mdLabels: {
      rule: '**Regel:**',
      page: '**Seite:**',
      selector: '**Selektor:**',
      description: '**Beschreibung:**',
      fix: '**Empfohlene Korrektur:**',
    },
    mdFooterLines: [
      '_Automatisierte Prüfung: Ein Prüfmodul erkennt einen Teil der RGAA-Kriterien; die mit „zu prüfen“',
      'gekennzeichneten Kriterien erfordern eine manuelle Prüfung. Bericht erstellt mit [Konforme](https://konforme.kayzen-lyon.com)._',
    ],

    attestDocTitle: 'Bescheinigung über die Barrierefreiheitsprüfung',
    attestKicker: 'Digitale Barrierefreiheit — RGAA 4.1.2 / WCAG 2.2 / Richtlinie (EU) 2019/882',
    attestTitle: 'Bescheinigung über die Barrierefreiheitsprüfung',
    attestParagraph: (name, link, date, method) =>
      `Die Website <strong>${name}</strong>${link}
wurde am <strong>${date}</strong> einer Barrierefreiheitsprüfung unterzogen, durchgeführt mit der Plattform
Konforme nach der technischen Methode des RGAA 4.1.2${method}.`,
    attestMethodComplete:
      ' (automatisierte Prüfung, ergänzt durch eine manuelle Bewertung der 106 Kriterien)',
    attestMethodAuto: ' (automatisierte Prüfung)',
    attestMethodAutoOngoing: ' (automatisierte Prüfung, manuelle Bewertung läuft)',
    attestRateCaption:
      'RGAA-Konformitätsgrad für die bewerteten Kriterien<br>(konforme Kriterien / bewertete Kriterien, ohne nicht anwendbare — offizielle Methode)',
    attestOk: 'Konforme Kriterien',
    attestNonConformes: 'Nicht konforme Kriterien',
    attestNonApplicables: 'Nicht anwendbare Kriterien',
    attestAVerifier: 'Noch zu prüfende Kriterien',
    attestSample: 'Geprüfte Stichprobe',
    attestFrameworks: 'Referenzstandards',
    attestPages: (n) => `${n} Seite${n > 1 ? 'n' : ''}`,
    attestNotice: `  Diese Bescheinigung gibt den Zustand der Website zum Prüfdatum für die angegebene Stichprobe wieder.
  Sie stellt keine Zertifizierung durch eine unabhängige Stelle dar. Der RGAA verlangt für die
  Durchführung von Prüfungen keine Akkreditierung: Die Prüfung kann intern oder durch Dritte erfolgen
  (offizielles Muster der Barrierefreiheitserklärung). Eine erneute Prüfung wird nach jeder
  wesentlichen Änderung der Website und mindestens einmal jährlich empfohlen.`,
    attestFooter: `  Dokument erstellt mit <a href="https://konforme.kayzen-lyon.com">Konforme</a> — KAYZEN.
  Als PDF drucken: Datei → Drucken → „Als PDF speichern“.`,

    csvColumns: ['schweregrad', 'regel', 'kategorie', 'titel', 'seite', 'selektor', 'status', 'korrektur'],
    jiraLabels: {
      rule: 'Regel',
      page: 'Seite',
      selector: 'Selektor',
      detail: 'Details',
      fix: 'Empfohlene Korrektur',
      code: 'Code',
      tags: 'barrierefreiheit rgaa',
    },

    fileReport: 'barrierefreiheit-bericht',
    fileAttestation: 'pruefbescheinigung',
    fileAudit: 'audit',
    fileTickets: 'a11y-tickets',
  },

  /* ------------------------------ Español ------------------------------ */
  es: {
    dateLocale: 'es-ES',
    siteFallback: 'Sitio',
    pageSuffix: (url) => ` — página ${url}`,

    docTitle: 'Informe de auditoría de accesibilidad',
    h1: 'Informe de auditoría de accesibilidad',
    subtitle: (date) => `Auditoría automatizada RGAA 4.1.2 / WCAG 2.2 realizada el ${date}`,
    auditedPage: 'Página auditada',
    labelSep: ': ',
    pct: (v) => `${v} %`,
    pagesAnalysed: (n) => `${n} página${n > 1 ? 's' : ''} analizada${n > 1 ? 's' : ''}`,
    mdPagesAnalysed: (n) => `${n} página(s) analizada(s)`,

    scorePage: 'Puntuación de la página',
    scoreRgaaTested: 'Conformidad RGAA (criterios evaluados)',
    scoreGlobal: 'Conformidad global',
    scoreCriteriaTested: 'Criterios RGAA evaluados',

    severity: { critical: 'Crítico', serious: 'Grave', moderate: 'Moderado', minor: 'Leve' },
    severityCount: (sev, n) => {
      const w = {
        critical: n > 1 ? 'incumplimientos críticos' : 'incumplimiento crítico',
        serious: n > 1 ? 'incumplimientos graves' : 'incumplimiento grave',
        moderate: n > 1 ? 'incumplimientos moderados' : 'incumplimiento moderado',
        minor: n > 1 ? 'incumplimientos leves' : 'incumplimiento leve',
      }[sev]
      return `${n} ${w}`
    },
    status: {
      ok: 'Conforme',
      non_conforme: 'No conforme',
      non_applicable: 'No aplicable',
      a_verifier: 'Por verificar',
    },
    coverage: {
      auto: 'Comprobado automáticamente',
      partial: 'Comprobado parcialmente (complete con una revisión manual)',
      manual: 'Requiere una verificación humana',
    },
    noOpenIssues: 'Ninguna no conformidad abierta',

    legalBlock: `  <strong>Recordatorio normativo.</strong> Desde el <strong>28 de junio de 2025</strong>, la Directiva
  europea (UE) 2019/882 (European Accessibility Act) exige la accesibilidad de los sitios de comercio
  electrónico y de numerosos servicios digitales. En Francia, la conformidad se demuestra mediante el
  <strong>RGAA 4.1.2</strong> y la DGCCRF controla activamente: hasta
  <strong>50 000 € de multa por servicio no conforme</strong> y <strong>25 000 €</strong> en ausencia de
  declaración de accesibilidad.`,
    mdLegalLines: [
      '> **Recordatorio normativo** — Desde el 28 de junio de 2025, la Directiva (UE) 2019/882 (European',
      '> Accessibility Act) exige la accesibilidad de numerosos servicios digitales. En Francia, la DGCCRF',
      '> puede imponer hasta 50 000 € de multa por servicio no conforme y 25 000 € en ausencia de',
      '> declaración de accesibilidad.',
    ],

    criteriaHeading: 'Los 106 criterios del RGAA 4.1.2',
    criteriaRate: (rate) =>
      `Tasa de conformidad (método oficial: criterios conformes / criterios evaluados, excluidos los no aplicables): <strong>${rate} %</strong> — `,
    criteriaCounts: (s) =>
      `${s.ok} conforme${s.ok > 1 ? 's' : ''},
      ${s.nonConformes} no conforme${s.nonConformes > 1 ? 's' : ''},
      ${s.nonApplicables} no aplicable${s.nonApplicables > 1 ? 's' : ''},
      ${s.aVerifier} por verificar manualmente.`,
    topicStats: (nc, ok, av) =>
      `${nc > 0 ? `${nc} no conforme${nc > 1 ? 's' : ''} · ` : ''}${ok} validado${ok > 1 ? 's' : ''} · ${av} por verificar`,
    thNum: 'N.º',
    thCriterion: 'Criterio',
    thStatus: 'Estado',
    thLevel: 'Nivel',
    levelLabel: (level) => `Nivel ${level}`,
    manualReview: (date) => `Evaluación manual del ${date}`,

    issuesHeading: 'No conformidades detectadas',
    issuesHeadingPage: ' en esta página',
    noIssues: '🎉 No se ha detectado ninguna no conformidad en las reglas automatizables.',
    mdNoIssues: 'No se ha detectado ninguna no conformidad en las reglas automatizables. 🎉',
    tagFixed: 'corregida',
    tagFalsePositive: 'falso positivo',
    selectorLabel: 'Selector:',
    fixLabel: 'Corrección sugerida:',
    footerBlock: `  <p>Auditoría automatizada: un motor detecta una parte de los criterios RGAA (los demás requieren una
  verificación humana, señalada como «por verificar» más arriba). Para una conformidad oponible, complete
  este informe con una auditoría manual.<br>
  Informe generado con <a href="https://konforme.kayzen-lyon.com">Konforme</a>. Para obtenerlo en PDF:
  Archivo → Imprimir → «Guardar como PDF».</p>`,

    mdScoresHeading: 'Puntuaciones',
    mdIndicator: 'Indicador',
    mdValue: 'Valor',
    mdRateRow: 'Tasa de conformidad RGAA (criterios evaluados)',
    mdOpenIssuesRow: 'No conformidades abiertas',
    mdCountLines: (s) => [
      `- ✅ Conformes: **${s.ok}**`,
      `- ❌ No conformes: **${s.nonConformes}**`,
      `- ➖ No aplicables: **${s.nonApplicables}**`,
      `- 👁️ Por verificar manualmente: **${s.aVerifier}**`,
    ],
    mdRateSentence: (rate) =>
      `Tasa de conformidad (método oficial): **${rate} %** — criterios conformes / criterios evaluados, excluidos los no aplicables.`,
    mdWhyImportant: (id) => `**Criterio ${id} — por qué es importante:**`,
    mdDetailHeading: 'Detalle de las no conformidades',
    mdLabels: {
      rule: '**Regla:**',
      page: '**Página:**',
      selector: '**Selector:**',
      description: '**Descripción:**',
      fix: '**Corrección sugerida:**',
    },
    mdFooterLines: [
      '_Auditoría automatizada: un motor detecta una parte de los criterios RGAA; los criterios «por verificar»',
      'requieren una revisión humana. Informe generado con [Konforme](https://konforme.kayzen-lyon.com)._',
    ],

    attestDocTitle: 'Acta de auditoría de accesibilidad',
    attestKicker: 'Accesibilidad digital — RGAA 4.1.2 / WCAG 2.2 / Directiva (UE) 2019/882',
    attestTitle: 'Acta de auditoría de accesibilidad',
    attestParagraph: (name, link, date, method) =>
      `El sitio <strong>${name}</strong>${link}
fue objeto de una auditoría de accesibilidad el <strong>${date}</strong>, realizada con la plataforma Konforme
según el método técnico del RGAA 4.1.2${method}.`,
    attestMethodComplete:
      ' (auditoría automatizada completada con una evaluación manual de los 106 criterios)',
    attestMethodAuto: ' (auditoría automatizada)',
    attestMethodAutoOngoing: ' (auditoría automatizada, evaluación manual en curso)',
    attestRateCaption:
      'tasa de conformidad RGAA sobre los criterios evaluados<br>(criterios conformes / criterios evaluados, excluidos los no aplicables — método oficial)',
    attestOk: 'Criterios conformes',
    attestNonConformes: 'Criterios no conformes',
    attestNonApplicables: 'Criterios no aplicables',
    attestAVerifier: 'Criterios pendientes de verificar',
    attestSample: 'Muestra auditada',
    attestFrameworks: 'Referenciales',
    attestPages: (n) => `${n} página${n > 1 ? 's' : ''}`,
    attestNotice: `  Esta acta refleja el estado del sitio en la fecha de la auditoría, sobre la muestra indicada.
  No constituye una certificación emitida por un organismo tercero. El referencial RGAA no exige
  ninguna acreditación para la realización de auditorías: la auditoría puede realizarse internamente o
  por un tercero (modelo oficial de declaración de accesibilidad). Se recomienda una nueva auditoría
  tras cualquier evolución importante del sitio y, al menos, una vez al año.`,
    attestFooter: `  Documento generado por <a href="https://konforme.kayzen-lyon.com">Konforme</a> — KAYZEN.
  Para imprimirlo en PDF: Archivo → Imprimir → «Guardar como PDF».`,

    csvColumns: ['severidad', 'regla', 'categoria', 'titulo', 'pagina', 'selector', 'estado', 'correccion'],
    jiraLabels: {
      rule: 'Regla',
      page: 'Página',
      selector: 'Selector',
      detail: 'Detalle',
      fix: 'Corrección sugerida',
      code: 'Código',
      tags: 'accesibilidad rgaa',
    },

    fileReport: 'informe-auditoria',
    fileAttestation: 'acta-auditoria',
    fileAudit: 'auditoria',
    fileTickets: 'tickets-a11y',
  },

  /* ------------------------------ Italiano ----------------------------- */
  it: {
    dateLocale: 'it-IT',
    siteFallback: 'Sito',
    pageSuffix: (url) => ` — pagina ${url}`,

    docTitle: 'Rapporto di audit di accessibilità',
    h1: 'Rapporto di audit di accessibilità',
    subtitle: (date) => `Audit automatizzato RGAA 4.1.2 / WCAG 2.2 effettuato il ${date}`,
    auditedPage: 'Pagina sottoposta ad audit',
    labelSep: ': ',
    pct: (v) => `${v} %`,
    pagesAnalysed: (n) => (n > 1 ? `${n} pagine analizzate` : `${n} pagina analizzata`),
    mdPagesAnalysed: (n) => (n > 1 ? `${n} pagine analizzate` : `${n} pagina analizzata`),

    scorePage: 'Punteggio della pagina',
    scoreRgaaTested: 'Conformità RGAA (criteri testati)',
    scoreGlobal: 'Conformità globale',
    scoreCriteriaTested: 'Criteri RGAA testati',

    severity: { critical: 'Critico', serious: 'Grave', moderate: 'Moderato', minor: 'Lieve' },
    severityCount: (sev, n) => {
      const w = {
        critical: n > 1 ? 'non conformità critiche' : 'non conformità critica',
        serious: n > 1 ? 'non conformità gravi' : 'non conformità grave',
        moderate: n > 1 ? 'non conformità moderate' : 'non conformità moderata',
        minor: n > 1 ? 'non conformità lievi' : 'non conformità lieve',
      }[sev]
      return `${n} ${w}`
    },
    status: {
      ok: 'Conforme',
      non_conforme: 'Non conforme',
      non_applicable: 'Non applicabile',
      a_verifier: 'Da verificare',
    },
    coverage: {
      auto: 'Verificato automaticamente',
      partial: 'Verificato parzialmente (da completare con una revisione manuale)',
      manual: 'Richiede una verifica umana',
    },
    noOpenIssues: 'Nessuna non conformità aperta',

    legalBlock: `  <strong>Promemoria normativo.</strong> Dal <strong>28 giugno 2025</strong> la direttiva europea
  (UE) 2019/882 (European Accessibility Act) impone l'accessibilità dei siti di e-commerce e di numerosi
  servizi digitali. In Francia la conformità si dimostra tramite il <strong>RGAA 4.1.2</strong> e la DGCCRF
  effettua controlli attivi: fino a <strong>50 000 € di sanzione per servizio non conforme</strong> e
  <strong>25 000 €</strong> in assenza di dichiarazione di accessibilità.`,
    mdLegalLines: [
      '> **Promemoria normativo** — Dal 28 giugno 2025 la direttiva (UE) 2019/882 (European',
      "> Accessibility Act) impone l'accessibilità di numerosi servizi digitali. In Francia la DGCCRF può",
      '> irrogare fino a 50 000 € di sanzione per servizio non conforme e 25 000 € in assenza di',
      '> dichiarazione di accessibilità.',
    ],

    criteriaHeading: 'I 106 criteri del RGAA 4.1.2',
    criteriaRate: (rate) =>
      `Tasso di conformità (metodo ufficiale: criteri conformi / criteri valutati, esclusi i non applicabili): <strong>${rate} %</strong> — `,
    criteriaCounts: (s) =>
      `${s.ok} conform${s.ok > 1 ? 'i' : 'e'},
      ${s.nonConformes} non conform${s.nonConformes > 1 ? 'i' : 'e'},
      ${s.nonApplicables} non applicabil${s.nonApplicables > 1 ? 'i' : 'e'},
      ${s.aVerifier} da verificare manualmente.`,
    topicStats: (nc, ok, av) =>
      `${nc > 0 ? `${nc} non conform${nc > 1 ? 'i' : 'e'} · ` : ''}${ok} validat${ok > 1 ? 'i' : 'o'} · ${av} da verificare`,
    thNum: 'N.',
    thCriterion: 'Criterio',
    thStatus: 'Stato',
    thLevel: 'Livello',
    levelLabel: (level) => `Livello ${level}`,
    manualReview: (date) => `Valutazione manuale del ${date}`,

    issuesHeading: 'Non conformità rilevate',
    issuesHeadingPage: ' in questa pagina',
    noIssues: '🎉 Nessuna non conformità rilevata sulle regole automatizzabili.',
    mdNoIssues: 'Nessuna non conformità rilevata sulle regole automatizzabili. 🎉',
    tagFixed: 'corretta',
    tagFalsePositive: 'falso positivo',
    selectorLabel: 'Selettore:',
    fixLabel: 'Correzione suggerita:',
    footerBlock: `  <p>Audit automatizzato: un motore rileva una parte dei criteri RGAA (gli altri richiedono una
  verifica umana, segnalata come «da verificare» sopra). Per una conformità opponibile, completi questo
  rapporto con un audit manuale.<br>
  Rapporto generato con <a href="https://konforme.kayzen-lyon.com">Konforme</a>. Per ottenerlo in PDF:
  File → Stampa → «Salva come PDF».</p>`,

    mdScoresHeading: 'Punteggi',
    mdIndicator: 'Indicatore',
    mdValue: 'Valore',
    mdRateRow: 'Tasso di conformità RGAA (criteri valutati)',
    mdOpenIssuesRow: 'Non conformità aperte',
    mdCountLines: (s) => [
      `- ✅ Conformi: **${s.ok}**`,
      `- ❌ Non conformi: **${s.nonConformes}**`,
      `- ➖ Non applicabili: **${s.nonApplicables}**`,
      `- 👁️ Da verificare manualmente: **${s.aVerifier}**`,
    ],
    mdRateSentence: (rate) =>
      `Tasso di conformità (metodo ufficiale): **${rate} %** — criteri conformi / criteri valutati, esclusi i non applicabili.`,
    mdWhyImportant: (id) => `**Criterio ${id} — perché è importante:**`,
    mdDetailHeading: 'Dettaglio delle non conformità',
    mdLabels: {
      rule: '**Regola:**',
      page: '**Pagina:**',
      selector: '**Selettore:**',
      description: '**Descrizione:**',
      fix: '**Correzione suggerita:**',
    },
    mdFooterLines: [
      '_Audit automatizzato: un motore rileva una parte dei criteri RGAA; i criteri «da verificare»',
      'richiedono una revisione umana. Rapporto generato con [Konforme](https://konforme.kayzen-lyon.com)._',
    ],

    attestDocTitle: 'Attestazione di audit di accessibilità',
    attestKicker: 'Accessibilità digitale — RGAA 4.1.2 / WCAG 2.2 / direttiva (UE) 2019/882',
    attestTitle: 'Attestazione di audit di accessibilità',
    attestParagraph: (name, link, date, method) =>
      `Il sito <strong>${name}</strong>${link}
è stato sottoposto a un audit di accessibilità il <strong>${date}</strong>, effettuato con la piattaforma
Konforme secondo il metodo tecnico del RGAA 4.1.2${method}.`,
    attestMethodComplete:
      ' (audit automatizzato completato da una valutazione manuale dei 106 criteri)',
    attestMethodAuto: ' (audit automatizzato)',
    attestMethodAutoOngoing: ' (audit automatizzato, valutazione manuale in corso)',
    attestRateCaption:
      'tasso di conformità RGAA sui criteri valutati<br>(criteri conformi / criteri valutati, esclusi i non applicabili — metodo ufficiale)',
    attestOk: 'Criteri conformi',
    attestNonConformes: 'Criteri non conformi',
    attestNonApplicables: 'Criteri non applicabili',
    attestAVerifier: 'Criteri ancora da verificare',
    attestSample: 'Campione sottoposto ad audit',
    attestFrameworks: 'Riferimenti normativi',
    attestPages: (n) => (n > 1 ? `${n} pagine` : `${n} pagina`),
    attestNotice: `  La presente attestazione riporta lo stato del sito alla data dell'audit, sul campione indicato.
  Non costituisce una certificazione rilasciata da un organismo terzo. Il referenziale RGAA non
  richiede alcun accreditamento per l'esecuzione degli audit: l'audit può essere svolto internamente
  o da un terzo (modello ufficiale di dichiarazione di accessibilità). Si raccomanda un nuovo audit
  dopo ogni evoluzione importante del sito e almeno una volta all'anno.`,
    attestFooter: `  Documento generato da <a href="https://konforme.kayzen-lyon.com">Konforme</a> — KAYZEN.
  Per stamparlo in PDF: File → Stampa → «Salva come PDF».`,

    csvColumns: ['gravita', 'regola', 'categoria', 'titolo', 'pagina', 'selettore', 'stato', 'correzione'],
    jiraLabels: {
      rule: 'Regola',
      page: 'Pagina',
      selector: 'Selettore',
      detail: 'Dettaglio',
      fix: 'Correzione suggerita',
      code: 'Codice',
      tags: 'accessibilita rgaa',
    },

    fileReport: 'rapporto-audit',
    fileAttestation: 'attestazione-audit',
    fileAudit: 'audit',
    fileTickets: 'ticket-a11y',
  },
}

function t(lang: Lang): ReportL10n {
  return L10N[lang] ?? L10N.fr
}

function fmtDate(lang: Lang, iso: string, withTime = false): string {
  return new Intl.DateTimeFormat(t(lang).dateLocale, {
    dateStyle: 'long',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
  }).format(new Date(iso))
}

function fmtDateMedium(lang: Lang, iso: string): string {
  return new Intl.DateTimeFormat(t(lang).dateLocale, { dateStyle: 'medium' }).format(new Date(iso))
}

export type ReportScope = {
  /** Restreint le rapport à une seule page auditée du site. */
  pageUrl?: string
  /** Évaluations manuelles des critères (audit complet, méthode officielle). */
  reviews?: CriterionReview[]
}

function scopeIssues(issues: ScanIssue[], scope?: ReportScope): ScanIssue[] {
  return scope?.pageUrl ? issues.filter((i) => i.page_url === scope.pageUrl) : issues
}

function reportTitleSuffix(scope?: ReportScope, lang: Lang = 'fr'): string {
  return scope?.pageUrl ? t(lang).pageSuffix(scope.pageUrl) : ''
}

function fileSuffix(scan: Scan, scope?: ReportScope): string {
  const day = scan.created_at.slice(0, 10)
  const page = scope?.pageUrl ? `-${slugify(scope.pageUrl.replace(/^https?:\/\//, '')).slice(0, 60)}` : ''
  return `${slugify(scan.sites?.name ?? 'site')}${page}-${day}`
}

/* ------------------------------------------------------------------ */
/* Rapport HTML autonome (lisible, imprimable, exportable en PDF)      */
/* ------------------------------------------------------------------ */

function criteriaSectionHtml(summary: ConformitySummary, lang: Lang): string {
  const T = t(lang)
  const topics = summary.topics
    .map((tp) => {
      const topicL10n = localizeTopic(lang, tp.topic)
      const rows = tp.results
        .map((r) => {
          const critL10n = localizeCriterion(lang, r.criterion)
          const issues =
            r.openIssues.length > 0
              ? `<div class="crit-issues">${r.openIssues
                  .map(
                    (i) =>
                      `• ${escapeHtml(localizeIssueTitle(lang, i))}${i.page_url ? ` <span class="dim">(${escapeHtml(i.page_url)})</span>` : ''}`,
                  )
                  .join('<br>')}</div>`
              : ''
          return `
        <tr>
          <td class="crit-id"><a href="https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#${r.criterion.id}">${r.criterion.id}</a></td>
          <td>
            <strong>${escapeHtml(critL10n.title)}</strong>
            <div class="crit-plain">${escapeHtml(critL10n.plain)}</div>
            <div class="dim">${escapeHtml(T.levelLabel(r.criterion.level))} · WCAG ${r.criterion.wcag.join(', ')} · ${escapeHtml(T.coverage[r.criterion.coverage])}</div>
            ${r.review ? `<div class="dim">${escapeHtml(T.manualReview(fmtDateMedium(lang, r.review.reviewed_at)))}${r.review.note ? ` — ${escapeHtml(r.review.note)}` : ''}</div>` : ''}
            ${issues}
          </td>
          <td><span class="pill" style="background:${STATUS_COLORS[r.status]}">${T.status[r.status]}</span></td>
        </tr>`
        })
        .join('')
      return `
    <h3 class="topic">${tp.topic.id}. ${escapeHtml(topicL10n.name)}
      <span class="topic-stats">${T.topicStats(tp.nonConformes, tp.ok, tp.aVerifier)}</span>
    </h3>
    <p class="dim">${escapeHtml(topicL10n.description)}</p>
    <table class="criteria">
      <thead><tr><th scope="col">${T.thNum}</th><th scope="col">${T.thCriterion}</th><th scope="col">${T.thStatus}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`
    })
    .join('')

  return `
  <section>
    <h2>${T.criteriaHeading}</h2>
    <p>
      ${summary.rate !== null ? T.criteriaRate(summary.rate) : ''}
      ${T.criteriaCounts(summary)}
    </p>
    ${topics}
  </section>`
}

/**
 * Génère le rapport d'audit complet en HTML autonome (statut des 106 critères
 * RGAA, non-conformités détaillées, rappel réglementaire), imprimable en PDF.
 */
export function buildAuditReportHtml(
  scan: Scan,
  issues: ScanIssue[],
  scope?: ReportScope,
  opts?: { autoPrint?: boolean },
  lang: Lang = 'fr',
): string {
  const T = t(lang)
  const siteName = scan.sites?.name ?? T.siteFallback
  const siteUrl = scan.sites?.url ?? ''
  const scoped = scopeIssues(issues, scope)
  const summary = computeConformity(issues, scope?.pageUrl, scope?.reviews)
  const date = fmtDate(lang, scan.created_at, true)

  const open = scoped.filter((i) => i.status === 'open' || i.status === 'in_progress')
  const counts = Object.fromEntries(
    SEVERITY_ORDER.map((s) => [s, open.filter((i) => i.severity === s).length]),
  ) as Record<Severity, number>

  const pageScore = scope?.pageUrl
    ? scan.page_scores?.find((p) => p.url === scope.pageUrl)?.score ?? null
    : null

  const scoreCell = (label: string, value: number | null) => `
    <div class="score">
      <div class="score-value">${value !== null ? `${Math.round(value)}<small>%</small>` : '—'}</div>
      <div class="score-label">${escapeHtml(label)}</div>
    </div>`

  const scores = scope?.pageUrl
    ? scoreCell(T.scorePage, pageScore) +
      (summary.rate !== null ? scoreCell(T.scoreRgaaTested, summary.rate) : '')
    : scoreCell(T.scoreGlobal, scan.score) +
      scoreCell('RGAA 4.1.2', scan.rgaa_score) +
      scoreCell('WCAG 2.2 AA', scan.wcag_score) +
      (summary.rate !== null ? scoreCell(T.scoreCriteriaTested, summary.rate) : '')

  const sections = SEVERITY_ORDER.map((sev) => {
    const list = scoped.filter((i) => i.severity === sev)
    if (list.length === 0) return ''
    const items = list
      .map((i) => {
        const fix = localizeIssueFix(lang, i)
        return `
      <article class="issue">
        <h4>${escapeHtml(localizeIssueTitle(lang, i))}${i.status === 'fixed' ? ` <span class="tag-fixed">${T.tagFixed}</span>` : i.status === 'false_positive' ? ` <span class="tag-fixed">${T.tagFalsePositive}</span>` : ''}</h4>
        <p class="meta">${escapeHtml(i.rule_id)}${i.page_url && !scope?.pageUrl ? ` · ${escapeHtml(i.page_url)}` : ''}</p>
        ${i.description ? `<p>${escapeHtml(i.description).replace(/\n/g, '<br>')}</p>` : ''}
        ${i.selector ? `<p class="mono"><strong>${T.selectorLabel}</strong> <code>${escapeHtml(i.selector)}</code></p>` : ''}
        ${i.html_snippet ? `<pre><code>${escapeHtml(i.html_snippet)}</code></pre>` : ''}
        ${fix ? `<p class="fix"><strong>${T.fixLabel}</strong> ${escapeHtml(fix)}</p>` : ''}
      </article>`
      })
      .join('')
    return `
    <h3 style="color:${SEVERITY_COLORS[sev]}">${T.severity[sev]} (${list.length})</h3>
    ${items}`
  }).join('')

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${T.docTitle} — ${escapeHtml(siteName)}${escapeHtml(reportTitleSuffix(scope, lang))}</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; max-width: 56rem; margin: 2rem auto; padding: 0 1.25rem; line-height: 1.55; color: #1a1a2e; }
  h1 { font-size: 1.5rem; margin-bottom: .25rem; }
  h2 { font-size: 1.2rem; margin: 2.2rem 0 .75rem; border-bottom: 2px solid #1a1a2e; padding-bottom: .25rem; }
  h3 { font-size: 1.05rem; margin: 1.6rem 0 .6rem; }
  .subtitle { color: #555; margin-top: 0; }
  .dim { color: #666; font-size: .78rem; }
  .scores { display: flex; gap: 1rem; flex-wrap: wrap; margin: 1.5rem 0; }
  .score { border: 1px solid #ddd; border-radius: 10px; padding: .9rem 1.4rem; text-align: center; min-width: 9rem; }
  .score-value { font-size: 1.8rem; font-weight: 700; }
  .score-value small { font-size: 1rem; font-weight: 500; }
  .score-label { font-size: .8rem; color: #555; margin-top: .2rem; }
  .summary { display: flex; gap: .6rem; flex-wrap: wrap; margin-bottom: 1rem; }
  .summary span, .pill { border-radius: 999px; padding: .25rem .8rem; font-size: .78rem; font-weight: 600; color: #fff; white-space: nowrap; }
  .legal { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: .9rem 1.1rem; font-size: .85rem; }
  .legal strong { color: #92400e; }
  .topic { margin-bottom: .1rem; }
  .topic-stats { font-weight: 400; font-size: .78rem; color: #666; margin-left: .5rem; }
  table.criteria { width: 100%; border-collapse: collapse; margin: .4rem 0 1.4rem; font-size: .85rem; }
  table.criteria th, table.criteria td { border: 1px solid #e3e3ee; padding: .5rem .65rem; text-align: left; vertical-align: top; }
  table.criteria th { background: #f6f7fb; font-size: .78rem; }
  .crit-id { font-weight: 700; white-space: nowrap; }
  .crit-plain { color: #444; font-size: .8rem; margin: .2rem 0; }
  .crit-issues { margin-top: .35rem; font-size: .8rem; color: #b91c1c; }
  .issue { border: 1px solid #e3e3ee; border-radius: 10px; padding: .9rem 1.1rem; margin-bottom: .8rem; page-break-inside: avoid; }
  .issue h4 { margin: 0 0 .15rem; font-size: 1rem; }
  .issue .meta { margin: 0 0 .5rem; font-size: .8rem; color: #666; }
  .issue pre { background: #f6f7fb; border: 1px solid #e3e3ee; border-radius: 8px; padding: .6rem .8rem; font-size: .78rem; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }
  .issue code { font-size: .82em; }
  .fix { background: #ecfdf3; border: 1px solid #bbe7cd; border-radius: 8px; padding: .5rem .8rem; }
  .tag-fixed { font-size: .7rem; font-weight: 600; color: #067647; background: #ecfdf3; border-radius: 999px; padding: .1rem .55rem; vertical-align: middle; }
  footer { margin-top: 3rem; font-size: .8rem; color: #555; border-top: 1px solid #ddd; padding-top: 1rem; }
  @media print { body { margin: 0; } .score { border-color: #bbb; } }
</style>
</head>
<body>
<h1>${T.h1}${escapeHtml(reportTitleSuffix(scope, lang))}</h1>
<p class="subtitle"><strong>${escapeHtml(siteName)}</strong>${siteUrl ? ` — <a href="${escapeHtml(siteUrl)}">${escapeHtml(siteUrl)}</a>` : ''}<br>
${T.subtitle(date)}${scope?.pageUrl ? `<br>${T.auditedPage}${T.labelSep}<a href="${escapeHtml(scope.pageUrl)}">${escapeHtml(scope.pageUrl)}</a>` : ` · ${T.pagesAnalysed(scan.pages_count)}`}</p>

<div class="scores">
  ${scores}
</div>

<div class="summary">
  ${SEVERITY_ORDER.filter((s) => counts[s] > 0)
    .map((s) => `<span style="background:${SEVERITY_COLORS[s]}">${T.severityCount(s, counts[s])}</span>`)
    .join('\n  ')}
  ${open.length === 0 ? `<span style="background:#067647">${T.noOpenIssues}</span>` : ''}
</div>

<div class="legal">
${T.legalBlock}
</div>

${criteriaSectionHtml(summary, lang)}

<section>
  <h2>${T.issuesHeading}${scope?.pageUrl ? T.issuesHeadingPage : ''}</h2>
  ${sections || `<p>${T.noIssues}</p>`}
</section>

<footer>
${T.footerBlock}
</footer>
${opts?.autoPrint ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},250)})</script>' : ''}
</body>
</html>`
}

export function downloadAuditReport(
  scan: Scan,
  issues: ScanIssue[],
  scope?: ReportScope,
  lang: Lang = 'fr',
) {
  downloadHtmlFile(
    buildAuditReportHtml(scan, issues, scope, undefined, lang),
    `${t(lang).fileReport}-${fileSuffix(scan, scope)}.html`,
  )
}

/** Export PDF : ouvre le rapport dans un onglet et déclenche l'impression. */
export function printAuditReport(
  scan: Scan,
  issues: ScanIssue[],
  scope?: ReportScope,
  lang: Lang = 'fr',
) {
  const html = buildAuditReportHtml(scan, issues, scope, { autoPrint: true }, lang)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank', 'noopener')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

/* ------------------------------------------------------------------ */
/* Attestation d'audit (document synthétique, imprimable en PDF)        */
/* ------------------------------------------------------------------ */

/**
 * Attestation d'audit : document d'une page, daté, présentable à un donneur
 * d'ordre ou un contrôleur. Formulation prudente : c'est une attestation de
 * réalisation d'audit et de résultat, pas une certification tierce.
 */
export function buildAttestationHtml(
  scan: Scan,
  issues: ScanIssue[],
  scope?: ReportScope,
  lang: Lang = 'fr',
): string {
  const T = t(lang)
  const siteName = scan.sites?.name ?? T.siteFallback
  const siteUrl = scan.sites?.url ?? ''
  const summary = computeConformity(issues, undefined, scope?.reviews)
  const date = fmtDate(lang, scan.created_at)
  const pages = scan.page_scores ?? []
  const complete = summary.aVerifier === 0

  const method = complete
    ? T.attestMethodComplete
    : summary.tested > 0
      ? T.attestMethodAutoOngoing
      : T.attestMethodAuto

  const linkHtml = siteUrl ? ` (<a href="${escapeHtml(siteUrl)}">${escapeHtml(siteUrl)}</a>)` : ''

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${T.attestDocTitle} — ${escapeHtml(siteName)}</title>
<style>
  body { font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; max-width: 46rem; margin: 2.5rem auto; padding: 0 1.5rem; line-height: 1.6; color: #1a1a2e; }
  header { text-align: center; border-bottom: 3px solid #1a1a2e; padding-bottom: 1.2rem; margin-bottom: 1.6rem; }
  h1 { font-size: 1.45rem; margin: .2rem 0; }
  .kicker { text-transform: uppercase; letter-spacing: .12em; font-size: .72rem; color: #555; }
  .rate { text-align: center; margin: 1.6rem 0; }
  .rate strong { font-size: 3rem; }
  .rate small { display: block; color: #555; font-size: .85rem; }
  dl { display: grid; grid-template-columns: 14rem 1fr; gap: .45rem 1rem; font-size: .92rem; }
  dt { font-weight: 600; color: #444; }
  dd { margin: 0; }
  .pages { font-size: .8rem; color: #555; margin-top: .3rem; }
  .notice { background: #f6f7fb; border: 1px solid #e3e3ee; border-radius: 10px; padding: .8rem 1rem; font-size: .8rem; color: #444; margin-top: 1.6rem; }
  footer { margin-top: 2rem; font-size: .78rem; color: #555; text-align: center; }
  @media print { body { margin: 1rem auto; } }
</style>
</head>
<body>
<header>
  <p class="kicker">${T.attestKicker}</p>
  <h1>${T.attestTitle}</h1>
</header>

<p>${T.attestParagraph(escapeHtml(siteName), linkHtml, date, method)}</p>

<div class="rate">
  <strong>${summary.rate !== null ? T.pct(summary.rate) : '—'}</strong>
  <small>${T.attestRateCaption}</small>
</div>

<dl>
  <dt>${T.attestOk}</dt><dd>${summary.ok} / 106</dd>
  <dt>${T.attestNonConformes}</dt><dd>${summary.nonConformes}</dd>
  <dt>${T.attestNonApplicables}</dt><dd>${summary.nonApplicables}</dd>
  <dt>${T.attestAVerifier}</dt><dd>${summary.aVerifier}</dd>
  <dt>${T.attestSample}</dt>
  <dd>${T.attestPages(scan.pages_count)}
    ${pages.length > 0 ? `<div class="pages">${pages.map((p) => escapeHtml(p.url)).join('<br>')}</div>` : ''}
  </dd>
  <dt>${T.attestFrameworks}</dt><dd>RGAA 4.1.2 · WCAG 2.2 AA · EN 301 549</dd>
</dl>

<div class="notice">
${T.attestNotice}
</div>

<footer>
${T.attestFooter}
</footer>
</body>
</html>`
}

export function downloadAttestation(
  scan: Scan,
  issues: ScanIssue[],
  scope?: ReportScope,
  lang: Lang = 'fr',
) {
  downloadHtmlFile(
    buildAttestationHtml(scan, issues, scope, lang),
    `${t(lang).fileAttestation}-${fileSuffix(scan)}.html`,
  )
}

/* ------------------------------------------------------------------ */
/* Rapport Markdown                                                     */
/* ------------------------------------------------------------------ */

const MD_STATUS_ICON = { ok: '✅', non_conforme: '❌', a_verifier: '👁️', non_applicable: '➖' } as const

export function buildAuditReportMarkdown(
  scan: Scan,
  issues: ScanIssue[],
  scope?: ReportScope,
  lang: Lang = 'fr',
): string {
  const T = t(lang)
  const siteName = scan.sites?.name ?? T.siteFallback
  const siteUrl = scan.sites?.url ?? ''
  const scoped = scopeIssues(issues, scope)
  const summary = computeConformity(issues, scope?.pageUrl, scope?.reviews)
  const date = fmtDate(lang, scan.created_at)
  const open = scoped.filter((i) => i.status === 'open' || i.status === 'in_progress')

  const lines: string[] = []
  lines.push(`# ${T.h1}${reportTitleSuffix(scope, lang)}`)
  lines.push('')
  lines.push(`**${siteName}**${siteUrl ? ` — <${siteUrl}>` : ''}`)
  lines.push(
    `${T.subtitle(date)}${scope?.pageUrl ? `\n${T.auditedPage}${T.labelSep}<${scope.pageUrl}>` : ` · ${T.mdPagesAnalysed(scan.pages_count)}`}`,
  )
  lines.push('')
  lines.push(`## ${T.mdScoresHeading}`)
  lines.push('')
  lines.push(`| ${T.mdIndicator} | ${T.mdValue} |`)
  lines.push('|---|---|')
  if (!scope?.pageUrl) {
    lines.push(`| ${T.scoreGlobal} | ${scan.score !== null ? T.pct(Math.round(scan.score)) : '—'} |`)
    lines.push(`| RGAA 4.1.2 | ${scan.rgaa_score !== null ? T.pct(Math.round(scan.rgaa_score)) : '—'} |`)
    lines.push(`| WCAG 2.2 AA | ${scan.wcag_score !== null ? T.pct(Math.round(scan.wcag_score)) : '—'} |`)
  } else {
    const pageScore = scan.page_scores?.find((p) => p.url === scope.pageUrl)?.score ?? null
    lines.push(`| ${T.scorePage} | ${pageScore !== null ? T.pct(Math.round(pageScore)) : '—'} |`)
  }
  if (summary.rate !== null) lines.push(`| ${T.mdRateRow} | ${T.pct(summary.rate)} |`)
  lines.push(`| ${T.mdOpenIssuesRow} | ${open.length} |`)
  lines.push('')
  for (const l of T.mdLegalLines) lines.push(l)
  lines.push('')
  lines.push(`## ${T.criteriaHeading}`)
  lines.push('')
  for (const l of T.mdCountLines(summary)) lines.push(l)
  if (summary.rate !== null) {
    lines.push('')
    lines.push(T.mdRateSentence(summary.rate))
  }
  lines.push('')

  for (const tp of summary.topics) {
    const topicL10n = localizeTopic(lang, tp.topic)
    lines.push(`### ${tp.topic.id}. ${topicL10n.name}`)
    lines.push('')
    lines.push(`_${topicL10n.description}_`)
    lines.push('')
    lines.push(`| ${T.thNum} | ${T.thCriterion} | ${T.thLevel} | ${T.thStatus} |`)
    lines.push('|---|---|---|---|')
    for (const r of tp.results) {
      const status = `${MD_STATUS_ICON[r.status]} ${T.status[r.status]}`
      const critL10n = localizeCriterion(lang, r.criterion)
      lines.push(`| ${r.criterion.id} | ${critL10n.title.replace(/\|/g, '\\|')} | ${r.criterion.level} | ${status} |`)
    }
    lines.push('')
    for (const r of tp.results) {
      if (r.openIssues.length === 0) continue
      lines.push(`${T.mdWhyImportant(r.criterion.id)} ${localizeCriterion(lang, r.criterion).plain}`)
      lines.push('')
      for (const i of r.openIssues) {
        lines.push(
          `- [${T.severity[i.severity]}] ${localizeIssueTitle(lang, i)}${i.page_url && !scope?.pageUrl ? ` — ${i.page_url}` : ''}`,
        )
      }
      lines.push('')
    }
  }

  lines.push(`## ${T.mdDetailHeading}`)
  lines.push('')
  if (scoped.length === 0) {
    lines.push(T.mdNoIssues)
    lines.push('')
  }
  for (const sev of SEVERITY_ORDER) {
    const list = scoped.filter((i) => i.severity === sev)
    if (list.length === 0) continue
    lines.push(`### ${T.severity[sev]} (${list.length})`)
    lines.push('')
    for (const i of list) {
      lines.push(
        `#### ${localizeIssueTitle(lang, i)}${i.status === 'fixed' ? ` _(${T.tagFixed})_` : i.status === 'false_positive' ? ` _(${T.tagFalsePositive})_` : ''}`,
      )
      lines.push('')
      lines.push(`- ${T.mdLabels.rule} ${i.rule_id}`)
      if (i.page_url && !scope?.pageUrl) lines.push(`- ${T.mdLabels.page} ${i.page_url}`)
      if (i.selector) lines.push(`- ${T.mdLabels.selector} \`${i.selector}\``)
      if (i.description) lines.push(`- ${T.mdLabels.description} ${i.description.replace(/\r?\n/g, ' ')}`)
      const fix = localizeIssueFix(lang, i)
      if (fix) lines.push(`- ${T.mdLabels.fix} ${fix}`)
      if (i.html_snippet) {
        lines.push('')
        lines.push('```html')
        lines.push(i.html_snippet)
        lines.push('```')
      }
      lines.push('')
    }
  }

  lines.push('---')
  lines.push('')
  for (const l of T.mdFooterLines) lines.push(l)
  lines.push('')
  return lines.join('\n')
}

export function downloadAuditMarkdown(
  scan: Scan,
  issues: ScanIssue[],
  scope?: ReportScope,
  lang: Lang = 'fr',
) {
  downloadBlob(
    buildAuditReportMarkdown(scan, issues, scope, lang),
    `${t(lang).fileReport}-${fileSuffix(scan, scope)}.md`,
    'text/markdown;charset=utf-8',
  )
}

/* ------------------------------------------------------------------ */
/* CSV / JSON                                                           */
/* ------------------------------------------------------------------ */

function csvCell(v: string | null | undefined): string {
  const s = (v ?? '').replace(/\r?\n/g, ' ')
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Export CSV (séparateur « ; », BOM UTF-8 pour Excel FR). */
export function buildIssuesCsv(issues: ScanIssue[], lang: Lang = 'fr'): string {
  const T = t(lang)
  const rows = issues.map((i) =>
    [
      T.severity[i.severity],
      i.rule_id,
      i.category ?? '',
      localizeIssueTitle(lang, i),
      i.page_url ?? '',
      i.selector ?? '',
      i.status,
      localizeIssueFix(lang, i) ?? '',
    ].map(csvCell).join(';'),
  )
  return '﻿' + [T.csvColumns.join(';'), ...rows].join('\r\n')
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function downloadAuditCsv(scan: Scan, issues: ScanIssue[], lang: Lang = 'fr') {
  downloadBlob(
    buildIssuesCsv(issues, lang),
    `${t(lang).fileAudit}-${fileSuffix(scan)}.csv`,
    'text/csv;charset=utf-8',
  )
}

/* ------------------------------------------------------------------ */
/* Export tickets (CSV compatible import Jira)                          */
/* ------------------------------------------------------------------ */

const JIRA_PRIORITY: Record<Severity, string> = {
  critical: 'Highest',
  serious: 'High',
  moderate: 'Medium',
  minor: 'Low',
}

function jiraCell(v: string): string {
  return `"${v.replace(/"/g, '""')}"`
}

/**
 * CSV prêt pour l'import Jira (System > External System Import > CSV) :
 * une ligne par non-conformité ouverte, avec priorité mappée sur la sévérité.
 * Fonctionne aussi pour Trello, Linear, Asana (import CSV générique).
 *
 * Les en-têtes de colonnes (`Summary`, `Description`, `Priority`, `Labels`) et
 * les valeurs de priorité sont des identifiants de champs Jira : ils restent en
 * anglais quelle que soit la langue, sinon l'import échoue. Le contenu des
 * tickets, lui, est traduit.
 */
export function buildJiraCsv(issues: ScanIssue[], lang: Lang = 'fr'): string {
  const T = t(lang)
  const open = issues.filter((i) => i.status === 'open' || i.status === 'in_progress')
  const header = ['Summary', 'Description', 'Priority', 'Labels'].join(',')
  const rows = open.map((i) => {
    const fix = localizeIssueFix(lang, i)
    const description = [
      `${T.jiraLabels.rule}${T.labelSep}${i.rule_id}`,
      i.page_url ? `${T.jiraLabels.page}${T.labelSep}${i.page_url}` : null,
      i.selector ? `${T.jiraLabels.selector}${T.labelSep}${i.selector}` : null,
      i.description ? `${T.jiraLabels.detail}${T.labelSep}${i.description.replace(/\r?\n/g, ' ')}` : null,
      fix ? `${T.jiraLabels.fix}${T.labelSep}${fix}` : null,
      i.html_snippet ? `${T.jiraLabels.code}${T.labelSep}${i.html_snippet.replace(/\r?\n/g, ' ')}` : null,
    ]
      .filter(Boolean)
      .join('\n')
    return [
      jiraCell(`[A11y] ${localizeIssueTitle(lang, i)}`),
      jiraCell(description),
      jiraCell(JIRA_PRIORITY[i.severity]),
      jiraCell(T.jiraLabels.tags),
    ].join(',')
  })
  return [header, ...rows].join('\r\n')
}

export function downloadJiraCsv(scan: Scan, issues: ScanIssue[], lang: Lang = 'fr') {
  downloadBlob(
    buildJiraCsv(issues, lang),
    `${t(lang).fileTickets}-${fileSuffix(scan)}.csv`,
    'text/csv;charset=utf-8',
  )
}

export function downloadAuditJson(scan: Scan, issues: ScanIssue[]) {
  const payload = {
    site: scan.sites ?? null,
    scan: {
      id: scan.id,
      created_at: scan.created_at,
      score: scan.score,
      rgaa_score: scan.rgaa_score,
      wcag_score: scan.wcag_score,
      pages_count: scan.pages_count,
      issues_count: scan.issues_count,
      page_scores: scan.page_scores,
    },
    issues,
  }
  downloadBlob(JSON.stringify(payload, null, 2), `audit-${fileSuffix(scan)}.json`, 'application/json;charset=utf-8')
}
