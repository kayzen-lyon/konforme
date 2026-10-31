import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button-variants'
import { Seo } from '@/components/Seo'
import { defineMessages, useMessages } from '@/i18n'

const CURL_EXAMPLE = `curl -s -X POST "https://fra.cloud.appwrite.io/v1/functions/scan-site/executions" \\
  -H "Content-Type: application/json" \\
  -H "X-Appwrite-Project: konforme" \\
  -d '{"body":"{\\"url\\":\\"https://votre-site.fr\\"}","async":false}'`

const RESPONSE_EXAMPLE = `{
  "url": "https://votre-site.fr/",
  "score": 84.2,
  "rgaa_score": 86.1,
  "wcag_score": 82.7,
  "issues_count": 12,
  "rules_checked": 74,
  "by_severity": { "critical": 2, "serious": 3, "moderate": 5, "minor": 2 },
  "top_issues": [
    { "rule_id": "RGAA 1.1 / WCAG 1.1.1", "severity": "critical", "title": "Image sans alternative textuelle", "count": 4 }
  ]
}`

const ACTION_EXAMPLE = `name: Audit accessibilité (Konforme)
on:
  push:
    branches: [main]
jobs:
  accessibilite:
    runs-on: ubuntu-latest
    steps:
      - name: Audit de la page d'accueil
        run: |
          RES=$(curl -s -X POST "https://fra.cloud.appwrite.io/v1/functions/scan-site/executions" \\
            -H "Content-Type: application/json" \\
            -H "X-Appwrite-Project: konforme" \\
            -d '{"body":"{\\"url\\":\\"https://votre-site.fr\\"}","async":false}')
          SCORE=$(echo "$RES" | jq -r '.responseBody | fromjson | .score')
          echo "Score d'accessibilité : \${SCORE} %"
          awk "BEGIN { exit !(\${SCORE} >= 80) }" || {
            echo "::error::Score d'accessibilité \${SCORE} % sous le seuil de 80 %"
            exit 1
          }`

const L = defineMessages({
  fr: {
    seoTitle: "API & CI : auditez l'accessibilité en un appel HTTP",
    seoDescription:
      "Intégrez l'audit d'accessibilité RGAA/WCAG de Konforme dans votre CI : un appel HTTP sans clé pour auditer une page, et une GitHub Action prête à copier qui bloque les régressions.",
    kicker: 'Développeurs',
    h1: "Auditez l'accessibilité en un appel HTTP",
    intro:
      "Le mini-audit public de Konforme (une page, ~100 règles RGAA 4.1.2 / WCAG 2.2) est accessible en HTTP sans clé d'API ni compte. Idéal pour un contrôle en CI : bloquez le déploiement quand le score régresse.",
    callTitle: "L'appel",
    callNoteA: 'Réponse : le champ ',
    callNoteB:
      " contient le résultat JSON. Les cibles privées (localhost, IP internes) sont refusées, et l'audit d'une page prend 5 à 25 secondes.",
    responseTitle: 'La réponse',
    actionTitle: 'GitHub Action : bloquer les régressions',
    actionNoteA: 'Copiez ce workflow dans ',
    actionNoteB:
      ' : à chaque push, la page est auditée et le build échoue sous 80 % (ajustez le seuil).',
    limitsTitle: 'Limites et suite',
    limit1A: 'Le mode public audite ',
    limit1S: 'une page à la fois',
    limit1B: ', sans persistance ni historique.',
    limit2A:
      'Pour un audit multi-pages, le suivi des 106 critères, les évaluations manuelles, les exports et le monitoring : ',
    limit2Link: 'créez un compte gratuit',
    limit2B: '.',
    limit3:
      'Usage raisonnable : cet endpoint partage les ressources du vérificateur public. Une API dédiée avec clé arrive pour les usages intensifs.',
    ctaTitle: 'Besoin de plus ?',
    ctaText: 'Audit multi-pages, tickets Jira, badge, déclaration légale — tout est dans l’app.',
    ctaButton: 'Commencer gratuitement',
  },
  en: {
    seoTitle: 'API & CI: audit accessibility with a single HTTP call',
    seoDescription:
      "Plug Konforme's RGAA/WCAG accessibility audit into your CI: one key-less HTTP call to audit a page, plus a copy-paste GitHub Action that blocks regressions.",
    kicker: 'Developers',
    h1: 'Audit accessibility with a single HTTP call',
    intro:
      "Konforme's public mini-audit (one page, ~100 RGAA 4.1.2 / WCAG 2.2 rules) is available over HTTP with no API key and no account. Ideal as a CI gate: block the deployment when the score regresses.",
    callTitle: 'The call',
    callNoteA: 'Response: the ',
    callNoteB:
      ' field contains the JSON result. Private targets (localhost, internal IP addresses) are rejected, and auditing one page takes 5 to 25 seconds.',
    responseTitle: 'The response',
    actionTitle: 'GitHub Action: block regressions',
    actionNoteA: 'Copy this workflow into ',
    actionNoteB:
      ': on every push the page is audited and the build fails below 80% (adjust the threshold).',
    limitsTitle: 'Limits and what comes next',
    limit1A: 'The public mode audits ',
    limit1S: 'one page at a time',
    limit1B: ', with no persistence and no history.',
    limit2A:
      'For a multi-page audit, tracking of the 106 criteria, manual evaluations, exports and monitoring: ',
    limit2Link: 'create a free account',
    limit2B: '.',
    limit3:
      'Fair use: this endpoint shares the resources of the public checker. A dedicated API with a key is coming for intensive use.',
    ctaTitle: 'Need more?',
    ctaText: 'Multi-page audits, Jira tickets, badge, legal statement — it is all in the app.',
    ctaButton: 'Get started for free',
  },
  de: {
    seoTitle: 'API & CI: Barrierefreiheit mit einem HTTP-Aufruf prüfen',
    seoDescription:
      'Binden Sie das RGAA-/WCAG-Barrierefreiheitsaudit von Konforme in Ihre CI ein: ein HTTP-Aufruf ohne Schlüssel, um eine Seite zu prüfen, und eine kopierfertige GitHub Action, die Verschlechterungen blockiert.',
    kicker: 'Entwickler',
    h1: 'Barrierefreiheit mit einem HTTP-Aufruf prüfen',
    intro:
      'Das öffentliche Mini-Audit von Konforme (eine Seite, ca. 100 Regeln aus RGAA 4.1.2 / WCAG 2.2) ist per HTTP ohne API-Schlüssel und ohne Konto erreichbar. Ideal als Kontrolle in der CI: Blockieren Sie das Deployment, wenn sich der Wert verschlechtert.',
    callTitle: 'Der Aufruf',
    callNoteA: 'Antwort: das Feld ',
    callNoteB:
      ' enthält das JSON-Ergebnis. Private Ziele (localhost, interne IP-Adressen) werden abgelehnt, und das Audit einer Seite dauert 5 bis 25 Sekunden.',
    responseTitle: 'Die Antwort',
    actionTitle: 'GitHub Action: Verschlechterungen blockieren',
    actionNoteA: 'Kopieren Sie diesen Workflow nach ',
    actionNoteB:
      ': Bei jedem Push wird die Seite geprüft, und der Build schlägt unterhalb von 80 % fehl (passen Sie den Schwellenwert an).',
    limitsTitle: 'Grenzen und Ausblick',
    limit1A: 'Der öffentliche Modus prüft ',
    limit1S: 'jeweils eine Seite',
    limit1B: ', ohne Speicherung und ohne Verlauf.',
    limit2A:
      'Für ein Audit mehrerer Seiten, die Verfolgung der 106 Kriterien, manuelle Bewertungen, Exporte und Monitoring: ',
    limit2Link: 'erstellen Sie ein kostenloses Konto',
    limit2B: '.',
    limit3:
      'Faire Nutzung: Dieser Endpunkt teilt sich die Ressourcen des öffentlichen Prüfers. Eine dedizierte API mit Schlüssel folgt für intensive Nutzung.',
    ctaTitle: 'Brauchen Sie mehr?',
    ctaText: 'Audits über mehrere Seiten, Jira-Tickets, Badge, rechtliche Erklärung — alles in der App.',
    ctaButton: 'Kostenlos starten',
  },
  es: {
    seoTitle: 'API y CI: audite la accesibilidad con una sola llamada HTTP',
    seoDescription:
      'Integre la auditoría de accesibilidad RGAA/WCAG de Konforme en su CI: una llamada HTTP sin clave para auditar una página y una GitHub Action lista para copiar que bloquea las regresiones.',
    kicker: 'Desarrolladores',
    h1: 'Audite la accesibilidad con una sola llamada HTTP',
    intro:
      'La miniauditoría pública de Konforme (una página, unas 100 reglas RGAA 4.1.2 / WCAG 2.2) está disponible por HTTP sin clave de API ni cuenta. Ideal como control en la CI: bloquee el despliegue cuando la puntuación empeore.',
    callTitle: 'La llamada',
    callNoteA: 'Respuesta: el campo ',
    callNoteB:
      ' contiene el resultado JSON. Los destinos privados (localhost, direcciones IP internas) se rechazan, y auditar una página tarda entre 5 y 25 segundos.',
    responseTitle: 'La respuesta',
    actionTitle: 'GitHub Action: bloquear las regresiones',
    actionNoteA: 'Copie este flujo de trabajo en ',
    actionNoteB:
      ': en cada push se audita la página y la compilación falla por debajo del 80 % (ajuste el umbral).',
    limitsTitle: 'Límites y siguientes pasos',
    limit1A: 'El modo público audita ',
    limit1S: 'una página cada vez',
    limit1B: ', sin persistencia ni histórico.',
    limit2A:
      'Para una auditoría multipágina, el seguimiento de los 106 criterios, las evaluaciones manuales, las exportaciones y la monitorización: ',
    limit2Link: 'cree una cuenta gratuita',
    limit2B: '.',
    limit3:
      'Uso razonable: este endpoint comparte los recursos del verificador público. Próximamente habrá una API dedicada con clave para usos intensivos.',
    ctaTitle: '¿Necesita más?',
    ctaText: 'Auditoría multipágina, tickets de Jira, distintivo, declaración legal: todo está en la aplicación.',
    ctaButton: 'Empezar gratis',
  },
  it: {
    seoTitle: 'API e CI: analizzi l’accessibilità con una sola chiamata HTTP',
    seoDescription:
      'Integri l’audit di accessibilità RGAA/WCAG di Konforme nella sua CI: una chiamata HTTP senza chiave per analizzare una pagina e una GitHub Action pronta da copiare che blocca le regressioni.',
    kicker: 'Sviluppatori',
    h1: 'Analizzi l’accessibilità con una sola chiamata HTTP',
    intro:
      'Il mini-audit pubblico di Konforme (una pagina, circa 100 regole RGAA 4.1.2 / WCAG 2.2) è accessibile via HTTP senza chiave API né account. Ideale come controllo in CI: blocchi il rilascio quando il punteggio peggiora.',
    callTitle: 'La chiamata',
    callNoteA: 'Risposta: il campo ',
    callNoteB:
      ' contiene il risultato JSON. Gli obiettivi privati (localhost, indirizzi IP interni) vengono rifiutati e l’audit di una pagina richiede dai 5 ai 25 secondi.',
    responseTitle: 'La risposta',
    actionTitle: 'GitHub Action: bloccare le regressioni',
    actionNoteA: 'Copi questo workflow in ',
    actionNoteB:
      ': a ogni push la pagina viene analizzata e la build fallisce al di sotto dell’80 % (regoli la soglia).',
    limitsTitle: 'Limiti e sviluppi futuri',
    limit1A: 'La modalità pubblica analizza ',
    limit1S: 'una pagina alla volta',
    limit1B: ', senza persistenza né storico.',
    limit2A:
      'Per un audit su più pagine, il monitoraggio dei 106 criteri, le valutazioni manuali, le esportazioni e il monitoraggio continuo: ',
    limit2Link: 'crei un account gratuito',
    limit2B: '.',
    limit3:
      'Uso ragionevole: questo endpoint condivide le risorse del verificatore pubblico. Per gli usi intensivi arriverà un’API dedicata con chiave.',
    ctaTitle: 'Le serve di più?',
    ctaText: 'Audit su più pagine, ticket Jira, badge, dichiarazione legale: tutto è nell’applicazione.',
    ctaButton: 'Iniziare gratuitamente',
  },
})

/**
 * Documentation développeurs : audit d'une page en un appel HTTP (le même
 * moteur que le vérificateur public de la landing) et intégration CI.
 */
export function Developpeurs() {
  const t = useMessages(L)

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Seo
        title={t.seoTitle}
        description={t.seoDescription}
        path="/developpeurs"
        localized
      />

      <p className="eyebrow mb-5">{t.kicker}</p>
      <h1 className="text-4xl md:text-5xl font-extrabold text-balance mb-6">
        {t.h1}
      </h1>
      <p className="text-lg text-text-muted leading-relaxed mb-10">
        {t.intro}
      </p>

      <section className="mb-10" aria-labelledby="endpoint-title">
        <h2 id="endpoint-title" className="text-2xl font-bold tracking-tight mb-3">{t.callTitle}</h2>
        <pre tabIndex={0} className="overflow-x-auto rounded-[12px] border border-border bg-surface-2 px-4 py-3 text-xs text-text-soft leading-relaxed">
          <code>{CURL_EXAMPLE}</code>
        </pre>
        <p className="text-sm text-text-dim mt-2">
          {t.callNoteA}<code className="text-primary-soft">responseBody</code>{t.callNoteB}
        </p>
      </section>

      <section className="mb-10" aria-labelledby="response-title">
        <h2 id="response-title" className="text-2xl font-bold tracking-tight mb-3">{t.responseTitle}</h2>
        <pre tabIndex={0} className="overflow-x-auto rounded-[12px] border border-border bg-surface-2 px-4 py-3 text-xs text-text-soft leading-relaxed">
          <code>{RESPONSE_EXAMPLE}</code>
        </pre>
      </section>

      <section className="mb-10" aria-labelledby="action-title">
        <h2 id="action-title" className="text-2xl font-bold tracking-tight mb-3">
          {t.actionTitle}
        </h2>
        <p className="text-text-soft leading-relaxed mb-3">
          {t.actionNoteA}<code className="text-primary-soft">.github/workflows/accessibilite.yml</code>{t.actionNoteB}
        </p>
        <pre tabIndex={0} className="overflow-x-auto rounded-[12px] border border-border bg-surface-2 px-4 py-3 text-xs text-text-soft leading-relaxed">
          <code>{ACTION_EXAMPLE}</code>
        </pre>
      </section>

      <section className="mb-10" aria-labelledby="limits-title">
        <h2 id="limits-title" className="text-2xl font-bold tracking-tight mb-3">{t.limitsTitle}</h2>
        <ul className="space-y-2 text-text-soft leading-relaxed list-disc pl-5">
          <li>{t.limit1A}<strong className="text-text">{t.limit1S}</strong>{t.limit1B}</li>
          <li>
            {t.limit2A}<Link to="/login" className="underline text-link hover:text-text">{t.limit2Link}</Link>{t.limit2B}
          </li>
          <li>{t.limit3}</li>
        </ul>
      </section>

      <section className="rounded-[16px] border border-border bg-surface px-6 py-8 text-center">
        <h2 className="text-xl font-bold tracking-tight mb-2">{t.ctaTitle}</h2>
        <p className="text-text-muted mb-5">{t.ctaText}</p>
        <Link to="/login" className={buttonVariants()}>{t.ctaButton}</Link>
      </section>
    </div>
  )
}
