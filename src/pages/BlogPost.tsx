import { Link, useParams } from 'react-router-dom'
import { Seo, SITE_URL } from '@/components/Seo'
import { localizedPost } from '@/i18n/content-i18n'
import { formatDate } from '@/lib/format'
import { NotFound } from '@/pages/NotFound'
import { Button } from '@/components/ui/button'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    breadcrumb: "Fil d'Ariane",
    allPosts: '← Tous les articles',
    readingTime: 'min de lecture',
    frenchOnly: 'Cet article est publié en français.',
    ctaTitle: 'Où en est votre site ?',
    ctaText: "Audit d'accessibilité automatisé RGAA / WCAG, résultat en une minute.",
    ctaButton: 'Lancer un audit gratuit',
  },
  en: {
    breadcrumb: 'Breadcrumb',
    allPosts: '← All articles',
    readingTime: 'min read',
    frenchOnly: 'Please note: this article is published in French.',
    ctaTitle: 'Where does your website stand?',
    ctaText: 'Automated RGAA / WCAG accessibility audit, results in one minute.',
    ctaButton: 'Run a free audit',
  },
  de: {
    breadcrumb: 'Brotkrumennavigation',
    allPosts: '← Alle Artikel',
    readingTime: 'Min. Lesezeit',
    frenchOnly: 'Hinweis: Dieser Artikel ist auf Französisch veröffentlicht.',
    ctaTitle: 'Wo steht Ihre Website?',
    ctaText: 'Automatisiertes RGAA-/WCAG-Barrierefreiheitsaudit, Ergebnis in einer Minute.',
    ctaButton: 'Kostenloses Audit starten',
  },
  es: {
    breadcrumb: 'Ruta de navegación',
    allPosts: '← Todos los artículos',
    readingTime: 'min de lectura',
    frenchOnly: 'Aviso: este artículo está publicado en francés.',
    ctaTitle: '¿En qué punto está su sitio?',
    ctaText: 'Auditoría de accesibilidad automatizada RGAA / WCAG, resultado en un minuto.',
    ctaButton: 'Lanzar una auditoría gratuita',
  },
  it: {
    breadcrumb: 'Percorso di navigazione',
    allPosts: '← Tutti gli articoli',
    readingTime: 'min di lettura',
    frenchOnly: 'Nota: questo articolo è pubblicato in francese.',
    ctaTitle: 'A che punto è il suo sito?',
    ctaText: 'Audit di accessibilità automatizzato RGAA / WCAG, risultato in un minuto.',
    ctaButton: 'Avvii un audit gratuito',
  },
})

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const t = useMessages(L)
  const lang = useLang()
  const post = slug ? localizedPost(lang, slug) : undefined
  if (!post) return <NotFound />

  return (
    <article className="mx-auto max-w-3xl px-6 py-14">
      <Seo
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        type="article"
        localized
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            inLanguage: lang,
            url: `${SITE_URL}${localizePath(lang, `/blog/${post.slug}`)}`,
            author: { '@type': 'Organization', name: 'Konforme' },
            publisher: { '@type': 'Organization', name: 'KAYZEN' },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Blog',
                item: `${SITE_URL}${localizePath(lang, '/blog')}`,
              },
              { '@type': 'ListItem', position: 2, name: post.title },
            ],
          },
        ]}
      />

      <nav aria-label={t.breadcrumb} className="text-sm text-text-dim mb-6">
        <Link to={localizePath(lang, '/blog')} className="hover:text-white hover:underline">
          {t.allPosts}
        </Link>
      </nav>

      <header className="mb-10">
        <p className="text-xs text-text-dim mb-3">
          <time dateTime={post.date}>{formatDate(post.date, false, lang)}</time> ·{' '}
          {post.readingMinutes} {t.readingTime}
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
          {post.title}
        </h1>
      </header>

      <div className="space-y-8">
        {post.sections.map((section, i) => (
          <section key={i}>
            {section.heading && (
              <h2 className="text-2xl font-bold tracking-tight mb-3">{section.heading}</h2>
            )}
            {section.paragraphs.map((p, j) => (
              <p key={j} className="text-text-soft leading-relaxed mb-4">{p}</p>
            ))}
            {section.list && (
              <ul className="space-y-2 text-text-soft leading-relaxed list-disc pl-5">
                {section.list.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-[14px] border border-primary/40 bg-primary/10 p-8 text-center">
        <h2 className="text-xl font-bold mb-2">{t.ctaTitle}</h2>
        <p className="text-sm text-text-muted mb-5">{t.ctaText}</p>
        <Link to="/login">
          <Button variant="primary">{t.ctaButton}</Button>
        </Link>
      </div>
    </article>
  )
}
