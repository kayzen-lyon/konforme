import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ORGANIZATION_JSONLD, Seo } from '@/components/Seo'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    seoTitle: 'À propos de Konforme',
    seoDescription:
      "Konforme est la plateforme d'audit d'accessibilité web de KAYZEN (Lyon) : rendre la conformité RGAA et WCAG simple, mesurable et abordable.",
    eyebrow: 'À propos',
    h1: "Rendre l'accessibilité web simple et mesurable",
    p1: "Konforme est né d'un constat simple : depuis l'entrée en application de l'European Accessibility Act en juin 2025, des centaines de milliers de sites français doivent se mettre en conformité — mais les audits traditionnels coûtent plusieurs milliers d'euros et prennent des semaines.",
    p2: "Nous avons construit une plateforme qui automatise ce qui peut l'être : détection des non-conformités RGAA 4.1.2 et WCAG 2.2, corrections guidées avec le code concerné, suivi du score dans le temps et génération de la déclaration d'accessibilité légale.",
    p3a: 'Konforme est édité par ',
    p3b: ", société lyonnaise spécialisée dans la création de sites web et la conformité numérique (accessibilité, RGPD). Nous utilisons Konforme sur nos propres réalisations — ce site inclus, dont la ",
    p3link: "déclaration d'accessibilité",
    p3c: ' est publique.',
    commitmentsTitle: 'Nos engagements',
    commitments: [
      {
        term: 'Transparence',
        text: " : un audit automatisé ne couvre pas tout, et nous le disons. Nous affichons ce qui est testé et ce qui relève d'un audit manuel.",
      },
      {
        term: 'Pédagogie',
        text: ' : chaque non-conformité est expliquée avec sa correction, pour faire monter vos équipes en compétence.',
      },
      {
        term: 'Données en Europe',
        text: ' : vos données sont hébergées dans l’Union européenne (Appwrite Cloud, région Francfort), sur une infrastructure open source.',
      },
    ],
    ctaTry: 'Essayer Konforme',
    ctaContact: 'Nous contacter',
  },
  en: {
    seoTitle: 'About Konforme',
    seoDescription:
      'Konforme is the web accessibility audit platform built by KAYZEN (Lyon): making RGAA and WCAG compliance simple, measurable and affordable.',
    eyebrow: 'About',
    h1: 'Making web accessibility simple and measurable',
    p1: 'Konforme started from a simple observation: since the European Accessibility Act came into force in June 2025, hundreds of thousands of websites have to become compliant — yet traditional audits cost several thousand euros and take weeks.',
    p2: 'We built a platform that automates whatever can be automated: detection of RGAA 4.1.2 and WCAG 2.2 non-conformities, guided fixes showing the code involved, score tracking over time and generation of the legal accessibility statement.',
    p3a: 'Konforme is published by ',
    p3b: ', a Lyon-based company specialising in website design and digital compliance (accessibility, GDPR). We use Konforme on our own projects — including this website, whose ',
    p3link: 'accessibility statement',
    p3c: ' is public.',
    commitmentsTitle: 'Our commitments',
    commitments: [
      {
        term: 'Transparency',
        text: ': an automated audit does not cover everything, and we say so. We show what is tested and what requires a manual audit.',
      },
      {
        term: 'Education',
        text: ': every non-conformity is explained along with its fix, so your teams build lasting skills.',
      },
      {
        term: 'Data in Europe',
        text: ': your data is hosted in the European Union (Appwrite Cloud, Frankfurt region), on open source infrastructure.',
      },
    ],
    ctaTry: 'Try Konforme',
    ctaContact: 'Contact us',
  },
  de: {
    seoTitle: 'Über Konforme',
    seoDescription:
      'Konforme ist die Plattform für Web-Barrierefreiheitsaudits von KAYZEN (Lyon): RGAA- und WCAG-Konformität einfach, messbar und bezahlbar machen.',
    eyebrow: 'Über uns',
    h1: 'Web-Barrierefreiheit einfach und messbar machen',
    p1: 'Konforme entstand aus einer einfachen Feststellung: Seit dem Inkrafttreten des European Accessibility Act im Juni 2025 müssen Hunderttausende Websites konform werden — klassische Audits kosten jedoch mehrere Tausend Euro und dauern Wochen.',
    p2: 'Wir haben eine Plattform entwickelt, die automatisiert, was sich automatisieren lässt: Erkennung von Verstößen gegen RGAA 4.1.2 und WCAG 2.2, geführte Korrekturen mit dem betroffenen Code, Verfolgung des Scores im Zeitverlauf und Erstellung der gesetzlichen Barrierefreiheitserklärung.',
    p3a: 'Konforme wird herausgegeben von ',
    p3b: ', einem Unternehmen aus Lyon, spezialisiert auf Website-Erstellung und digitale Konformität (Barrierefreiheit, DSGVO). Wir setzen Konforme für unsere eigenen Projekte ein — auch für diese Website, deren ',
    p3link: 'Barrierefreiheitserklärung',
    p3c: ' öffentlich ist.',
    commitmentsTitle: 'Unsere Grundsätze',
    commitments: [
      {
        term: 'Transparenz',
        text: ': Ein automatisiertes Audit deckt nicht alles ab, und das sagen wir auch. Wir zeigen, was geprüft wird und was ein manuelles Audit erfordert.',
      },
      {
        term: 'Wissensvermittlung',
        text: ': Jeder Verstoß wird zusammen mit seiner Korrektur erklärt, damit Ihre Teams Kompetenz aufbauen.',
      },
      {
        term: 'Daten in Europa',
        text: ': Ihre Daten werden in der Europäischen Union gehostet (Appwrite Cloud, Region Frankfurt), auf einer Open-Source-Infrastruktur.',
      },
    ],
    ctaTry: 'Konforme testen',
    ctaContact: 'Kontaktieren Sie uns',
  },
  es: {
    seoTitle: 'Acerca de Konforme',
    seoDescription:
      'Konforme es la plataforma de auditoría de accesibilidad web de KAYZEN (Lyon): hacer que la conformidad RGAA y WCAG sea sencilla, medible y asequible.',
    eyebrow: 'Acerca de',
    h1: 'Hacer que la accesibilidad web sea sencilla y medible',
    p1: 'Konforme nació de una constatación sencilla: desde la entrada en vigor del European Accessibility Act en junio de 2025, cientos de miles de sitios deben cumplir la normativa, pero las auditorías tradicionales cuestan varios miles de euros y tardan semanas.',
    p2: 'Hemos creado una plataforma que automatiza todo lo que puede automatizarse: detección de las no conformidades RGAA 4.1.2 y WCAG 2.2, correcciones guiadas con el código afectado, seguimiento de la puntuación a lo largo del tiempo y generación de la declaración de accesibilidad legal.',
    p3a: 'Konforme está editado por ',
    p3b: ', empresa lyonesa especializada en la creación de sitios web y en la conformidad digital (accesibilidad, RGPD). Utilizamos Konforme en nuestros propios proyectos, incluido este sitio, cuya ',
    p3link: 'declaración de accesibilidad',
    p3c: ' es pública.',
    commitmentsTitle: 'Nuestros compromisos',
    commitments: [
      {
        term: 'Transparencia',
        text: ': una auditoría automatizada no lo cubre todo, y lo decimos. Mostramos lo que se comprueba y lo que corresponde a una auditoría manual.',
      },
      {
        term: 'Pedagogía',
        text: ': cada no conformidad se explica junto con su corrección, para que sus equipos ganen competencias.',
      },
      {
        term: 'Datos en Europa',
        text: ': sus datos se alojan en la Unión Europea (Appwrite Cloud, región de Fráncfort), sobre una infraestructura de código abierto.',
      },
    ],
    ctaTry: 'Probar Konforme',
    ctaContact: 'Contáctenos',
  },
  it: {
    seoTitle: 'Chi siamo — Konforme',
    seoDescription:
      'Konforme è la piattaforma di audit di accessibilità web di KAYZEN (Lione): rendere la conformità RGAA e WCAG semplice, misurabile e accessibile.',
    eyebrow: 'Chi siamo',
    h1: "Rendere l'accessibilità web semplice e misurabile",
    p1: 'Konforme nasce da una constatazione semplice: dall’entrata in vigore dell’European Accessibility Act nel giugno 2025, centinaia di migliaia di siti devono mettersi in conformità, ma gli audit tradizionali costano diverse migliaia di euro e richiedono settimane.',
    p2: 'Abbiamo costruito una piattaforma che automatizza ciò che è automatizzabile: rilevamento delle non conformità RGAA 4.1.2 e WCAG 2.2, correzioni guidate con il codice interessato, monitoraggio del punteggio nel tempo e generazione della dichiarazione di accessibilità prevista dalla legge.',
    p3a: 'Konforme è edito da ',
    p3b: ', società di Lione specializzata nella creazione di siti web e nella conformità digitale (accessibilità, GDPR). Utilizziamo Konforme sui nostri stessi progetti, incluso questo sito, la cui ',
    p3link: 'dichiarazione di accessibilità',
    p3c: ' è pubblica.',
    commitmentsTitle: 'I nostri impegni',
    commitments: [
      {
        term: 'Trasparenza',
        text: ': un audit automatizzato non copre tutto, e lo diciamo. Mostriamo che cosa viene testato e che cosa richiede un audit manuale.',
      },
      {
        term: 'Pedagogia',
        text: ': ogni non conformità viene spiegata insieme alla sua correzione, per far crescere le competenze dei suoi team.',
      },
      {
        term: 'Dati in Europa',
        text: ': i suoi dati sono ospitati nell’Unione europea (Appwrite Cloud, regione di Francoforte), su un’infrastruttura open source.',
      },
    ],
    ctaTry: 'Provi Konforme',
    ctaContact: 'Ci contatti',
  },
})

export function About() {
  const t = useMessages(L)
  const lang = useLang()

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Seo
        title={t.seoTitle}
        description={t.seoDescription}
        path="/a-propos"
        localized
        jsonLd={[ORGANIZATION_JSONLD]}
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-link mb-3">{t.eyebrow}</p>
      <h1 className="text-4xl font-extrabold tracking-tight mb-6">{t.h1}</h1>
      <div className="space-y-5 text-text-soft leading-relaxed text-lg">
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <p>
          {t.p3a}
          <strong className="text-text">KAYZEN</strong>
          {t.p3b}
          <Link to={localizePath(lang, '/accessibilite')} className="text-link hover:underline">
            {t.p3link}
          </Link>
          {t.p3c}
        </p>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mt-12 mb-4">{t.commitmentsTitle}</h2>
      <ul className="space-y-3 text-text-soft leading-relaxed list-disc pl-5">
        {t.commitments.map((c) => (
          <li key={c.term}>
            <strong className="text-text">{c.term}</strong>
            {c.text}
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/login">
          <Button variant="primary">{t.ctaTry}</Button>
        </Link>
        <Link to={localizePath(lang, '/contact')}>
          <Button variant="ghost">{t.ctaContact}</Button>
        </Link>
      </div>
    </div>
  )
}
