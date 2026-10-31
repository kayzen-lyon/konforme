import { Link } from 'react-router-dom'
import { H2, P, UL } from '@/content/legal-ui'
import type { LegalDoc } from '@/content/legal'

const LANGUAGE_CLAUSE = (
  <P>
    Dies ist eine Übersetzung zu Informationszwecken. Rechtlich verbindlich ist die französische
    Fassung dieses Dokuments; bei Auslegungsunterschieden hat die französische Fassung Vorrang.
  </P>
)

/** Documents légaux traduits en allemand. */
export const LEGAL_DE: LegalDoc[] = [
  {
    slug: 'mentions-legales',
    title: 'Impressum',
    description:
      'Herausgeber, Verantwortlicher für die Veröffentlichung und Hoster der Website konforme.kayzen-lyon.com.',
    updated: '2026-07-12',
    body: (
      <>
        {LANGUAGE_CLAUSE}
        <H2>Herausgeber der Website</H2>
        <P>
          Die Website konforme.kayzen-lyon.com wird herausgegeben von{' '}
          <strong className="text-text">Tarek BELHADJ</strong>, Einzelunternehmer (entrepreneur
          individuel) unter dem Handelsnamen <strong className="text-text">KAYZEN</strong> —
          SIREN 493 857 262, SIRET 493 857 262 00098, APE-Code 62.01Z — mit Sitz in
          6 rue Pierre Termier, 69009 Lyon, Frankreich. Keine Umsatzsteuer ausgewiesen gemäß
          Art. L. 233-3 des französischen CIBS (Kleinunternehmerregelung, franchise en base).
        </P>
        <P>
          Telefon: +33 (0)4 87 77 68 61 — E-Mail: contact@kayzen-lyon.fr.
          <br />
          Verantwortlicher für die Veröffentlichung: Tarek BELHADJ.
        </P>
        <H2>Hosting</H2>
        <P>
          Die Website wird gehostet von Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
          Vereinigte Staaten (vercel.com). Die Anwendungsdaten (Konten, Datenbank, Funktionen)
          werden von Appwrite Cloud (Appwrite Code Ltd., appwrite.io) in der Region Frankfurt,
          Deutschland (Europäische Union), gehostet.
        </P>
        <H2>Geistiges Eigentum</H2>
        <P>
          Sämtliche Inhalte der Website (Texte, Benutzeroberflächen, Logos, Quellcode) sind
          urheberrechtlich geschützt. Jede nicht genehmigte Vervielfältigung ist untersagt.
        </P>
      </>
    ),
  },
  {
    slug: 'cgu',
    title: 'Allgemeine Nutzungsbedingungen',
    description: 'Regeln für die Nutzung der Plattform Konforme.',
    updated: '2026-07-12',
    body: (
      <>
        {LANGUAGE_CLAUSE}
        <H2>1. Gegenstand</H2>
        <P>
          Diese Allgemeinen Nutzungsbedingungen regeln die Nutzung der Plattform Konforme, eines
          von KAYZEN (Tarek BELHADJ, Einzelunternehmer) herausgegebenen Dienstes zur Prüfung der Barrierefreiheit im Web. Mit der
          Erstellung eines Kontos akzeptieren Sie diese Bedingungen vorbehaltlos.
        </P>
        <H2>2. Konto und Zugang</H2>
        <P>
          Der Zugang zum Dashboard setzt ein Konto voraus (Authentifizierung über Google). Sie sind
          für die Vertraulichkeit Ihrer Zugangsdaten und für die über Ihr Konto ausgeführten
          Handlungen verantwortlich.
        </P>
        <H2>3. Nutzung des Prüfdienstes</H2>
        <UL
          items={[
            'Sie dürfen ausschließlich Websites prüfen, deren Inhaber Sie sind oder für die Ihnen eine Genehmigung vorliegt.',
            'Der Prüf-Robot (KonformeBot) führt standardmäßige HTTP-Anfragen aus, begrenzt auf einige Seiten pro Prüfung.',
            'Es ist untersagt, den Dienst zu nutzen, um Websites Dritter zu überlasten, auszuspähen oder anzugreifen.',
          ]}
        />
        <H2>4. Grenzen des Dienstes</H2>
        <P>
          Die automatisierte Prüfung deckt diejenigen Barrierefreiheitskriterien ab, die
          maschinell überprüfbar sind. Sie stellt für sich genommen keine Garantie für die
          vollständige rechtliche Konformität dar: Bestimmte RGAA-/WCAG-Kriterien erfordern eine
          menschliche Überprüfung. Die Ergebnisse werden zu Informationszwecken und ohne Gewähr
          für Vollständigkeit bereitgestellt.
        </P>
        <H2>5. Haftung</H2>
        <P>
          KAYZEN setzt angemessene Mittel ein, um die Verfügbarkeit des Dienstes
          sicherzustellen, ohne jedoch einen Erfolg zu schulden. KAYZEN haftet nicht für
          mittelbare Schäden, die aus der Nutzung oder der Nichtverfügbarkeit des Dienstes
          entstehen.
        </P>
        <H2>6. Anwendbares Recht</H2>
        <P>
          Diese Allgemeinen Nutzungsbedingungen unterliegen französischem Recht. Zuständige
          Gerichte: Lyon.
        </P>
      </>
    ),
  },
  {
    slug: 'cgv',
    title: 'Allgemeine Geschäftsbedingungen',
    description: 'Bedingungen für die kostenpflichtigen Angebote von Konforme.',
    updated: '2026-07-12',
    body: (
      <>
        {LANGUAGE_CLAUSE}
        <H2>1. Angebote</H2>
        <P>
          Konforme bietet ein kostenloses Angebot (automatisierte Prüfung) sowie kostenpflichtige
          Leistungen an (begleitete Prüfungen, Herstellung der Konformität, Überwachungsabonnements).
          Die kostenpflichtigen Leistungen sind Gegenstand eines Angebots oder eines
          Online-Abschlusses, in dem Preis, Laufzeit und Umfang festgelegt werden.
        </P>
        <H2>2. Preise und Zahlung</H2>
        <P>
          Die Preise verstehen sich in Euro zuzüglich Steuern. Die Zahlung erfolgt bei Abschluss
          oder gemäß dem im Angebot vorgesehenen Zahlungsplan. Jeder Zahlungsverzug führt zu
          Verzugszinsen in Höhe des gesetzlichen Zinssatzes.
        </P>
        <H2>3. Widerrufsrecht</H2>
        <P>
          Gemäß Artikel L221-3 des französischen Verbrauchergesetzbuchs (Code de la consommation)
          gilt das 14-tägige Widerrufsrecht für Verbraucherkundinnen und -kunden sowie, unter
          bestimmten Voraussetzungen, für Gewerbetreibende mit weniger als 6 Beschäftigten, sofern
          die Leistung außerhalb ihres Haupttätigkeitsbereichs liegt.
        </P>
        <H2>4. Kündigung</H2>
        <P>
          Die Abonnements können jederzeit über das Dashboard oder per E-Mail gekündigt werden; die
          Kündigung wird zum Ende des laufenden Zeitraums wirksam.
        </P>
      </>
    ),
  },
  {
    slug: 'confidentialite',
    title: 'Datenschutzerklärung',
    description:
      'Welche Daten Konforme erhebt, zu welchem Zweck und welche Rechte Ihnen nach der DSGVO zustehen.',
    updated: '2026-07-12',
    body: (
      <>
        {LANGUAGE_CLAUSE}
        <H2>Verantwortlicher für die Verarbeitung</H2>
        <P>Tarek BELHADJ, Einzelunternehmer (Handelsname KAYZEN), 6 rue Pierre Termier, 69009 Lyon — contact@kayzen-lyon.fr.</P>
        <H2>Erhobene Daten</H2>
        <UL
          items={[
            <>
              <strong className="text-text">Konto</strong>: Name, E-Mail-Adresse und Avatar, die
              bei der OAuth-Anmeldung von Google übermittelt werden.
            </>,
            <>
              <strong className="text-text">Nutzung</strong>: hinzugefügte Websites, gestartete
              Prüfungen und die zugehörigen Ergebnisse.
            </>,
            <>
              <strong className="text-text">Keine Werbe-Tracker</strong>: Die Website verwendet
              weder Werbe-Cookies noch Tracking-Werkzeuge von Drittanbietern.
            </>,
          ]}
        />
        <H2>Zwecke und Rechtsgrundlagen</H2>
        <P>
          Bereitstellung des Dienstes (Erfüllung des Vertrags), Sicherheit und Missbrauchsprävention
          (berechtigtes Interesse), gegebenenfalls Rechnungsstellung (rechtliche Verpflichtung).
        </P>
        <H2>Hosting und Speicherfristen</H2>
        <P>
          Die Daten werden in der Europäischen Union gehostet (Appwrite Cloud, Region Frankfurt).
          Sie werden so lange aufbewahrt, wie Ihr Konto aktiv ist, und anschließend innerhalb von
          90 Tagen nach Löschung des Kontos gelöscht.
        </P>
        <H2>Ihre Rechte</H2>
        <P>
          Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Datenübertragbarkeit,
          Widerspruch und Einschränkung der Verarbeitung. Sie können diese Rechte per E-Mail an
          contact@kayzen-lyon.fr ausüben. Sie können sich außerdem an die CNIL (die französische
          Datenschutzbehörde, cnil.fr) wenden.
        </P>
      </>
    ),
  },
  {
    slug: 'rgpd',
    title: 'DSGVO-Konformität',
    description:
      'Die DSGVO-Verpflichtungen von Konforme: Datenminimierung, Hosting in der EU, Auftragsverarbeiter.',
    updated: '2026-07-12',
    body: (
      <>
        {LANGUAGE_CLAUSE}
        <H2>Unsere Grundsätze</H2>
        <UL
          items={[
            'Datenminimierung: Wir erheben ausschließlich die für den Dienst erforderlichen Daten.',
            'Hosting in der EU: Datenbank und Dateien in der Region Frankfurt (Deutschland).',
            'Verschlüsselung: Daten werden bei der Übertragung (TLS) und im Ruhezustand verschlüsselt.',
            'Abschottung: Jede Organisation hat ausschließlich Zugriff auf ihre eigenen Daten (RLS-Regeln auf Datenbankebene).',
          ]}
        />
        <H2>Auftragsverarbeiter</H2>
        <UL
          items={[
            'Appwrite Cloud (Datenbank, Authentifizierung, Funktionen) — EU-Region (Frankfurt).',
            'Vercel (Hosting der Website) — Standardvertragsklauseln.',
            'Google (OAuth-Authentifizierung) — nur, wenn Sie diese Anmeldeart wählen.',
          ]}
        />
        <H2>Verletzung des Schutzes personenbezogener Daten</H2>
        <P>
          Im Falle einer Verletzung, die ein Risiko für Ihre Rechte mit sich bringen kann,
          benachrichtigen wir die CNIL (die französische Datenschutzbehörde) innerhalb von 72
          Stunden und die betroffenen Personen unverzüglich.
        </P>
        <P>
          Siehe auch unsere{' '}
          <Link to="/legal/confidentialite" className="text-link hover:underline">
            Datenschutzerklärung
          </Link>
          .
        </P>
      </>
    ),
  },
  {
    slug: 'cookies',
    title: 'Cookie-Richtlinie',
    description:
      'Konforme verwendet ausschließlich technisch notwendige Cookies, ohne Werbe-Tracker.',
    updated: '2026-07-12',
    body: (
      <>
        {LANGUAGE_CLAUSE}
        <H2>Verwendete Cookies</H2>
        <P>
          Die Website verwendet{' '}
          <strong className="text-text">
            keinerlei Werbe-Cookies und keine Reichweitenmessung durch Dritte
          </strong>
          . Es werden ausschließlich streng technisch notwendige Cookies und Speicherverfahren
          eingesetzt:
        </P>
        <UL
          items={[
            'Appwrite-Sitzungscookie (Authentifizierung) — unerlässlich für die Funktion des Dashboards.',
            'Etwaige lokale Einstellungen (localStorage) — werden niemals an Dritte übermittelt.',
          ]}
        />
        <P>
          Da diese Cookies unbedingt erforderlich sind, bedürfen sie keines Einwilligungsbanners
          (Beschluss der CNIL, der französischen Datenschutzbehörde). Sie können sie jederzeit über
          Ihren Browser löschen; Sie werden dann abgemeldet.
        </P>
      </>
    ),
  },
]
