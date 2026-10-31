import { Seo } from '@/components/Seo'
import { defineMessages, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    seoTitle: "Déclaration d'accessibilité",
    seoDescription:
      "Déclaration d'accessibilité RGAA du site konforme.kayzen-lyon.com : état de conformité, résultats des tests et voies de recours.",
    eyebrow: 'Accessibilité',
    h1: "Déclaration d'accessibilité",
    introA: ' s’engage à rendre son site internet accessible conformément à l’article 47 de la loi n° 2005-102 du 11 février 2005.',
    scopeA: 'Cette déclaration d’accessibilité s’applique au site ',
    scopeB: '.',
    statusTitle: 'État de conformité',
    statusA: 'Le site konforme.kayzen-lyon.com est ',
    statusStrong: 'partiellement conforme',
    statusB: ' avec le référentiel général d’amélioration de l’accessibilité (RGAA), version 4.1, en raison des non-conformités et dérogations énumérées ci-dessous.',
    testsTitle: 'Résultats des tests',
    testsIntro:
      'L’audit de conformité réalisé en juillet 2026 en interne (audit automatisé Konforme complété d’une revue manuelle : navigation clavier, lecteur d’écran, contrastes, zoom 200 %) révèle que le site respecte les critères automatisables testés. Points connus en cours d’amélioration :',
    testsItems: [
      'Certains contenus du tableau de bord (graphiques) proposent une alternative textuelle simplifiée plutôt qu’une restitution donnée par donnée.',
      'Le processus d’authentification dépend d’un service tiers (Google) dont l’accessibilité ne relève pas de notre contrôle.',
    ],
    statementTitle: 'Établissement de cette déclaration',
    statementText:
      'Cette déclaration a été établie le 12 juillet 2026. Technologies utilisées : HTML5, CSS, JavaScript (React). Tests effectués avec les navigateurs et lecteurs d’écran courants (NVDA/Firefox, VoiceOver/Safari) et l’outil d’audit Konforme.',
    feedbackTitle: 'Retour d’information et contact',
    feedbackA:
      'Si vous n’arrivez pas à accéder à un contenu ou à un service, contactez-nous pour être orienté vers une alternative accessible : ',
    feedbackB: ' ou +33 (0)4 87 77 68 61.',
    recourseTitle: 'Voies de recours',
    recourseIntro:
      'Si vous avez signalé un défaut d’accessibilité sans obtenir de réponse satisfaisante, vous pouvez :',
    recourseWrite: 'Écrire au ',
    recourseContact: 'Contacter ',
    recourseDelegate: 'le délégué du Défenseur des droits de votre région',
    recourseMail:
      'Envoyer un courrier (gratuit, sans timbre) : Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07',
    newWindow: ' (nouvelle fenêtre)',
  },
  en: {
    seoTitle: 'Accessibility statement',
    seoDescription:
      'RGAA accessibility statement for konforme.kayzen-lyon.com: compliance status, test results and remedies.',
    eyebrow: 'Accessibility',
    h1: 'Accessibility statement',
    introA: ' is committed to making its website accessible in accordance with Article 47 of French act no. 2005-102 of 11 February 2005.',
    scopeA: 'This accessibility statement applies to the website ',
    scopeB: '.',
    statusTitle: 'Compliance status',
    statusA: 'The website konforme.kayzen-lyon.com is ',
    statusStrong: 'partially compliant',
    statusB: ' with the RGAA (French general accessibility improvement framework), version 4.1, because of the non-conformities and exemptions listed below.',
    testsTitle: 'Test results',
    testsIntro:
      'The compliance audit carried out in-house in July 2026 (automated Konforme audit completed by a manual review: keyboard navigation, screen reader, contrast, 200% zoom) shows that the website meets the automatable criteria tested. Known issues currently being addressed:',
    testsItems: [
      'Some dashboard content (charts) offers a simplified text alternative rather than a data-by-data rendering.',
      'The authentication process relies on a third-party service (Google) whose accessibility is beyond our control.',
    ],
    statementTitle: 'Preparation of this statement',
    statementText:
      'This statement was drawn up on 12 July 2026. Technologies used: HTML5, CSS, JavaScript (React). Testing was carried out with common browsers and screen readers (NVDA/Firefox, VoiceOver/Safari) and with the Konforme audit tool.',
    feedbackTitle: 'Feedback and contact',
    feedbackA:
      'If you are unable to access a piece of content or a service, please contact us so that we can direct you to an accessible alternative: ',
    feedbackB: ' or +33 (0)4 87 77 68 61.',
    recourseTitle: 'Remedies',
    recourseIntro:
      'If you have reported an accessibility issue without receiving a satisfactory response, you may:',
    recourseWrite: 'Write to the ',
    recourseContact: 'Contact ',
    recourseDelegate: 'the regional representative of the Défenseur des droits',
    recourseMail:
      'Send a letter (free of charge, no stamp required): Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07, France',
    newWindow: ' (opens in a new window)',
  },
  de: {
    seoTitle: 'Erklärung zur Barrierefreiheit',
    seoDescription:
      'RGAA-Erklärung zur Barrierefreiheit von konforme.kayzen-lyon.com: Konformitätsstatus, Testergebnisse und Rechtsbehelfe.',
    eyebrow: 'Barrierefreiheit',
    h1: 'Erklärung zur Barrierefreiheit',
    introA: ' verpflichtet sich, seine Website gemäß Artikel 47 des französischen Gesetzes Nr. 2005-102 vom 11. Februar 2005 barrierefrei zu gestalten.',
    scopeA: 'Diese Erklärung zur Barrierefreiheit gilt für die Website ',
    scopeB: '.',
    statusTitle: 'Stand der Konformität',
    statusA: 'Die Website konforme.kayzen-lyon.com ist aufgrund der nachstehend aufgeführten Verstöße und Ausnahmen ',
    statusStrong: 'teilweise konform',
    statusB: ' mit dem allgemeinen französischen Referenzrahmen zur Verbesserung der Barrierefreiheit (RGAA) in der Version 4.1.',
    testsTitle: 'Testergebnisse',
    testsIntro:
      'Das im Juli 2026 intern durchgeführte Konformitätsaudit (automatisiertes Konforme-Audit ergänzt durch eine manuelle Prüfung: Tastaturnavigation, Screenreader, Kontraste, 200 % Zoom) zeigt, dass die Website die geprüften automatisierbaren Kriterien erfüllt. Bekannte Punkte, die derzeit verbessert werden:',
    testsItems: [
      'Einige Inhalte des Dashboards (Diagramme) bieten eine vereinfachte Textalternative statt einer Wiedergabe Wert für Wert.',
      'Der Anmeldevorgang hängt von einem Drittanbieterdienst (Google) ab, dessen Barrierefreiheit sich unserer Kontrolle entzieht.',
    ],
    statementTitle: 'Erstellung dieser Erklärung',
    statementText:
      'Diese Erklärung wurde am 12. Juli 2026 erstellt. Verwendete Technologien: HTML5, CSS, JavaScript (React). Die Tests erfolgten mit gängigen Browsern und Screenreadern (NVDA/Firefox, VoiceOver/Safari) sowie mit dem Audit-Werkzeug Konforme.',
    feedbackTitle: 'Rückmeldung und Kontakt',
    feedbackA:
      'Wenn Sie auf einen Inhalt oder einen Dienst nicht zugreifen können, kontaktieren Sie uns, damit wir Ihnen eine barrierefreie Alternative anbieten können: ',
    feedbackB: ' oder +33 (0)4 87 77 68 61.',
    recourseTitle: 'Rechtsbehelfe',
    recourseIntro:
      'Wenn Sie einen Mangel an Barrierefreiheit gemeldet haben, ohne eine zufriedenstellende Antwort zu erhalten, können Sie:',
    recourseWrite: 'Schreiben an den ',
    recourseContact: 'Kontakt aufnehmen mit ',
    recourseDelegate: 'dem regionalen Beauftragten des Défenseur des droits',
    recourseMail:
      'Einen Brief senden (kostenlos, ohne Briefmarke): Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07, Frankreich',
    newWindow: ' (neues Fenster)',
  },
  es: {
    seoTitle: 'Declaración de accesibilidad',
    seoDescription:
      'Declaración de accesibilidad RGAA del sitio konforme.kayzen-lyon.com: estado de conformidad, resultados de las pruebas y vías de recurso.',
    eyebrow: 'Accesibilidad',
    h1: 'Declaración de accesibilidad',
    introA: ' se compromete a hacer accesible su sitio web de conformidad con el artículo 47 de la ley francesa n.º 2005-102 de 11 de febrero de 2005.',
    scopeA: 'Esta declaración de accesibilidad se aplica al sitio ',
    scopeB: '.',
    statusTitle: 'Estado de conformidad',
    statusA: 'El sitio konforme.kayzen-lyon.com es ',
    statusStrong: 'parcialmente conforme',
    statusB: ' con el referencial general de mejora de la accesibilidad (RGAA), versión 4.1, debido a las no conformidades y excepciones enumeradas a continuación.',
    testsTitle: 'Resultados de las pruebas',
    testsIntro:
      'La auditoría de conformidad realizada internamente en julio de 2026 (auditoría automatizada Konforme completada con una revisión manual: navegación por teclado, lector de pantalla, contrastes, zoom al 200 %) muestra que el sitio cumple los criterios automatizables comprobados. Puntos conocidos en curso de mejora:',
    testsItems: [
      'Algunos contenidos del panel de control (gráficos) ofrecen una alternativa textual simplificada en lugar de una restitución dato por dato.',
      'El proceso de autenticación depende de un servicio de terceros (Google) cuya accesibilidad no está bajo nuestro control.',
    ],
    statementTitle: 'Elaboración de esta declaración',
    statementText:
      'Esta declaración se elaboró el 12 de julio de 2026. Tecnologías utilizadas: HTML5, CSS, JavaScript (React). Las pruebas se realizaron con los navegadores y lectores de pantalla habituales (NVDA/Firefox, VoiceOver/Safari) y con la herramienta de auditoría Konforme.',
    feedbackTitle: 'Comentarios y contacto',
    feedbackA:
      'Si no consigue acceder a un contenido o a un servicio, póngase en contacto con nosotros para que le orientemos hacia una alternativa accesible: ',
    feedbackB: ' o +33 (0)4 87 77 68 61.',
    recourseTitle: 'Vías de recurso',
    recourseIntro:
      'Si ha señalado un defecto de accesibilidad sin obtener una respuesta satisfactoria, puede:',
    recourseWrite: 'Escribir al ',
    recourseContact: 'Contactar con ',
    recourseDelegate: 'el delegado del Défenseur des droits de su región',
    recourseMail:
      'Enviar una carta (gratuita, sin sello): Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07, Francia',
    newWindow: ' (nueva ventana)',
  },
  it: {
    seoTitle: 'Dichiarazione di accessibilità',
    seoDescription:
      'Dichiarazione di accessibilità RGAA del sito konforme.kayzen-lyon.com: stato di conformità, risultati dei test e mezzi di ricorso.',
    eyebrow: 'Accessibilità',
    h1: 'Dichiarazione di accessibilità',
    introA: ' si impegna a rendere il proprio sito internet accessibile conformemente all’articolo 47 della legge francese n. 2005-102 dell’11 febbraio 2005.',
    scopeA: 'La presente dichiarazione di accessibilità si applica al sito ',
    scopeB: '.',
    statusTitle: 'Stato di conformità',
    statusA: 'Il sito konforme.kayzen-lyon.com è ',
    statusStrong: 'parzialmente conforme',
    statusB: ' al referenziale generale di miglioramento dell’accessibilità (RGAA), versione 4.1, a causa delle non conformità e delle deroghe elencate di seguito.',
    testsTitle: 'Risultati dei test',
    testsIntro:
      'L’audit di conformità svolto internamente nel luglio 2026 (audit automatizzato Konforme completato da una revisione manuale: navigazione da tastiera, screen reader, contrasti, zoom al 200 %) mostra che il sito rispetta i criteri automatizzabili testati. Punti noti in corso di miglioramento:',
    testsItems: [
      'Alcuni contenuti della dashboard (grafici) propongono un’alternativa testuale semplificata anziché una restituzione dato per dato.',
      'Il processo di autenticazione dipende da un servizio di terze parti (Google) la cui accessibilità non rientra nel nostro controllo.',
    ],
    statementTitle: 'Redazione della presente dichiarazione',
    statementText:
      'La presente dichiarazione è stata redatta il 12 luglio 2026. Tecnologie utilizzate: HTML5, CSS, JavaScript (React). I test sono stati effettuati con i browser e gli screen reader più diffusi (NVDA/Firefox, VoiceOver/Safari) e con lo strumento di audit Konforme.',
    feedbackTitle: 'Riscontri e contatti',
    feedbackA:
      'Se non riesce ad accedere a un contenuto o a un servizio, ci contatti per essere indirizzato verso un’alternativa accessibile: ',
    feedbackB: ' oppure +33 (0)4 87 77 68 61.',
    recourseTitle: 'Mezzi di ricorso',
    recourseIntro:
      'Se ha segnalato un difetto di accessibilità senza ottenere una risposta soddisfacente, può:',
    recourseWrite: 'Scrivere al ',
    recourseContact: 'Contattare ',
    recourseDelegate: 'il delegato del Défenseur des droits della sua regione',
    recourseMail:
      'Inviare una lettera (gratuita, senza affrancatura): Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07, Francia',
    newWindow: ' (nuova finestra)',
  },
})

export function Accessibilite() {
  const t = useMessages(L)

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Seo title={t.seoTitle} description={t.seoDescription} path="/accessibilite" localized />
      <p className="text-xs font-semibold uppercase tracking-wider text-link mb-3">{t.eyebrow}</p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">{t.h1}</h1>

      <div className="space-y-4 text-text-soft leading-relaxed">
        <p>
          <strong className="text-text">KAYZEN</strong>
          {t.introA}
        </p>
        <p>
          {t.scopeA}
          <strong className="text-text">konforme.kayzen-lyon.com</strong>
          {t.scopeB}
        </p>
      </div>

      <h2 className="text-xl font-bold tracking-tight mt-10 mb-3">{t.statusTitle}</h2>
      <p className="text-text-soft leading-relaxed mb-4">
        {t.statusA}
        <strong className="text-text">{t.statusStrong}</strong>
        {t.statusB}
      </p>

      <h2 className="text-xl font-bold tracking-tight mt-10 mb-3">{t.testsTitle}</h2>
      <p className="text-text-soft leading-relaxed mb-4">{t.testsIntro}</p>
      <ul className="space-y-2 text-text-soft leading-relaxed list-disc pl-5 mb-4">
        {t.testsItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h2 className="text-xl font-bold tracking-tight mt-10 mb-3">{t.statementTitle}</h2>
      <p className="text-text-soft leading-relaxed mb-4">{t.statementText}</p>

      <h2 className="text-xl font-bold tracking-tight mt-10 mb-3">{t.feedbackTitle}</h2>
      <p className="text-text-soft leading-relaxed mb-4">
        {t.feedbackA}
        <a href="mailto:contact@kayzen-lyon.fr" className="text-link hover:underline">
          contact@kayzen-lyon.fr
        </a>
        {t.feedbackB}
      </p>

      <h2 className="text-xl font-bold tracking-tight mt-10 mb-3">{t.recourseTitle}</h2>
      <p className="text-text-soft leading-relaxed mb-4">{t.recourseIntro}</p>
      <ul className="space-y-2 text-text-soft leading-relaxed list-disc pl-5">
        <li>
          {t.recourseWrite}
          <a href="https://formulaire.defenseurdesdroits.fr/" className="text-link hover:underline" rel="noopener noreferrer" target="_blank">
            Défenseur des droits<span className="sr-only">{t.newWindow}</span>
          </a>
        </li>
        <li>
          {t.recourseContact}
          <a href="https://www.defenseurdesdroits.fr/saisir/delegues" className="text-link hover:underline" rel="noopener noreferrer" target="_blank">
            {t.recourseDelegate}<span className="sr-only">{t.newWindow}</span>
          </a>
        </li>
        <li>{t.recourseMail}</li>
      </ul>
    </div>
  )
}
