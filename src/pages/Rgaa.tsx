import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Seo } from '@/components/Seo'
import { defineMessages, useLang, useMessages } from '@/i18n'
import { localizeTopic } from '@/i18n/rgaa-i18n'
import { RGAA_CRITERIA, RGAA_TOPICS } from '@/lib/rgaa'

const L = defineMessages({
  fr: {
    locale: 'fr-FR',
    seoTitle: 'Guide RGAA 4.1.2 : les 106 critères expliqués',
    seoDescription:
      "Le RGAA 4.1.2 en clair : 13 thématiques, 106 critères, niveaux de conformité, obligations légales françaises et lien avec les WCAG 2.2 et l'EAA.",
    jsonLdHeadline: 'Guide RGAA 4.1.2 : les 106 critères expliqués',
    kicker: 'Guide',
    h1: "RGAA 4.1.2 : le référentiel français d'accessibilité",
    introA: 'Le ',
    introStrong1: "Référentiel Général d'Amélioration de l'Accessibilité",
    introB:
      " (RGAA) est la méthode officielle française pour vérifier qu'un site web respecte les standards internationaux WCAG. Sa version 4.1 compte ",
    introStrong2: '106 critères',
    introC: ' répartis en 13 thématiques, chacun décliné en tests concrets.',
    whoTitle: 'Qui est concerné ?',
    who: [
      { a: 'Les ', b: 'services publics', c: ' et organismes délégataires : obligation RGAA depuis 2019.' },
      { a: 'Les ', b: 'entreprises réalisant plus de 250 M€ de CA', c: ' en France : obligation de déclaration depuis 2020.' },
      {
        a: 'Depuis le ',
        b: '28 juin 2025',
        c: ", l'European Accessibility Act étend l'obligation à la plupart des services numériques grand public : e-commerce, banques, transports, médias, télécoms — y compris les PME (hors micro-entreprises de services).",
      },
    ],
    themesTitle: 'Les 13 thématiques du RGAA',
    tableCaption: 'Les 13 thématiques du RGAA 4.1.2 et leurs critères',
    colNumber: 'N°',
    colTheme: 'Thématique',
    colCriteria: 'Critères',
    colExamples: 'Exemples de points vérifiés',
    examples: [
      'Alternatives textuelles, images décoratives, CAPTCHA',
      'Titre pertinent sur chaque iframe',
      'Contraste 4,5:1, information non portée par la seule couleur',
      'Sous-titres, transcription, audiodescription, contrôle de lecture',
      'En-têtes de colonnes/lignes, résumé des tableaux complexes',
      'Intitulés explicites, liens sans texte',
      "Composants JS compatibles clavier et lecteurs d'écran",
      'Doctype, langue, titre de page, code valide',
      'Titres hiérarchisés, listes, citations',
      'CSS, zoom 200 %, espacement du texte, focus visible',
      "Étiquettes, regroupements, messages d'erreur, aide à la saisie",
      "Liens d'évitement, plan du site, ordre de tabulation, landmarks",
      'Limites de temps, nouvelles fenêtres, documents bureautiques',
    ],
    levelsTitle: 'Les niveaux de conformité',
    levelsIntro:
      "Le taux de conformité RGAA = critères respectés ÷ critères applicables. Trois états sont possibles pour la déclaration d'accessibilité :",
    levelFull: 'Totalement conforme',
    levelFullText: ' : 100 % des critères applicables respectés.',
    levelPartial: 'Partiellement conforme',
    levelPartialText: ' : au moins 50 %.',
    levelNone: 'Non conforme',
    levelNoneText: ' : moins de 50 %, ou aucun audit réalisé.',
    autoTitle: 'Ce que Konforme automatise',
    autoText:
      "Konforme teste automatiquement les critères vérifiables par machine : alternatives des images, étiquettes de formulaires, structure des titres, cadres, tableaux, liens vides, langue du document, zoom bloqué, lecture automatique… Ces contrôles couvrent la majorité des blocages réellement rencontrés par les utilisateurs. Le rapport indique pour chaque non-conformité le critère RGAA/WCAG, l'élément HTML concerné et la correction à appliquer, puis génère votre déclaration d'accessibilité.",
    ctaTitle: 'Testez votre site maintenant',
    ctaText: 'Audit automatisé gratuit, résultat en une minute.',
    ctaButton: 'Lancer un audit gratuit',
  },
  en: {
    locale: 'en',
    seoTitle: 'RGAA 4.1.2 guide: the 106 criteria explained',
    seoDescription:
      'RGAA 4.1.2 in plain language: 13 topics, 106 criteria, conformance levels, French legal obligations and how it relates to WCAG 2.2 and the EAA.',
    jsonLdHeadline: 'RGAA 4.1.2 guide: the 106 criteria explained',
    kicker: 'Guide',
    h1: 'RGAA 4.1.2: the French accessibility framework',
    introA: 'The ',
    introStrong1: "Référentiel Général d'Amélioration de l'Accessibilité",
    introB:
      ' (RGAA), the French general accessibility improvement framework, is the official French method for checking that a website meets the international WCAG standards. Version 4.1 contains ',
    introStrong2: '106 criteria',
    introC: ' spread over 13 topics, each broken down into concrete tests.',
    whoTitle: 'Who is concerned?',
    who: [
      { a: '', b: 'Public-sector bodies', c: ' and their delegated operators: RGAA has been mandatory since 2019.' },
      { a: '', b: 'Companies with more than €250 million in revenue', c: ' in France: publishing an accessibility statement has been mandatory since 2020.' },
      {
        a: 'Since ',
        b: '28 June 2025',
        c: ', the European Accessibility Act has extended the obligation to most consumer-facing digital services: e-commerce, banking, transport, media, telecoms — including SMEs (service micro-enterprises excepted).',
      },
    ],
    themesTitle: 'The 13 RGAA topics',
    tableCaption: 'The 13 topics of RGAA 4.1.2 and their criteria',
    colNumber: 'No.',
    colTheme: 'Topic',
    colCriteria: 'Criteria',
    colExamples: 'Examples of what is checked',
    examples: [
      'Text alternatives, decorative images, CAPTCHA',
      'A relevant title on every iframe',
      'Contrast ratio of 4.5:1, information not conveyed by color alone',
      'Captions, transcript, audio description, playback control',
      'Column and row headers, summary of complex tables',
      'Explicit link labels, links with no text',
      'JavaScript components compatible with keyboards and screen readers',
      'Doctype, language, page title, valid code',
      'Hierarchical headings, lists, quotations',
      'CSS, 200% zoom, text spacing, visible focus',
      'Labels, field groupings, error messages, input assistance',
      'Skip links, site map, tab order, landmarks',
      'Time limits, new windows, office documents',
    ],
    levelsTitle: 'Conformance levels',
    levelsIntro:
      'The RGAA conformance rate = criteria met ÷ applicable criteria. Three states are possible in the accessibility statement:',
    levelFull: 'Fully compliant',
    levelFullText: ': 100% of applicable criteria are met.',
    levelPartial: 'Partially compliant',
    levelPartialText: ': at least 50%.',
    levelNone: 'Non-compliant',
    levelNoneText: ': below 50%, or no audit carried out.',
    autoTitle: 'What Konforme automates',
    autoText:
      'Konforme automatically tests the machine-verifiable criteria: image alternatives, form labels, heading structure, frames, tables, empty links, document language, blocked zoom, autoplay and more. These checks cover most of the barriers users actually run into. For every issue, the report gives the RGAA/WCAG criterion, the HTML element concerned and the fix to apply, then generates your accessibility statement.',
    ctaTitle: 'Test your site now',
    ctaText: 'Free automated audit, results in a minute.',
    ctaButton: 'Run a free audit',
  },
  de: {
    locale: 'de-DE',
    seoTitle: 'RGAA-4.1.2-Leitfaden: die 106 Kriterien erklärt',
    seoDescription:
      'RGAA 4.1.2 verständlich erklärt: 13 Themenbereiche, 106 Kriterien, Konformitätsstufen, französische Rechtspflichten und der Bezug zu WCAG 2.2 und zum EAA.',
    jsonLdHeadline: 'RGAA-4.1.2-Leitfaden: die 106 Kriterien erklärt',
    kicker: 'Leitfaden',
    h1: 'RGAA 4.1.2: das französische Referenzwerk für Barrierefreiheit',
    introA: 'Das ',
    introStrong1: "Référentiel Général d'Amélioration de l'Accessibilité",
    introB:
      ' (RGAA), das französische Referenzwerk zur Verbesserung der Barrierefreiheit, ist die offizielle französische Methode, um zu prüfen, ob eine Website die internationalen WCAG-Standards einhält. Version 4.1 umfasst ',
    introStrong2: '106 Kriterien',
    introC: ', verteilt auf 13 Themenbereiche, die jeweils in konkrete Tests gegliedert sind.',
    whoTitle: 'Wer ist betroffen?',
    who: [
      { a: 'Die ', b: 'öffentlichen Stellen', c: ' und beauftragten Einrichtungen: RGAA-Pflicht seit 2019.' },
      { a: '', b: 'Unternehmen mit mehr als 250 Mio. € Umsatz', c: ' in Frankreich: Pflicht zur Veröffentlichung einer Erklärung seit 2020.' },
      {
        a: 'Seit dem ',
        b: '28. Juni 2025',
        c: ' weitet der European Accessibility Act die Pflicht auf die meisten digitalen Verbraucherdienste aus: E-Commerce, Banken, Verkehr, Medien, Telekommunikation — einschließlich KMU (ausgenommen Kleinstunternehmen im Dienstleistungsbereich).',
      },
    ],
    themesTitle: 'Die 13 Themenbereiche des RGAA',
    tableCaption: 'Die 13 Themenbereiche des RGAA 4.1.2 und ihre Kriterien',
    colNumber: 'Nr.',
    colTheme: 'Themenbereich',
    colCriteria: 'Kriterien',
    colExamples: 'Beispiele für geprüfte Punkte',
    examples: [
      'Textalternativen, dekorative Bilder, CAPTCHA',
      'Aussagekräftiger Titel für jedes iframe',
      'Kontrast 4,5:1, Information nicht allein über Farbe vermittelt',
      'Untertitel, Transkription, Audiodeskription, Wiedergabesteuerung',
      'Spalten- und Zeilenüberschriften, Zusammenfassung komplexer Tabellen',
      'Aussagekräftige Linktexte, Links ohne Text',
      'JavaScript-Komponenten, die mit Tastatur und Screenreadern nutzbar sind',
      'Doctype, Sprache, Seitentitel, valider Code',
      'Hierarchische Überschriften, Listen, Zitate',
      'CSS, 200 % Zoom, Textabstände, sichtbarer Fokus',
      'Beschriftungen, Gruppierungen, Fehlermeldungen, Eingabehilfen',
      'Sprunglinks, Sitemap, Tab-Reihenfolge, Landmarks',
      'Zeitbegrenzungen, neue Fenster, Bürodokumente',
    ],
    levelsTitle: 'Die Konformitätsstufen',
    levelsIntro:
      'Die RGAA-Konformitätsrate = erfüllte Kriterien ÷ anwendbare Kriterien. Für die Barrierefreiheitserklärung sind drei Zustände möglich:',
    levelFull: 'Vollständig konform',
    levelFullText: ': 100 % der anwendbaren Kriterien sind erfüllt.',
    levelPartial: 'Teilweise konform',
    levelPartialText: ': mindestens 50 %.',
    levelNone: 'Nicht konform',
    levelNoneText: ': weniger als 50 % oder kein durchgeführtes Audit.',
    autoTitle: 'Was Konforme automatisiert',
    autoText:
      'Konforme prüft automatisch die maschinell verifizierbaren Kriterien: Bildalternativen, Formularbeschriftungen, Überschriftenstruktur, Rahmen, Tabellen, leere Links, Dokumentsprache, blockierten Zoom, automatische Wiedergabe und mehr. Diese Prüfungen decken die meisten Barrieren ab, auf die Nutzerinnen und Nutzer tatsächlich stoßen. Der Bericht nennt zu jedem Verstoß das RGAA-/WCAG-Kriterium, das betroffene HTML-Element und die anzuwendende Korrektur und erzeugt anschließend Ihre Barrierefreiheitserklärung.',
    ctaTitle: 'Testen Sie Ihre Website jetzt',
    ctaText: 'Kostenloses automatisiertes Audit, Ergebnis in einer Minute.',
    ctaButton: 'Kostenloses Audit starten',
  },
  es: {
    locale: 'es-ES',
    seoTitle: 'Guía del RGAA 4.1.2: los 106 criterios explicados',
    seoDescription:
      'El RGAA 4.1.2 en claro: 13 temáticas, 106 criterios, niveles de conformidad, obligaciones legales francesas y su relación con las WCAG 2.2 y el EAA.',
    jsonLdHeadline: 'Guía del RGAA 4.1.2: los 106 criterios explicados',
    kicker: 'Guía',
    h1: 'RGAA 4.1.2: el referencial francés de accesibilidad',
    introA: 'El ',
    introStrong1: "Référentiel Général d'Amélioration de l'Accessibilité",
    introB:
      ' (RGAA), el referencial general francés de mejora de la accesibilidad, es el método oficial francés para comprobar que un sitio web respeta los estándares internacionales WCAG. Su versión 4.1 consta de ',
    introStrong2: '106 criterios',
    introC: ' repartidos en 13 temáticas, cada uno desglosado en pruebas concretas.',
    whoTitle: '¿A quién afecta?',
    who: [
      { a: 'Los ', b: 'servicios públicos', c: ' y los organismos delegados: obligación del RGAA desde 2019.' },
      { a: 'Las ', b: 'empresas con más de 250 M€ de facturación', c: ' en Francia: obligación de publicar una declaración desde 2020.' },
      {
        a: 'Desde el ',
        b: '28 de junio de 2025',
        c: ', el European Accessibility Act amplía la obligación a la mayoría de los servicios digitales dirigidos al público: comercio electrónico, banca, transporte, medios de comunicación y telecomunicaciones, incluidas las pymes (salvo las microempresas de servicios).',
      },
    ],
    themesTitle: 'Las 13 temáticas del RGAA',
    tableCaption: 'Las 13 temáticas del RGAA 4.1.2 y sus criterios',
    colNumber: 'N.º',
    colTheme: 'Temática',
    colCriteria: 'Criterios',
    colExamples: 'Ejemplos de puntos verificados',
    examples: [
      'Alternativas textuales, imágenes decorativas, CAPTCHA',
      'Título pertinente en cada iframe',
      'Contraste 4,5:1, información que no depende solo del color',
      'Subtítulos, transcripción, audiodescripción, control de reproducción',
      'Encabezados de columnas y filas, resumen de las tablas complejas',
      'Textos de enlace explícitos, enlaces sin texto',
      'Componentes JavaScript compatibles con teclado y lectores de pantalla',
      'Doctype, idioma, título de página, código válido',
      'Títulos jerarquizados, listas, citas',
      'CSS, zoom del 200 %, espaciado del texto, foco visible',
      'Etiquetas, agrupaciones, mensajes de error, ayuda a la introducción de datos',
      'Enlaces de evitación, mapa del sitio, orden de tabulación, landmarks',
      'Límites de tiempo, ventanas nuevas, documentos ofimáticos',
    ],
    levelsTitle: 'Los niveles de conformidad',
    levelsIntro:
      'La tasa de conformidad del RGAA = criterios respetados ÷ criterios aplicables. La declaración de accesibilidad admite tres estados:',
    levelFull: 'Totalmente conforme',
    levelFullText: ': se respeta el 100 % de los criterios aplicables.',
    levelPartial: 'Parcialmente conforme',
    levelPartialText: ': al menos el 50 %.',
    levelNone: 'No conforme',
    levelNoneText: ': menos del 50 % o ninguna auditoría realizada.',
    autoTitle: 'Lo que Konforme automatiza',
    autoText:
      'Konforme comprueba automáticamente los criterios verificables por máquina: alternativas de las imágenes, etiquetas de formulario, estructura de los títulos, marcos, tablas, enlaces vacíos, idioma del documento, zoom bloqueado, reproducción automática… Estos controles cubren la mayoría de las barreras que encuentran realmente las personas usuarias. Para cada incumplimiento, el informe indica el criterio RGAA/WCAG, el elemento HTML afectado y la corrección que debe aplicarse, y después genera su declaración de accesibilidad.',
    ctaTitle: 'Pruebe su sitio ahora',
    ctaText: 'Auditoría automatizada gratuita, resultado en un minuto.',
    ctaButton: 'Lanzar una auditoría gratuita',
  },
  it: {
    locale: 'it-IT',
    seoTitle: 'Guida al RGAA 4.1.2: i 106 criteri spiegati',
    seoDescription:
      'Il RGAA 4.1.2 spiegato con chiarezza: 13 tematiche, 106 criteri, livelli di conformità, obblighi di legge francesi e legame con le WCAG 2.2 e l’EAA.',
    jsonLdHeadline: 'Guida al RGAA 4.1.2: i 106 criteri spiegati',
    kicker: 'Guida',
    h1: 'RGAA 4.1.2: il referenziale francese per l’accessibilità',
    introA: 'Il ',
    introStrong1: "Référentiel Général d'Amélioration de l'Accessibilité",
    introB:
      ' (RGAA), il quadro generale francese per il miglioramento dell’accessibilità, è il metodo ufficiale francese per verificare che un sito web rispetti gli standard internazionali WCAG. La sua versione 4.1 conta ',
    introStrong2: '106 criteri',
    introC: ' suddivisi in 13 tematiche, ciascuno articolato in test concreti.',
    whoTitle: 'Chi è interessato?',
    who: [
      { a: 'I ', b: 'servizi pubblici', c: ' e gli organismi delegati: obbligo RGAA dal 2019.' },
      { a: 'Le ', b: 'imprese con oltre 250 milioni di euro di fatturato', c: ' in Francia: obbligo di dichiarazione dal 2020.' },
      {
        a: 'Dal ',
        b: '28 giugno 2025',
        c: ' l’European Accessibility Act estende l’obbligo alla maggior parte dei servizi digitali destinati al pubblico: e-commerce, banche, trasporti, media, telecomunicazioni — comprese le PMI (escluse le microimprese di servizi).',
      },
    ],
    themesTitle: 'Le 13 tematiche del RGAA',
    tableCaption: 'Le 13 tematiche del RGAA 4.1.2 e i loro criteri',
    colNumber: 'N.',
    colTheme: 'Tematica',
    colCriteria: 'Criteri',
    colExamples: 'Esempi di punti verificati',
    examples: [
      'Alternative testuali, immagini decorative, CAPTCHA',
      'Titolo pertinente su ogni iframe',
      'Contrasto 4,5:1, informazione non veicolata dal solo colore',
      'Sottotitoli, trascrizione, audiodescrizione, controllo della riproduzione',
      'Intestazioni di colonna e di riga, riepilogo delle tabelle complesse',
      'Testi dei link espliciti, link privi di testo',
      'Componenti JavaScript compatibili con tastiera e screen reader',
      'Doctype, lingua, titolo di pagina, codice valido',
      'Titoli gerarchizzati, elenchi, citazioni',
      'CSS, zoom al 200 %, spaziatura del testo, focus visibile',
      'Etichette, raggruppamenti, messaggi di errore, aiuto alla compilazione',
      'Link di salto, mappa del sito, ordine di tabulazione, landmark',
      'Limiti di tempo, nuove finestre, documenti per ufficio',
    ],
    levelsTitle: 'I livelli di conformità',
    levelsIntro:
      'Il tasso di conformità RGAA = criteri rispettati ÷ criteri applicabili. Per la dichiarazione di accessibilità sono possibili tre stati:',
    levelFull: 'Totalmente conforme',
    levelFullText: ': il 100 % dei criteri applicabili è rispettato.',
    levelPartial: 'Parzialmente conforme',
    levelPartialText: ': almeno il 50 %.',
    levelNone: 'Non conforme',
    levelNoneText: ': meno del 50 % oppure nessun audit svolto.',
    autoTitle: 'Ciò che Konforme automatizza',
    autoText:
      'Konforme verifica automaticamente i criteri controllabili dalla macchina: alternative delle immagini, etichette dei moduli, struttura dei titoli, cornici, tabelle, link vuoti, lingua del documento, zoom bloccato, riproduzione automatica… Questi controlli coprono la maggior parte degli ostacoli realmente incontrati dagli utenti. Per ogni non conformità il rapporto indica il criterio RGAA/WCAG, l’elemento HTML interessato e la correzione da applicare, poi genera la sua dichiarazione di accessibilità.',
    ctaTitle: 'Testi subito il suo sito',
    ctaText: 'Audit automatizzato gratuito, risultato in un minuto.',
    ctaButton: 'Avviare un audit gratuito',
  },
})

export function Rgaa() {
  const lang = useLang()
  const t = useMessages(L)

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Seo
        title={t.seoTitle}
        description={t.seoDescription}
        path="/rgaa"
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
      <p className="text-lg text-text-muted leading-relaxed mb-10">
        {t.introA}<strong className="text-text">{t.introStrong1}</strong>
        {t.introB}<strong className="text-text">{t.introStrong2}</strong>
        {t.introC}
      </p>

      <section className="mb-12" aria-labelledby="qui-title">
        <h2 id="qui-title" className="text-2xl font-bold tracking-tight mb-4">{t.whoTitle}</h2>
        <ul className="space-y-2.5 text-text-soft leading-relaxed list-disc pl-5">
          {t.who.map((item) => (
            <li key={item.b}>{item.a}<strong className="text-text">{item.b}</strong>{item.c}</li>
          ))}
        </ul>
      </section>

      <section className="mb-12" aria-labelledby="themes-title">
        <h2 id="themes-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.themesTitle}
        </h2>
        <div className="overflow-x-auto rounded-[14px] border border-border">
          <table className="w-full text-sm">
            <caption className="sr-only">{t.tableCaption}</caption>
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs uppercase tracking-wider text-text-muted">
                <th scope="col" className="px-4 py-3 font-semibold">{t.colNumber}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{t.colTheme}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{t.colCriteria}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{t.colExamples}</th>
              </tr>
            </thead>
            <tbody>
              {RGAA_TOPICS.map((topic, i) => (
                <tr key={topic.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 text-text-dim">{topic.id}</td>
                  <th scope="row" className="px-4 py-3 font-semibold text-left">{localizeTopic(lang, topic).name}</th>
                  <td className="px-4 py-3">{RGAA_CRITERIA.filter((c) => c.topic === topic.id).length}</td>
                  <td className="px-4 py-3 text-text-muted">{t.examples[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12" aria-labelledby="conf-title">
        <h2 id="conf-title" className="text-2xl font-bold tracking-tight mb-4">{t.levelsTitle}</h2>
        <p className="text-text-soft leading-relaxed mb-4">
          {t.levelsIntro}
        </p>
        <ul className="space-y-2.5 text-text-soft list-disc pl-5">
          <li><strong className="text-success-soft">{t.levelFull}</strong>{t.levelFullText}</li>
          <li><strong className="text-warning-soft">{t.levelPartial}</strong>{t.levelPartialText}</li>
          <li><strong className="text-danger-soft">{t.levelNone}</strong>{t.levelNoneText}</li>
        </ul>
      </section>

      <section className="mb-12" aria-labelledby="auto-title">
        <h2 id="auto-title" className="text-2xl font-bold tracking-tight mb-4">
          {t.autoTitle}
        </h2>
        <p className="text-text-soft leading-relaxed">
          {t.autoText}
        </p>
      </section>

      <div className="rounded-[14px] border border-primary/40 bg-primary/10 p-8 text-center">
        <h2 className="text-xl font-bold mb-2">{t.ctaTitle}</h2>
        <p className="text-sm text-text-muted mb-5">{t.ctaText}</p>
        <Link to="/login">
          <Button variant="primary" size="lg">{t.ctaButton}</Button>
        </Link>
      </div>
    </div>
  )
}
