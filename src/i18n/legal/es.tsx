/* eslint-disable react-refresh/only-export-components -- fichier de contenu, pas de HMR nécessaire */
import { Link } from 'react-router-dom'
import type { LegalDoc } from '@/content/legal'
import { H2, P, UL } from '@/content/legal-ui'

const LanguageClause = () => (
  <P>
    Esta es una traducción de cortesía. La versión francesa de este documento es la jurídicamente
    vinculante; en caso de discrepancia de interpretación, prevalecerá la versión francesa.
  </P>
)

/** Documents légaux traduits en espagnol. */
export const LEGAL_ES: LegalDoc[] = [
  {
    slug: 'mentions-legales',
    title: 'Aviso legal',
    description:
      'Editor, director de publicación y proveedor de alojamiento del sitio konforme.kayzen-lyon.com.',
    updated: '2026-07-12',
    body: (
      <>
        <LanguageClause />
        <H2>Editor del sitio</H2>
        <P>
          El sitio konforme.kayzen-lyon.com está editado por{' '}
          <strong className="text-text">Tarek BELHADJ</strong>, empresario individual (entrepreneur
          individuel) con el nombre comercial <strong className="text-text">KAYZEN</strong> —
          SIREN 493 857 262, SIRET 493 857 262 00098, código APE 62.01Z — con domicilio en 6 rue
          Pierre Termier, 69009 Lyon, Francia. IVA no aplicable, art. L. 233-3 del CIBS francés
          (régimen de franquicia, franchise en base).
        </P>
        <P>
          Teléfono: +33 (0)4 87 77 68 61 — Correo electrónico: contact@kayzen-lyon.fr.
          <br />
          Director de la publicación: Tarek BELHADJ.
        </P>
        <H2>Alojamiento</H2>
        <P>
          El sitio está alojado por Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, Estados
          Unidos (vercel.com). Los datos de la aplicación (cuentas, base de datos, funciones) están
          alojados por Appwrite Cloud (Appwrite Code Ltd., appwrite.io), región de Fráncfort,
          Alemania (Unión Europea).
        </P>
        <H2>Propiedad intelectual</H2>
        <P>
          El conjunto de los contenidos del sitio (textos, interfaces, logotipos, código) está
          protegido por los derechos de autor. Queda prohibida toda reproducción no autorizada.
        </P>
      </>
    ),
  },
  {
    slug: 'cgu',
    title: 'Condiciones generales de uso',
    description: 'Normas de utilización de la plataforma Konforme.',
    updated: '2026-07-12',
    body: (
      <>
        <LanguageClause />
        <H2>1. Objeto</H2>
        <P>
          Las presentes condiciones generales de uso regulan la utilización de la plataforma
          Konforme, servicio de auditoría de accesibilidad web editado por KAYZEN (Tarek BELHADJ, empresario individual). Al crear una
          cuenta, usted las acepta sin reservas.
        </P>
        <H2>2. Cuenta y acceso</H2>
        <P>
          El acceso al panel de control requiere una cuenta (autenticación con Google). Usted es
          responsable de la confidencialidad de sus credenciales y de las acciones realizadas desde
          su cuenta.
        </P>
        <H2>3. Uso del servicio de auditoría</H2>
        <UL
          items={[
            'Solo puede auditar sitios de los que sea propietario o para los que disponga de una autorización.',
            'El robot de auditoría (KonformeBot) realiza peticiones HTTP estándar, limitadas a unas pocas páginas por auditoría.',
            'Queda prohibido utilizar el servicio para sobrecargar, sondear o atacar sitios de terceros.',
          ]}
        />
        <H2>4. Límites del servicio</H2>
        <P>
          La auditoría automatizada cubre los criterios de accesibilidad verificables por máquina.
          No constituye, por sí sola, una garantía de conformidad legal total: determinados
          criterios RGAA/WCAG requieren una verificación humana. Los resultados se facilitan a
          título informativo, sin garantía de exhaustividad.
        </P>
        <H2>5. Responsabilidad</H2>
        <P>
          KAYZEN emplea medios razonables para garantizar la disponibilidad del servicio, sin
          obligación de resultado. No podrá exigirse responsabilidad a KAYZEN por los daños
          indirectos derivados del uso o de la indisponibilidad del servicio.
        </P>
        <H2>6. Derecho aplicable</H2>
        <P>
          Las presentes condiciones generales de uso se someten al Derecho francés. Tribunales
          competentes: Lyon.
        </P>
      </>
    ),
  },
  {
    slug: 'cgv',
    title: 'Condiciones generales de venta',
    description: 'Condiciones aplicables a las ofertas de pago de Konforme.',
    updated: '2026-07-12',
    body: (
      <>
        <LanguageClause />
        <H2>1. Ofertas</H2>
        <P>
          Konforme ofrece una modalidad gratuita (auditoría automatizada) y prestaciones de pago
          (auditorías asistidas, adecuación a la normativa, suscripciones de supervisión). Las
          prestaciones de pago son objeto de un presupuesto o de una suscripción en línea que
          precisa el precio, la duración y el alcance.
        </P>
        <H2>2. Precios y pago</H2>
        <P>
          Los precios se expresan en euros, sin impuestos. El pago se efectúa en el momento de la
          suscripción o según el calendario previsto en el presupuesto. Todo retraso en el pago
          conlleva penalizaciones al tipo legal.
        </P>
        <H2>3. Desistimiento</H2>
        <P>
          De conformidad con el artículo L221-3 del Código de consumo francés, el derecho de
          desistimiento de 14 días se aplica a los clientes consumidores y, con ciertas condiciones,
          a los profesionales con menos de 6 empleados cuando la prestación queda fuera de su ámbito
          de actividad principal.
        </P>
        <H2>4. Rescisión</H2>
        <P>
          Las suscripciones pueden rescindirse en cualquier momento desde el panel de control o por
          correo electrónico; la rescisión surte efecto al finalizar el período en curso.
        </P>
      </>
    ),
  },
  {
    slug: 'confidentialite',
    title: 'Política de privacidad',
    description: 'Qué datos recopila Konforme, con qué finalidad y cuáles son sus derechos RGPD.',
    updated: '2026-07-12',
    body: (
      <>
        <LanguageClause />
        <H2>Responsable del tratamiento</H2>
        <P>Tarek BELHADJ, empresario individual (nombre comercial KAYZEN), 6 rue Pierre Termier, 69009 Lyon — contact@kayzen-lyon.fr.</P>
        <H2>Datos recopilados</H2>
        <UL
          items={[
            <>
              <strong className="text-text">Cuenta</strong>: nombre, correo electrónico y avatar
              transmitidos por Google durante la conexión OAuth.
            </>,
            <>
              <strong className="text-text">Uso</strong>: sitios añadidos, auditorías lanzadas y
              resultados asociados.
            </>,
            <>
              <strong className="text-text">Ningún rastreador publicitario</strong>: el sitio no
              utiliza cookies publicitarias ni herramientas de seguimiento de terceros.
            </>,
          ]}
        />
        <H2>Finalidades y bases jurídicas</H2>
        <P>
          Prestación del servicio (ejecución del contrato), seguridad y prevención de abusos
          (interés legítimo) y facturación cuando proceda (obligación legal).
        </P>
        <H2>Alojamiento y plazos de conservación</H2>
        <P>
          Los datos se alojan en la Unión Europea (Appwrite Cloud, región de Fráncfort). Se
          conservan mientras su cuenta permanezca activa y se suprimen en un plazo de 90 días tras
          la eliminación de la cuenta.
        </P>
        <H2>Sus derechos</H2>
        <P>
          Usted dispone de los derechos de acceso, rectificación, supresión, portabilidad, oposición
          y limitación. Puede ejercerlos por correo electrónico en contact@kayzen-lyon.fr. También
          puede presentar una reclamación ante la CNIL (la autoridad francesa de protección de
          datos, cnil.fr).
        </P>
      </>
    ),
  },
  {
    slug: 'rgpd',
    title: 'Conformidad con el RGPD',
    description:
      'Los compromisos de Konforme en materia de RGPD: minimización, alojamiento en la UE, encargados del tratamiento.',
    updated: '2026-07-12',
    body: (
      <>
        <LanguageClause />
        <H2>Nuestros principios</H2>
        <UL
          items={[
            'Minimización: solo recopilamos los datos necesarios para el servicio.',
            'Alojamiento en la UE: base de datos y archivos en la región de Fráncfort (Alemania).',
            'Cifrado: datos cifrados en tránsito (TLS) y en reposo.',
            'Compartimentación: cada organización accede únicamente a sus propios datos (reglas RLS a nivel de la base de datos).',
          ]}
        />
        <H2>Encargados del tratamiento</H2>
        <UL
          items={[
            'Appwrite Cloud (base de datos, autenticación, funciones) — región UE (Fráncfort).',
            'Vercel (alojamiento del sitio) — cláusulas contractuales tipo.',
            'Google (autenticación OAuth) — únicamente si elige este modo de conexión.',
          ]}
        />
        <H2>Violación de datos</H2>
        <P>
          En caso de violación que pueda entrañar un riesgo para sus derechos, lo notificamos a la
          CNIL (la autoridad francesa de protección de datos) en un plazo de 72 h y a las personas
          afectadas en el menor plazo posible.
        </P>
        <P>
          Consulte también nuestra{' '}
          <Link to="/legal/confidentialite" className="text-link hover:underline">
            política de privacidad
          </Link>
          .
        </P>
      </>
    ),
  },
  {
    slug: 'cookies',
    title: 'Política de cookies',
    description:
      'Konforme utiliza únicamente cookies técnicas, sin ningún rastreador publicitario.',
    updated: '2026-07-12',
    body: (
      <>
        <LanguageClause />
        <H2>Cookies utilizadas</H2>
        <P>
          El sitio no utiliza{' '}
          <strong className="text-text">
            ninguna cookie publicitaria ni de medición de audiencia de terceros
          </strong>
          . Únicamente se emplean cookies y almacenamientos estrictamente técnicos:
        </P>
        <UL
          items={[
            'Cookie de sesión de Appwrite (autenticación) — imprescindible para el funcionamiento del panel de control.',
            'Preferencias locales eventuales (localStorage) — nunca transmitidas a terceros.',
          ]}
        />
        <P>
          Al ser estas cookies estrictamente necesarias, no requieren banner de consentimiento
          (deliberación de la CNIL, la autoridad francesa de protección de datos). Puede eliminarlas
          en cualquier momento desde su navegador; en tal caso, se cerrará su sesión.
        </P>
      </>
    ),
  },
]
