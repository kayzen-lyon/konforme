import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { localizedPosts } from '@/i18n/content-i18n'
import { formatDate } from '@/lib/format'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    seoTitle: 'Blog accessibilité web : RGAA, WCAG, EAA',
    seoDescription:
      "Guides pratiques et actualités sur l'accessibilité numérique : RGAA 4.1.2, WCAG 2.2, European Accessibility Act, corrections concrètes.",
    eyebrow: 'Blog',
    h1: 'Accessibilité web, en pratique',
    intro: 'Guides RGAA, WCAG et EAA écrits pour les équipes produit et les développeurs.',
    frenchOnly: 'Les articles du blog sont publiés en français.',
    readingTime: 'min de lecture',
  },
  en: {
    seoTitle: 'Web accessibility blog: RGAA, WCAG, EAA',
    seoDescription:
      'Practical guides and news about digital accessibility: RGAA 4.1.2, WCAG 2.2, European Accessibility Act and concrete fixes.',
    eyebrow: 'Blog',
    h1: 'Web accessibility, in practice',
    intro: 'RGAA, WCAG and EAA guides written for product teams and developers.',
    frenchOnly: 'Please note: the blog articles are published in French only.',
    readingTime: 'min read',
  },
  de: {
    seoTitle: 'Blog zur Web-Barrierefreiheit: RGAA, WCAG, EAA',
    seoDescription:
      'Praxisleitfäden und Neuigkeiten zur digitalen Barrierefreiheit: RGAA 4.1.2, WCAG 2.2, European Accessibility Act und konkrete Korrekturen.',
    eyebrow: 'Blog',
    h1: 'Web-Barrierefreiheit in der Praxis',
    intro: 'RGAA-, WCAG- und EAA-Leitfäden für Produktteams und Entwicklerinnen und Entwickler.',
    frenchOnly: 'Hinweis: Die Blogartikel werden ausschließlich auf Französisch veröffentlicht.',
    readingTime: 'Min. Lesezeit',
  },
  es: {
    seoTitle: 'Blog de accesibilidad web: RGAA, WCAG, EAA',
    seoDescription:
      'Guías prácticas y novedades sobre accesibilidad digital: RGAA 4.1.2, WCAG 2.2, European Accessibility Act y correcciones concretas.',
    eyebrow: 'Blog',
    h1: 'Accesibilidad web, en la práctica',
    intro: 'Guías RGAA, WCAG y EAA escritas para equipos de producto y desarrolladores.',
    frenchOnly: 'Aviso: los artículos del blog se publican únicamente en francés.',
    readingTime: 'min de lectura',
  },
  it: {
    seoTitle: 'Blog sull’accessibilità web: RGAA, WCAG, EAA',
    seoDescription:
      'Guide pratiche e novità sull’accessibilità digitale: RGAA 4.1.2, WCAG 2.2, European Accessibility Act e correzioni concrete.',
    eyebrow: 'Blog',
    h1: 'Accessibilità web, in pratica',
    intro: 'Guide RGAA, WCAG ed EAA scritte per i team di prodotto e gli sviluppatori.',
    frenchOnly: 'Nota: gli articoli del blog sono pubblicati esclusivamente in francese.',
    readingTime: 'min di lettura',
  },
})

export function Blog() {
  const t = useMessages(L)
  const lang = useLang()

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Seo title={t.seoTitle} description={t.seoDescription} path="/blog" localized />
      <p className="eyebrow mb-5">{t.eyebrow}</p>
      <h1 className="text-4xl md:text-5xl font-extrabold text-balance mb-5">{t.h1}</h1>
      <p className="text-lg text-text-muted mb-12">{t.intro}</p>

      <ul className="space-y-6">
        {localizedPosts(lang).map((post) => (
          <li key={post.slug}>
            <article className="glass-card p-7 md:p-8 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card">
              <p className="text-xs text-text-dim mb-2">
                <time dateTime={post.date}>{formatDate(post.date, false, lang)}</time> ·{' '}
                {post.readingMinutes} {t.readingTime}
              </p>
              <h2 className="text-xl font-bold tracking-tight mb-2">
                <Link
                  to={localizePath(lang, `/blog/${post.slug}`)}
                  className="hover:text-primary-soft hover:underline underline-offset-4"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm text-text-muted leading-relaxed">
                {post.description}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  )
}
