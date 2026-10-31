import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { ScoreRing } from '@/components/ScoreRing'
import { appwriteConfigured, functions, SCAN_FUNCTION_ID } from '@/lib/appwrite'
import { defineMessages, useMessages } from '@/i18n'
import { SEVERITY_META } from '@/lib/format'
import type { Severity } from '@/lib/database.types'

type PublicResult = {
  url: string
  score: number | null
  rgaa_score: number | null
  wcag_score: number | null
  issues_count: number
  rules_checked: number
  by_severity: Record<Severity, number>
  top_issues: { rule_id: string; severity: Severity; title: string; count: number }[]
}

const L = defineMessages({
  fr: {
    title: 'Votre site est-il accessible ? Testez-le maintenant',
    subtitle:
      "Gratuit, sans compte, sans script à installer. Une centaine de règles RGAA 4.1.2 / WCAG 2.2 vérifiées en ~20 secondes sur votre page d'accueil.",
    urlLabel: 'Adresse de votre site',
    placeholder: 'https://votre-site.fr',
    submit: 'Vérifier l’accessibilité',
    loading: 'Analyse en cours…',
    loadingHint: 'Récupération de la page et exécution des règles… environ 20 secondes.',
    unavailable: "Le service d'audit est momentanément indisponible.",
    failed: "L'analyse a échoué. Réessayez dans un instant.",
    timeout:
      'Ce site est volumineux et la première analyse a dépassé le temps imparti. Réessayez : la seconde tentative aboutit généralement.',
    resultRegion: "Résultat de l'audit express",
    scoreLabel: "Score d'accessibilité",
    summary: (rules: number, issues: number) =>
      `${rules} règles vérifiées · ${issues} problème${issues > 1 ? 's' : ''} détecté${issues > 1 ? 's' : ''} sur la page d'accueil`,
    sev: { critical: 'Critique', serious: 'Majeur', moderate: 'Modéré', minor: 'Mineur' } as Record<Severity, string>,
    sevCount: (n: number, label: string) => `${n} ${label.toLowerCase()}${n > 1 ? 's' : ''}`,
    noIssues: 'Aucun problème détecté sur les règles automatisables 🎉',
    topIssuesLabel: 'Principaux problèmes détectés',
    previewTitle: "Ceci n'est qu'un aperçu d'une seule page.",
    previewDesc:
      "Créez un compte gratuit pour auditer plusieurs pages, obtenir chaque correction à appliquer, suivre vos progrès et générer votre déclaration d'accessibilité.",
    cta: 'Obtenir le rapport complet — gratuit',
  },
  en: {
    title: 'Is your website accessible? Test it now',
    subtitle:
      'Free, no account, no script to install. Around a hundred RGAA 4.1.2 / WCAG 2.2 rules checked on your home page in about 20 seconds.',
    urlLabel: 'Your website address',
    placeholder: 'https://your-website.com',
    submit: 'Check accessibility',
    loading: 'Analysis in progress…',
    loadingHint: 'Fetching the page and running the rules… about 20 seconds.',
    unavailable: 'The audit service is temporarily unavailable.',
    failed: 'The analysis failed. Please try again in a moment.',
    timeout:
      'This website is large and the first analysis exceeded the time limit. Try again: the second attempt usually succeeds.',
    resultRegion: 'Express audit result',
    scoreLabel: 'Accessibility score',
    summary: (rules: number, issues: number) =>
      `${rules} rules checked · ${issues} issue${issues > 1 ? 's' : ''} found on the home page`,
    sev: { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' } as Record<Severity, string>,
    sevCount: (n: number, label: string) => `${n} ${label.toLowerCase()}`,
    noIssues: 'No issue found among the automatable rules 🎉',
    topIssuesLabel: 'Main issues found',
    previewTitle: 'This is only a preview of a single page.',
    previewDesc:
      'Create a free account to audit several pages, get every fix to apply, track your progress and generate your accessibility statement.',
    cta: 'Get the full report — free',
  },
  de: {
    title: 'Ist Ihre Website barrierefrei? Testen Sie sie jetzt',
    subtitle:
      'Kostenlos, ohne Konto, ohne Skript-Installation. Rund hundert RGAA 4.1.2 / WCAG 2.2 Regeln werden in etwa 20 Sekunden auf Ihrer Startseite geprüft.',
    urlLabel: 'Adresse Ihrer Website',
    placeholder: 'https://ihre-website.de',
    submit: 'Barrierefreiheit prüfen',
    loading: 'Analyse läuft…',
    loadingHint: 'Die Seite wird geladen und die Regeln werden ausgeführt… etwa 20 Sekunden.',
    unavailable: 'Der Audit-Dienst ist vorübergehend nicht verfügbar.',
    failed: 'Die Analyse ist fehlgeschlagen. Bitte versuchen Sie es gleich noch einmal.',
    timeout:
      'Diese Website ist umfangreich, und die erste Analyse hat das Zeitlimit überschritten. Versuchen Sie es erneut: Der zweite Versuch gelingt in der Regel.',
    resultRegion: 'Ergebnis des Schnell-Audits',
    scoreLabel: 'Score für Barrierefreiheit',
    summary: (rules: number, issues: number) =>
      `${rules} geprüfte Regeln · ${issues} Problem${issues > 1 ? 'e' : ''} auf der Startseite gefunden`,
    sev: { critical: 'Kritisch', serious: 'Schwerwiegend', moderate: 'Mittel', minor: 'Gering' } as Record<Severity, string>,
    sevCount: (n: number, label: string) => `${n}× ${label.toLowerCase()}`,
    noIssues: 'Bei den automatisiert prüfbaren Regeln wurde kein Problem gefunden 🎉',
    topIssuesLabel: 'Wichtigste gefundene Probleme',
    previewTitle: 'Dies ist nur eine Vorschau einer einzigen Seite.',
    previewDesc:
      'Erstellen Sie ein kostenloses Konto, um mehrere Seiten zu prüfen, jede anzuwendende Korrektur zu erhalten, Ihren Fortschritt zu verfolgen und Ihre Erklärung zur Barrierefreiheit zu erzeugen.',
    cta: 'Vollständigen Bericht erhalten — kostenlos',
  },
  es: {
    title: '¿Su sitio web es accesible? Pruébelo ahora',
    subtitle:
      'Gratis, sin cuenta, sin script que instalar. Un centenar de reglas RGAA 4.1.2 / WCAG 2.2 verificadas en unos 20 segundos en su página de inicio.',
    urlLabel: 'Dirección de su sitio web',
    placeholder: 'https://su-sitio.es',
    submit: 'Verificar la accesibilidad',
    loading: 'Análisis en curso…',
    loadingHint: 'Recuperando la página y ejecutando las reglas… unos 20 segundos.',
    unavailable: 'El servicio de auditoría no está disponible momentáneamente.',
    failed: 'El análisis ha fallado. Vuelva a intentarlo en unos instantes.',
    timeout:
      'Este sitio es voluminoso y el primer análisis ha superado el tiempo previsto. Vuelva a intentarlo: el segundo intento suele completarse.',
    resultRegion: 'Resultado de la auditoría exprés',
    scoreLabel: 'Puntuación de accesibilidad',
    summary: (rules: number, issues: number) =>
      `${rules} reglas verificadas · ${issues} problema${issues > 1 ? 's' : ''} detectado${issues > 1 ? 's' : ''} en la página de inicio`,
    sev: { critical: 'Crítico', serious: 'Grave', moderate: 'Moderado', minor: 'Leve' } as Record<Severity, string>,
    sevCount: (n: number, label: string) => `${n} ${label.toLowerCase()}${n > 1 ? 's' : ''}`,
    noIssues: 'No se ha detectado ningún problema en las reglas automatizables 🎉',
    topIssuesLabel: 'Principales problemas detectados',
    previewTitle: 'Esto es solo una vista previa de una única página.',
    previewDesc:
      'Cree una cuenta gratuita para auditar varias páginas, obtener cada corrección que debe aplicar, seguir su progreso y generar su declaración de accesibilidad.',
    cta: 'Obtener el informe completo — gratis',
  },
  it: {
    title: 'Il suo sito è accessibile? Lo verifichi subito',
    subtitle:
      'Gratuito, senza account, senza script da installare. Un centinaio di regole RGAA 4.1.2 / WCAG 2.2 verificate in circa 20 secondi sulla sua home page.',
    urlLabel: 'Indirizzo del suo sito',
    placeholder: 'https://il-suo-sito.it',
    submit: 'Verifica l’accessibilità',
    loading: 'Analisi in corso…',
    loadingHint: 'Recupero della pagina ed esecuzione delle regole… circa 20 secondi.',
    unavailable: 'Il servizio di audit è momentaneamente non disponibile.',
    failed: 'L’analisi non è riuscita. Riprovi tra un istante.',
    timeout:
      'Questo sito è voluminoso e la prima analisi ha superato il tempo disponibile. Riprovi: il secondo tentativo va generalmente a buon fine.',
    resultRegion: 'Risultato dell’audit express',
    scoreLabel: 'Punteggio di accessibilità',
    summary: (rules: number, issues: number) =>
      `${rules} regole verificate · ${issues} problema${issues > 1 ? 'i' : ''} rilevat${issues > 1 ? 'i' : 'o'} sulla home page`,
    sev: { critical: 'Critico', serious: 'Grave', moderate: 'Moderato', minor: 'Minore' } as Record<Severity, string>,
    sevCount: (n: number, label: string) => `${n}× ${label.toLowerCase()}`,
    noIssues: 'Nessun problema rilevato sulle regole automatizzabili 🎉',
    topIssuesLabel: 'Principali problemi rilevati',
    previewTitle: 'Questa è solo un’anteprima di una singola pagina.',
    previewDesc:
      'Crei un account gratuito per analizzare più pagine, ottenere ogni correzione da applicare, seguire i suoi progressi e generare la sua dichiarazione di accessibilità.',
    cta: 'Ottenere il rapporto completo — gratuito',
  },
})

/**
 * Mini-audit public : une URL, pas de compte. Appelle la fonction scan-site
 * en mode { url } (exécution synchrone, aucune écriture en base).
 */
export function PublicChecker() {
  const t = useMessages(L)
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PublicResult | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const raw = String(new FormData(e.currentTarget).get('url') ?? '').trim()
    if (!raw) return
    const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    if (!appwriteConfigured) {
      setError(t.unavailable)
      setState('error')
      return
    }
    setState('loading')
    setError(null)
    try {
      const exec = await functions.createExecution({
        functionId: SCAN_FUNCTION_ID,
        body: JSON.stringify({ url }),
        async: false,
      })
      const payload = JSON.parse(exec.responseBody || '{}')
      if (exec.responseStatusCode >= 400 || payload.error) {
        throw new Error(payload.error || t.failed)
      }
      setResult(payload as PublicResult)
      setState('done')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      setError(/timed out|timeout/i.test(msg) ? t.timeout : msg || t.failed)
      setState('error')
    }
  }

  return (
    <div id="checker" className="scroll-mt-24 rounded-[24px] border border-border bg-surface p-6 md:p-10 shadow-card">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-balance mb-3">
          {t.title}
        </h2>
        <p className="text-sm md:text-base text-text-muted mb-6">
          {t.subtitle}
        </p>

        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 justify-center" noValidate>
          <label htmlFor="checker-url" className="sr-only">{t.urlLabel}</label>
          <input
            id="checker-url"
            name="url"
            type="text"
            inputMode="url"
            required
            placeholder={t.placeholder}
            className="w-full sm:w-96 rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary placeholder:text-text-dim"
          />
          <Button type="submit" size="lg" variant="primary" disabled={state === 'loading'}>
            {state === 'loading' ? (
              <>
                <span aria-hidden="true" className="size-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                {t.loading}
              </>
            ) : (
              t.submit
            )}
          </Button>
        </form>
        {state === 'loading' && (
          <p role="status" className="mt-3 text-xs text-text-dim">
            {t.loadingHint}
          </p>
        )}
        {state === 'error' && error && (
          <p role="alert" className="mt-4 rounded-[12px] border border-danger/40 bg-danger-bg/30 px-4 py-2.5 text-sm text-danger-soft max-w-lg mx-auto">
            {error}
          </p>
        )}
      </div>

      {state === 'done' && result && (
        <div className="mt-8 max-w-3xl mx-auto" role="region" aria-label={t.resultRegion}>
          <div className="grid gap-6 md:grid-cols-[auto_1fr] items-center rounded-[24px] border border-border bg-surface-2 p-6 md:p-8">
            <div className="justify-self-center">
              <ScoreRing score={result.score} size={120} label={t.scoreLabel} />
            </div>
            <div className="text-left">
              <p className="font-bold break-all">{result.url}</p>
              <p className="text-sm text-text-muted mt-1">
                {t.summary(result.rules_checked, result.issues_count)}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {(Object.keys(SEVERITY_META) as Severity[]).map((s) =>
                  result.by_severity[s] ? (
                    <span key={s} className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${SEVERITY_META[s].className}`}>
                      {t.sevCount(result.by_severity[s], t.sev[s])}
                    </span>
                  ) : null,
                )}
                {result.issues_count === 0 && (
                  <span className="rounded-full border border-success/40 bg-success-bg/60 px-2.5 py-1 text-xs font-semibold text-success-soft">
                    {t.noIssues}
                  </span>
                )}
              </div>
            </div>
          </div>

          {result.top_issues.length > 0 && (
            <ul className="mt-4 space-y-2" aria-label={t.topIssuesLabel}>
              {result.top_issues.slice(0, 5).map((i) => (
                <li key={i.rule_id} className="flex items-center gap-3 rounded-[12px] border border-border bg-surface-2 px-4 py-2.5 text-left text-sm">
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold ${SEVERITY_META[i.severity].className}`}>
                    {t.sev[i.severity]}
                  </span>
                  <span className="flex-1 min-w-0 truncate">{i.title}</span>
                  <span className="shrink-0 text-xs text-text-dim">×{i.count}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 rounded-[16px] bg-surface-2 p-6 text-center">
            <p className="font-semibold mb-1">
              {t.previewTitle}
            </p>
            <p className="text-sm text-text-muted mb-4">
              {t.previewDesc}
            </p>
            <Link to="/login" className={buttonVariants({ size: 'lg' })}>{t.cta}</Link>
          </div>
        </div>
      )}
    </div>
  )
}
