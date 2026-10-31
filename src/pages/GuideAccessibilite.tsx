import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Seo } from '@/components/Seo'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'
import { localizeCriterion, localizeTopic } from '@/i18n/rgaa-i18n'
import {
  RGAA_CRITERIA,
  RGAA_METHOD_URL,
  RGAA_TEST_ENV_URL,
  RGAA_TOPICS,
  rgaaCriterionUrl,
} from '@/lib/rgaa'

const L = defineMessages({
  fr: {
    locale: 'fr-FR',
    seoTitle: 'Guide complet : European Accessibility Act & RGAA — les 106 critères expliqués',
    seoDescription:
      "Le guide de référence en français : obligations de la directive (UE) 2019/882, échéances, sanctions DGCCRF, et les 106 critères du RGAA 4.1.2 expliqués simplement, pour les utilisateurs comme pour les professionnels.",
    jsonLdHeadline: 'Guide complet : European Accessibility Act & RGAA',
    kicker: 'Guide complet',
    h1: "Accessibilité numérique : l'EAA et les 106 critères du RGAA, expliqués à tous",

    leadA: 'Depuis le ',
    leadS1: '28 juin 2025',
    leadB: ", la directive européenne (UE) 2019/882 — l'",
    leadS2: 'European Accessibility Act',
    leadC:
      " — rend l'accessibilité numérique obligatoire pour la plupart des services grand public : e-commerce, banques, transports, télécoms, médias. En France, la conformité se démontre avec le ",
    leadS3: 'RGAA 4.1.2',
    leadD: ' et ses ',
    leadS4: '106 critères',
    leadE: ', et la ',
    leadS5: 'DGCCRF',
    leadF: ' contrôle activement.',

    introA: "Ce guide s'adresse aux deux publics : les ",
    introS1: 'décideurs',
    introB: ', qui doivent comprendre les obligations et les risques, et les ',
    introS2: 'professionnels du web',
    introC:
      ", qui doivent savoir précisément quoi corriger. Chaque critère est expliqué en français courant : ce qu'il exige, et surtout ",
    introEm: 'qui',
    introD: ' il protège.',

    whyTitle: "Pourquoi c'est important (au-delà de la loi)",
    whyA: 'En France, environ ',
    whyS: '12 millions de personnes',
    whyB:
      " vivent avec un handicap — visuel, auditif, moteur ou cognitif — et la population vieillit. Un site inaccessible, c'est un magasin dont la porte est fermée pour 15 à 20 % des visiteurs : des clients perdus, avant même de parler de sanction. L'accessibilité améliore aussi le référencement naturel (structure, alternatives textuelles) et la qualité générale du code.",

    whoTitle: 'Qui est concerné ?',
    who: [
      {
        a: 'Les ',
        b: 'entreprises privées B2C',
        c: " de plus de 10 salariés et plus de 2 M€ de chiffre d'affaires dans les secteurs visés : commerce électronique, services bancaires, livres numériques, transport de passagers, communications électroniques, médias audiovisuels.",
      },
      {
        a: 'Les ',
        b: 'fabricants et distributeurs de produits',
        c: ' : ordinateurs, smartphones, terminaux de paiement, distributeurs automatiques, liseuses — sans exemption pour les micro-entreprises.',
      },
      {
        a: 'Les ',
        b: 'services publics',
        c: ', déjà soumis au RGAA depuis 2019 (article 47 de la loi de 2005), et les entreprises de plus de 250 M€ de CA depuis 2020.',
      },
      {
        a: 'Les ',
        b: 'micro-entreprises de services',
        c: " (moins de 10 salariés et moins de 2 M€ de CA) sont exemptées — mais leurs clients donneurs d'ordre peuvent l'exiger contractuellement.",
      },
    ],

    deadlinesTitle: 'Les échéances',
    deadlines: [
      { date: '27 juin 2019', label: 'Adoption de la directive (UE) 2019/882 — European Accessibility Act (EAA).' },
      { date: '28 juin 2022', label: 'Date limite de transposition dans le droit national des États membres.' },
      { date: '28 juin 2025', label: 'Tout produit ou service neuf mis sur le marché doit être accessible. Les contrôles de la DGCCRF ont commencé.' },
      { date: '28 juin 2030', label: 'Fin de la période transitoire : les services existants (contrats antérieurs) doivent être conformes.' },
    ],

    sanctionsTitle: 'Les sanctions encourues',
    sanctionsIntroA: 'Le contrôle est réparti par secteur : ',
    sanctionsIntroS: 'DGCCRF',
    sanctionsIntroB:
      " pour le e-commerce, ACPR/Banque de France pour la banque, Arcep pour les télécoms, Arcom pour l'audiovisuel, DGITM pour les transports. Les amendes sont cumulables par service et par canal :",
    sanctions: [
      { amount: '50 000 €', label: 'par service non conforme (site, application, borne — cumulable par canal)' },
      { amount: '25 000 €', label: "en l'absence de déclaration d'accessibilité publiée" },
      { amount: '7 500 €', label: 'par infraction constatée (15 000 € en cas de récidive), avec injonction sous astreinte' },
      { amount: '75 000 €', label: "l'inaccessibilité délibérée peut être qualifiée de discrimination (personne morale)" },
    ],

    auditorsTitle: 'Qui peut auditer ? Faut-il un auditeur « certifié » ?',
    auditorsP1A: 'Non : ',
    auditorsP1S: "aucun agrément d'État n'est exigé",
    auditorsP1B:
      " pour réaliser un audit RGAA. Le modèle officiel de déclaration d'accessibilité prévoit explicitement que l'audit soit « réalisé en interne » ou « par la société [X] » : toute organisation compétente — y compris la vôtre, en autonomie avec un outil comme Konforme — peut auditer et publier sa déclaration.",
    auditorsP2A: 'Il existe en revanche des ',
    auditorsP2S: 'certifications volontaires',
    auditorsP2B: " qui renforcent la crédibilité d'un auditeur ou d'un site :",
    certifications: [
      {
        b: "Access42 — « Auditer l'accessibilité numérique avec le RGAA » (RS6582)",
        t: " : la seule certification de compétences d'auditeur reconnue par l'État (enregistrée à France Compétences en 2024, finançable CPF). Individuelle : formation puis examen (audit d'une page en 7 h + oral devant jury).",
        em: '',
        t2: '',
      },
      {
        b: 'IAAP (CPACC, WAS)',
        t: " : certifications individuelles internationales de l'International Association of Accessibility Professionals.",
        em: '',
        t2: '',
      },
      {
        b: 'Opquast',
        t: ' : certification individuelle de qualité web (dont accessibilité).',
        em: '',
        t2: '',
      },
      {
        b: 'DEKRA Certification',
        t: ' : ne certifie pas les auditeurs mais propose un ',
        em: 'audit tierce partie du site',
        t2: " avec attestation (validité 3 ans) — utile quand un donneur d'ordre exige un regard externe.",
      },
      {
        b: 'Qualiopi',
        t: ' : requise uniquement pour vendre de la',
        em: ' formation',
        t2: " financée (OPCO/CPF) — sans rapport avec le droit d'auditer.",
      },
    ],
    auditorsOutro:
      "En pratique : auditez et corrigez en autonomie, publiez votre déclaration, conservez votre attestation d'audit datée (générée par Konforme) — et si un client ou un contrôleur exige une vérification externe, un audit tierce partie viendra confirmer un travail déjà fait.",

    methodTitle: "La méthode officielle, mode d'emploi",
    methodP1A: 'La ',
    methodLink: 'méthode technique du RGAA',
    methodP1B: ' définit précisément comment auditer. Trois règles à connaître :',
    rule1A: 'Chaque critère reçoit un statut : ',
    rule1S1: 'conforme',
    rule1B: ', ',
    rule1S2: 'non conforme',
    rule1C: ' ou ',
    rule1S3: 'non applicable',
    rule1D:
      " (le contenu concerné n'existe pas sur le site — par exemple les critères multimédia sur un site sans vidéo).",
    rule2A: 'Le ',
    rule2S: 'taux de conformité',
    rule2B:
      ' = critères conformes ÷ (conformes + non conformes). Les non-applicables sont exclus du calcul.',
    rule3A: 'Les termes ont un sens précis, défini par le ',
    rule3Link: 'glossaire officiel',
    rule3B:
      " (« image porteuse d'information », « changement de contexte »…) — nous le reproduisons intégralement.",

    testEnvTitle: "L'environnement de test de référence",
    testEnvA: "La restitution doit être vérifiée avec de vraies technologies d'assistance, dans les ",
    testEnvLink: 'combinaisons de référence',
    testEnvB: ' :',
    testEnvCaption: 'Environnement de test de référence du RGAA',
    colPlatform: 'Plateforme',
    colAt: "Technologie d'assistance",
    colBrowser: 'Navigateur',
    testEnvRows: [
      { platform: 'Ordinateur (Windows)', at: 'NVDA (dernière version)', browser: 'Firefox' },
      { platform: 'Ordinateur (Windows)', at: 'JAWS (version précédente)', browser: 'Firefox ou Internet Explorer' },
      { platform: 'Ordinateur (macOS)', at: 'VoiceOver (dernière version)', browser: 'Safari' },
      { platform: 'Mobile (Android natif)', at: 'TalkBack (dernière version)', browser: 'Chrome' },
      { platform: 'Mobile (iOS)', at: 'VoiceOver (dernière version)', browser: 'Safari' },
    ],
    v5A: 'À noter : la ',
    v5S: 'version 5 du RGAA',
    v5B:
      " est en cours de rédaction (publication prévue fin 2026). N'attendez pas pour vous mettre en conformité : les critères actuels resteront la base de la future version.",

    criteriaTitle: 'Les 106 critères du RGAA 4.1.2, un par un',
    criteriaIntroA: 'Le RGAA traduit les exigences européennes (norme EN 301 549, WCAG 2.1 niveau AA) en ',
    criteriaIntroS: '106 critères vérifiables',
    criteriaIntroB:
      ", répartis en 13 thématiques. Pour chacun : l'exigence, son niveau (A ou AA), les critères WCAG correspondants, ce que notre moteur teste automatiquement, et une explication en français courant.",
    levelLabel: 'Niveau',
    coverage: {
      auto: 'Testé automatiquement',
      partial: 'Testé partiellement (compléter par une revue manuelle)',
      manual: 'Nécessite une vérification humaine',
    },
    detailLink: 'fiche détaillée',
    officialLink: 'texte officiel',

    stepsTitle: 'La démarche de mise en conformité, pour les professionnels',
    steps: [
      {
        title: '1. Auditer',
        text: "Lancez un audit automatique sur les pages clés (accueil, contact, parcours d'achat, connexion). Il détecte instantanément la part machine-vérifiable des 106 critères et vous donne un taux de départ.",
      },
      {
        title: '2. Prioriser',
        text: "Corrigez d'abord les non-conformités critiques (images sans alternative, champs sans étiquette, liens vides) : ce sont les plus bloquantes pour les utilisateurs et les plus visibles en cas de contrôle.",
      },
      {
        title: '3. Corriger',
        text: 'Chaque non-conformité du rapport indique le sélecteur CSS, le code concerné et une correction suggérée — avec un assistant IA pour générer le correctif. La plupart des corrections sont simples (attributs manquants).',
      },
      {
        title: "4. Compléter par l'évaluation manuelle intégrée",
        text: "Les critères « à vérifier manuellement » (contrastes réels, navigation clavier, sous-titres…) s'évaluent directement dans Konforme : dans l'onglet « Les 106 critères RGAA », marquez chaque critère Conforme, Non conforme ou Non applicable, avec une note justificative. Vous couvrez ainsi les 106 critères de A à Z, sans prestataire externe.",
      },
      {
        title: "5. Publier la déclaration d'accessibilité",
        text: 'Document légal obligatoire : état de conformité (totale ≥ 100 %, partielle ≥ 50 %, non conforme < 50 %), liste des contenus non accessibles, dispositif de retour utilisateur et voies de recours (Défenseur des droits). Konforme la génère pré-remplie.',
      },
      {
        title: '6. Surveiller',
        text: "L'accessibilité régresse à chaque mise en production. Activez le monitoring pour re-auditer automatiquement et être alerté en cas de régression — l'historique des scores prouve votre démarche d'amélioration en cas de contrôle.",
      },
    ],

    declTitle: "La déclaration d'accessibilité, mode d'emploi",
    declIntro:
      "C'est le document légal qui doit être accessible depuis chaque page de votre site (souvent en pied de page). Elle comporte obligatoirement :",
    decl1A: "L'",
    decl1S: 'état de conformité',
    decl1B: ', calculé sur les critères applicables : ',
    decl1Em1: 'totalement conforme',
    decl1C: ' (100 %), ',
    decl1Em2: 'partiellement conforme',
    decl1D: ' (≥ 50 %) ou ',
    decl1Em3: 'non conforme',
    decl1E: ' (< 50 % ou aucun audit valide) ;',
    decl2A: 'La ',
    decl2S: 'liste des contenus non accessibles',
    decl2B: ', avec les éventuelles dérogations pour charge disproportionnée (à justifier) ;',
    decl3A: 'Un ',
    decl3S: 'dispositif de retour',
    decl3B: " permettant de signaler un défaut et d'obtenir une alternative accessible ;",
    decl4A: 'Les ',
    decl4S: 'voies de recours',
    decl4B: ' (Défenseur des droits) ;',
    decl5: "L'échantillon de pages audité, les technologies et l'environnement de test, la date de l'audit.",
    declOutro:
      'Konforme génère cette déclaration pré-remplie au format officiel depuis votre tableau de bord.',

    reportTitle: 'Comment lire un rapport Konforme (pour tous)',
    report: [
      {
        b: 'Le taux de conformité',
        t: ' mesure la part des règles respectées sur les pages auditées. Un badge coloré (vert ≥ 85 %, orange ≥ 50 %, rouge en dessous) peut être affiché sur votre site.',
      },
      {
        b: "L'onglet « Les 106 critères RGAA »",
        t: ' montre, critère par critère, ce qui est validé, non conforme, ou à vérifier manuellement — avec une info-bulle « ? » qui explique chaque exigence sans jargon.',
      },
      {
        b: 'Chaque non-conformité',
        t: " indique la page, l'élément exact (sélecteur et code HTML), la gravité, et une correction suggérée — à transmettre telle quelle à votre développeur ou votre agence.",
      },
      {
        b: 'Les exports',
        t: " (PDF, HTML, Markdown, CSV) produisent un livrable d'audit complet, globalement ou page par page — présentable en interne comme à un contrôleur.",
      },
    ],

    finalTitle: 'Où en est votre site ?',
    finalText:
      "Testez gratuitement vos pages : taux de conformité, non-conformités détaillées et plan d'action en quelques minutes.",
    finalBtn1: 'Auditer mon site gratuitement',
    finalBtn2: 'Comprendre le RGAA',
  },

  en: {
    locale: 'en',
    seoTitle: 'Complete guide: European Accessibility Act & RGAA — the 106 criteria explained',
    seoDescription:
      'The reference guide: obligations under Directive (EU) 2019/882, deadlines, penalties enforced by the DGCCRF (the French consumer-protection authority), and the 106 criteria of RGAA 4.1.2 explained simply, for decision-makers and practitioners alike.',
    jsonLdHeadline: 'Complete guide: European Accessibility Act & RGAA',
    kicker: 'Complete guide',
    h1: 'Digital accessibility: the EAA and the 106 RGAA criteria, explained for everyone',

    leadA: 'Since ',
    leadS1: '28 June 2025',
    leadB: ', European Directive (EU) 2019/882 — the ',
    leadS2: 'European Accessibility Act',
    leadC:
      ' — has made digital accessibility mandatory for most consumer-facing services: e-commerce, banking, transport, telecoms and media. In France, conformance is demonstrated with ',
    leadS3: 'RGAA 4.1.2',
    leadD: ' and its ',
    leadS4: '106 criteria',
    leadE: ', and the ',
    leadS5: 'DGCCRF',
    leadF: ' (the French consumer-protection authority) is actively carrying out inspections.',

    introA: 'This guide addresses two audiences: ',
    introS1: 'decision-makers',
    introB: ', who need to understand the obligations and the risks, and ',
    introS2: 'web professionals',
    introC:
      ', who need to know exactly what to fix. Every criterion is explained in plain language: what it requires and, above all, ',
    introEm: 'who',
    introD: ' it protects.',

    whyTitle: 'Why it matters (beyond the law)',
    whyA: 'In France, around ',
    whyS: '12 million people',
    whyB:
      ' live with a disability — visual, hearing, motor or cognitive — and the population is ageing. An inaccessible site is a shop whose door is locked for 15 to 20% of visitors: customers lost, before penalties even enter the picture. Accessibility also improves search rankings (structure, text alternatives) and overall code quality.',

    whoTitle: 'Who is concerned?',
    who: [
      {
        a: '',
        b: 'Private B2C companies',
        c: ' with more than 10 employees and more than €2 million in revenue, in the sectors covered: e-commerce, banking services, e-books, passenger transport, electronic communications and audiovisual media.',
      },
      {
        a: '',
        b: 'Product manufacturers and distributors',
        c: ': computers, smartphones, payment terminals, self-service machines, e-readers — with no exemption for micro-enterprises.',
      },
      {
        a: '',
        b: 'Public-sector bodies',
        c: ', already subject to RGAA since 2019 (Article 47 of the French 2005 disability act), and companies with more than €250 million in revenue since 2020.',
      },
      {
        a: '',
        b: 'Service micro-enterprises',
        c: ' (fewer than 10 employees and less than €2 million in revenue) are exempt — but their business customers may require compliance contractually.',
      },
    ],

    deadlinesTitle: 'The deadlines',
    deadlines: [
      { date: '27 June 2019', label: 'Adoption of Directive (EU) 2019/882 — the European Accessibility Act (EAA).' },
      { date: '28 June 2022', label: 'Deadline for transposition into the national law of the member states.' },
      { date: '28 June 2025', label: 'Every new product or service placed on the market must be accessible. Inspections by the DGCCRF (the French consumer-protection authority) have begun.' },
      { date: '28 June 2030', label: 'End of the transition period: existing services (under earlier contracts) must be compliant.' },
    ],

    sanctionsTitle: 'The penalties incurred',
    sanctionsIntroA: 'In France, enforcement is split by sector: the ',
    sanctionsIntroS: 'DGCCRF',
    sanctionsIntroB:
      ' (consumer protection) for e-commerce, the ACPR and Banque de France for banking, Arcep for telecoms, Arcom for audiovisual media and the DGITM for transport. Fines can add up per service and per channel:',
    sanctions: [
      { amount: '€50,000', label: 'per non-compliant service (website, app, kiosk — cumulative per channel)' },
      { amount: '€25,000', label: 'where no accessibility statement has been published' },
      { amount: '€7,500', label: 'per recorded infringement (€15,000 for a repeat offence), with an injunction backed by a daily penalty' },
      { amount: '€75,000', label: 'deliberate inaccessibility can be classed as discrimination (for a legal entity)' },
    ],

    auditorsTitle: 'Who may audit? Do you need a "certified" auditor?',
    auditorsP1A: 'No: ',
    auditorsP1S: 'no state accreditation is required',
    auditorsP1B:
      ' to carry out an RGAA audit. The official accessibility statement template explicitly allows the audit to be "carried out in-house" or "by company [X]": any competent organisation — including yours, on its own with a tool such as Konforme — can audit and publish its statement.',
    auditorsP2A: 'There are, however, ',
    auditorsP2S: 'voluntary certifications',
    auditorsP2B: ' that strengthen the credibility of an auditor or of a website:',
    certifications: [
      {
        b: 'Access42 — "Auditing digital accessibility with the RGAA" (RS6582)',
        t: ': the only auditor-competency certification recognised by the French state (registered with France Compétences in 2024, eligible for CPF training funding). It is individual: training followed by an exam (a one-page audit in 7 hours plus an oral before a panel).',
        em: '',
        t2: '',
      },
      {
        b: 'IAAP (CPACC, WAS)',
        t: ': international individual certifications from the International Association of Accessibility Professionals.',
        em: '',
        t2: '',
      },
      {
        b: 'Opquast',
        t: ': an individual web-quality certification (accessibility included).',
        em: '',
        t2: '',
      },
      {
        b: 'DEKRA Certification',
        t: ': does not certify auditors but offers a ',
        em: 'third-party audit of the site',
        t2: ' with an attestation (valid for 3 years) — useful when a client insists on an external opinion.',
      },
      {
        b: 'Qualiopi',
        t: ': required only to sell publicly funded',
        em: ' training',
        t2: ' (via OPCO or CPF schemes) — unrelated to the right to audit.',
      },
    ],
    auditorsOutro:
      'In practice: audit and fix on your own, publish your statement, keep your dated audit attestation (generated by Konforme) — and if a client or an inspector requires external verification, a third-party audit will simply confirm work already done.',

    methodTitle: 'The official method, step by step',
    methodP1A: 'The ',
    methodLink: 'RGAA technical method',
    methodP1B: ' defines precisely how to audit. Three rules to know:',
    rule1A: 'Each criterion is given a status: ',
    rule1S1: 'compliant',
    rule1B: ', ',
    rule1S2: 'non-compliant',
    rule1C: ' or ',
    rule1S3: 'not applicable',
    rule1D:
      ' (the content concerned does not exist on the site — for example the multimedia criteria on a site without video).',
    rule2A: 'The ',
    rule2S: 'conformance rate',
    rule2B:
      ' = compliant criteria ÷ (compliant + non-compliant). Criteria that are not applicable are excluded from the calculation.',
    rule3A: 'The terms have a precise meaning, defined by the ',
    rule3Link: 'official glossary',
    rule3B:
      ' ("image conveying information", "change of context"…) — which we reproduce in full.',

    testEnvTitle: 'The reference test environment',
    testEnvA: 'Rendering must be verified with real assistive technologies, using the ',
    testEnvLink: 'reference combinations',
    testEnvB: ':',
    testEnvCaption: 'RGAA reference test environment',
    colPlatform: 'Platform',
    colAt: 'Assistive technology',
    colBrowser: 'Browser',
    testEnvRows: [
      { platform: 'Desktop (Windows)', at: 'NVDA (latest version)', browser: 'Firefox' },
      { platform: 'Desktop (Windows)', at: 'JAWS (previous version)', browser: 'Firefox or Internet Explorer' },
      { platform: 'Desktop (macOS)', at: 'VoiceOver (latest version)', browser: 'Safari' },
      { platform: 'Mobile (native Android)', at: 'TalkBack (latest version)', browser: 'Chrome' },
      { platform: 'Mobile (iOS)', at: 'VoiceOver (latest version)', browser: 'Safari' },
    ],
    v5A: 'Note: ',
    v5S: 'version 5 of the RGAA',
    v5B:
      ' is being drafted (publication expected at the end of 2026). Do not wait to become compliant: the current criteria will remain the basis of the future version.',

    criteriaTitle: 'The 106 criteria of RGAA 4.1.2, one by one',
    criteriaIntroA: 'The RGAA translates the European requirements (standard EN 301 549, WCAG 2.1 level AA) into ',
    criteriaIntroS: '106 verifiable criteria',
    criteriaIntroB:
      ', grouped into 13 topics. For each one: the requirement, its level (A or AA), the corresponding WCAG criteria, what our engine tests automatically, and a plain-language explanation.',
    levelLabel: 'Level',
    coverage: {
      auto: 'Tested automatically',
      partial: 'Partially tested (complete with a manual review)',
      manual: 'Requires human verification',
    },
    detailLink: 'detailed page',
    officialLink: 'official text',

    stepsTitle: 'The compliance process, for professionals',
    steps: [
      {
        title: '1. Audit',
        text: 'Run an automated audit on your key pages (home, contact, checkout, sign-in). It instantly detects the machine-verifiable share of the 106 criteria and gives you a baseline score.',
      },
      {
        title: '2. Prioritise',
        text: 'Fix the critical issues first (images with no alternative, fields with no label, empty links): they are the most disabling for users and the most visible during an inspection.',
      },
      {
        title: '3. Fix',
        text: 'Every issue in the report gives the CSS selector, the code concerned and a suggested fix — with an AI assistant to generate the patch. Most fixes are simple (missing attributes).',
      },
      {
        title: '4. Complete with the built-in manual evaluation',
        text: 'Criteria marked "to be checked manually" (real contrast, keyboard navigation, captions…) are evaluated directly in Konforme: in the "The 106 RGAA criteria" tab, mark each criterion Compliant, Non-compliant or Not applicable, with a justifying note. You thus cover all 106 criteria from A to Z, without an external provider.',
      },
      {
        title: '5. Publish the accessibility statement',
        text: 'A mandatory legal document: conformance status (full = 100%, partial ≥ 50%, non-compliant < 50%), list of inaccessible content, user feedback mechanism and means of redress (in France, the Défenseur des droits, the national ombudsman). Konforme generates it pre-filled.',
      },
      {
        title: '6. Monitor',
        text: 'Accessibility regresses with every release. Turn on monitoring to re-audit automatically and be alerted to regressions — the score history proves your improvement effort in the event of an inspection.',
      },
    ],

    declTitle: 'The accessibility statement, step by step',
    declIntro:
      'This is the legal document that must be reachable from every page of your site (usually in the footer). It must include:',
    decl1A: 'The ',
    decl1S: 'conformance status',
    decl1B: ', calculated on the applicable criteria: ',
    decl1Em1: 'fully compliant',
    decl1C: ' (100%), ',
    decl1Em2: 'partially compliant',
    decl1D: ' (≥ 50%) or ',
    decl1Em3: 'non-compliant',
    decl1E: ' (< 50% or no valid audit);',
    decl2A: 'The ',
    decl2S: 'list of inaccessible content',
    decl2B: ', with any exemptions for disproportionate burden (which must be justified);',
    decl3A: 'A ',
    decl3S: 'feedback mechanism',
    decl3B: ' allowing users to report a defect and obtain an accessible alternative;',
    decl4A: 'The ',
    decl4S: 'means of redress',
    decl4B: ' (in France, the Défenseur des droits, the national ombudsman);',
    decl5: 'The sample of pages audited, the technologies and test environment, and the date of the audit.',
    declOutro:
      'Konforme generates this statement pre-filled in the official format from your dashboard.',

    reportTitle: 'How to read a Konforme report (for everyone)',
    report: [
      {
        b: 'The conformance rate',
        t: ' measures the share of rules met across the audited pages. A colour-coded badge (green ≥ 85%, orange ≥ 50%, red below) can be displayed on your site.',
      },
      {
        b: 'The "The 106 RGAA criteria" tab',
        t: ' shows, criterion by criterion, what is validated, non-compliant or to be checked manually — with a "?" tooltip that explains each requirement without jargon.',
      },
      {
        b: 'Every issue',
        t: ' gives the page, the exact element (selector and HTML code), the severity and a suggested fix — ready to pass on as-is to your developer or agency.',
      },
      {
        b: 'The exports',
        t: ' (PDF, HTML, Markdown, CSV) produce a complete audit deliverable, overall or page by page — presentable internally as well as to an inspector.',
      },
    ],

    finalTitle: 'Where does your site stand?',
    finalText:
      'Test your pages free of charge: conformance rate, detailed issues and an action plan in a few minutes.',
    finalBtn1: 'Audit my site for free',
    finalBtn2: 'Understand the RGAA',
  },

  de: {
    locale: 'de-DE',
    seoTitle: 'Vollständiger Leitfaden: European Accessibility Act & RGAA — die 106 Kriterien erklärt',
    seoDescription:
      'Der Referenzleitfaden: Pflichten aus der Richtlinie (EU) 2019/882, Fristen, Sanktionen der DGCCRF (französische Verbraucherschutzbehörde) und die 106 Kriterien des RGAA 4.1.2 verständlich erklärt — für Entscheidungsträger wie für Fachleute.',
    jsonLdHeadline: 'Vollständiger Leitfaden: European Accessibility Act & RGAA',
    kicker: 'Vollständiger Leitfaden',
    h1: 'Digitale Barrierefreiheit: der EAA und die 106 RGAA-Kriterien, für alle erklärt',

    leadA: 'Seit dem ',
    leadS1: '28. Juni 2025',
    leadB: ' macht die europäische Richtlinie (EU) 2019/882 — der ',
    leadS2: 'European Accessibility Act',
    leadC:
      ' — digitale Barrierefreiheit für die meisten Dienstleistungen für Verbraucherinnen und Verbraucher verpflichtend: E-Commerce, Banken, Verkehr, Telekommunikation, Medien. In Frankreich wird die Konformität mit dem ',
    leadS3: 'RGAA 4.1.2',
    leadD: ' und seinen ',
    leadS4: '106 Kriterien',
    leadE: ' nachgewiesen, und die ',
    leadS5: 'DGCCRF',
    leadF: ' (die französische Verbraucherschutzbehörde) kontrolliert aktiv.',

    introA: 'Dieser Leitfaden richtet sich an zwei Zielgruppen: an ',
    introS1: 'Entscheidungsträger',
    introB: ', die die Pflichten und Risiken verstehen müssen, und an ',
    introS2: 'Web-Fachleute',
    introC:
      ', die genau wissen müssen, was zu korrigieren ist. Jedes Kriterium wird in verständlicher Sprache erklärt: was es verlangt und vor allem, ',
    introEm: 'wen',
    introD: ' es schützt.',

    whyTitle: 'Warum das wichtig ist (über das Gesetz hinaus)',
    whyA: 'In Frankreich leben rund ',
    whyS: '12 Millionen Menschen',
    whyB:
      ' mit einer Behinderung — visuell, auditiv, motorisch oder kognitiv — und die Bevölkerung altert. Eine nicht barrierefreie Website ist ein Geschäft, dessen Tür für 15 bis 20 % der Besucher verschlossen bleibt: verlorene Kundschaft, noch bevor von Sanktionen die Rede ist. Barrierefreiheit verbessert außerdem die Auffindbarkeit in Suchmaschinen (Struktur, Textalternativen) und die allgemeine Codequalität.',

    whoTitle: 'Wer ist betroffen?',
    who: [
      {
        a: '',
        b: 'Private B2C-Unternehmen',
        c: ' mit mehr als 10 Beschäftigten und mehr als 2 Mio. € Umsatz in den betroffenen Branchen: elektronischer Handel, Bankdienstleistungen, E-Books, Personenverkehr, elektronische Kommunikation, audiovisuelle Medien.',
      },
      {
        a: '',
        b: 'Hersteller und Händler von Produkten',
        c: ': Computer, Smartphones, Zahlungsterminals, Selbstbedienungsautomaten, E-Reader — ohne Ausnahme für Kleinstunternehmen.',
      },
      {
        a: 'Die ',
        b: 'öffentlichen Stellen',
        c: ', die dem RGAA bereits seit 2019 unterliegen (Artikel 47 des französischen Gesetzes von 2005), sowie Unternehmen mit mehr als 250 Mio. € Umsatz seit 2020.',
      },
      {
        a: '',
        b: 'Kleinstunternehmen im Dienstleistungsbereich',
        c: ' (weniger als 10 Beschäftigte und weniger als 2 Mio. € Umsatz) sind ausgenommen — ihre Auftraggeber können die Konformität jedoch vertraglich verlangen.',
      },
    ],

    deadlinesTitle: 'Die Fristen',
    deadlines: [
      { date: '27. Juni 2019', label: 'Verabschiedung der Richtlinie (EU) 2019/882 — European Accessibility Act (EAA).' },
      { date: '28. Juni 2022', label: 'Frist für die Umsetzung in das nationale Recht der Mitgliedstaaten.' },
      { date: '28. Juni 2025', label: 'Jedes neu in Verkehr gebrachte Produkt und jede neue Dienstleistung muss barrierefrei sein. Die Kontrollen der DGCCRF (französische Verbraucherschutzbehörde) haben begonnen.' },
      { date: '28. Juni 2030', label: 'Ende der Übergangsfrist: bestehende Dienste (aus früheren Verträgen) müssen konform sein.' },
    ],

    sanctionsTitle: 'Die drohenden Sanktionen',
    sanctionsIntroA: 'In Frankreich ist die Aufsicht nach Branchen aufgeteilt: die ',
    sanctionsIntroS: 'DGCCRF',
    sanctionsIntroB:
      ' (Verbraucherschutz) für den E-Commerce, ACPR/Banque de France für Banken, Arcep für die Telekommunikation, Arcom für audiovisuelle Medien, DGITM für den Verkehr. Die Bußgelder sind je Dienst und je Kanal kumulierbar:',
    sanctions: [
      { amount: '50.000 €', label: 'pro nicht konformem Dienst (Website, App, Terminal — je Kanal kumulierbar)' },
      { amount: '25.000 €', label: 'wenn keine Barrierefreiheitserklärung veröffentlicht wurde' },
      { amount: '7.500 €', label: 'je festgestelltem Verstoß (15.000 € im Wiederholungsfall), mit Anordnung unter Zwangsgeld' },
      { amount: '75.000 €', label: 'vorsätzliche Nichtzugänglichkeit kann als Diskriminierung gewertet werden (juristische Person)' },
    ],

    auditorsTitle: 'Wer darf auditieren? Braucht es einen „zertifizierten" Auditor?',
    auditorsP1A: 'Nein: ',
    auditorsP1S: 'es ist keine staatliche Zulassung erforderlich',
    auditorsP1B:
      ', um ein RGAA-Audit durchzuführen. Die offizielle Vorlage der Barrierefreiheitserklärung sieht ausdrücklich vor, dass das Audit „intern" oder „durch das Unternehmen [X]" durchgeführt wird: jede fachlich kompetente Organisation — auch Ihre eigene, eigenständig mit einem Werkzeug wie Konforme — kann auditieren und ihre Erklärung veröffentlichen.',
    auditorsP2A: 'Es gibt hingegen ',
    auditorsP2S: 'freiwillige Zertifizierungen',
    auditorsP2B: ', die die Glaubwürdigkeit eines Auditors oder einer Website stärken:',
    certifications: [
      {
        b: 'Access42 — „Digitale Barrierefreiheit mit dem RGAA auditieren" (RS6582)',
        t: ': die einzige vom französischen Staat anerkannte Kompetenzzertifizierung für Auditoren (2024 bei France Compétences registriert, über das CPF finanzierbar). Sie ist personenbezogen: Schulung und anschließende Prüfung (Audit einer Seite in 7 Stunden plus mündliche Prüfung vor einer Jury).',
        em: '',
        t2: '',
      },
      {
        b: 'IAAP (CPACC, WAS)',
        t: ': internationale personenbezogene Zertifizierungen der International Association of Accessibility Professionals.',
        em: '',
        t2: '',
      },
      {
        b: 'Opquast',
        t: ': personenbezogene Zertifizierung für Webqualität (einschließlich Barrierefreiheit).',
        em: '',
        t2: '',
      },
      {
        b: 'DEKRA Certification',
        t: ': zertifiziert keine Auditoren, bietet aber ein ',
        em: 'Drittprüfungs-Audit der Website',
        t2: ' mit Bescheinigung (3 Jahre gültig) — nützlich, wenn ein Auftraggeber einen externen Blick verlangt.',
      },
      {
        b: 'Qualiopi',
        t: ': nur erforderlich, um öffentlich finanzierte',
        em: ' Weiterbildung',
        t2: ' (OPCO/CPF) zu verkaufen — ohne Bezug zum Recht, zu auditieren.',
      },
    ],
    auditorsOutro:
      'In der Praxis: auditieren und korrigieren Sie eigenständig, veröffentlichen Sie Ihre Erklärung, bewahren Sie Ihre datierte Auditbescheinigung auf (von Konforme erzeugt) — und wenn ein Kunde oder eine Aufsichtsbehörde eine externe Prüfung verlangt, bestätigt ein Drittprüfungs-Audit lediglich bereits geleistete Arbeit.',

    methodTitle: 'Die offizielle Methode, Schritt für Schritt',
    methodP1A: 'Die ',
    methodLink: 'technische Methode des RGAA',
    methodP1B: ' legt genau fest, wie zu auditieren ist. Drei Regeln sollten Sie kennen:',
    rule1A: 'Jedes Kriterium erhält einen Status: ',
    rule1S1: 'konform',
    rule1B: ', ',
    rule1S2: 'nicht konform',
    rule1C: ' oder ',
    rule1S3: 'nicht anwendbar',
    rule1D:
      ' (der betreffende Inhalt existiert auf der Website nicht — zum Beispiel die Multimedia-Kriterien auf einer Website ohne Video).',
    rule2A: 'Die ',
    rule2S: 'Konformitätsrate',
    rule2B:
      ' = konforme Kriterien ÷ (konforme + nicht konforme). Nicht anwendbare Kriterien werden aus der Berechnung ausgeschlossen.',
    rule3A: 'Die Begriffe haben eine genaue Bedeutung, die im ',
    rule3Link: 'offiziellen Glossar',
    rule3B:
      ' definiert ist („informationstragendes Bild", „Kontextwechsel"…) — wir geben es vollständig wieder.',

    testEnvTitle: 'Die Referenz-Testumgebung',
    testEnvA: 'Die Wiedergabe muss mit echten assistiven Technologien überprüft werden, in den ',
    testEnvLink: 'Referenzkombinationen',
    testEnvB: ':',
    testEnvCaption: 'Referenz-Testumgebung des RGAA',
    colPlatform: 'Plattform',
    colAt: 'Assistive Technologie',
    colBrowser: 'Browser',
    testEnvRows: [
      { platform: 'Computer (Windows)', at: 'NVDA (neueste Version)', browser: 'Firefox' },
      { platform: 'Computer (Windows)', at: 'JAWS (vorherige Version)', browser: 'Firefox oder Internet Explorer' },
      { platform: 'Computer (macOS)', at: 'VoiceOver (neueste Version)', browser: 'Safari' },
      { platform: 'Mobilgerät (natives Android)', at: 'TalkBack (neueste Version)', browser: 'Chrome' },
      { platform: 'Mobilgerät (iOS)', at: 'VoiceOver (neueste Version)', browser: 'Safari' },
    ],
    v5A: 'Hinweis: die ',
    v5S: 'Version 5 des RGAA',
    v5B:
      ' wird derzeit erarbeitet (Veröffentlichung für Ende 2026 vorgesehen). Warten Sie nicht mit der Umsetzung: die heutigen Kriterien bleiben die Grundlage der künftigen Version.',

    criteriaTitle: 'Die 106 Kriterien des RGAA 4.1.2, eines nach dem anderen',
    criteriaIntroA: 'Das RGAA übersetzt die europäischen Anforderungen (Norm EN 301 549, WCAG 2.1 Stufe AA) in ',
    criteriaIntroS: '106 überprüfbare Kriterien',
    criteriaIntroB:
      ', verteilt auf 13 Themenbereiche. Zu jedem: die Anforderung, ihre Stufe (A oder AA), die entsprechenden WCAG-Kriterien, was unsere Engine automatisch prüft, und eine verständliche Erklärung.',
    levelLabel: 'Stufe',
    coverage: {
      auto: 'Automatisch geprüft',
      partial: 'Teilweise geprüft (durch eine manuelle Prüfung ergänzen)',
      manual: 'Erfordert eine menschliche Prüfung',
    },
    detailLink: 'Detailseite',
    officialLink: 'offizieller Text',

    stepsTitle: 'Der Weg zur Konformität, für Fachleute',
    steps: [
      {
        title: '1. Auditieren',
        text: 'Starten Sie ein automatisches Audit der wichtigsten Seiten (Startseite, Kontakt, Kaufstrecke, Anmeldung). Es erkennt sofort den maschinell prüfbaren Anteil der 106 Kriterien und liefert Ihnen einen Ausgangswert.',
      },
      {
        title: '2. Priorisieren',
        text: 'Beheben Sie zuerst die kritischen Verstöße (Bilder ohne Alternative, Felder ohne Beschriftung, leere Links): Sie behindern Nutzerinnen und Nutzer am stärksten und fallen bei einer Kontrolle am ehesten auf.',
      },
      {
        title: '3. Korrigieren',
        text: 'Jeder Verstoß im Bericht nennt den CSS-Selektor, den betroffenen Code und einen Korrekturvorschlag — mit einem KI-Assistenten, der den Fix erzeugt. Die meisten Korrekturen sind einfach (fehlende Attribute).',
      },
      {
        title: '4. Mit der integrierten manuellen Bewertung ergänzen',
        text: 'Die Kriterien „manuell zu prüfen" (tatsächliche Kontraste, Tastaturnavigation, Untertitel…) werden direkt in Konforme bewertet: Markieren Sie im Reiter „Die 106 RGAA-Kriterien" jedes Kriterium als konform, nicht konform oder nicht anwendbar, jeweils mit einer begründenden Notiz. So decken Sie alle 106 Kriterien von A bis Z ab, ohne externen Dienstleister.',
      },
      {
        title: '5. Die Barrierefreiheitserklärung veröffentlichen',
        text: 'Verpflichtendes Rechtsdokument: Konformitätsstatus (vollständig = 100 %, teilweise ≥ 50 %, nicht konform < 50 %), Liste der nicht barrierefreien Inhalte, Rückmeldemechanismus für Nutzende und Rechtsbehelfe (in Frankreich der Défenseur des droits, die nationale Ombudsstelle). Konforme erzeugt sie vorausgefüllt.',
      },
      {
        title: '6. Überwachen',
        text: 'Barrierefreiheit verschlechtert sich mit jedem Release. Aktivieren Sie das Monitoring, um automatisch neu zu auditieren und bei Verschlechterungen benachrichtigt zu werden — die Verlaufskurve der Werte belegt bei einer Kontrolle Ihr Bemühen um Verbesserung.',
      },
    ],

    declTitle: 'Die Barrierefreiheitserklärung, Schritt für Schritt',
    declIntro:
      'Das ist das Rechtsdokument, das von jeder Seite Ihrer Website aus erreichbar sein muss (meist im Fußbereich). Es muss zwingend enthalten:',
    decl1A: 'Den ',
    decl1S: 'Konformitätsstatus',
    decl1B: ', berechnet auf die anwendbaren Kriterien: ',
    decl1Em1: 'vollständig konform',
    decl1C: ' (100 %), ',
    decl1Em2: 'teilweise konform',
    decl1D: ' (≥ 50 %) oder ',
    decl1Em3: 'nicht konform',
    decl1E: ' (< 50 % oder kein gültiges Audit);',
    decl2A: 'Die ',
    decl2S: 'Liste der nicht barrierefreien Inhalte',
    decl2B: ', mit etwaigen Ausnahmen wegen unverhältnismäßiger Belastung (zu begründen);',
    decl3A: 'Einen ',
    decl3S: 'Rückmeldemechanismus',
    decl3B: ', der es erlaubt, einen Mangel zu melden und eine barrierefreie Alternative zu erhalten;',
    decl4A: 'Die ',
    decl4S: 'Rechtsbehelfe',
    decl4B: ' (in Frankreich der Défenseur des droits, die nationale Ombudsstelle);',
    decl5: 'Die auditierte Seitenauswahl, die Technologien und die Testumgebung sowie das Datum des Audits.',
    declOutro:
      'Konforme erzeugt diese Erklärung vorausgefüllt im offiziellen Format aus Ihrem Dashboard heraus.',

    reportTitle: 'Wie man einen Konforme-Bericht liest (für alle)',
    report: [
      {
        b: 'Die Konformitätsrate',
        t: ' misst den Anteil der eingehaltenen Regeln auf den auditierten Seiten. Ein farbiges Badge (grün ≥ 85 %, orange ≥ 50 %, rot darunter) kann auf Ihrer Website angezeigt werden.',
      },
      {
        b: 'Der Reiter „Die 106 RGAA-Kriterien"',
        t: ' zeigt Kriterium für Kriterium, was erfüllt, nicht konform oder manuell zu prüfen ist — mit einem „?"-Tooltip, der jede Anforderung ohne Fachjargon erklärt.',
      },
      {
        b: 'Jeder Verstoß',
        t: ' nennt die Seite, das genaue Element (Selektor und HTML-Code), die Schwere und einen Korrekturvorschlag — direkt so an Ihre Entwicklung oder Agentur weiterzugeben.',
      },
      {
        b: 'Die Exporte',
        t: ' (PDF, HTML, Markdown, CSV) erzeugen ein vollständiges Audit-Ergebnisdokument, gesamt oder Seite für Seite — intern wie gegenüber einer Aufsichtsbehörde vorzeigbar.',
      },
    ],

    finalTitle: 'Wo steht Ihre Website?',
    finalText:
      'Testen Sie Ihre Seiten kostenlos: Konformitätsrate, detaillierte Verstöße und ein Maßnahmenplan in wenigen Minuten.',
    finalBtn1: 'Meine Website kostenlos auditieren',
    finalBtn2: 'Das RGAA verstehen',
  },

  es: {
    locale: 'es-ES',
    seoTitle: 'Guía completa: European Accessibility Act y RGAA — los 106 criterios explicados',
    seoDescription:
      'La guía de referencia: obligaciones de la Directiva (UE) 2019/882, plazos, sanciones de la DGCCRF (autoridad francesa de protección al consumidor) y los 106 criterios del RGAA 4.1.2 explicados de forma sencilla, tanto para responsables como para profesionales.',
    jsonLdHeadline: 'Guía completa: European Accessibility Act y RGAA',
    kicker: 'Guía completa',
    h1: 'Accesibilidad digital: el EAA y los 106 criterios del RGAA, explicados para todos',

    leadA: 'Desde el ',
    leadS1: '28 de junio de 2025',
    leadB: ', la directiva europea (UE) 2019/882 — el ',
    leadS2: 'European Accessibility Act',
    leadC:
      ' — hace obligatoria la accesibilidad digital para la mayoría de los servicios dirigidos al público: comercio electrónico, banca, transporte, telecomunicaciones y medios de comunicación. En Francia, la conformidad se demuestra con el ',
    leadS3: 'RGAA 4.1.2',
    leadD: ' y sus ',
    leadS4: '106 criterios',
    leadE: ', y la ',
    leadS5: 'DGCCRF',
    leadF: ' (la autoridad francesa de protección al consumidor) controla activamente.',

    introA: 'Esta guía se dirige a dos públicos: a los ',
    introS1: 'responsables de decisión',
    introB: ', que deben comprender las obligaciones y los riesgos, y a los ',
    introS2: 'profesionales de la web',
    introC:
      ', que deben saber exactamente qué corregir. Cada criterio se explica en lenguaje llano: qué exige y, sobre todo, ',
    introEm: 'a quién',
    introD: ' protege.',

    whyTitle: 'Por qué es importante (más allá de la ley)',
    whyA: 'En Francia, alrededor de ',
    whyS: '12 millones de personas',
    whyB:
      ' viven con una discapacidad —visual, auditiva, motora o cognitiva— y la población envejece. Un sitio inaccesible es una tienda con la puerta cerrada para el 15 % o el 20 % de sus visitantes: clientes perdidos, incluso antes de hablar de sanciones. La accesibilidad mejora además el posicionamiento natural (estructura, alternativas textuales) y la calidad general del código.',

    whoTitle: '¿A quién afecta?',
    who: [
      {
        a: 'Las ',
        b: 'empresas privadas B2C',
        c: ' con más de 10 empleados y más de 2 M€ de facturación en los sectores afectados: comercio electrónico, servicios bancarios, libros digitales, transporte de viajeros, comunicaciones electrónicas y medios audiovisuales.',
      },
      {
        a: 'Los ',
        b: 'fabricantes y distribuidores de productos',
        c: ': ordenadores, teléfonos inteligentes, terminales de pago, máquinas expendedoras, lectores electrónicos, sin exención para las microempresas.',
      },
      {
        a: 'Los ',
        b: 'servicios públicos',
        c: ', ya sujetos al RGAA desde 2019 (artículo 47 de la ley francesa de 2005), y las empresas con más de 250 M€ de facturación desde 2020.',
      },
      {
        a: 'Las ',
        b: 'microempresas de servicios',
        c: ' (menos de 10 empleados y menos de 2 M€ de facturación) están exentas, pero sus clientes pueden exigirlo contractualmente.',
      },
    ],

    deadlinesTitle: 'Los plazos',
    deadlines: [
      { date: '27 de junio de 2019', label: 'Adopción de la Directiva (UE) 2019/882 — European Accessibility Act (EAA).' },
      { date: '28 de junio de 2022', label: 'Fecha límite de transposición al derecho nacional de los Estados miembros.' },
      { date: '28 de junio de 2025', label: 'Todo producto o servicio nuevo puesto en el mercado debe ser accesible. Los controles de la DGCCRF (autoridad francesa de protección al consumidor) ya han comenzado.' },
      { date: '28 de junio de 2030', label: 'Fin del periodo transitorio: los servicios existentes (contratos anteriores) deben ser conformes.' },
    ],

    sanctionsTitle: 'Las sanciones previstas',
    sanctionsIntroA: 'En Francia, el control se reparte por sectores: la ',
    sanctionsIntroS: 'DGCCRF',
    sanctionsIntroB:
      ' (protección al consumidor) para el comercio electrónico, ACPR/Banque de France para la banca, Arcep para las telecomunicaciones, Arcom para el audiovisual y DGITM para el transporte. Las multas son acumulables por servicio y por canal:',
    sanctions: [
      { amount: '50 000 €', label: 'por servicio no conforme (sitio, aplicación, terminal; acumulable por canal)' },
      { amount: '25 000 €', label: 'cuando no se ha publicado ninguna declaración de accesibilidad' },
      { amount: '7 500 €', label: 'por infracción constatada (15 000 € en caso de reincidencia), con requerimiento bajo multa coercitiva' },
      { amount: '75 000 €', label: 'la inaccesibilidad deliberada puede calificarse de discriminación (persona jurídica)' },
    ],

    auditorsTitle: '¿Quién puede auditar? ¿Hace falta un auditor «certificado»?',
    auditorsP1A: 'No: ',
    auditorsP1S: 'no se exige ninguna acreditación estatal',
    auditorsP1B:
      ' para realizar una auditoría RGAA. El modelo oficial de declaración de accesibilidad prevé expresamente que la auditoría se realice «internamente» o «por la sociedad [X]»: cualquier organización competente —incluida la suya, de forma autónoma con una herramienta como Konforme— puede auditar y publicar su declaración.',
    auditorsP2A: 'Existen, en cambio, ',
    auditorsP2S: 'certificaciones voluntarias',
    auditorsP2B: ' que refuerzan la credibilidad de un auditor o de un sitio:',
    certifications: [
      {
        b: 'Access42 — «Auditar la accesibilidad digital con el RGAA» (RS6582)',
        t: ': la única certificación de competencias de auditor reconocida por el Estado francés (registrada en France Compétences en 2024, financiable mediante el CPF). Es individual: formación y después examen (auditoría de una página en 7 h más una prueba oral ante un tribunal).',
        em: '',
        t2: '',
      },
      {
        b: 'IAAP (CPACC, WAS)',
        t: ': certificaciones individuales internacionales de la International Association of Accessibility Professionals.',
        em: '',
        t2: '',
      },
      {
        b: 'Opquast',
        t: ': certificación individual de calidad web (accesibilidad incluida).',
        em: '',
        t2: '',
      },
      {
        b: 'DEKRA Certification',
        t: ': no certifica a los auditores, pero ofrece una ',
        em: 'auditoría del sitio por un tercero',
        t2: ' con certificado (validez de 3 años), útil cuando un cliente exige una mirada externa.',
      },
      {
        b: 'Qualiopi',
        t: ': solo se exige para vender',
        em: ' formación',
        t2: ' financiada con fondos públicos (OPCO/CPF), sin relación con el derecho a auditar.',
      },
    ],
    auditorsOutro:
      'En la práctica: audite y corrija de forma autónoma, publique su declaración, conserve su certificado de auditoría fechado (generado por Konforme) y, si un cliente o un inspector exige una verificación externa, una auditoría de tercera parte no hará más que confirmar un trabajo ya hecho.',

    methodTitle: 'El método oficial, paso a paso',
    methodP1A: 'El ',
    methodLink: 'método técnico del RGAA',
    methodP1B: ' define con precisión cómo auditar. Tres reglas que conviene conocer:',
    rule1A: 'Cada criterio recibe un estado: ',
    rule1S1: 'conforme',
    rule1B: ', ',
    rule1S2: 'no conforme',
    rule1C: ' o ',
    rule1S3: 'no aplicable',
    rule1D:
      ' (el contenido en cuestión no existe en el sitio; por ejemplo, los criterios multimedia en un sitio sin vídeo).',
    rule2A: 'La ',
    rule2S: 'tasa de conformidad',
    rule2B:
      ' = criterios conformes ÷ (conformes + no conformes). Los no aplicables quedan excluidos del cálculo.',
    rule3A: 'Los términos tienen un sentido preciso, definido por el ',
    rule3Link: 'glosario oficial',
    rule3B:
      ' («imagen portadora de información», «cambio de contexto»…), que reproducimos íntegramente.',

    testEnvTitle: 'El entorno de prueba de referencia',
    testEnvA: 'La restitución debe verificarse con tecnologías de apoyo reales, en las ',
    testEnvLink: 'combinaciones de referencia',
    testEnvB: ':',
    testEnvCaption: 'Entorno de prueba de referencia del RGAA',
    colPlatform: 'Plataforma',
    colAt: 'Tecnología de apoyo',
    colBrowser: 'Navegador',
    testEnvRows: [
      { platform: 'Ordenador (Windows)', at: 'NVDA (última versión)', browser: 'Firefox' },
      { platform: 'Ordenador (Windows)', at: 'JAWS (versión anterior)', browser: 'Firefox o Internet Explorer' },
      { platform: 'Ordenador (macOS)', at: 'VoiceOver (última versión)', browser: 'Safari' },
      { platform: 'Móvil (Android nativo)', at: 'TalkBack (última versión)', browser: 'Chrome' },
      { platform: 'Móvil (iOS)', at: 'VoiceOver (última versión)', browser: 'Safari' },
    ],
    v5A: 'A tener en cuenta: la ',
    v5S: 'versión 5 del RGAA',
    v5B:
      ' está en fase de redacción (publicación prevista para finales de 2026). No espere para ponerse en conformidad: los criterios actuales seguirán siendo la base de la futura versión.',

    criteriaTitle: 'Los 106 criterios del RGAA 4.1.2, uno a uno',
    criteriaIntroA: 'El RGAA traduce las exigencias europeas (norma EN 301 549, WCAG 2.1 nivel AA) en ',
    criteriaIntroS: '106 criterios verificables',
    criteriaIntroB:
      ', repartidos en 13 temáticas. Para cada uno: la exigencia, su nivel (A o AA), los criterios WCAG correspondientes, lo que nuestro motor comprueba automáticamente y una explicación en lenguaje llano.',
    levelLabel: 'Nivel',
    coverage: {
      auto: 'Comprobado automáticamente',
      partial: 'Comprobado parcialmente (completar con una revisión manual)',
      manual: 'Requiere una verificación humana',
    },
    detailLink: 'ficha detallada',
    officialLink: 'texto oficial',

    stepsTitle: 'El proceso de puesta en conformidad, para profesionales',
    steps: [
      {
        title: '1. Auditar',
        text: 'Lance una auditoría automática sobre las páginas clave (inicio, contacto, proceso de compra, conexión). Detecta al instante la parte verificable por máquina de los 106 criterios y le da una tasa de partida.',
      },
      {
        title: '2. Priorizar',
        text: 'Corrija primero los incumplimientos críticos (imágenes sin alternativa, campos sin etiqueta, enlaces vacíos): son los más bloqueantes para las personas usuarias y los más visibles en caso de control.',
      },
      {
        title: '3. Corregir',
        text: 'Cada incumplimiento del informe indica el selector CSS, el código afectado y una corrección sugerida, con un asistente de IA para generar el parche. La mayoría de las correcciones son sencillas (atributos que faltan).',
      },
      {
        title: '4. Completar con la evaluación manual integrada',
        text: 'Los criterios «por verificar manualmente» (contrastes reales, navegación por teclado, subtítulos…) se evalúan directamente en Konforme: en la pestaña «Los 106 criterios RGAA», marque cada criterio como Conforme, No conforme o No aplicable, con una nota justificativa. Así cubre los 106 criterios de la A a la Z, sin proveedor externo.',
      },
      {
        title: '5. Publicar la declaración de accesibilidad',
        text: 'Documento legal obligatorio: estado de conformidad (total = 100 %, parcial ≥ 50 %, no conforme < 50 %), lista de contenidos no accesibles, mecanismo de retorno para las personas usuarias y vías de recurso (en Francia, el Défenseur des droits, el defensor del pueblo). Konforme la genera precumplimentada.',
      },
      {
        title: '6. Supervisar',
        text: 'La accesibilidad se degrada con cada puesta en producción. Active la monitorización para reauditar automáticamente y recibir alertas en caso de regresión: el histórico de puntuaciones demuestra su esfuerzo de mejora en caso de control.',
      },
    ],

    declTitle: 'La declaración de accesibilidad, paso a paso',
    declIntro:
      'Es el documento legal que debe ser accesible desde todas las páginas de su sitio (a menudo en el pie de página). Debe incluir obligatoriamente:',
    decl1A: 'El ',
    decl1S: 'estado de conformidad',
    decl1B: ', calculado sobre los criterios aplicables: ',
    decl1Em1: 'totalmente conforme',
    decl1C: ' (100 %), ',
    decl1Em2: 'parcialmente conforme',
    decl1D: ' (≥ 50 %) o ',
    decl1Em3: 'no conforme',
    decl1E: ' (< 50 % o ninguna auditoría válida);',
    decl2A: 'La ',
    decl2S: 'lista de los contenidos no accesibles',
    decl2B: ', con las eventuales exenciones por carga desproporcionada (que deben justificarse);',
    decl3A: 'Un ',
    decl3S: 'mecanismo de retorno',
    decl3B: ' que permita señalar un defecto y obtener una alternativa accesible;',
    decl4A: 'Las ',
    decl4S: 'vías de recurso',
    decl4B: ' (en Francia, el Défenseur des droits, el defensor del pueblo);',
    decl5: 'La muestra de páginas auditada, las tecnologías y el entorno de prueba, y la fecha de la auditoría.',
    declOutro:
      'Konforme genera esta declaración precumplimentada en el formato oficial desde su panel de control.',

    reportTitle: 'Cómo leer un informe Konforme (para todos)',
    report: [
      {
        b: 'La tasa de conformidad',
        t: ' mide la proporción de reglas respetadas en las páginas auditadas. Puede mostrarse en su sitio un distintivo de color (verde ≥ 85 %, naranja ≥ 50 %, rojo por debajo).',
      },
      {
        b: 'La pestaña «Los 106 criterios RGAA»',
        t: ' muestra, criterio por criterio, lo que está validado, lo que no es conforme y lo que hay que verificar manualmente, con una ayuda emergente «?» que explica cada exigencia sin jerga.',
      },
      {
        b: 'Cada incumplimiento',
        t: ' indica la página, el elemento exacto (selector y código HTML), la gravedad y una corrección sugerida, lista para transmitirla tal cual a su desarrollador o a su agencia.',
      },
      {
        b: 'Las exportaciones',
        t: ' (PDF, HTML, Markdown, CSV) producen un entregable de auditoría completo, global o página por página, presentable tanto internamente como ante un inspector.',
      },
    ],

    finalTitle: '¿En qué punto está su sitio?',
    finalText:
      'Pruebe sus páginas gratuitamente: tasa de conformidad, incumplimientos detallados y plan de acción en unos minutos.',
    finalBtn1: 'Auditar mi sitio gratuitamente',
    finalBtn2: 'Comprender el RGAA',
  },

  it: {
    locale: 'it-IT',
    seoTitle: 'Guida completa: European Accessibility Act e RGAA — i 106 criteri spiegati',
    seoDescription:
      'La guida di riferimento: obblighi della direttiva (UE) 2019/882, scadenze, sanzioni della DGCCRF (autorità francese per la tutela dei consumatori) e i 106 criteri del RGAA 4.1.2 spiegati in modo semplice, per i decisori come per i professionisti.',
    jsonLdHeadline: 'Guida completa: European Accessibility Act e RGAA',
    kicker: 'Guida completa',
    h1: 'Accessibilità digitale: l’EAA e i 106 criteri del RGAA, spiegati a tutti',

    leadA: 'Dal ',
    leadS1: '28 giugno 2025',
    leadB: ' la direttiva europea (UE) 2019/882 — l’',
    leadS2: 'European Accessibility Act',
    leadC:
      ' — rende l’accessibilità digitale obbligatoria per la maggior parte dei servizi destinati al pubblico: e-commerce, banche, trasporti, telecomunicazioni, media. In Francia la conformità si dimostra con il ',
    leadS3: 'RGAA 4.1.2',
    leadD: ' e i suoi ',
    leadS4: '106 criteri',
    leadE: ', e la ',
    leadS5: 'DGCCRF',
    leadF: ' (l’autorità francese per la tutela dei consumatori) effettua controlli attivi.',

    introA: 'Questa guida si rivolge a due pubblici: ai ',
    introS1: 'decisori',
    introB: ', che devono comprendere gli obblighi e i rischi, e ai ',
    introS2: 'professionisti del web',
    introC:
      ', che devono sapere con precisione che cosa correggere. Ogni criterio è spiegato in un linguaggio chiaro: che cosa richiede e, soprattutto, ',
    introEm: 'chi',
    introD: ' protegge.',

    whyTitle: 'Perché è importante (al di là della legge)',
    whyA: 'In Francia circa ',
    whyS: '12 milioni di persone',
    whyB:
      ' vivono con una disabilità — visiva, uditiva, motoria o cognitiva — e la popolazione invecchia. Un sito non accessibile è un negozio con la porta chiusa per il 15-20 % dei visitatori: clienti persi, ancor prima di parlare di sanzioni. L’accessibilità migliora inoltre il posizionamento nei motori di ricerca (struttura, alternative testuali) e la qualità generale del codice.',

    whoTitle: 'Chi è interessato?',
    who: [
      {
        a: 'Le ',
        b: 'imprese private B2C',
        c: ' con più di 10 dipendenti e più di 2 milioni di euro di fatturato nei settori interessati: commercio elettronico, servizi bancari, libri digitali, trasporto passeggeri, comunicazioni elettroniche, media audiovisivi.',
      },
      {
        a: 'I ',
        b: 'fabbricanti e distributori di prodotti',
        c: ': computer, smartphone, terminali di pagamento, distributori automatici, e-reader — senza esenzioni per le microimprese.',
      },
      {
        a: 'I ',
        b: 'servizi pubblici',
        c: ', già soggetti al RGAA dal 2019 (articolo 47 della legge francese del 2005), e le imprese con oltre 250 milioni di euro di fatturato dal 2020.',
      },
      {
        a: 'Le ',
        b: 'microimprese di servizi',
        c: ' (meno di 10 dipendenti e meno di 2 milioni di euro di fatturato) sono esentate, ma i loro committenti possono esigerlo per contratto.',
      },
    ],

    deadlinesTitle: 'Le scadenze',
    deadlines: [
      { date: '27 giugno 2019', label: 'Adozione della direttiva (UE) 2019/882 — European Accessibility Act (EAA).' },
      { date: '28 giugno 2022', label: 'Termine per il recepimento nel diritto nazionale degli Stati membri.' },
      { date: '28 giugno 2025', label: 'Ogni prodotto o servizio nuovo immesso sul mercato deve essere accessibile. I controlli della DGCCRF (autorità francese per la tutela dei consumatori) sono iniziati.' },
      { date: '28 giugno 2030', label: 'Fine del periodo transitorio: i servizi esistenti (contratti anteriori) devono essere conformi.' },
    ],

    sanctionsTitle: 'Le sanzioni previste',
    sanctionsIntroA: 'In Francia il controllo è ripartito per settore: la ',
    sanctionsIntroS: 'DGCCRF',
    sanctionsIntroB:
      ' (tutela dei consumatori) per l’e-commerce, ACPR/Banque de France per le banche, Arcep per le telecomunicazioni, Arcom per l’audiovisivo, DGITM per i trasporti. Le ammende sono cumulabili per servizio e per canale:',
    sanctions: [
      { amount: '50 000 €', label: 'per servizio non conforme (sito, applicazione, totem — cumulabile per canale)' },
      { amount: '25 000 €', label: 'in assenza di una dichiarazione di accessibilità pubblicata' },
      { amount: '7 500 €', label: 'per infrazione accertata (15 000 € in caso di recidiva), con ingiunzione soggetta a penalità di mora' },
      { amount: '75 000 €', label: 'l’inaccessibilità deliberata può essere qualificata come discriminazione (persona giuridica)' },
    ],

    auditorsTitle: 'Chi può svolgere l’audit? Serve un auditor «certificato»?',
    auditorsP1A: 'No: ',
    auditorsP1S: 'non è richiesta alcuna abilitazione statale',
    auditorsP1B:
      ' per svolgere un audit RGAA. Il modello ufficiale di dichiarazione di accessibilità prevede esplicitamente che l’audit sia «svolto internamente» oppure «dalla società [X]»: qualsiasi organizzazione competente — compresa la sua, in autonomia con uno strumento come Konforme — può svolgere l’audit e pubblicare la propria dichiarazione.',
    auditorsP2A: 'Esistono invece ',
    auditorsP2S: 'certificazioni volontarie',
    auditorsP2B: ' che rafforzano la credibilità di un auditor o di un sito:',
    certifications: [
      {
        b: 'Access42 — «Svolgere audit di accessibilità digitale con il RGAA» (RS6582)',
        t: ': l’unica certificazione di competenze per auditor riconosciuta dallo Stato francese (registrata presso France Compétences nel 2024, finanziabile tramite il CPF). È individuale: formazione e poi esame (audit di una pagina in 7 ore più una prova orale davanti a una commissione).',
        em: '',
        t2: '',
      },
      {
        b: 'IAAP (CPACC, WAS)',
        t: ': certificazioni individuali internazionali della International Association of Accessibility Professionals.',
        em: '',
        t2: '',
      },
      {
        b: 'Opquast',
        t: ': certificazione individuale di qualità web (accessibilità compresa).',
        em: '',
        t2: '',
      },
      {
        b: 'DEKRA Certification',
        t: ': non certifica gli auditor ma propone un ',
        em: 'audit del sito da parte di un terzo',
        t2: ' con attestato (validità di 3 anni), utile quando un committente esige uno sguardo esterno.',
      },
      {
        b: 'Qualiopi',
        t: ': richiesta unicamente per vendere',
        em: ' formazione',
        t2: ' finanziata con fondi pubblici (OPCO/CPF), senza alcun rapporto con il diritto di svolgere audit.',
      },
    ],
    auditorsOutro:
      'In pratica: svolga l’audit e le correzioni in autonomia, pubblichi la sua dichiarazione, conservi l’attestato di audit datato (generato da Konforme) e, se un cliente o un controllore esige una verifica esterna, un audit di terza parte non farà che confermare un lavoro già svolto.',

    methodTitle: 'Il metodo ufficiale, istruzioni per l’uso',
    methodP1A: 'Il ',
    methodLink: 'metodo tecnico del RGAA',
    methodP1B: ' definisce con precisione come svolgere l’audit. Tre regole da conoscere:',
    rule1A: 'Ogni criterio riceve uno stato: ',
    rule1S1: 'conforme',
    rule1B: ', ',
    rule1S2: 'non conforme',
    rule1C: ' oppure ',
    rule1S3: 'non applicabile',
    rule1D:
      ' (il contenuto interessato non esiste nel sito — per esempio i criteri multimediali su un sito senza video).',
    rule2A: 'Il ',
    rule2S: 'tasso di conformità',
    rule2B:
      ' = criteri conformi ÷ (conformi + non conformi). I criteri non applicabili sono esclusi dal calcolo.',
    rule3A: 'I termini hanno un significato preciso, definito dal ',
    rule3Link: 'glossario ufficiale',
    rule3B:
      ' («immagine portatrice di informazione», «cambiamento di contesto»…) — che riproduciamo integralmente.',

    testEnvTitle: 'L’ambiente di test di riferimento',
    testEnvA: 'La restituzione deve essere verificata con vere tecnologie assistive, nelle ',
    testEnvLink: 'combinazioni di riferimento',
    testEnvB: ':',
    testEnvCaption: 'Ambiente di test di riferimento del RGAA',
    colPlatform: 'Piattaforma',
    colAt: 'Tecnologia assistiva',
    colBrowser: 'Browser',
    testEnvRows: [
      { platform: 'Computer (Windows)', at: 'NVDA (ultima versione)', browser: 'Firefox' },
      { platform: 'Computer (Windows)', at: 'JAWS (versione precedente)', browser: 'Firefox o Internet Explorer' },
      { platform: 'Computer (macOS)', at: 'VoiceOver (ultima versione)', browser: 'Safari' },
      { platform: 'Mobile (Android nativo)', at: 'TalkBack (ultima versione)', browser: 'Chrome' },
      { platform: 'Mobile (iOS)', at: 'VoiceOver (ultima versione)', browser: 'Safari' },
    ],
    v5A: 'Da notare: la ',
    v5S: 'versione 5 del RGAA',
    v5B:
      ' è in corso di redazione (pubblicazione prevista per la fine del 2026). Non aspetti per mettersi in conformità: i criteri attuali resteranno la base della versione futura.',

    criteriaTitle: 'I 106 criteri del RGAA 4.1.2, uno per uno',
    criteriaIntroA: 'Il RGAA traduce i requisiti europei (norma EN 301 549, WCAG 2.1 livello AA) in ',
    criteriaIntroS: '106 criteri verificabili',
    criteriaIntroB:
      ', suddivisi in 13 tematiche. Per ciascuno: il requisito, il suo livello (A o AA), i criteri WCAG corrispondenti, ciò che il nostro motore verifica automaticamente e una spiegazione in linguaggio chiaro.',
    levelLabel: 'Livello',
    coverage: {
      auto: 'Verificato automaticamente',
      partial: 'Verificato parzialmente (da completare con una revisione manuale)',
      manual: 'Richiede una verifica umana',
    },
    detailLink: 'scheda dettagliata',
    officialLink: 'testo ufficiale',

    stepsTitle: 'Il percorso di messa in conformità, per i professionisti',
    steps: [
      {
        title: '1. Svolgere l’audit',
        text: 'Avvii un audit automatico sulle pagine chiave (home, contatti, percorso d’acquisto, accesso). Rileva immediatamente la parte verificabile dalla macchina dei 106 criteri e le fornisce un tasso di partenza.',
      },
      {
        title: '2. Dare priorità',
        text: 'Corregga per prime le non conformità critiche (immagini senza alternativa, campi senza etichetta, link vuoti): sono le più bloccanti per gli utenti e le più visibili in caso di controllo.',
      },
      {
        title: '3. Correggere',
        text: 'Ogni non conformità del rapporto indica il selettore CSS, il codice interessato e una correzione suggerita, con un assistente IA per generare la modifica. La maggior parte delle correzioni è semplice (attributi mancanti).',
      },
      {
        title: '4. Completare con la valutazione manuale integrata',
        text: 'I criteri «da verificare manualmente» (contrasti reali, navigazione da tastiera, sottotitoli…) si valutano direttamente in Konforme: nella scheda «I 106 criteri RGAA» contrassegni ogni criterio come Conforme, Non conforme o Non applicabile, con una nota giustificativa. Copre così i 106 criteri dalla A alla Z, senza fornitori esterni.',
      },
      {
        title: '5. Pubblicare la dichiarazione di accessibilità',
        text: 'Documento legale obbligatorio: stato di conformità (totale = 100 %, parziale ≥ 50 %, non conforme < 50 %), elenco dei contenuti non accessibili, meccanismo di feedback per gli utenti e mezzi di ricorso (in Francia il Défenseur des droits, il difensore civico nazionale). Konforme la genera precompilata.',
      },
      {
        title: '6. Monitorare',
        text: 'L’accessibilità peggiora a ogni messa in produzione. Attivi il monitoraggio per rieseguire automaticamente l’audit ed essere avvisato in caso di regressione: lo storico dei punteggi dimostra il suo impegno di miglioramento in caso di controllo.',
      },
    ],

    declTitle: 'La dichiarazione di accessibilità, istruzioni per l’uso',
    declIntro:
      'È il documento legale che deve essere raggiungibile da ogni pagina del suo sito (spesso nel piè di pagina). Deve obbligatoriamente contenere:',
    decl1A: 'Lo ',
    decl1S: 'stato di conformità',
    decl1B: ', calcolato sui criteri applicabili: ',
    decl1Em1: 'totalmente conforme',
    decl1C: ' (100 %), ',
    decl1Em2: 'parzialmente conforme',
    decl1D: ' (≥ 50 %) oppure ',
    decl1Em3: 'non conforme',
    decl1E: ' (< 50 % o nessun audit valido);',
    decl2A: 'L’',
    decl2S: 'elenco dei contenuti non accessibili',
    decl2B: ', con le eventuali deroghe per onere sproporzionato (da giustificare);',
    decl3A: 'Un ',
    decl3S: 'meccanismo di feedback',
    decl3B: ' che consenta di segnalare un difetto e di ottenere un’alternativa accessibile;',
    decl4A: 'I ',
    decl4S: 'mezzi di ricorso',
    decl4B: ' (in Francia il Défenseur des droits, il difensore civico nazionale);',
    decl5: 'Il campione di pagine sottoposto ad audit, le tecnologie e l’ambiente di test, la data dell’audit.',
    declOutro:
      'Konforme genera questa dichiarazione precompilata nel formato ufficiale a partire dal suo pannello di controllo.',

    reportTitle: 'Come leggere un rapporto Konforme (per tutti)',
    report: [
      {
        b: 'Il tasso di conformità',
        t: ' misura la quota di regole rispettate sulle pagine sottoposte ad audit. Sul suo sito può essere mostrato un badge colorato (verde ≥ 85 %, arancione ≥ 50 %, rosso al di sotto).',
      },
      {
        b: 'La scheda «I 106 criteri RGAA»',
        t: ' mostra, criterio per criterio, ciò che è validato, non conforme o da verificare manualmente, con un suggerimento «?» che spiega ogni requisito senza gergo tecnico.',
      },
      {
        b: 'Ogni non conformità',
        t: ' indica la pagina, l’elemento esatto (selettore e codice HTML), la gravità e una correzione suggerita, da trasmettere così com’è al suo sviluppatore o alla sua agenzia.',
      },
      {
        b: 'Le esportazioni',
        t: ' (PDF, HTML, Markdown, CSV) producono un documento di audit completo, complessivo o pagina per pagina, presentabile sia internamente sia a un controllore.',
      },
    ],

    finalTitle: 'A che punto è il suo sito?',
    finalText:
      'Testi gratuitamente le sue pagine: tasso di conformità, non conformità dettagliate e piano d’azione in pochi minuti.',
    finalBtn1: 'Analizzare gratuitamente il mio sito',
    finalBtn2: 'Capire il RGAA',
  },
})

export function GuideAccessibilite() {
  const lang = useLang()
  const t = useMessages(L)

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Seo
        title={t.seoTitle}
        description={t.seoDescription}
        path="/guide-accessibilite"
        localized
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: t.jsonLdHeadline,
            inLanguage: t.locale,
            author: { '@type': 'Organization', name: 'Konforme' },
            publisher: { '@type': 'Organization', name: 'KAYZEN' },
          },
        ]}
      />

      <p className="text-xs font-semibold uppercase tracking-wider text-link mb-3">{t.kicker}</p>
      <h1 className="text-4xl font-extrabold tracking-tight mb-6">
        {t.h1}
      </h1>
      <p className="text-lg text-text-muted leading-relaxed mb-4">
        {t.leadA}<strong className="text-text">{t.leadS1}</strong>{t.leadB}
        <strong className="text-text">{t.leadS2}</strong>{t.leadC}
        <strong className="text-text">{t.leadS3}</strong>{t.leadD}
        <strong className="text-text">{t.leadS4}</strong>{t.leadE}
        <strong className="text-text">{t.leadS5}</strong>{t.leadF}
      </p>
      <p className="text-text-muted leading-relaxed mb-10">
        {t.introA}<strong className="text-text">{t.introS1}</strong>{t.introB}
        <strong className="text-text">{t.introS2}</strong>{t.introC}
        <em>{t.introEm}</em>{t.introD}
      </p>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="pourquoi-title">
        <h2 id="pourquoi-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.whyTitle}
        </h2>
        <p className="text-text-soft leading-relaxed mb-3">
          {t.whyA}<strong className="text-text">{t.whyS}</strong>{t.whyB}
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="concernes-title">
        <h2 id="concernes-title" className="text-2xl font-bold tracking-tight mb-4">{t.whoTitle}</h2>
        <ul className="space-y-2.5 text-text-soft leading-relaxed list-disc pl-5">
          {t.who.map((item) => (
            <li key={item.b}>
              {item.a}<strong className="text-text">{item.b}</strong>{item.c}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="dates-title">
        <h2 id="dates-title" className="text-2xl font-bold tracking-tight mb-4">{t.deadlinesTitle}</h2>
        <ol className="space-y-3">
          {t.deadlines.map((d) => (
            <li key={d.date} className="flex gap-4 rounded-[12px] border border-border px-4 py-3">
              <span className="shrink-0 w-32 font-bold text-link">{d.date}</span>
              <span className="text-text-soft text-sm leading-relaxed">{d.label}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="sanctions-title">
        <h2 id="sanctions-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.sanctionsTitle}
        </h2>
        <p className="text-text-soft leading-relaxed mb-4">
          {t.sanctionsIntroA}<strong className="text-text">{t.sanctionsIntroS}</strong>{t.sanctionsIntroB}
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {t.sanctions.map((s) => (
            <li key={s.amount} className="rounded-[12px] border border-danger/30 bg-danger-bg/20 px-4 py-3">
              <span className="block text-xl font-extrabold text-danger-soft">{s.amount}</span>
              <span className="text-sm text-text-soft leading-relaxed">{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="auditeurs-title">
        <h2 id="auditeurs-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.auditorsTitle}
        </h2>
        <p className="text-text-soft leading-relaxed mb-3">
          {t.auditorsP1A}<strong className="text-text">{t.auditorsP1S}</strong>{t.auditorsP1B}
        </p>
        <p className="text-text-soft leading-relaxed mb-3">
          {t.auditorsP2A}<strong className="text-text">{t.auditorsP2S}</strong>{t.auditorsP2B}
        </p>
        <ul className="space-y-2.5 text-text-soft leading-relaxed list-disc pl-5">
          {t.certifications.map((c) => (
            <li key={c.b}>
              <strong className="text-text">{c.b}</strong>{c.t}
              {c.em ? <em>{c.em}</em> : null}{c.t2}
            </li>
          ))}
        </ul>
        <p className="text-text-soft leading-relaxed mt-3">
          {t.auditorsOutro}
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="methode-title">
        <h2 id="methode-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.methodTitle}
        </h2>
        <p className="text-text-soft leading-relaxed mb-3">
          {t.methodP1A}
          <a href={RGAA_METHOD_URL} target="_blank" rel="noreferrer" className="underline text-link hover:text-white">
            {t.methodLink}
          </a>
          {t.methodP1B}
        </p>
        <ul className="space-y-2.5 text-text-soft leading-relaxed list-disc pl-5 mb-5">
          <li>
            {t.rule1A}<strong className="text-text">{t.rule1S1}</strong>{t.rule1B}
            <strong className="text-text">{t.rule1S2}</strong>{t.rule1C}
            <strong className="text-text">{t.rule1S3}</strong>{t.rule1D}
          </li>
          <li>
            {t.rule2A}<strong className="text-text">{t.rule2S}</strong>{t.rule2B}
          </li>
          <li>
            {t.rule3A}
            <Link to={localizePath(lang, '/glossaire')} className="underline text-link hover:text-white">
              {t.rule3Link}
            </Link>
            {t.rule3B}
          </li>
        </ul>
        <h3 className="text-lg font-bold tracking-tight mb-2">{t.testEnvTitle}</h3>
        <p className="text-text-soft leading-relaxed mb-3">
          {t.testEnvA}
          <a href={RGAA_TEST_ENV_URL} target="_blank" rel="noreferrer" className="underline text-link hover:text-white">
            {t.testEnvLink}
          </a>
          {t.testEnvB}
        </p>
        <div className="overflow-x-auto rounded-[14px] border border-border mb-4">
          <table className="w-full text-sm">
            <caption className="sr-only">{t.testEnvCaption}</caption>
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">{t.colPlatform}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{t.colAt}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{t.colBrowser}</th>
              </tr>
            </thead>
            <tbody>
              {t.testEnvRows.map((e) => (
                <tr key={`${e.platform}-${e.at}`} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 text-text-soft">{e.platform}</td>
                  <td className="px-4 py-2.5 text-text-soft">{e.at}</td>
                  <td className="px-4 py-2.5 text-text-soft">{e.browser}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-text-dim">
          {t.v5A}<strong className="text-text-soft">{t.v5S}</strong>{t.v5B}
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="criteres-title">
        <h2 id="criteres-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.criteriaTitle}
        </h2>
        <p className="text-text-soft leading-relaxed mb-6">
          {t.criteriaIntroA}<strong className="text-text">{t.criteriaIntroS}</strong>{t.criteriaIntroB}
        </p>
        <div className="space-y-8">
          {RGAA_TOPICS.map((topic) => {
            const tl = localizeTopic(lang, topic)
            return (
              <article key={topic.id} aria-labelledby={`guide-topic-${topic.id}`}>
                <h3 id={`guide-topic-${topic.id}`} className="text-xl font-bold tracking-tight mb-1">
                  {topic.id}. {tl.name}
                </h3>
                <p className="text-sm text-text-dim mb-3">{tl.description}</p>
                <ul className="space-y-2">
                  {RGAA_CRITERIA.filter((c) => c.topic === topic.id).map((c) => {
                    const cl = localizeCriterion(lang, c)
                    return (
                      <li key={c.id} className="rounded-[12px] border border-border px-4 py-3">
                        <p className="text-sm font-semibold text-text">
                          <span className="text-link tabular-nums">{c.id}</span> — {cl.title}
                        </p>
                        <p className="mt-1 text-sm text-text-soft leading-relaxed">{cl.plain}</p>
                        <p className="mt-1.5 text-xs text-text-dim">
                          {t.levelLabel} {c.level} · WCAG {c.wcag.join(', ')} · {t.coverage[c.coverage]} ·{' '}
                          <Link to={localizePath(lang, `/rgaa/critere/${c.id}`)} className="underline text-link hover:text-white">
                            {t.detailLink}
                          </Link>{' '}
                          ·{' '}
                          <a
                            href={rgaaCriterionUrl(c.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="underline text-link hover:text-white"
                          >
                            {t.officialLink}
                          </a>
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </article>
            )
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="pros-title">
        <h2 id="pros-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.stepsTitle}
        </h2>
        <ol className="space-y-3">
          {t.steps.map((s) => (
            <li key={s.title} className="rounded-[12px] border border-border px-4 py-3.5">
              <h3 className="font-bold text-text mb-1">{s.title}</h3>
              <p className="text-sm text-text-soft leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="declaration-title">
        <h2 id="declaration-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.declTitle}
        </h2>
        <p className="text-text-soft leading-relaxed mb-3">
          {t.declIntro}
        </p>
        <ul className="space-y-2.5 text-text-soft leading-relaxed list-disc pl-5">
          <li>
            {t.decl1A}<strong className="text-text">{t.decl1S}</strong>{t.decl1B}
            <em>{t.decl1Em1}</em>{t.decl1C}<em>{t.decl1Em2}</em>{t.decl1D}
            <em>{t.decl1Em3}</em>{t.decl1E}
          </li>
          <li>{t.decl2A}<strong className="text-text">{t.decl2S}</strong>{t.decl2B}</li>
          <li>{t.decl3A}<strong className="text-text">{t.decl3S}</strong>{t.decl3B}</li>
          <li>{t.decl4A}<strong className="text-text">{t.decl4S}</strong>{t.decl4B}</li>
          <li>{t.decl5}</li>
        </ul>
        <p className="text-text-soft leading-relaxed mt-3">
          {t.declOutro}
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="mb-12" aria-labelledby="users-title">
        <h2 id="users-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.reportTitle}
        </h2>
        <ul className="space-y-2.5 text-text-soft leading-relaxed list-disc pl-5">
          {t.report.map((r) => (
            <li key={r.b}>
              <strong className="text-text">{r.b}</strong>{r.t}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section className="rounded-[16px] border border-border bg-surface px-6 py-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">{t.finalTitle}</h2>
        <p className="text-text-muted leading-relaxed mb-5">
          {t.finalText}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to={localizePath(lang, '/')}>
            <Button variant="primary">{t.finalBtn1}</Button>
          </Link>
          <Link to={localizePath(lang, '/rgaa')}>
            <Button variant="outline">{t.finalBtn2}</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
