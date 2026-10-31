import { Link } from 'react-router-dom'
import { H2, P, UL } from '@/content/legal-ui'
import type { LegalDoc } from '@/content/legal'

/** Documents légaux traduits en anglais. */
export const LEGAL_EN: LegalDoc[] = [
  {
    slug: 'mentions-legales',
    title: 'Legal notice',
    description: 'Publisher, publication director and hosting provider of konforme.kayzen-lyon.com.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          This is a courtesy translation. The French version of this document is the legally binding
          one; in the event of any discrepancy in interpretation, the French version prevails.
        </P>
        <H2>Website publisher</H2>
        <P>
          The konforme.kayzen-lyon.com website is published by{' '}
          <strong className="text-text">Tarek BELHADJ</strong>, sole trader (entrepreneur
          individuel) trading as <strong className="text-text">KAYZEN</strong> — SIREN 493 857 262,
          SIRET 493 857 262 00098, APE code 62.01Z — whose business address is 6 rue Pierre
          Termier, 69009 Lyon, France. VAT not applicable, Article L. 233-3 of the French CIBS
          (VAT franchise scheme, franchise en base).
        </P>
        <P>
          Telephone: +33 (0)4 87 77 68 61 — Email: contact@kayzen-lyon.fr.
          <br />
          Publication director: Tarek BELHADJ.
        </P>
        <H2>Hosting</H2>
        <P>
          The website is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United
          States (vercel.com). Application data (accounts, database, functions) is hosted by
          Appwrite Cloud (Appwrite Code Ltd., appwrite.io), Frankfurt region, Germany (European
          Union).
        </P>
        <H2>Intellectual property</H2>
        <P>
          All content on the website (texts, interfaces, logos, code) is protected by copyright. Any
          unauthorised reproduction is prohibited.
        </P>
      </>
    ),
  },
  {
    slug: 'cgu',
    title: 'Terms of use',
    description: 'Rules governing the use of the Konforme platform.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          This is a courtesy translation. The French version of this document is the legally binding
          one; in the event of any discrepancy in interpretation, the French version prevails.
        </P>
        <H2>1. Purpose</H2>
        <P>
          These terms of use govern the use of the Konforme platform, a web accessibility audit
          service published by KAYZEN (Tarek BELHADJ, sole trader). By creating an account, you accept them without
          reservation.
        </P>
        <H2>2. Account and access</H2>
        <P>
          Access to the dashboard requires an account (Google authentication). You are responsible
          for keeping your credentials confidential and for any action carried out from your
          account.
        </P>
        <H2>3. Use of the audit service</H2>
        <UL
          items={[
            'You may only audit websites that you own or for which you have obtained authorisation.',
            'The audit robot (KonformeBot) performs standard HTTP requests, limited to a few pages per audit.',
            'Using the service to overload, probe or attack third-party websites is prohibited.',
          ]}
        />
        <H2>4. Limits of the service</H2>
        <P>
          The automated audit covers the accessibility criteria that can be verified by machine. On
          its own, it does not constitute a guarantee of full legal compliance: some RGAA/WCAG
          criteria require human verification. Results are provided for information purposes only,
          with no guarantee of completeness.
        </P>
        <H2>5. Liability</H2>
        <P>
          KAYZEN implements reasonable means to ensure the availability of the service, without
          any obligation to achieve a specific result. KAYZEN may not be held liable for
          indirect damages resulting from the use or unavailability of the service.
        </P>
        <H2>6. Governing law</H2>
        <P>
          These terms of use are governed by French law. Courts having jurisdiction: Lyon, France.
        </P>
      </>
    ),
  },
  {
    slug: 'cgv',
    title: 'Terms and conditions of sale',
    description: 'Conditions applicable to the paid Konforme plans.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          This is a courtesy translation. The French version of this document is the legally binding
          one; in the event of any discrepancy in interpretation, the French version prevails.
        </P>
        <H2>1. Offers</H2>
        <P>
          Konforme offers a free plan (automated audit) and paid services (assisted audits,
          remediation work, monitoring subscriptions). Paid services are subject to a quotation or
          an online subscription setting out the price, the duration and the scope.
        </P>
        <H2>2. Prices and payment</H2>
        <P>
          Prices are expressed in euros excluding taxes. Payment is made upon subscription or
          according to the payment schedule set out in the quotation. Any late payment gives rise to
          penalties at the statutory rate.
        </P>
        <H2>3. Withdrawal</H2>
        <P>
          In accordance with article L221-3 of the French Consumer Code, the 14-day right of
          withdrawal applies to consumer customers and, subject to conditions, to professionals with
          fewer than 6 employees acting outside their main field of activity.
        </P>
        <H2>4. Termination</H2>
        <P>
          Subscriptions may be cancelled at any time from the dashboard or by email; termination
          takes effect at the end of the current period.
        </P>
      </>
    ),
  },
  {
    slug: 'confidentialite',
    title: 'Privacy policy',
    description: 'What data Konforme collects, why, and your rights under the GDPR.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          This is a courtesy translation. The French version of this document is the legally binding
          one; in the event of any discrepancy in interpretation, the French version prevails.
        </P>
        <H2>Data controller</H2>
        <P>Tarek BELHADJ, sole trader trading as KAYZEN, 6 rue Pierre Termier, 69009 Lyon, France — contact@kayzen-lyon.fr.</P>
        <H2>Data collected</H2>
        <UL
          items={[
            <>
              <strong className="text-text">Account</strong>: name, email address and avatar
              provided by Google during OAuth sign-in.
            </>,
            <>
              <strong className="text-text">Usage</strong>: websites added, audits started and the
              associated results.
            </>,
            <>
              <strong className="text-text">No advertising trackers</strong>: the website uses
              neither advertising cookies nor third-party tracking tools.
            </>,
          ]}
        />
        <H2>Purposes and legal bases</H2>
        <P>
          Provision of the service (performance of the contract), security and prevention of abuse
          (legitimate interest), and invoicing where applicable (legal obligation).
        </P>
        <H2>Hosting and retention periods</H2>
        <P>
          Data is hosted in the European Union (Appwrite Cloud, Frankfurt region). It is retained for
          as long as your account is active, then deleted within 90 days of the account being
          deleted.
        </P>
        <H2>Your rights</H2>
        <P>
          You have the rights of access, rectification, erasure, portability, objection and
          restriction. Exercise them by email at contact@kayzen-lyon.fr. You may also lodge a
          complaint with the CNIL, the French data-protection authority (cnil.fr).
        </P>
      </>
    ),
  },
  {
    slug: 'rgpd',
    title: 'GDPR compliance',
    description:
      'Konforme GDPR commitments: data minimisation, EU hosting, sub-processors.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          This is a courtesy translation. The French version of this document is the legally binding
          one; in the event of any discrepancy in interpretation, the French version prevails.
        </P>
        <H2>Our principles</H2>
        <UL
          items={[
            'Minimisation: we only collect the data required to provide the service.',
            'EU hosting: database and files in the Frankfurt region (Germany).',
            'Encryption: data encrypted in transit (TLS) and at rest.',
            'Segregation: each organisation can only access its own data (RLS rules at database level).',
          ]}
        />
        <H2>Sub-processors</H2>
        <UL
          items={[
            'Appwrite Cloud (database, authentication, functions) — EU region (Frankfurt).',
            'Vercel (website hosting) — standard contractual clauses.',
            'Google (OAuth authentication) — only if you choose this sign-in method.',
          ]}
        />
        <H2>Data breach</H2>
        <P>
          In the event of a breach likely to create a risk to your rights, we notify the CNIL (the
          French data-protection authority) within 72 hours and the data subjects concerned as soon
          as possible.
        </P>
        <P>
          See also our{' '}
          <Link to="/legal/confidentialite" className="text-link hover:underline">
            privacy policy
          </Link>
          .
        </P>
      </>
    ),
  },
  {
    slug: 'cookies',
    title: 'Cookie policy',
    description: 'Konforme uses technical cookies only, with no advertising trackers.',
    updated: '2026-10-31',
    body: (
      <>
        <P>
          This is a courtesy translation. The French version of this document is the legally binding
          one; in the event of any discrepancy in interpretation, the French version prevails.
        </P>
        <H2>Cookies used</H2>
        <P>
          The website uses{' '}
          <strong className="text-text">
            no advertising cookies and no third-party audience measurement
          </strong>
          . Only strictly technical cookies and storage are used:
        </P>
        <UL
          items={[
            'Appwrite session cookie (authentication) — essential to the operation of the dashboard.',
            'Any local preferences (localStorage) — never transmitted to third parties.',
          ]}
        />
        <P>
          As these cookies are strictly necessary, they do not require a consent banner (CNIL
          decision). You may delete them at any time from your browser; you will then be signed out.
        </P>
      </>
    ),
  },
]
