import { useParams } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { localizedLegalDoc } from '@/i18n/content-i18n'
import { formatDate } from '@/lib/format'
import { NotFound } from '@/pages/NotFound'
import { defineMessages, useLang, useMessages } from '@/i18n'

/**
 * Les documents juridiques (src/content/legal.tsx) font foi en français : seule
 * l'interface est traduite, avec une note lorsque la langue courante n'est pas
 * le français.
 */
const L = defineMessages({
  fr: {
    eyebrow: 'Légal',
    updated: 'Dernière mise à jour : ',
    frenchOnly:
      'Les documents juridiques font foi dans leur version française.',
    titles: {
      'mentions-legales': 'Mentions légales',
      cgu: "Conditions générales d'utilisation",
      cgv: 'Conditions générales de vente',
      confidentialite: 'Politique de confidentialité',
      rgpd: 'Conformité RGPD',
      cookies: 'Politique cookies',
    } as Record<string, string>,
    descriptions: {
      'mentions-legales':
        'Éditeur, directeur de publication et hébergeur du site konforme.kayzen-lyon.com.',
      cgu: "Règles d'utilisation de la plateforme Konforme.",
      cgv: 'Conditions applicables aux offres payantes de Konforme.',
      confidentialite: 'Quelles données Konforme collecte, pourquoi, et vos droits RGPD.',
      rgpd: 'Les engagements RGPD de Konforme : minimisation, hébergement UE, sous-traitants.',
      cookies: 'Konforme utilise uniquement des cookies techniques, sans traceur publicitaire.',
    } as Record<string, string>,
  },
  en: {
    eyebrow: 'Legal',
    updated: 'Last updated: ',
    frenchOnly:
      'Please note: the French version of these legal documents is the only authoritative one; the text below is therefore shown in French.',
    titles: {
      'mentions-legales': 'Legal notice',
      cgu: 'Terms of use',
      cgv: 'Terms of sale',
      confidentialite: 'Privacy policy',
      rgpd: 'GDPR compliance',
      cookies: 'Cookie policy',
    } as Record<string, string>,
    descriptions: {
      'mentions-legales':
        'Publisher, publication director and host of the konforme.kayzen-lyon.com website.',
      cgu: 'Rules for using the Konforme platform.',
      cgv: 'Conditions applying to the paid Konforme plans.',
      confidentialite: 'What data Konforme collects, why, and your GDPR rights.',
      rgpd: 'Konforme’s GDPR commitments: data minimisation, EU hosting, processors.',
      cookies: 'Konforme only uses technical cookies, with no advertising trackers.',
    } as Record<string, string>,
  },
  de: {
    eyebrow: 'Rechtliches',
    updated: 'Letzte Aktualisierung: ',
    frenchOnly:
      'Hinweis: Allein die französische Fassung dieser Rechtsdokumente ist verbindlich; der nachstehende Text wird daher auf Französisch angezeigt.',
    titles: {
      'mentions-legales': 'Impressum',
      cgu: 'Nutzungsbedingungen',
      cgv: 'Allgemeine Geschäftsbedingungen',
      confidentialite: 'Datenschutzerklärung',
      rgpd: 'DSGVO-Konformität',
      cookies: 'Cookie-Richtlinie',
    } as Record<string, string>,
    descriptions: {
      'mentions-legales':
        'Herausgeber, verantwortlicher Redakteur und Hoster der Website konforme.kayzen-lyon.com.',
      cgu: 'Regeln für die Nutzung der Plattform Konforme.',
      cgv: 'Bedingungen für die kostenpflichtigen Angebote von Konforme.',
      confidentialite: 'Welche Daten Konforme erhebt, warum, und Ihre Rechte nach der DSGVO.',
      rgpd: 'Die DSGVO-Zusagen von Konforme: Datenminimierung, EU-Hosting, Auftragsverarbeiter.',
      cookies: 'Konforme verwendet ausschließlich technische Cookies, ohne Werbe-Tracker.',
    } as Record<string, string>,
  },
  es: {
    eyebrow: 'Legal',
    updated: 'Última actualización: ',
    frenchOnly:
      'Aviso: solo la versión francesa de estos documentos jurídicos da fe; por ello el texto siguiente se muestra en francés.',
    titles: {
      'mentions-legales': 'Aviso legal',
      cgu: 'Condiciones generales de uso',
      cgv: 'Condiciones generales de venta',
      confidentialite: 'Política de privacidad',
      rgpd: 'Conformidad con el RGPD',
      cookies: 'Política de cookies',
    } as Record<string, string>,
    descriptions: {
      'mentions-legales':
        'Editor, director de publicación y alojamiento del sitio konforme.kayzen-lyon.com.',
      cgu: 'Normas de uso de la plataforma Konforme.',
      cgv: 'Condiciones aplicables a las ofertas de pago de Konforme.',
      confidentialite: 'Qué datos recopila Konforme, por qué, y sus derechos RGPD.',
      rgpd: 'Los compromisos RGPD de Konforme: minimización, alojamiento en la UE, encargados.',
      cookies: 'Konforme utiliza únicamente cookies técnicas, sin rastreadores publicitarios.',
    } as Record<string, string>,
  },
  it: {
    eyebrow: 'Note legali',
    updated: 'Ultimo aggiornamento: ',
    frenchOnly:
      'Nota: fa fede unicamente la versione francese di questi documenti legali; il testo che segue è quindi presentato in francese.',
    titles: {
      'mentions-legales': 'Note legali',
      cgu: 'Condizioni generali di utilizzo',
      cgv: 'Condizioni generali di vendita',
      confidentialite: 'Informativa sulla privacy',
      rgpd: 'Conformità al GDPR',
      cookies: 'Informativa sui cookie',
    } as Record<string, string>,
    descriptions: {
      'mentions-legales':
        'Editore, direttore della pubblicazione e host del sito konforme.kayzen-lyon.com.',
      cgu: 'Regole di utilizzo della piattaforma Konforme.',
      cgv: 'Condizioni applicabili alle offerte a pagamento di Konforme.',
      confidentialite: 'Quali dati raccoglie Konforme, perché, e i suoi diritti ai sensi del GDPR.',
      rgpd: 'Gli impegni GDPR di Konforme: minimizzazione, hosting nell’UE, responsabili del trattamento.',
      cookies: 'Konforme utilizza esclusivamente cookie tecnici, senza tracciatori pubblicitari.',
    } as Record<string, string>,
  },
})

export function LegalPage() {
  const { slug } = useParams<{ slug: string }>()
  const t = useMessages(L)
  const lang = useLang()
  const doc = slug ? localizedLegalDoc(lang, slug) : undefined
  if (!doc) return <NotFound />

  const title = t.titles[doc.slug] ?? doc.title
  const description = t.descriptions[doc.slug] ?? doc.description

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Seo title={title} description={description} path={`/legal/${doc.slug}`} localized />
      <p className="text-xs font-semibold uppercase tracking-wider text-link mb-3">{t.eyebrow}</p>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{title}</h1>
      <p className="text-sm text-text-dim mb-8">
        {t.updated}
        <time dateTime={doc.updated}>{formatDate(doc.updated, false, lang)}</time>
      </p>
      <div>{doc.body}</div>
    </div>
  )
}
