import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { ORGANIZATION_JSONLD, Seo, SOFTWARE_JSONLD } from '@/components/Seo'
import { PublicChecker } from '@/components/PublicChecker'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'
import { cn } from '@/lib/utils'

const L = defineMessages({
  fr: {
    seoTitle: 'Konforme — Accessibilité web RGAA & WCAG automatisée',
    seoDesc:
      "Scannez, corrigez et surveillez l'accessibilité de votre site. Audit RGAA 4.1.2 & WCAG 2.2 automatisé, corrections guidées, déclaration légale. EAA 2025 en vigueur.",
    heroWords: ['site vitrine', 'e-commerce', 'application web', 'intranet'],
    heroWordsSr: 'site web',
    heroBefore: "L'accessibilité de votre ",
    heroAfter: 'enfin automatisée',
    badge: 'EAA 2025 · RGAA 4.1.2 · WCAG 2.2',
    heroLead:
      'Une centaine de règles RGAA 4.1.2 / WCAG 2.2 vérifiées automatiquement, chaque correction expliquée, la déclaration légale générée, et vos sites surveillés semaine après semaine.',
    ctaTest: 'Tester mon site gratuitement',
    ctaSignup: 'Créer un compte',
    points: [
      'Conçu pour le RGAA 🇫🇷',
      'Données hébergées en UE',
      'Sans script à installer',
      "Pas d'overlay : de vraies corrections",
    ],
    mockUrl: "konforme — rapport d'audit · votre-site.fr",
    mockSev: { critical: 'Critique', moderate: 'Modéré', minor: 'Mineur' },
    mockDeclaration: "Déclaration d'accessibilité générée",
    mockReady: '✓ prête à publier',
    mockMonitoring: 'Surveillance',
    mockWeekly: '● hebdo active',
    checkerTitle: "Test d'accessibilité gratuit",
    statsLabel: 'Chiffres clés',
    stats: [
      { v: '≈100', l: 'règles vérifiées automatiquement' },
      { v: '~1 min', l: 'par audit multi-pages' },
      { v: '2 référentiels', l: 'RGAA 4.1.2 + WCAG 2.2 AA' },
      { v: 'Hebdo', l: 'surveillance planifiée des sites' },
    ],
    featuresTitle: 'Fonctionnalités',
    features: [
      {
        title: 'Audit RGAA 4.1.2',
        desc: 'Analyse automatisée sur les critères vérifiables par machine du référentiel français.',
      },
      {
        title: 'WCAG 2.2 niveau AA',
        desc: "Conformité internationale, alignée sur l'European Accessibility Act (EAA).",
      },
      {
        title: 'Corrections guidées',
        desc: 'Chaque non-conformité vient avec le code concerné et la correction à appliquer.',
      },
      {
        title: 'Surveillance planifiée',
        desc: 'Vos sites sont re-scannés automatiquement chaque semaine : le score est suivi dans le temps, sans y penser.',
      },
      {
        title: 'Déclaration légale',
        desc: "Génération du document exigé par l'article 47 de la loi française de 2005, prêt à publier.",
      },
      {
        title: 'Rapport multi-pages',
        desc: "Jusqu'à 25 pages analysées par audit (plan Pro), avec le score de chaque page et le détail par sévérité.",
      },
    ],
    howTitle: 'Comment ça marche ?',
    steps: [
      { t: '1. Ajoutez votre site', d: "Entrez l'URL de votre site : aucun code à installer, aucun script à poser." },
      { t: '2. Recevez le rapport', d: 'En ~1 minute, chaque non-conformité est listée avec sa sévérité, le code fautif et la correction.' },
      { t: '3. Publiez votre déclaration', d: "Corrigez, re-scannez, puis générez votre déclaration d'accessibilité prête à mettre en ligne." },
    ],
    faqTitle: 'Questions fréquentes',
    faq: [
      {
        q: "Qu'est-ce que l'European Accessibility Act (EAA) ?",
        a: "L'EAA (directive UE 2019/882) impose depuis le 28 juin 2025 l'accessibilité des produits et services numériques : e-commerce, banques, transports, e-books… En France, elle est transposée dans la loi et expose les entreprises non conformes à des sanctions et à une mise en demeure.",
      },
      {
        q: 'Quelle différence entre RGAA et WCAG ?',
        a: "Les WCAG sont le standard international du W3C. Le RGAA 4.1.2 est la méthode d'application française : 106 critères qui traduisent les WCAG en tests concrets, exigés pour le secteur public français et recommandés pour le privé.",
      },
      {
        q: 'Un audit automatique suffit-il pour être conforme ?',
        a: "Non. L'automatisation détecte environ 30 % des critères (images, formulaires, structure, contrastes…). C'est la première étape indispensable : elle élimine la majorité des blocages réels. Pour une déclaration opposable, complétez avec un audit manuel.",
      },
      {
        q: 'Combien de temps prend un audit Konforme ?',
        a: "Environ une minute pour un site classique : la plateforme analyse jusqu'à 25 pages (selon votre plan) avec une centaine de règles, et vous rend un rapport détaillé avec un score de conformité RGAA et WCAG pondéré par sévérité.",
      },
      {
        q: 'Konforme est-il un « overlay » d’accessibilité ?',
        a: "Non. Les overlays (widgets qui prétendent rendre un site accessible en un clic) sont critiqués par la communauté et ne rendent pas conforme. Konforme identifie les problèmes à la source et vous guide pour les corriger réellement dans votre code.",
      },
    ],
    trustTitle: 'Qui sommes-nous',
    trustHeadline: "Conçu et opéré à Lyon par l'agence Kayzen",
    trustBody:
      "Konforme est développé en France, les données sont hébergées dans l'Union européenne (Francfort), et l'audit manuel de l'offre Accompagné est réalisé par nos experts. Pas d'overlay, pas de boîte noire : de vraies corrections dans votre code.",
    trustCta: 'En savoir plus',
    finalTitle: "Prêt pour l'European Accessibility Act ?",
    finalBody:
      'Depuis juin 2025, les sites e-commerce et services numériques européens doivent être accessibles. Konforme identifie vos non-conformités dès aujourd’hui.',
    finalCta: 'Lancer un audit gratuit',
  },
  en: {
    seoTitle: 'Konforme — Automated RGAA & WCAG web accessibility',
    seoDesc:
      'Scan, fix and monitor your website’s accessibility. Automated RGAA 4.1.2 & WCAG 2.2 audit, guided fixes, legal accessibility statement. The EAA has applied since 2025.',
    heroWords: ['showcase site', 'e-commerce', 'web app', 'intranet'],
    heroWordsSr: 'website',
    heroBefore: 'Accessibility for your ',
    heroAfter: 'finally automated',
    badge: 'EAA 2025 · RGAA 4.1.2 · WCAG 2.2',
    heroLead:
      'Around a hundred RGAA 4.1.2 / WCAG 2.2 rules checked automatically, every fix explained, the legal accessibility statement generated, and your sites monitored week after week.',
    ctaTest: 'Test my website for free',
    ctaSignup: 'Create an account',
    points: [
      'Built for the RGAA 🇫🇷',
      'Data hosted in the EU',
      'No script to install',
      'No overlay: real fixes',
    ],
    mockUrl: 'konforme — audit report · your-website.com',
    mockSev: { critical: 'Critical', moderate: 'Moderate', minor: 'Minor' },
    mockDeclaration: 'Accessibility statement generated',
    mockReady: '✓ ready to publish',
    mockMonitoring: 'Monitoring',
    mockWeekly: '● weekly active',
    checkerTitle: 'Free accessibility test',
    statsLabel: 'Key figures',
    stats: [
      { v: '≈100', l: 'rules checked automatically' },
      { v: '~1 min', l: 'per multi-page audit' },
      { v: '2 standards', l: 'RGAA 4.1.2 + WCAG 2.2 AA' },
      { v: 'Weekly', l: 'scheduled monitoring of your sites' },
    ],
    featuresTitle: 'Features',
    features: [
      {
        title: 'RGAA 4.1.2 audit',
        desc: 'Automated analysis of the machine-testable criteria of the French accessibility framework.',
      },
      {
        title: 'WCAG 2.2 level AA',
        desc: 'International compliance, aligned with the European Accessibility Act (EAA).',
      },
      {
        title: 'Guided fixes',
        desc: 'Every non-compliance comes with the code involved and the fix to apply.',
      },
      {
        title: 'Scheduled monitoring',
        desc: 'Your sites are re-scanned automatically every week: the score is tracked over time, without you thinking about it.',
      },
      {
        title: 'Legal statement',
        desc: 'Generation of the document required by article 47 of the French 2005 act, ready to publish.',
      },
      {
        title: 'Multi-page report',
        desc: 'Up to 25 pages analysed per audit (Pro plan), with the score of each page and the breakdown by severity.',
      },
    ],
    howTitle: 'How does it work?',
    steps: [
      { t: '1. Add your website', d: 'Enter your website URL: no code to install, no script to add.' },
      { t: '2. Get the report', d: 'In about a minute, every non-compliance is listed with its severity, the offending code and the fix.' },
      { t: '3. Publish your statement', d: 'Fix, re-scan, then generate your accessibility statement, ready to go online.' },
    ],
    faqTitle: 'Frequently asked questions',
    faq: [
      {
        q: 'What is the European Accessibility Act (EAA)?',
        a: 'The EAA (EU Directive 2019/882) has required digital products and services to be accessible since 28 June 2025: e-commerce, banking, transport, e-books and more. In France it is transposed into national law and exposes non-compliant companies to formal notices and penalties.',
      },
      {
        q: 'What is the difference between RGAA and WCAG?',
        a: 'WCAG is the international W3C standard. RGAA 4.1.2 is the French application method: 106 criteria that turn WCAG into concrete tests, mandatory for the French public sector and recommended for private companies.',
      },
      {
        q: 'Is an automated audit enough to be compliant?',
        a: 'No. Automation detects around 30% of the criteria (images, forms, structure, contrast, etc.). It is the essential first step: it removes the majority of real-world blockers. For a legally defensible statement, complete it with a manual audit.',
      },
      {
        q: 'How long does a Konforme audit take?',
        a: 'About a minute for a typical website: the platform analyses up to 25 pages (depending on your plan) with around a hundred rules, and returns a detailed report with an RGAA and WCAG compliance score weighted by severity.',
      },
      {
        q: 'Is Konforme an accessibility “overlay”?',
        a: 'No. Overlays (widgets that claim to make a site accessible in one click) are criticised by the accessibility community and do not make a site compliant. Konforme identifies problems at the source and guides you to fix them for real in your code.',
      },
    ],
    trustTitle: 'Who we are',
    trustHeadline: 'Designed and operated in Lyon by the Kayzen agency',
    trustBody:
      'Konforme is developed in France, the data is hosted in the European Union (Frankfurt), and the manual audit of the Guided plan is carried out by our experts. No overlay, no black box: real fixes in your code.',
    trustCta: 'Learn more',
    finalTitle: 'Ready for the European Accessibility Act?',
    finalBody:
      'Since June 2025, European e-commerce websites and digital services must be accessible. Konforme identifies your non-compliances today.',
    finalCta: 'Start a free audit',
  },
  de: {
    seoTitle: 'Konforme — Automatisierte Barrierefreiheit nach RGAA & WCAG',
    seoDesc:
      'Prüfen, beheben und überwachen Sie die Barrierefreiheit Ihrer Website. Automatisiertes RGAA 4.1.2- und WCAG 2.2-Audit, geführte Korrekturen, rechtliche Erklärung. Der EAA gilt seit 2025.',
    heroWords: ['Ihre Website', 'Ihren Onlineshop', 'Ihre Web-App', 'Ihr Intranet'],
    heroWordsSr: 'Website',
    heroBefore: 'Barrierefreiheit für ',
    heroAfter: 'endlich automatisiert',
    badge: 'EAA 2025 · RGAA 4.1.2 · WCAG 2.2',
    heroLead:
      'Rund hundert RGAA 4.1.2 / WCAG 2.2 Regeln werden automatisch geprüft, jede Korrektur wird erklärt, die rechtlich geforderte Erklärung wird erzeugt, und Ihre Websites werden Woche für Woche überwacht.',
    ctaTest: 'Meine Website kostenlos testen',
    ctaSignup: 'Konto erstellen',
    points: [
      'Für den RGAA entwickelt 🇫🇷',
      'Daten in der EU gehostet',
      'Kein Skript zu installieren',
      'Kein Overlay: echte Korrekturen',
    ],
    mockUrl: 'konforme — Auditbericht · ihre-website.de',
    mockSev: { critical: 'Kritisch', moderate: 'Mittel', minor: 'Gering' },
    mockDeclaration: 'Erklärung zur Barrierefreiheit erzeugt',
    mockReady: '✓ bereit zur Veröffentlichung',
    mockMonitoring: 'Überwachung',
    mockWeekly: '● wöchentlich aktiv',
    checkerTitle: 'Kostenloser Test der Barrierefreiheit',
    statsLabel: 'Kennzahlen',
    stats: [
      { v: '≈100', l: 'automatisch geprüfte Regeln' },
      { v: '~1 Min.', l: 'pro Audit mehrerer Seiten' },
      { v: '2 Standards', l: 'RGAA 4.1.2 + WCAG 2.2 AA' },
      { v: 'Wöchentlich', l: 'geplante Überwachung der Websites' },
    ],
    featuresTitle: 'Funktionen',
    features: [
      {
        title: 'RGAA 4.1.2-Audit',
        desc: 'Automatisierte Analyse der maschinell prüfbaren Kriterien des französischen Referenzrahmens.',
      },
      {
        title: 'WCAG 2.2 Stufe AA',
        desc: 'Internationale Konformität, abgestimmt auf den European Accessibility Act (EAA).',
      },
      {
        title: 'Geführte Korrekturen',
        desc: 'Zu jeder Abweichung erhalten Sie den betroffenen Code und die anzuwendende Korrektur.',
      },
      {
        title: 'Geplante Überwachung',
        desc: 'Ihre Websites werden jede Woche automatisch erneut geprüft: Der Score wird im Zeitverlauf verfolgt, ganz ohne Ihr Zutun.',
      },
      {
        title: 'Rechtliche Erklärung',
        desc: 'Erzeugung des nach Artikel 47 des französischen Gesetzes von 2005 geforderten Dokuments, bereit zur Veröffentlichung.',
      },
      {
        title: 'Bericht über mehrere Seiten',
        desc: 'Bis zu 25 Seiten pro Audit (Pro-Tarif), mit dem Score jeder Seite und der Aufschlüsselung nach Schweregrad.',
      },
    ],
    howTitle: 'Wie funktioniert es?',
    steps: [
      { t: '1. Website hinzufügen', d: 'Geben Sie die URL Ihrer Website ein: kein Code zu installieren, kein Skript einzubinden.' },
      { t: '2. Bericht erhalten', d: 'In etwa einer Minute wird jede Abweichung mit Schweregrad, fehlerhaftem Code und Korrektur aufgeführt.' },
      { t: '3. Erklärung veröffentlichen', d: 'Korrigieren, erneut prüfen und anschließend Ihre Erklärung zur Barrierefreiheit erzeugen — bereit für die Veröffentlichung.' },
    ],
    faqTitle: 'Häufige Fragen',
    faq: [
      {
        q: 'Was ist der European Accessibility Act (EAA)?',
        a: 'Der EAA (EU-Richtlinie 2019/882) verlangt seit dem 28. Juni 2025 die Barrierefreiheit digitaler Produkte und Dienstleistungen: E-Commerce, Banken, Verkehr, E-Books und mehr. In Frankreich ist er in nationales Recht umgesetzt und setzt nicht konforme Unternehmen Aufforderungen und Sanktionen aus.',
      },
      {
        q: 'Worin unterscheiden sich RGAA und WCAG?',
        a: 'Die WCAG sind der internationale Standard des W3C. Der RGAA 4.1.2 ist die französische Anwendungsmethode: 106 Kriterien, die die WCAG in konkrete Tests übersetzen — verpflichtend für den französischen öffentlichen Sektor und für die Privatwirtschaft empfohlen.',
      },
      {
        q: 'Reicht ein automatisiertes Audit für die Konformität aus?',
        a: 'Nein. Die Automatisierung erkennt rund 30 % der Kriterien (Bilder, Formulare, Struktur, Kontraste …). Sie ist der unverzichtbare erste Schritt und beseitigt die meisten realen Hürden. Für eine rechtlich belastbare Erklärung ergänzen Sie sie durch ein manuelles Audit.',
      },
      {
        q: 'Wie lange dauert ein Konforme-Audit?',
        a: 'Etwa eine Minute für eine übliche Website: Die Plattform analysiert bis zu 25 Seiten (je nach Tarif) mit rund hundert Regeln und liefert Ihnen einen detaillierten Bericht mit einem nach Schweregrad gewichteten RGAA- und WCAG-Konformitätsscore.',
      },
      {
        q: 'Ist Konforme ein Barrierefreiheits-„Overlay“?',
        a: 'Nein. Overlays (Widgets, die vorgeben, eine Website per Klick barrierefrei zu machen) werden von der Fachwelt kritisiert und stellen keine Konformität her. Konforme erkennt die Probleme an der Quelle und führt Sie dazu, sie wirklich in Ihrem Code zu beheben.',
      },
    ],
    trustTitle: 'Wer wir sind',
    trustHeadline: 'In Lyon von der Agentur Kayzen entwickelt und betrieben',
    trustBody:
      'Konforme wird in Frankreich entwickelt, die Daten werden in der Europäischen Union (Frankfurt) gehostet, und das manuelle Audit des Begleitangebots führen unsere Fachleute durch. Kein Overlay, keine Blackbox: echte Korrekturen in Ihrem Code.',
    trustCta: 'Mehr erfahren',
    finalTitle: 'Sind Sie bereit für den European Accessibility Act?',
    finalBody:
      'Seit Juni 2025 müssen europäische E-Commerce-Websites und digitale Dienste barrierefrei sein. Konforme zeigt Ihnen Ihre Abweichungen schon heute.',
    finalCta: 'Kostenloses Audit starten',
  },
  es: {
    seoTitle: 'Konforme — Accesibilidad web RGAA y WCAG automatizada',
    seoDesc:
      'Analice, corrija y supervise la accesibilidad de su sitio web. Auditoría RGAA 4.1.2 y WCAG 2.2 automatizada, correcciones guiadas, declaración legal. La EAA se aplica desde 2025.',
    heroWords: ['sitio corporativo', 'e-commerce', 'aplicación web', 'intranet'],
    heroWordsSr: 'sitio web',
    heroBefore: 'La accesibilidad de su ',
    heroAfter: 'por fin automatizada',
    badge: 'EAA 2025 · RGAA 4.1.2 · WCAG 2.2',
    heroLead:
      'Un centenar de reglas RGAA 4.1.2 / WCAG 2.2 verificadas automáticamente, cada corrección explicada, la declaración legal generada y sus sitios supervisados semana tras semana.',
    ctaTest: 'Probar mi sitio gratis',
    ctaSignup: 'Crear una cuenta',
    points: [
      'Diseñado para el RGAA 🇫🇷',
      'Datos alojados en la UE',
      'Sin script que instalar',
      'Sin overlay: correcciones reales',
    ],
    mockUrl: 'konforme — informe de auditoría · su-sitio.es',
    mockSev: { critical: 'Crítico', moderate: 'Moderado', minor: 'Leve' },
    mockDeclaration: 'Declaración de accesibilidad generada',
    mockReady: '✓ lista para publicar',
    mockMonitoring: 'Supervisión',
    mockWeekly: '● semanal activa',
    checkerTitle: 'Test de accesibilidad gratuito',
    statsLabel: 'Cifras clave',
    stats: [
      { v: '≈100', l: 'reglas verificadas automáticamente' },
      { v: '~1 min', l: 'por auditoría de varias páginas' },
      { v: '2 referenciales', l: 'RGAA 4.1.2 + WCAG 2.2 AA' },
      { v: 'Semanal', l: 'supervisión programada de los sitios' },
    ],
    featuresTitle: 'Funcionalidades',
    features: [
      {
        title: 'Auditoría RGAA 4.1.2',
        desc: 'Análisis automatizado de los criterios verificables por máquina del referencial francés.',
      },
      {
        title: 'WCAG 2.2 nivel AA',
        desc: 'Conformidad internacional, alineada con la European Accessibility Act (EAA).',
      },
      {
        title: 'Correcciones guiadas',
        desc: 'Cada incumplimiento incluye el código afectado y la corrección que debe aplicar.',
      },
      {
        title: 'Supervisión programada',
        desc: 'Sus sitios se vuelven a analizar automáticamente cada semana: la puntuación se sigue en el tiempo, sin que tenga que ocuparse.',
      },
      {
        title: 'Declaración legal',
        desc: 'Generación del documento exigido por el artículo 47 de la ley francesa de 2005, listo para publicar.',
      },
      {
        title: 'Informe de varias páginas',
        desc: 'Hasta 25 páginas analizadas por auditoría (plan Pro), con la puntuación de cada página y el detalle por gravedad.',
      },
    ],
    howTitle: '¿Cómo funciona?',
    steps: [
      { t: '1. Añada su sitio', d: 'Introduzca la URL de su sitio: ningún código que instalar, ningún script que añadir.' },
      { t: '2. Reciba el informe', d: 'En ~1 minuto, cada incumplimiento aparece con su gravedad, el código erróneo y la corrección.' },
      { t: '3. Publique su declaración', d: 'Corrija, vuelva a analizar y genere su declaración de accesibilidad lista para publicar.' },
    ],
    faqTitle: 'Preguntas frecuentes',
    faq: [
      {
        q: '¿Qué es la European Accessibility Act (EAA)?',
        a: 'La EAA (directiva UE 2019/882) exige desde el 28 de junio de 2025 la accesibilidad de los productos y servicios digitales: e-commerce, bancos, transportes, libros electrónicos… En Francia está transpuesta a la legislación nacional y expone a las empresas no conformes a requerimientos y sanciones.',
      },
      {
        q: '¿Qué diferencia hay entre RGAA y WCAG?',
        a: 'Las WCAG son el estándar internacional del W3C. El RGAA 4.1.2 es el método de aplicación francés: 106 criterios que traducen las WCAG en pruebas concretas, obligatorios para el sector público francés y recomendados para el privado.',
      },
      {
        q: '¿Basta una auditoría automática para ser conforme?',
        a: 'No. La automatización detecta alrededor del 30 % de los criterios (imágenes, formularios, estructura, contrastes…). Es la primera etapa imprescindible: elimina la mayoría de los bloqueos reales. Para una declaración con valor jurídico, compleméntela con una auditoría manual.',
      },
      {
        q: '¿Cuánto tiempo lleva una auditoría Konforme?',
        a: 'Alrededor de un minuto para un sitio habitual: la plataforma analiza hasta 25 páginas (según su plan) con un centenar de reglas y le entrega un informe detallado con una puntuación de conformidad RGAA y WCAG ponderada por gravedad.',
      },
      {
        q: '¿Konforme es un «overlay» de accesibilidad?',
        a: 'No. Los overlays (widgets que pretenden hacer accesible un sitio con un clic) son criticados por la comunidad y no aportan conformidad. Konforme identifica los problemas en su origen y le guía para corregirlos realmente en su código.',
      },
    ],
    trustTitle: 'Quiénes somos',
    trustHeadline: 'Diseñado y operado en Lyon por la agencia Kayzen',
    trustBody:
      'Konforme se desarrolla en Francia, los datos se alojan en la Unión Europea (Fráncfort) y la auditoría manual de la oferta Acompañado la realizan nuestros expertos. Sin overlay, sin caja negra: correcciones reales en su código.',
    trustCta: 'Saber más',
    finalTitle: '¿Preparado para la European Accessibility Act?',
    finalBody:
      'Desde junio de 2025, los sitios de comercio electrónico y los servicios digitales europeos deben ser accesibles. Konforme identifica sus incumplimientos hoy mismo.',
    finalCta: 'Lanzar una auditoría gratuita',
  },
  it: {
    seoTitle: 'Konforme — Accessibilità web RGAA e WCAG automatizzata',
    seoDesc:
      'Analizzi, corregga e monitori l’accessibilità del suo sito. Audit RGAA 4.1.2 e WCAG 2.2 automatizzato, correzioni guidate, dichiarazione legale. L’EAA è in vigore dal 2025.',
    heroWords: ['il suo sito vetrina', 'il suo e-commerce', 'la sua applicazione web', 'la sua intranet'],
    heroWordsSr: 'sito web',
    heroBefore: 'Accessibilità per ',
    heroAfter: 'finalmente automatizzata',
    badge: 'EAA 2025 · RGAA 4.1.2 · WCAG 2.2',
    heroLead:
      'Un centinaio di regole RGAA 4.1.2 / WCAG 2.2 verificate automaticamente, ogni correzione spiegata, la dichiarazione legale generata e i suoi siti monitorati settimana dopo settimana.',
    ctaTest: 'Provare gratuitamente il mio sito',
    ctaSignup: 'Creare un account',
    points: [
      'Progettato per il RGAA 🇫🇷',
      'Dati ospitati nell’UE',
      'Nessuno script da installare',
      'Nessun overlay: correzioni reali',
    ],
    mockUrl: 'konforme — rapporto di audit · il-suo-sito.it',
    mockSev: { critical: 'Critico', moderate: 'Moderato', minor: 'Minore' },
    mockDeclaration: 'Dichiarazione di accessibilità generata',
    mockReady: '✓ pronta da pubblicare',
    mockMonitoring: 'Monitoraggio',
    mockWeekly: '● settimanale attivo',
    checkerTitle: 'Test di accessibilità gratuito',
    statsLabel: 'Cifre chiave',
    stats: [
      { v: '≈100', l: 'regole verificate automaticamente' },
      { v: '~1 min', l: 'per audit su più pagine' },
      { v: '2 riferimenti', l: 'RGAA 4.1.2 + WCAG 2.2 AA' },
      { v: 'Settimanale', l: 'monitoraggio programmato dei siti' },
    ],
    featuresTitle: 'Funzionalità',
    features: [
      {
        title: 'Audit RGAA 4.1.2',
        desc: 'Analisi automatizzata dei criteri verificabili in modo automatico del riferimento francese.',
      },
      {
        title: 'WCAG 2.2 livello AA',
        desc: 'Conformità internazionale, allineata all’European Accessibility Act (EAA).',
      },
      {
        title: 'Correzioni guidate',
        desc: 'Ogni non conformità è accompagnata dal codice interessato e dalla correzione da applicare.',
      },
      {
        title: 'Monitoraggio programmato',
        desc: 'I suoi siti vengono rianalizzati automaticamente ogni settimana: il punteggio è seguito nel tempo, senza doverci pensare.',
      },
      {
        title: 'Dichiarazione legale',
        desc: 'Generazione del documento richiesto dall’articolo 47 della legge francese del 2005, pronto da pubblicare.',
      },
      {
        title: 'Rapporto su più pagine',
        desc: 'Fino a 25 pagine analizzate per audit (piano Pro), con il punteggio di ogni pagina e il dettaglio per gravità.',
      },
    ],
    howTitle: 'Come funziona?',
    steps: [
      { t: '1. Aggiunga il suo sito', d: 'Inserisca l’URL del suo sito: nessun codice da installare, nessuno script da aggiungere.' },
      { t: '2. Riceva il rapporto', d: 'In circa un minuto ogni non conformità è elencata con la sua gravità, il codice errato e la correzione.' },
      { t: '3. Pubblichi la sua dichiarazione', d: 'Corregga, rianalizzi e generi la sua dichiarazione di accessibilità pronta per la pubblicazione.' },
    ],
    faqTitle: 'Domande frequenti',
    faq: [
      {
        q: 'Che cos’è l’European Accessibility Act (EAA)?',
        a: 'L’EAA (direttiva UE 2019/882) impone dal 28 giugno 2025 l’accessibilità dei prodotti e servizi digitali: e-commerce, banche, trasporti, e-book… In Francia è recepito nella legge nazionale ed espone le imprese non conformi a diffide e sanzioni.',
      },
      {
        q: 'Qual è la differenza tra RGAA e WCAG?',
        a: 'Le WCAG sono lo standard internazionale del W3C. Il RGAA 4.1.2 è il metodo di applicazione francese: 106 criteri che traducono le WCAG in test concreti, obbligatori per il settore pubblico francese e raccomandati per il privato.',
      },
      {
        q: 'Un audit automatico è sufficiente per essere conformi?',
        a: 'No. L’automazione rileva circa il 30 % dei criteri (immagini, moduli, struttura, contrasti…). È la prima tappa indispensabile: elimina la maggior parte degli ostacoli reali. Per una dichiarazione opponibile, la completi con un audit manuale.',
      },
      {
        q: 'Quanto tempo richiede un audit Konforme?',
        a: 'Circa un minuto per un sito classico: la piattaforma analizza fino a 25 pagine (a seconda del piano) con un centinaio di regole e le restituisce un rapporto dettagliato con un punteggio di conformità RGAA e WCAG ponderato per gravità.',
      },
      {
        q: 'Konforme è un «overlay» di accessibilità?',
        a: 'No. Gli overlay (widget che pretendono di rendere accessibile un sito con un clic) sono criticati dalla comunità e non producono conformità. Konforme individua i problemi all’origine e la guida a correggerli davvero nel suo codice.',
      },
    ],
    trustTitle: 'Chi siamo',
    trustHeadline: 'Progettato e gestito a Lione dall’agenzia Kayzen',
    trustBody:
      'Konforme è sviluppato in Francia, i dati sono ospitati nell’Unione europea (Francoforte) e l’audit manuale dell’offerta Assistita è svolto dai nostri esperti. Nessun overlay, nessuna scatola nera: correzioni reali nel suo codice.',
    trustCta: 'Scopri di più',
    finalTitle: 'Pronto per l’European Accessibility Act?',
    finalBody:
      'Da giugno 2025 i siti e-commerce e i servizi digitali europei devono essere accessibili. Konforme individua le sue non conformità già da oggi.',
    finalCta: 'Avviare un audit gratuito',
  },
})

function AnimatedWord() {
  const t = useMessages(L)
  const [i, setI] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setI((v) => (v + 1) % 4), 2400)
    return () => clearInterval(id)
  }, [])
  return (
    <>
      <span className="sr-only">{t.heroWordsSr}</span>
      <span aria-hidden="true" className="inline-block min-w-[7ch] underline decoration-primary decoration-[0.08em] underline-offset-[0.12em]">
        {t.heroWords[i % t.heroWords.length]}
      </span>
    </>
  )
}

/** Aperçu stylisé (décoratif) d'un rapport Konforme, en pur CSS/SVG. */
function ProductMockup() {
  const t = useMessages(L)
  const ring = (pct: number, color: string, size = 84) => {
    const stroke = size / 11
    const r = (size - stroke) / 2
    const c = 2 * Math.PI * r
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${(pct / 100) * c} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="var(--color-text)" fontSize={size / 4} fontWeight="800">
          {pct}%
        </text>
      </svg>
    )
  }
  return (
    <div aria-hidden="true" className="relative select-none">
      <div className="rounded-[24px] border border-border bg-surface shadow-card overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-5 py-3">
          <span className="size-2.5 rounded-full bg-border-strong/50" />
          <span className="size-2.5 rounded-full bg-border-strong/50" />
          <span className="size-2.5 rounded-full bg-border-strong/50" />
          <span className="ml-3 flex-1 truncate rounded-full bg-surface px-3 py-1 text-[0.65rem] text-text-dim">
            {t.mockUrl}
          </span>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            {ring(87, 'var(--color-success)')}
            <div className="flex-1 space-y-2">
              <div className="h-2.5 w-2/3 rounded bg-border" />
              <div className="h-2 w-1/2 rounded bg-border" />
              <div className="flex gap-2 pt-1">
                <span className="rounded-full bg-success-bg/70 px-2 py-0.5 text-[0.6rem] font-bold text-success-soft">RGAA 85%</span>
                <span className="rounded-full bg-success-bg/70 px-2 py-0.5 text-[0.6rem] font-bold text-success-soft">WCAG 92%</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { c: 'bg-danger-bg/70 text-danger-soft', label: t.mockSev.critical, w: 'w-3/4' },
              { c: 'bg-warning-bg/70 text-warning-soft', label: t.mockSev.moderate, w: 'w-2/3' },
              { c: 'bg-info-bg/70 text-info-soft', label: t.mockSev.minor, w: 'w-1/2' },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2.5 rounded-[12px] border border-border px-3 py-2">
                <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold ${row.c}`}>{row.label}</span>
                <span className={`h-2 rounded bg-border ${row.w}`} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-[12px] border border-success/30 bg-success-bg/25 px-3 py-2">
            <span className="text-[0.65rem] font-semibold text-success-soft">{t.mockDeclaration}</span>
            <span className="text-[0.65rem] font-bold text-success">{t.mockReady}</span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-5 rounded-full border border-border bg-surface px-4 py-2.5 shadow-lift">
        <span className="text-[0.65rem] text-text-dim">{t.mockMonitoring}</span>
        <span className="ml-2 text-[0.65rem] font-bold text-success">{t.mockWeekly}</span>
      </div>
    </div>
  )
}

const FEATURE_ICONS = [
  <IconFlag key="flag" />,
  <IconGlobe key="globe" />,
  <IconSparkles key="sparkles" />,
  <IconRadar key="radar" />,
  <IconDocument key="document" />,
  <IconLayers key="layers" />,
]

export function Landing() {
  const location = useLocation()
  const t = useMessages(L)
  const lang = useLang()
  useEffect(() => {
    if (location.hash === '#checker') {
      document.getElementById('checker')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [location.hash])

  const FEATURES = t.features.map((f, i) => ({ ...f, icon: FEATURE_ICONS[i] }))
  const FAQ = t.faq

  return (
    <>
      <Seo
        title={t.seoTitle}
        description={t.seoDesc}
        path="/"
        localized
        jsonLd={[
          ORGANIZATION_JSONLD,
          SOFTWARE_JSONLD,
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map((f) => ({
              '@type': 'Question',
              name: f.q,
              acceptedAnswer: { '@type': 'Answer', text: f.a },
            })),
          },
        ]}
      />

      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-16 md:pt-20 md:pb-24 grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow mb-6">{t.badge}</p>
            <h1 className="text-balance text-[2.5rem] sm:text-5xl md:text-6xl xl:text-[4.25rem] font-extrabold mb-7">
              {t.heroBefore}<AnimatedWord />
              <br />
              <span className="text-primary">{t.heroAfter}</span>
            </h1>
            <p className="text-lg md:text-xl text-text-muted max-w-2xl mb-9 leading-relaxed">
              {t.heroLead}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
              <a href="#checker" className={buttonVariants({ size: 'lg' })}>
                {t.ctaTest}
                <IconArrow />
              </a>
              <Link to="/login" className={buttonVariants({ size: 'lg', variant: 'ghost' })}>
                {t.ctaSignup}
              </Link>
            </div>
            <ul className="flex flex-wrap gap-2">
              {t.points.map((p) => (
                <li key={p} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-text">
                  <CheckDot /> {p}
                </li>
              ))}
            </ul>
          </div>
          <div className="max-w-md w-full mx-auto lg:max-w-none">
            <ProductMockup />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16" aria-labelledby="checker-title">
        <h2 id="checker-title" className="sr-only">{t.checkerTitle}</h2>
        <PublicChecker />
      </section>

      {/* Chiffres clés : bande bleu nuit, comme le bloc de preuves de kayzen-lyon.com */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mb-24" aria-label={t.statsLabel}>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-[24px] bg-white/10 text-center">
          {t.stats.map((s) => (
            <div key={s.l} className="flex flex-col bg-navy px-4 py-8">
              <dt className="order-2 mt-1.5 text-sm text-white/75">{s.l}</dt>
              <dd className="order-1 font-display text-3xl md:text-4xl font-extrabold tracking-[-0.03em] text-white">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-24" aria-labelledby="features-title">
        <div className="mb-12 text-center">
          <p className="eyebrow mb-4">EAA · RGAA · WCAG</p>
          <h2 id="features-title" className="text-3xl md:text-[2.75rem] font-extrabold text-balance">{t.featuresTitle}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-card">
              <CardContent>
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <CardTitle className="mb-2">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-surface-2 py-20 mb-24" aria-labelledby="how-title">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="how-title" className="text-3xl md:text-[2.75rem] font-extrabold text-center mb-12">
            {t.howTitle}
          </h2>
          <ol className="grid gap-6 md:grid-cols-3">
            {t.steps.map((s) => (
              <li key={s.t} className="glass-card p-8">
                <h3 className="text-xl font-bold mb-3">{s.t}</h3>
                <p className="text-text-muted leading-relaxed">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-24" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-3xl md:text-[2.75rem] font-extrabold text-center mb-10">
          {t.faqTitle}
        </h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="group rounded-[16px] border border-border bg-surface px-6 py-1 open:shadow-micro">
              <summary className="cursor-pointer py-4 font-display text-lg font-semibold list-none flex items-center justify-between gap-3 hover:text-primary">
                {f.q}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="pb-4 text-sm text-text-muted leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16" aria-labelledby="trust-title">
        <h2 id="trust-title" className="sr-only">{t.trustTitle}</h2>
        <div className="rounded-[24px] border border-border bg-surface-2 px-6 py-7 md:px-10 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <span aria-hidden="true" className="text-3xl">🇫🇷</span>
          <div className="flex-1">
            <p className="font-display text-lg font-bold">{t.trustHeadline}</p>
            <p className="text-sm text-text-muted mt-1">
              {t.trustBody}
            </p>
          </div>
          <Link to={localizePath(lang, '/a-propos')} className={cn(buttonVariants({ variant: 'ghost' }), 'shrink-0')}>
            {t.trustCta}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-[24px] bg-navy px-6 py-16 md:px-16 text-center">
          <h2 className="text-3xl md:text-[2.75rem] font-extrabold text-balance text-white mb-5">
            {t.finalTitle}
          </h2>
          <p className="text-lg text-white/75 mb-9 max-w-xl mx-auto">
            {t.finalBody}
          </p>
          <Link to="/login" className={buttonVariants({ size: 'lg' })}>
            {t.finalCta}
            <IconArrow />
          </Link>
        </div>
      </section>
    </>
  )
}

/* Icônes SVG inline (stroke currentColor, décoratives) */
function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function CheckDot() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}
function IconFlag() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 22V4a1 1 0 011-1h11l-2 4 2 4H5" />
    </svg>
  )
}
function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
    </svg>
  )
}
function IconSparkles() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 17l.9 2.1L22 20l-2.1.9L19 23l-.9-2.1L16 20l2.1-.9z" />
    </svg>
  )
}
function IconRadar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="2" />
      <path d="M16.24 7.76a6 6 0 010 8.49M7.76 16.24a6 6 0 010-8.49M19.07 4.93a10 10 0 010 14.14M4.93 19.07a10 10 0 010-14.14" />
    </svg>
  )
}
function IconDocument() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  )
}
function IconLayers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l10 6-10 6L2 8z" />
      <path d="M2 14l10 6 10-6" />
    </svg>
  )
}
