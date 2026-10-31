import { Link } from 'react-router-dom'
import { H2, P, UL } from '@/content/legal-ui'

export type LegalDoc = {
  slug: string
  title: string
  description: string
  updated: string
  body: React.ReactNode
}

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'mentions-legales',
    title: 'Mentions légales',
    description: 'Éditeur, directeur de publication et hébergeur du site konforme.kayzen-lyon.com.',
    updated: '2026-07-12',
    body: (
      <>
        <H2>Éditeur du site</H2>
        <P>
          Le site konforme.kayzen-lyon.com est édité par <strong className="text-text">Tarek BELHADJ</strong>,
          entrepreneur individuel, nom commercial <strong className="text-text">KAYZEN</strong> —
          SIREN 493 857 262, SIRET 493 857 262 00098, code APE 62.01Z — dont le siège est situé
          6 rue Pierre Termier, 69009 Lyon, France. TVA non applicable, art. L. 233-3 du CIBS
          (franchise en base).
        </P>
        <P>
          Téléphone : +33 (0)4 87 77 68 61 — Email : contact@kayzen-lyon.fr.
          <br />
          Directeur de la publication : Tarek BELHADJ.
        </P>
        <H2>Hébergement</H2>
        <P>
          Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723,
          États-Unis (vercel.com). Les données applicatives (comptes, base de données, fonctions)
          sont hébergées par Appwrite Cloud (Appwrite Code Ltd., appwrite.io), région Francfort,
          Allemagne (Union européenne).
        </P>
        <H2>Propriété intellectuelle</H2>
        <P>
          L'ensemble des contenus du site (textes, interfaces, logos, code) est protégé par le
          droit d'auteur. Toute reproduction non autorisée est interdite.
        </P>
      </>
    ),
  },
  {
    slug: 'cgu',
    title: "Conditions générales d'utilisation",
    description: "Règles d'utilisation de la plateforme Konforme.",
    updated: '2026-07-12',
    body: (
      <>
        <H2>1. Objet</H2>
        <P>
          Les présentes CGU encadrent l'utilisation de la plateforme Konforme, service d'audit
          d'accessibilité web édité par KAYZEN (Tarek BELHADJ, entrepreneur individuel). En créant un compte, vous les acceptez sans
          réserve.
        </P>
        <H2>2. Compte et accès</H2>
        <P>
          L'accès au tableau de bord nécessite un compte (authentification Google). Vous êtes
          responsable de la confidentialité de vos accès et des actions réalisées depuis votre
          compte.
        </P>
        <H2>3. Utilisation du service d'audit</H2>
        <UL
          items={[
            "Vous ne pouvez auditer que des sites dont vous êtes propriétaire ou pour lesquels vous disposez d'une autorisation.",
            "Le robot d'audit (KonformeBot) effectue des requêtes HTTP standard, limitées à quelques pages par audit.",
            "Il est interdit d'utiliser le service pour surcharger, sonder ou attaquer des sites tiers.",
          ]}
        />
        <H2>4. Limites du service</H2>
        <P>
          L'audit automatisé couvre les critères d'accessibilité vérifiables par machine. Il ne
          constitue pas, à lui seul, une garantie de conformité légale totale : certains critères
          RGAA/WCAG requièrent une vérification humaine. Les résultats sont fournis à titre
          informatif, sans garantie d'exhaustivité.
        </P>
        <H2>5. Responsabilité</H2>
        <P>
          KAYZEN met en œuvre des moyens raisonnables pour assurer la disponibilité du
          service, sans obligation de résultat. La responsabilité de KAYZEN ne saurait être
          engagée pour les dommages indirects résultant de l'utilisation ou de l'indisponibilité du
          service.
        </P>
        <H2>6. Droit applicable</H2>
        <P>Les présentes CGU sont soumises au droit français. Tribunaux compétents : Lyon.</P>
      </>
    ),
  },
  {
    slug: 'cgv',
    title: 'Conditions générales de vente',
    description: 'Conditions applicables aux offres payantes de Konforme.',
    updated: '2026-07-12',
    body: (
      <>
        <H2>1. Offres</H2>
        <P>
          Konforme propose une offre gratuite (audit automatisé) et des prestations payantes
          (audits accompagnés, mise en conformité, abonnements de surveillance). Les prestations
          payantes font l'objet d'un devis ou d'une souscription en ligne précisant le prix, la
          durée et le périmètre.
        </P>
        <H2>2. Prix et paiement</H2>
        <P>
          Les prix sont exprimés en euros hors taxes. Le paiement s'effectue à la souscription ou
          selon l'échéancier prévu au devis. Tout retard de paiement entraîne des pénalités au taux
          légal.
        </P>
        <H2>3. Rétractation</H2>
        <P>
          Conformément à l'article L221-3 du Code de la consommation, le droit de rétractation de
          14 jours s'applique aux clients consommateurs et, sous conditions, aux professionnels de
          moins de 6 salariés hors champ d'activité principale.
        </P>
        <H2>4. Résiliation</H2>
        <P>
          Les abonnements sont résiliables à tout moment depuis le tableau de bord ou par email ;
          la résiliation prend effet à la fin de la période en cours.
        </P>
      </>
    ),
  },
  {
    slug: 'confidentialite',
    title: 'Politique de confidentialité',
    description: 'Quelles données Konforme collecte, pourquoi, et vos droits RGPD.',
    updated: '2026-07-12',
    body: (
      <>
        <H2>Responsable de traitement</H2>
        <P>
          Tarek BELHADJ, entrepreneur individuel (nom commercial KAYZEN), 6 rue Pierre Termier, 69009 Lyon — contact@kayzen-lyon.fr.
        </P>
        <H2>Données collectées</H2>
        <UL
          items={[
            <>
              <strong className="text-text">Compte</strong> : nom, email et avatar transmis par
              Google lors de la connexion OAuth.
            </>,
            <>
              <strong className="text-text">Utilisation</strong> : sites ajoutés, audits lancés
              et résultats associés.
            </>,
            <>
              <strong className="text-text">Aucun traceur publicitaire</strong> : le site
              n'utilise ni cookie publicitaire ni outil de tracking tiers.
            </>,
          ]}
        />
        <H2>Finalités et bases légales</H2>
        <P>
          Fourniture du service (exécution du contrat), sécurité et prévention des abus (intérêt
          légitime), facturation le cas échéant (obligation légale).
        </P>
        <H2>Hébergement et durées</H2>
        <P>
          Les données sont hébergées dans l'Union européenne (Appwrite Cloud, région Francfort). Elles sont
          conservées tant que votre compte est actif, puis supprimées dans un délai de 90 jours
          après suppression du compte.
        </P>
        <H2>Vos droits</H2>
        <P>
          Vous disposez des droits d'accès, de rectification, d'effacement, de portabilité,
          d'opposition et de limitation. Exercez-les par email à contact@kayzen-lyon.fr. Vous pouvez
          également saisir la CNIL (cnil.fr).
        </P>
      </>
    ),
  },
  {
    slug: 'rgpd',
    title: 'Conformité RGPD',
    description: 'Les engagements RGPD de Konforme : minimisation, hébergement UE, sous-traitants.',
    updated: '2026-07-12',
    body: (
      <>
        <H2>Nos principes</H2>
        <UL
          items={[
            'Minimisation : nous ne collectons que les données nécessaires au service.',
            'Hébergement UE : base de données et fichiers dans la région Francfort (Allemagne).',
            'Chiffrement : données chiffrées en transit (TLS) et au repos.',
            "Cloisonnement : chaque organisation n'accède qu'à ses propres données (règles RLS au niveau de la base).",
          ]}
        />
        <H2>Sous-traitants</H2>
        <UL
          items={[
            'Appwrite Cloud (base de données, authentification, fonctions) — région UE (Francfort).',
            'Vercel (hébergement du site) — clauses contractuelles types.',
            'Google (authentification OAuth) — uniquement si vous choisissez ce mode de connexion.',
          ]}
        />
        <H2>Violation de données</H2>
        <P>
          En cas de violation susceptible d'engendrer un risque pour vos droits, nous notifions la
          CNIL sous 72 h et les personnes concernées dans les meilleurs délais.
        </P>
        <P>
          Voir aussi notre <Link to="/legal/confidentialite" className="text-link hover:underline">politique de confidentialité</Link>.
        </P>
      </>
    ),
  },
  {
    slug: 'cookies',
    title: 'Politique cookies',
    description: 'Konforme utilise uniquement des cookies techniques, sans traceur publicitaire.',
    updated: '2026-07-12',
    body: (
      <>
        <H2>Cookies utilisés</H2>
        <P>
          Le site n'utilise <strong className="text-text">aucun cookie publicitaire ni de mesure
          d'audience tierce</strong>. Seuls des cookies et stockages strictement techniques sont
          utilisés :
        </P>
        <UL
          items={[
            "Cookie de session Appwrite (authentification) — indispensable au fonctionnement du tableau de bord.",
            'Préférences locales éventuelles (localStorage) — jamais transmises à des tiers.',
          ]}
        />
        <P>
          Ces cookies étant strictement nécessaires, ils ne requièrent pas de bannière de
          consentement (délibération CNIL). Vous pouvez les supprimer à tout moment depuis votre
          navigateur ; vous serez alors déconnecté.
        </P>
      </>
    ),
  },
]
