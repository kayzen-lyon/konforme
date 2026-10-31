import { Link } from 'react-router-dom'
import { H2, P, UL } from '@/content/legal-ui'
import type { LegalDoc } from '@/content/legal'

/** Documents légaux traduits en italien. */
export const LEGAL_IT: LegalDoc[] = [
  {
    slug: 'mentions-legales',
    title: 'Note legali',
    description:
      'Editore, direttore della pubblicazione e provider di hosting del sito konforme.kayzen-lyon.com.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          La presente è una traduzione di cortesia. La versione francese di questo documento è
          quella giuridicamente vincolante; in caso di divergenza interpretativa prevale la
          versione francese.
        </P>
        <H2>Editore del sito</H2>
        <P>
          Il sito konforme.kayzen-lyon.com è edito da <strong className="text-text">Tarek BELHADJ</strong>,
          imprenditore individuale (entrepreneur individuel) con il nome commerciale{' '}
          <strong className="text-text">KAYZEN</strong> — SIREN 493 857 262, SIRET 493 857 262 00098,
          codice APE 62.01Z — con sede in 6 rue Pierre Termier, 69009 Lyon, Francia. IVA non
          applicabile, art. L. 233-3 del CIBS francese (regime di franchigia, franchise en base).
        </P>
        <P>
          Telefono: +33 (0)4 87 77 68 61 — Email: contact@kayzen-lyon.fr.
          <br />
          Direttore della pubblicazione: Tarek BELHADJ.
        </P>
        <H2>Hosting</H2>
        <P>
          Il sito è ospitato da Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, Stati Uniti
          (vercel.com). I dati applicativi (account, database, funzioni) sono ospitati da Appwrite
          Cloud (Appwrite Code Ltd., appwrite.io), regione di Francoforte, Germania (Unione europea).
        </P>
        <H2>Proprietà intellettuale</H2>
        <P>
          L’insieme dei contenuti del sito (testi, interfacce, loghi, codice) è protetto dal
          diritto d’autore. Qualsiasi riproduzione non autorizzata è vietata.
        </P>
      </>
    ),
  },
  {
    slug: 'cgu',
    title: 'Condizioni generali di utilizzo',
    description: 'Regole di utilizzo della piattaforma Konforme.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          La presente è una traduzione di cortesia. La versione francese di questo documento è
          quella giuridicamente vincolante; in caso di divergenza interpretativa prevale la
          versione francese.
        </P>
        <H2>1. Oggetto</H2>
        <P>
          Le presenti condizioni generali di utilizzo disciplinano l’uso della piattaforma
          Konforme, servizio di audit di accessibilità web edito da KAYZEN (Tarek BELHADJ, imprenditore individuale). Creando un
          account, l’utente le accetta senza riserve.
        </P>
        <H2>2. Account e accesso</H2>
        <P>
          L’accesso al pannello di controllo richiede un account (autenticazione Google). L’utente
          è responsabile della riservatezza delle proprie credenziali e delle azioni compiute dal
          proprio account.
        </P>
        <H2>3. Utilizzo del servizio di audit</H2>
        <UL
          items={[
            'È possibile sottoporre ad audit unicamente i siti di cui si è proprietari o per i quali si dispone di un’autorizzazione.',
            'Il robot di audit (KonformeBot) effettua richieste HTTP standard, limitate ad alcune pagine per audit.',
            'È vietato utilizzare il servizio per sovraccaricare, sondare o attaccare siti di terzi.',
          ]}
        />
        <H2>4. Limiti del servizio</H2>
        <P>
          L’audit automatizzato copre i criteri di accessibilità verificabili automaticamente. Da
          solo non costituisce una garanzia di piena conformità legale: alcuni criteri RGAA/WCAG
          richiedono una verifica umana. I risultati sono forniti a titolo informativo, senza
          garanzia di esaustività.
        </P>
        <H2>5. Responsabilità</H2>
        <P>
          KAYZEN adotta mezzi ragionevoli per assicurare la disponibilità del servizio, senza
          obbligazione di risultato. La responsabilità di KAYZEN non può essere invocata per
          i danni indiretti derivanti dall’utilizzo o dall’indisponibilità del servizio.
        </P>
        <H2>6. Legge applicabile</H2>
        <P>
          Le presenti condizioni generali di utilizzo sono soggette al diritto francese. Foro
          competente: Lione.
        </P>
      </>
    ),
  },
  {
    slug: 'cgv',
    title: 'Condizioni generali di vendita',
    description: 'Condizioni applicabili alle offerte a pagamento di Konforme.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          La presente è una traduzione di cortesia. La versione francese di questo documento è
          quella giuridicamente vincolante; in caso di divergenza interpretativa prevale la
          versione francese.
        </P>
        <H2>1. Offerte</H2>
        <P>
          Konforme propone un’offerta gratuita (audit automatizzato) e prestazioni a pagamento
          (audit assistiti, messa a norma, abbonamenti di monitoraggio). Le prestazioni a pagamento
          sono oggetto di un preventivo o di una sottoscrizione online che precisa il prezzo, la
          durata e il perimetro.
        </P>
        <H2>2. Prezzi e pagamento</H2>
        <P>
          I prezzi sono espressi in euro al netto delle imposte. Il pagamento avviene al momento
          della sottoscrizione o secondo lo scadenzario previsto nel preventivo. Qualsiasi ritardo
          di pagamento comporta penali al tasso legale.
        </P>
        <H2>3. Recesso</H2>
        <P>
          Conformemente all’articolo L221-3 del Codice del consumo francese, il diritto di recesso
          di 14 giorni si applica ai clienti consumatori e, a determinate condizioni, ai
          professionisti con meno di 6 dipendenti al di fuori del proprio settore di attività
          principale.
        </P>
        <H2>4. Risoluzione</H2>
        <P>
          Gli abbonamenti possono essere disdetti in qualsiasi momento dal pannello di controllo o
          via email; la disdetta ha effetto al termine del periodo in corso.
        </P>
      </>
    ),
  },
  {
    slug: 'confidentialite',
    title: 'Informativa sulla privacy',
    description: 'Quali dati raccoglie Konforme, perché, e i vostri diritti ai sensi del GDPR.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          La presente è una traduzione di cortesia. La versione francese di questo documento è
          quella giuridicamente vincolante; in caso di divergenza interpretativa prevale la
          versione francese.
        </P>
        <H2>Titolare del trattamento</H2>
        <P>Tarek BELHADJ, imprenditore individuale (nome commerciale KAYZEN), 6 rue Pierre Termier, 69009 Lyon — contact@kayzen-lyon.fr.</P>
        <H2>Dati raccolti</H2>
        <UL
          items={[
            <>
              <strong className="text-text">Account</strong>: nome, email e avatar trasmessi da
              Google al momento della connessione OAuth.
            </>,
            <>
              <strong className="text-text">Utilizzo</strong>: siti aggiunti, audit avviati e
              risultati associati.
            </>,
            <>
              <strong className="text-text">Nessun tracciante pubblicitario</strong>: il sito non
              utilizza né cookie pubblicitari né strumenti di tracciamento di terze parti.
            </>,
          ]}
        />
        <H2>Finalità e basi giuridiche</H2>
        <P>
          Fornitura del servizio (esecuzione del contratto), sicurezza e prevenzione degli abusi
          (legittimo interesse), fatturazione ove applicabile (obbligo di legge).
        </P>
        <H2>Hosting e durate di conservazione</H2>
        <P>
          I dati sono ospitati nell’Unione europea (Appwrite Cloud, regione di Francoforte). Sono
          conservati per tutto il tempo in cui il vostro account è attivo, quindi cancellati entro
          un termine di 90 giorni dalla soppressione dell’account.
        </P>
        <H2>I vostri diritti</H2>
        <P>
          Disponete dei diritti di accesso, rettifica, cancellazione, portabilità, opposizione e
          limitazione. Potete esercitarli via email all’indirizzo contact@kayzen-lyon.fr. Potete
          inoltre presentare reclamo alla CNIL (l’autorità francese per la protezione dei dati,
          cnil.fr).
        </P>
      </>
    ),
  },
  {
    slug: 'rgpd',
    title: 'Conformità al GDPR',
    description:
      'Gli impegni di Konforme in materia di GDPR: minimizzazione, hosting nell’UE, responsabili del trattamento.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          La presente è una traduzione di cortesia. La versione francese di questo documento è
          quella giuridicamente vincolante; in caso di divergenza interpretativa prevale la
          versione francese.
        </P>
        <H2>I nostri principi</H2>
        <UL
          items={[
            'Minimizzazione: raccogliamo esclusivamente i dati necessari al servizio.',
            'Hosting nell’UE: database e file nella regione di Francoforte (Germania).',
            'Cifratura: dati cifrati in transito (TLS) e a riposo.',
            'Segregazione: ogni organizzazione accede unicamente ai propri dati (regole RLS a livello di database).',
          ]}
        />
        <H2>Responsabili del trattamento</H2>
        <UL
          items={[
            'Appwrite Cloud (database, autenticazione, funzioni) — regione UE (Francoforte).',
            'Vercel (hosting del sito) — clausole contrattuali tipo.',
            'Google (autenticazione OAuth) — unicamente se scegliete questa modalità di connessione.',
          ]}
        />
        <H2>Violazione dei dati</H2>
        <P>
          In caso di violazione suscettibile di comportare un rischio per i vostri diritti,
          notifichiamo la CNIL (l’autorità francese per la protezione dei dati) entro 72 ore e
          informiamo le persone interessate nel più breve tempo possibile.
        </P>
        <P>
          Si veda anche la nostra{' '}
          <Link to="/legal/confidentialite" className="text-link hover:underline">
            informativa sulla privacy
          </Link>
          .
        </P>
      </>
    ),
  },
  {
    slug: 'cookies',
    title: 'Politica sui cookie',
    description:
      'Konforme utilizza esclusivamente cookie tecnici, senza alcun tracciante pubblicitario.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          La presente è una traduzione di cortesia. La versione francese di questo documento è
          quella giuridicamente vincolante; in caso di divergenza interpretativa prevale la
          versione francese.
        </P>
        <H2>Cookie utilizzati</H2>
        <P>
          Il sito non utilizza <strong className="text-text">alcun cookie pubblicitario né di
          misurazione dell’audience di terze parti</strong>. Sono utilizzati unicamente cookie e
          archiviazioni strettamente tecnici:
        </P>
        <UL
          items={[
            'Cookie di sessione Appwrite (autenticazione) — indispensabile al funzionamento del pannello di controllo.',
            'Eventuali preferenze locali (localStorage) — mai trasmesse a terzi.',
          ]}
        />
        <P>
          Essendo tali cookie strettamente necessari, non richiedono un banner di consenso
          (deliberazione della CNIL, l’autorità francese per la protezione dei dati). Potete
          eliminarli in qualsiasi momento dal vostro browser; sarete allora disconnessi.
        </P>
      </>
    ),
  },
]
