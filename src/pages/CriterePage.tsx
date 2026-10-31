import { Link, useParams } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button-variants'
import { Seo } from '@/components/Seo'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'
import { localizeCriterion, localizeTopic } from '@/i18n/rgaa-i18n'
import { RGAA_BY_ID, RGAA_CRITERIA, RGAA_TOPICS, rgaaCriterionUrl } from '@/lib/rgaa'

/** Remplace les jetons {clé} d'un libellé par leur valeur. */
function fmt(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '')
}

const L = defineMessages({
  fr: {
    locale: 'fr-FR',
    notFoundSeoTitle: 'Critère introuvable',
    notFoundSeoDescription: "Ce critère RGAA n'existe pas.",
    notFoundTitle: 'Critère introuvable',
    notFoundText: 'Le RGAA 4.1.2 compte 106 critères, numérotés de 1.1 à 13.12.',
    notFoundButton: 'Voir les 13 thématiques du RGAA',

    seoTitleTpl: 'Critère RGAA {id} : {title}',
    seoDescriptionTpl:
      'Critère {id} du RGAA 4.1.2 (niveau {level}, WCAG {wcag}) expliqué simplement : {plain}…',
    breadcrumbLabel: "Fil d'Ariane",
    breadcrumbCurrentTpl: 'Critère {id}',
    kickerTpl: 'RGAA 4.1.2 · Thématique {topicId} — {topicName} · Niveau {level}',
    h1Tpl: 'Critère {id} — {title}',

    whyTitle: 'Ce que ce critère exige, et pourquoi',
    featuresLabel: 'Caractéristiques du critère',
    wcagLabel: 'Correspondance WCAG',
    wcagItemTpl: '{wcag} (niveau {level})',
    checkLabel: 'Vérification',
    coverage: {
      auto: 'Testé automatiquement',
      partial: 'Testé partiellement (compléter par une revue manuelle)',
      manual: 'Nécessite une vérification humaine',
    },

    legalTitle: 'Le cadre légal',
    legalTextA:
      "Ce critère fait partie des 106 critères du RGAA 4.1.2, la méthode française exigée pour démontrer la conformité à la directive européenne (UE) 2019/882 (European Accessibility Act, applicable depuis le 28 juin 2025) et à l'article 47 de la loi de 2005. En cas de contrôle, la DGCCRF peut prononcer jusqu'à 50 000 € d'amende par service non conforme. ",
    legalLink: 'Voir le guide complet des obligations',
    legalTextB: '.',

    howTitle: 'Comment le vérifier sur votre site',
    howManual:
      "Ce critère nécessite une vérification humaine. Konforme vous guide : l'onglet « Les 106 critères RGAA » de chaque rapport permet de l'évaluer (conforme, non conforme, non applicable) avec une note justificative, selon la méthode officielle.",
    howAuto:
      "Ce critère est vérifié automatiquement par l'audit Konforme : chaque non-conformité est localisée (page, sélecteur CSS, code HTML concerné) avec une correction suggérée et un assistant IA.",
    howOfficialA: ' Le détail officiel des tests est publié par la DINUM : ',
    howOfficialLinkTpl: 'critère {id} sur accessibilite.numerique.gouv.fr',
    howOfficialB: '.',
    ctaButton: 'Tester mon site gratuitement',

    topicTitleTpl: 'Les autres critères de la thématique « {name} »',
    siblingTpl: 'Critère {id} — {title}',

    navLabel: 'Critère précédent / suivant',
    prevTpl: '← Critère {id}',
    nextTpl: 'Critère {id} →',
  },

  en: {
    locale: 'en',
    notFoundSeoTitle: 'Criterion not found',
    notFoundSeoDescription: 'This RGAA criterion does not exist.',
    notFoundTitle: 'Criterion not found',
    notFoundText: 'RGAA 4.1.2 has 106 criteria, numbered from 1.1 to 13.12.',
    notFoundButton: 'See the 13 RGAA topics',

    seoTitleTpl: 'RGAA criterion {id}: {title}',
    seoDescriptionTpl:
      'Criterion {id} of RGAA 4.1.2 (level {level}, WCAG {wcag}) explained simply: {plain}…',
    breadcrumbLabel: 'Breadcrumb',
    breadcrumbCurrentTpl: 'Criterion {id}',
    kickerTpl: 'RGAA 4.1.2 · Topic {topicId} — {topicName} · Level {level}',
    h1Tpl: 'Criterion {id} — {title}',

    whyTitle: 'What this criterion requires, and why',
    featuresLabel: 'Criterion characteristics',
    wcagLabel: 'WCAG mapping',
    wcagItemTpl: '{wcag} (level {level})',
    checkLabel: 'Verification',
    coverage: {
      auto: 'Tested automatically',
      partial: 'Partially tested (complete with a manual review)',
      manual: 'Requires human verification',
    },

    legalTitle: 'The legal framework',
    legalTextA:
      'This criterion is one of the 106 criteria of RGAA 4.1.2, the French method required to demonstrate conformance with European Directive (EU) 2019/882 (the European Accessibility Act, applicable since 28 June 2025) and with Article 47 of the French 2005 disability act. In the event of an inspection, the DGCCRF (the French consumer-protection authority) can impose fines of up to €50,000 per non-compliant service. ',
    legalLink: 'Read the full guide to the obligations',
    legalTextB: '.',

    howTitle: 'How to check it on your site',
    howManual:
      'This criterion requires human verification. Konforme guides you: the "The 106 RGAA criteria" tab in every report lets you evaluate it (compliant, non-compliant, not applicable) with a justifying note, following the official method.',
    howAuto:
      'This criterion is checked automatically by the Konforme audit: every issue is located (page, CSS selector, HTML code concerned) with a suggested fix and an AI assistant.',
    howOfficialA: ' The official test details are published by the DINUM: ',
    howOfficialLinkTpl: 'criterion {id} on accessibilite.numerique.gouv.fr',
    howOfficialB: '.',
    ctaButton: 'Test my site for free',

    topicTitleTpl: 'The other criteria in the "{name}" topic',
    siblingTpl: 'Criterion {id} — {title}',

    navLabel: 'Previous / next criterion',
    prevTpl: '← Criterion {id}',
    nextTpl: 'Criterion {id} →',
  },

  de: {
    locale: 'de-DE',
    notFoundSeoTitle: 'Kriterium nicht gefunden',
    notFoundSeoDescription: 'Dieses RGAA-Kriterium existiert nicht.',
    notFoundTitle: 'Kriterium nicht gefunden',
    notFoundText: 'Das RGAA 4.1.2 umfasst 106 Kriterien, nummeriert von 1.1 bis 13.12.',
    notFoundButton: 'Die 13 Themenbereiche des RGAA ansehen',

    seoTitleTpl: 'RGAA-Kriterium {id}: {title}',
    seoDescriptionTpl:
      'Kriterium {id} des RGAA 4.1.2 (Stufe {level}, WCAG {wcag}) verständlich erklärt: {plain}…',
    breadcrumbLabel: 'Brotkrümelnavigation',
    breadcrumbCurrentTpl: 'Kriterium {id}',
    kickerTpl: 'RGAA 4.1.2 · Themenbereich {topicId} — {topicName} · Stufe {level}',
    h1Tpl: 'Kriterium {id} — {title}',

    whyTitle: 'Was dieses Kriterium verlangt — und warum',
    featuresLabel: 'Merkmale des Kriteriums',
    wcagLabel: 'WCAG-Zuordnung',
    wcagItemTpl: '{wcag} (Stufe {level})',
    checkLabel: 'Prüfung',
    coverage: {
      auto: 'Automatisch geprüft',
      partial: 'Teilweise geprüft (durch eine manuelle Prüfung ergänzen)',
      manual: 'Erfordert eine menschliche Prüfung',
    },

    legalTitle: 'Der rechtliche Rahmen',
    legalTextA:
      'Dieses Kriterium gehört zu den 106 Kriterien des RGAA 4.1.2, der in Frankreich vorgeschriebenen Methode zum Nachweis der Konformität mit der europäischen Richtlinie (EU) 2019/882 (European Accessibility Act, anwendbar seit dem 28. Juni 2025) und mit Artikel 47 des französischen Gesetzes von 2005. Bei einer Kontrolle kann die DGCCRF (die französische Verbraucherschutzbehörde) Bußgelder von bis zu 50.000 € je nicht konformem Dienst verhängen. ',
    legalLink: 'Zum vollständigen Leitfaden der Pflichten',
    legalTextB: '.',

    howTitle: 'So prüfen Sie es auf Ihrer Website',
    howManual:
      'Dieses Kriterium erfordert eine menschliche Prüfung. Konforme leitet Sie an: Im Reiter „Die 106 RGAA-Kriterien" jedes Berichts können Sie es nach der offiziellen Methode bewerten (konform, nicht konform, nicht anwendbar) und eine begründende Notiz hinterlegen.',
    howAuto:
      'Dieses Kriterium wird vom Konforme-Audit automatisch geprüft: Jeder Verstoß wird lokalisiert (Seite, CSS-Selektor, betroffener HTML-Code) und mit einem Korrekturvorschlag sowie einem KI-Assistenten versehen.',
    howOfficialA: ' Die offiziellen Testdetails werden von der DINUM veröffentlicht: ',
    howOfficialLinkTpl: 'Kriterium {id} auf accessibilite.numerique.gouv.fr',
    howOfficialB: '.',
    ctaButton: 'Meine Website kostenlos testen',

    topicTitleTpl: 'Die übrigen Kriterien des Themenbereichs „{name}"',
    siblingTpl: 'Kriterium {id} — {title}',

    navLabel: 'Vorheriges / nächstes Kriterium',
    prevTpl: '← Kriterium {id}',
    nextTpl: 'Kriterium {id} →',
  },

  es: {
    locale: 'es-ES',
    notFoundSeoTitle: 'Criterio no encontrado',
    notFoundSeoDescription: 'Este criterio del RGAA no existe.',
    notFoundTitle: 'Criterio no encontrado',
    notFoundText: 'El RGAA 4.1.2 consta de 106 criterios, numerados del 1.1 al 13.12.',
    notFoundButton: 'Ver las 13 temáticas del RGAA',

    seoTitleTpl: 'Criterio RGAA {id}: {title}',
    seoDescriptionTpl:
      'Criterio {id} del RGAA 4.1.2 (nivel {level}, WCAG {wcag}) explicado de forma sencilla: {plain}…',
    breadcrumbLabel: 'Ruta de navegación',
    breadcrumbCurrentTpl: 'Criterio {id}',
    kickerTpl: 'RGAA 4.1.2 · Temática {topicId} — {topicName} · Nivel {level}',
    h1Tpl: 'Criterio {id} — {title}',

    whyTitle: 'Qué exige este criterio y por qué',
    featuresLabel: 'Características del criterio',
    wcagLabel: 'Correspondencia WCAG',
    wcagItemTpl: '{wcag} (nivel {level})',
    checkLabel: 'Verificación',
    coverage: {
      auto: 'Comprobado automáticamente',
      partial: 'Comprobado parcialmente (completar con una revisión manual)',
      manual: 'Requiere una verificación humana',
    },

    legalTitle: 'El marco legal',
    legalTextA:
      'Este criterio forma parte de los 106 criterios del RGAA 4.1.2, el método francés exigido para demostrar la conformidad con la directiva europea (UE) 2019/882 (European Accessibility Act, aplicable desde el 28 de junio de 2025) y con el artículo 47 de la ley francesa de 2005. En caso de control, la DGCCRF (la autoridad francesa de protección al consumidor) puede imponer hasta 50 000 € de multa por servicio no conforme. ',
    legalLink: 'Ver la guía completa de las obligaciones',
    legalTextB: '.',

    howTitle: 'Cómo verificarlo en su sitio',
    howManual:
      'Este criterio requiere una verificación humana. Konforme le guía: la pestaña «Los 106 criterios RGAA» de cada informe permite evaluarlo (conforme, no conforme, no aplicable) con una nota justificativa, según el método oficial.',
    howAuto:
      'Este criterio se verifica automáticamente en la auditoría de Konforme: cada incumplimiento se localiza (página, selector CSS, código HTML afectado) con una corrección sugerida y un asistente de IA.',
    howOfficialA: ' El detalle oficial de las pruebas lo publica la DINUM: ',
    howOfficialLinkTpl: 'criterio {id} en accessibilite.numerique.gouv.fr',
    howOfficialB: '.',
    ctaButton: 'Probar mi sitio gratuitamente',

    topicTitleTpl: 'Los demás criterios de la temática «{name}»',
    siblingTpl: 'Criterio {id} — {title}',

    navLabel: 'Criterio anterior / siguiente',
    prevTpl: '← Criterio {id}',
    nextTpl: 'Criterio {id} →',
  },

  it: {
    locale: 'it-IT',
    notFoundSeoTitle: 'Criterio non trovato',
    notFoundSeoDescription: 'Questo criterio RGAA non esiste.',
    notFoundTitle: 'Criterio non trovato',
    notFoundText: 'Il RGAA 4.1.2 conta 106 criteri, numerati da 1.1 a 13.12.',
    notFoundButton: 'Vedere le 13 tematiche del RGAA',

    seoTitleTpl: 'Criterio RGAA {id}: {title}',
    seoDescriptionTpl:
      'Criterio {id} del RGAA 4.1.2 (livello {level}, WCAG {wcag}) spiegato in modo semplice: {plain}…',
    breadcrumbLabel: 'Percorso di navigazione',
    breadcrumbCurrentTpl: 'Criterio {id}',
    kickerTpl: 'RGAA 4.1.2 · Tematica {topicId} — {topicName} · Livello {level}',
    h1Tpl: 'Criterio {id} — {title}',

    whyTitle: 'Che cosa richiede questo criterio e perché',
    featuresLabel: 'Caratteristiche del criterio',
    wcagLabel: 'Corrispondenza WCAG',
    wcagItemTpl: '{wcag} (livello {level})',
    checkLabel: 'Verifica',
    coverage: {
      auto: 'Verificato automaticamente',
      partial: 'Verificato parzialmente (da completare con una revisione manuale)',
      manual: 'Richiede una verifica umana',
    },

    legalTitle: 'Il quadro giuridico',
    legalTextA:
      'Questo criterio fa parte dei 106 criteri del RGAA 4.1.2, il metodo francese richiesto per dimostrare la conformità alla direttiva europea (UE) 2019/882 (European Accessibility Act, applicabile dal 28 giugno 2025) e all’articolo 47 della legge francese del 2005. In caso di controllo, la DGCCRF (l’autorità francese per la tutela dei consumatori) può comminare fino a 50 000 € di ammenda per servizio non conforme. ',
    legalLink: 'Consultare la guida completa agli obblighi',
    legalTextB: '.',

    howTitle: 'Come verificarlo sul suo sito',
    howManual:
      'Questo criterio richiede una verifica umana. Konforme la guida: la scheda «I 106 criteri RGAA» di ogni rapporto permette di valutarlo (conforme, non conforme, non applicabile) con una nota giustificativa, secondo il metodo ufficiale.',
    howAuto:
      'Questo criterio è verificato automaticamente dall’audit Konforme: ogni non conformità viene localizzata (pagina, selettore CSS, codice HTML interessato) con una correzione suggerita e un assistente IA.',
    howOfficialA: ' Il dettaglio ufficiale dei test è pubblicato dalla DINUM: ',
    howOfficialLinkTpl: 'criterio {id} su accessibilite.numerique.gouv.fr',
    howOfficialB: '.',
    ctaButton: 'Testare gratuitamente il mio sito',

    topicTitleTpl: 'Gli altri criteri della tematica «{name}»',
    siblingTpl: 'Criterio {id} — {title}',

    navLabel: 'Criterio precedente / successivo',
    prevTpl: '← Criterio {id}',
    nextTpl: 'Criterio {id} →',
  },
})

/**
 * Fiche publique d'un critère RGAA (SEO programmatique : 106 pages générées
 * depuis le référentiel, /rgaa/critere/:id). Chaque fiche explique le critère
 * en langue courante, son cadre légal et comment le vérifier.
 */
export function CriterePage() {
  const { id } = useParams<{ id: string }>()
  const lang = useLang()
  const t = useMessages(L)
  const criterion = id ? RGAA_BY_ID.get(id) : undefined

  if (!criterion) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <Seo title={t.notFoundSeoTitle} description={t.notFoundSeoDescription} path="/rgaa" noindex />
        <h1 className="text-2xl font-bold mb-3">{t.notFoundTitle}</h1>
        <p className="text-text-muted mb-6">{t.notFoundText}</p>
        <Link to={localizePath(lang, '/rgaa')} className={buttonVariants()}>{t.notFoundButton}</Link>
      </div>
    )
  }

  const topic = RGAA_TOPICS.find((tp) => tp.id === criterion.topic)!
  const topicL10n = localizeTopic(lang, topic)
  const criterionL10n = localizeCriterion(lang, criterion)
  const siblings = RGAA_CRITERIA.filter((c) => c.topic === criterion.topic && c.id !== criterion.id)
  const index = RGAA_CRITERIA.findIndex((c) => c.id === criterion.id)
  const prev = RGAA_CRITERIA[index - 1]
  const next = RGAA_CRITERIA[index + 1]

  const pageTitle = fmt(t.seoTitleTpl, { id: criterion.id, title: criterionL10n.title })

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Seo
        title={pageTitle}
        description={fmt(t.seoDescriptionTpl, {
          id: criterion.id,
          level: criterion.level,
          wcag: criterion.wcag.join(', '),
          plain: criterionL10n.plain.slice(0, 120),
        })}
        path={`/rgaa/critere/${criterion.id}`}
        type="article"
        localized
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: pageTitle,
            inLanguage: t.locale,
            author: { '@type': 'Organization', name: 'Konforme' },
            publisher: { '@type': 'Organization', name: 'KAYZEN' },
          },
        ]}
      />

      <nav aria-label={t.breadcrumbLabel} className="text-sm text-text-dim mb-3">
        <Link to={localizePath(lang, '/rgaa')} className="hover:text-text hover:underline">RGAA</Link>
        {' / '}
        <span>{topic.id}. {topicL10n.name}</span>
        {' / '}
        <span aria-current="page">{fmt(t.breadcrumbCurrentTpl, { id: criterion.id })}</span>
      </nav>

      <p className="eyebrow mb-5">
        {fmt(t.kickerTpl, { topicId: String(topic.id), topicName: topicL10n.name, level: criterion.level })}
      </p>
      <h1 className="text-3xl md:text-4xl font-extrabold text-balance mb-6">
        {fmt(t.h1Tpl, { id: criterion.id, title: criterionL10n.title })}
      </h1>

      <section className="mb-8" aria-labelledby="pourquoi">
        <h2 id="pourquoi" className="text-xl font-bold tracking-tight mb-3">
          {t.whyTitle}
        </h2>
        <p className="text-lg text-text-soft leading-relaxed">{criterionL10n.plain}</p>
      </section>

      <section className="mb-8 grid gap-3 sm:grid-cols-2" aria-label={t.featuresLabel}>
        <div className="rounded-[12px] border border-border px-4 py-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">{t.wcagLabel}</span>
          <span className="text-text-soft">
            {criterion.wcag.map((w) => fmt(t.wcagItemTpl, { wcag: w, level: criterion.level })).join(', ')}
          </span>
        </div>
        <div className="rounded-[12px] border border-border px-4 py-3">
          <span className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">{t.checkLabel}</span>
          <span className="text-text-soft">{t.coverage[criterion.coverage]}</span>
        </div>
      </section>

      <section className="mb-8" aria-labelledby="cadre">
        <h2 id="cadre" className="text-xl font-bold tracking-tight mb-3">{t.legalTitle}</h2>
        <p className="text-text-soft leading-relaxed">
          {t.legalTextA}
          <Link to={localizePath(lang, '/guide-accessibilite')} className="underline text-link hover:text-text">
            {t.legalLink}
          </Link>
          {t.legalTextB}
        </p>
      </section>

      <section className="mb-8" aria-labelledby="verifier">
        <h2 id="verifier" className="text-xl font-bold tracking-tight mb-3">{t.howTitle}</h2>
        <p className="text-text-soft leading-relaxed mb-4">
          {criterion.coverage === 'manual' ? t.howManual : t.howAuto}
          {t.howOfficialA}
          <a href={rgaaCriterionUrl(criterion.id)} target="_blank" rel="noreferrer" className="underline text-link hover:text-text">
            {fmt(t.howOfficialLinkTpl, { id: criterion.id })}
          </a>
          {t.howOfficialB}
        </p>
        <Link to={localizePath(lang, '/')} className={buttonVariants()}>{t.ctaButton}</Link>
      </section>

      <section className="mb-8" aria-labelledby="theme">
        <h2 id="theme" className="text-xl font-bold tracking-tight mb-3">
          {fmt(t.topicTitleTpl, { name: topicL10n.name })}
        </h2>
        <p className="text-sm text-text-dim mb-3">{topicL10n.description}</p>
        <ul className="space-y-1.5">
          {siblings.map((c) => (
            <li key={c.id}>
              <Link to={localizePath(lang, `/rgaa/critere/${c.id}`)} className="text-sm text-text-soft underline hover:text-text">
                {fmt(t.siblingTpl, { id: c.id, title: localizeCriterion(lang, c).title })}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <nav className="flex justify-between gap-4 border-t border-border pt-5" aria-label={t.navLabel}>
        {prev ? (
          <Link to={localizePath(lang, `/rgaa/critere/${prev.id}`)} className="text-sm text-text-muted hover:text-text hover:underline">
            {fmt(t.prevTpl, { id: prev.id })}
          </Link>
        ) : <span />}
        {next ? (
          <Link to={localizePath(lang, `/rgaa/critere/${next.id}`)} className="text-sm text-text-muted hover:text-text hover:underline">
            {fmt(t.nextTpl, { id: next.id })}
          </Link>
        ) : <span />}
      </nav>
    </div>
  )
}
