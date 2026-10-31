import { useMemo, useState } from 'react'
import { Seo } from '@/components/Seo'
import { defineMessages, useLang, useMessages } from '@/i18n'
import { RGAA_GLOSSARY_URL, RGAA_VERSION } from '@/lib/rgaa'
import glossaireJson from '@/content/rgaa/glossaire.json'
import { NewWindowHint } from '@/components/ui/new-window'

type GlossaryEntry = { title: string; body: string }

const ENTRIES: GlossaryEntry[] = (glossaireJson as { glossary: GlossaryEntry[] }).glossary

/** Remplace les jetons {clé} d'un libellé par leur valeur. */
function fmt(tpl: string, vars: Record<string, string>): string {
  return tpl.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '')
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ')
}

const L = defineMessages({
  fr: {
    seoTitleTpl: 'Glossaire officiel du RGAA {version} : tous les termes définis',
    seoDescription:
      "Le glossaire complet de la méthode RGAA (source officielle DINUM) : alternative textuelle, composant d'interface, changement de contexte… toutes les définitions nécessaires pour appliquer les 106 critères.",
    kicker: 'Méthode officielle',
    h1Tpl: 'Glossaire du RGAA {version}',
    introA:
      "La méthode RGAA repose sur des définitions précises : « image porteuse d'information », « changement de contexte », « étiquette »… Ce glossaire reprend ",
    introStrongTpl: "l'intégralité des {count} définitions officielles",
    introB: ' publiées par la DINUM sur ',
    introC: '.',
    frenchOnlyNote: '',
    searchLabel: 'Rechercher un terme',
    searchPlaceholder: 'Ex. : alternative textuelle, focus, contraste…',
    countOneTpl: '{count} terme affiché',
    countManyTpl: '{count} termes affichés',
    emptyTpl: 'Aucun terme ne correspond à « {query} ».',
    sourceTpl:
      'Source : glossaire officiel du RGAA {version}, DINUM — reproduit à des fins de référence. Les liens internes des définitions peuvent renvoyer vers le site officiel.',
  },
  en: {
    seoTitleTpl: 'Official RGAA {version} glossary: every term defined',
    seoDescription:
      'The complete glossary of the RGAA method (official DINUM source): text alternative, user-interface component, change of context… all the definitions needed to apply the 106 criteria.',
    kicker: 'Official method',
    h1Tpl: 'RGAA {version} glossary',
    introA:
      'The RGAA method relies on precise definitions: "image conveying information", "change of context", "label"… This glossary reproduces ',
    introStrongTpl: 'all {count} official definitions',
    introB: ' published by the DINUM at ',
    introC: '.',
    frenchOnlyNote:
      'Note: the definitions below are reproduced in French. The RGAA glossary is the official legal reference and is published in French only by the DINUM (the French government digital agency); translating it would alter its legal meaning. The rest of this site is available in your language.',
    searchLabel: 'Search for a term',
    searchPlaceholder: 'E.g. alternative textuelle, focus, contraste…',
    countOneTpl: '{count} term shown',
    countManyTpl: '{count} terms shown',
    emptyTpl: 'No term matches "{query}".',
    sourceTpl:
      'Source: official RGAA {version} glossary, DINUM — reproduced for reference purposes. Links inside the definitions may point to the official website.',
  },
  de: {
    seoTitleTpl: 'Offizielles Glossar des RGAA {version}: alle Begriffe definiert',
    seoDescription:
      'Das vollständige Glossar der RGAA-Methode (offizielle Quelle: DINUM): Textalternative, Bedienelement, Kontextwechsel… alle Definitionen, die für die Anwendung der 106 Kriterien nötig sind.',
    kicker: 'Offizielle Methode',
    h1Tpl: 'Glossar des RGAA {version}',
    introA:
      'Die RGAA-Methode beruht auf präzisen Definitionen: „informationstragendes Bild", „Kontextwechsel", „Beschriftung"… Dieses Glossar gibt ',
    introStrongTpl: 'sämtliche {count} offiziellen Definitionen',
    introB: ' wieder, die von der DINUM veröffentlicht werden auf ',
    introC: '.',
    frenchOnlyNote:
      'Hinweis: Die nachstehenden Definitionen werden auf Französisch wiedergegeben. Das RGAA-Glossar ist die amtliche Rechtsreferenz und wird von der DINUM (der Digitalbehörde des französischen Staates) ausschließlich auf Französisch veröffentlicht; eine Übersetzung würde seine rechtliche Bedeutung verändern. Der übrige Teil dieser Website steht in Ihrer Sprache zur Verfügung.',
    searchLabel: 'Einen Begriff suchen',
    searchPlaceholder: 'Z. B. alternative textuelle, focus, contraste…',
    countOneTpl: '{count} Begriff angezeigt',
    countManyTpl: '{count} Begriffe angezeigt',
    emptyTpl: 'Kein Begriff entspricht „{query}".',
    sourceTpl:
      'Quelle: offizielles Glossar des RGAA {version}, DINUM — zu Referenzzwecken wiedergegeben. Interne Links in den Definitionen können auf die offizielle Website verweisen.',
  },
  es: {
    seoTitleTpl: 'Glosario oficial del RGAA {version}: todos los términos definidos',
    seoDescription:
      'El glosario completo del método RGAA (fuente oficial DINUM): alternativa textual, componente de interfaz, cambio de contexto… todas las definiciones necesarias para aplicar los 106 criterios.',
    kicker: 'Método oficial',
    h1Tpl: 'Glosario del RGAA {version}',
    introA:
      'El método RGAA se basa en definiciones precisas: «imagen portadora de información», «cambio de contexto», «etiqueta»… Este glosario recoge ',
    introStrongTpl: 'la totalidad de las {count} definiciones oficiales',
    introB: ' publicadas por la DINUM en ',
    introC: '.',
    frenchOnlyNote:
      'Nota: las definiciones que figuran a continuación se reproducen en francés. El glosario del RGAA es la referencia jurídica oficial y la DINUM (la agencia digital del Estado francés) solo lo publica en francés; traducirlo alteraría su alcance jurídico. El resto de este sitio está disponible en su idioma.',
    searchLabel: 'Buscar un término',
    searchPlaceholder: 'Ej.: alternative textuelle, focus, contraste…',
    countOneTpl: '{count} término mostrado',
    countManyTpl: '{count} términos mostrados',
    emptyTpl: 'Ningún término corresponde a «{query}».',
    sourceTpl:
      'Fuente: glosario oficial del RGAA {version}, DINUM — reproducido con fines de referencia. Los enlaces internos de las definiciones pueden remitir al sitio oficial.',
  },
  it: {
    seoTitleTpl: 'Glossario ufficiale del RGAA {version}: tutti i termini definiti',
    seoDescription:
      'Il glossario completo del metodo RGAA (fonte ufficiale DINUM): alternativa testuale, componente di interfaccia, cambiamento di contesto… tutte le definizioni necessarie per applicare i 106 criteri.',
    kicker: 'Metodo ufficiale',
    h1Tpl: 'Glossario del RGAA {version}',
    introA:
      'Il metodo RGAA si basa su definizioni precise: «immagine portatrice di informazione», «cambiamento di contesto», «etichetta»… Questo glossario riporta ',
    introStrongTpl: 'l’integralità delle {count} definizioni ufficiali',
    introB: ' pubblicate dalla DINUM su ',
    introC: '.',
    frenchOnlyNote:
      'Nota: le definizioni riportate di seguito sono in francese. Il glossario del RGAA è il riferimento giuridico ufficiale ed è pubblicato unicamente in francese dalla DINUM (l’agenzia digitale dello Stato francese); tradurlo ne altererebbe la portata giuridica. Il resto di questo sito è disponibile nella sua lingua.',
    searchLabel: 'Cercare un termine',
    searchPlaceholder: 'Es.: alternative textuelle, focus, contraste…',
    countOneTpl: '{count} termine visualizzato',
    countManyTpl: '{count} termini visualizzati',
    emptyTpl: 'Nessun termine corrisponde a «{query}».',
    sourceTpl:
      'Fonte: glossario ufficiale del RGAA {version}, DINUM — riprodotto a scopo di riferimento. I link interni alle definizioni possono rimandare al sito ufficiale.',
  },
})

/**
 * Le glossaire complet et officiel du RGAA (source : DINUM,
 * accessibilite.numerique.gouv.fr) — indispensable pour appliquer la méthode :
 * chaque critère s'appuie sur ces définitions précises. L'interface est
 * traduite ; les définitions restent dans leur version officielle française.
 */
export function Glossaire() {
  const lang = useLang()
  const t = useMessages(L)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ENTRIES
    return ENTRIES.filter(
      (e) => e.title.toLowerCase().includes(q) || stripHtml(e.body).toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Seo
        title={fmt(t.seoTitleTpl, { version: RGAA_VERSION })}
        description={t.seoDescription}
        path="/glossaire"
        localized
      />

      <p className="eyebrow mb-5">{t.kicker}</p>
      <h1 className="text-4xl md:text-5xl font-extrabold text-balance mb-6">
        {fmt(t.h1Tpl, { version: RGAA_VERSION })}
      </h1>
      <p className="text-lg text-text-muted leading-relaxed mb-4">
        {t.introA}
        <strong className="text-text">{fmt(t.introStrongTpl, { count: String(ENTRIES.length) })}</strong>
        {t.introB}
        <a href={RGAA_GLOSSARY_URL} target="_blank" rel="noreferrer" className="underline text-link hover:text-text">
          accessibilite.numerique.gouv.fr
          <NewWindowHint />
        </a>
        {t.introC}
      </p>

      {lang !== 'fr' && (
        <p className="mb-4 rounded-[12px] border border-border bg-surface px-4 py-3 text-sm text-text-soft leading-relaxed">
          {t.frenchOnlyNote}
        </p>
      )}

      <div className="mb-8">
        <label htmlFor="glossary-search" className="mb-1 block text-sm font-semibold">
          {t.searchLabel}
        </label>
        <input
          id="glossary-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-[12px] border border-border bg-surface px-4 py-2.5 text-sm text-text"
        />
        <p className="mt-1 text-xs text-text-dim" role="status">
          {fmt(filtered.length > 1 ? t.countManyTpl : t.countOneTpl, { count: String(filtered.length) })}
        </p>
      </div>

      <div className="space-y-6">
        {filtered.map((e) => (
          <article
            key={e.title}
            id={slugify(e.title)}
            className="rounded-[16px] border border-border px-5 py-4"
            aria-labelledby={`term-${slugify(e.title)}`}
            lang="fr"
          >
            <h2 id={`term-${slugify(e.title)}`} className="text-lg font-bold tracking-tight mb-2">
              {e.title}
            </h2>
            <div
              className="glossary-body text-sm text-text-soft leading-relaxed [&_a]:underline [&_a]:text-link [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mt-1 [&_code]:text-primary-soft [&_code]:text-xs [&_p]:mt-2 [&_img]:max-w-full"
              dangerouslySetInnerHTML={{ __html: e.body }}
            />
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-text-muted py-8 text-center">
            {fmt(t.emptyTpl, { query })}
          </p>
        )}
      </div>

      <p className="mt-10 text-xs text-text-dim">
        {fmt(t.sourceTpl, { version: RGAA_VERSION })}
      </p>
    </div>
  )
}
