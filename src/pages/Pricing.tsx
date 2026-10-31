import { Link } from 'react-router-dom'
import { Seo } from '@/components/Seo'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { PLANS, type Plan } from '@/lib/plans'
import { defineMessages, localizePath, useLang, useMessages } from '@/i18n'
import {
  planCta,
  planFeatures,
  planName,
  planPeriod,
  planPrice,
  planTagline,
} from '@/i18n/plans-i18n'

const ORDER: Plan[] = [PLANS.free, PLANS.pro, PLANS.enterprise]

const L = defineMessages({
  fr: {
    seoTitle: 'Tarifs',
    seoDescription:
      "Audit d'accessibilité RGAA/WCAG gratuit pour un site, plan Pro pour les agences, accompagnement expert pour la conformité opposable.",
    h1: 'Des tarifs simples, un objectif : la conformité',
    intro:
      "Commencez gratuitement, passez au plan Pro quand votre activité grandit. L'audit manuel opposable est disponible en offre accompagnée.",
    recommended: 'Recommandé',
    proNote: 'Paiement en ligne bientôt disponible — activation sous 24 h par notre équipe.',
    faqTitle: 'Questions fréquentes',
    faq: {
      scope: {
        q: "Que couvre l'audit automatisé ?",
        a: "Plus de 40 règles RGAA 4.1.2 / WCAG 2.2 vérifiables par machine (images, formulaires, structure, ARIA, contrastes…), soit environ 30 % du référentiel. La conformité opposable nécessite un audit manuel complémentaire, inclus dans l'offre Accompagné.",
      },
      legal: {
        q: 'Suis-je concerné par l’obligation légale ?',
        a1: "Depuis juin 2025, l'European Accessibility Act étend l'obligation d'accessibilité à la plupart des services numériques privés (e-commerce, banques, transports…). En France, l'article 47 de la loi de 2005 s'applique déjà au secteur public et aux grandes entreprises. ",
        link: 'En savoir plus sur le RGAA',
        a2: '.',
      },
      change: {
        q: 'Puis-je changer de plan à tout moment ?',
        a1: "Oui. Le quota d'audits se réinitialise le ",
        sup: 'er',
        a2: " de chaque mois, et le passage d'un plan à l'autre est immédiat.",
      },
    },
  },
  en: {
    seoTitle: 'Pricing',
    seoDescription:
      'Free RGAA/WCAG accessibility audit for one website, a Pro plan for agencies and expert guidance towards legally binding compliance.',
    h1: 'Simple pricing, one goal: compliance',
    intro:
      'Start for free and move to the Pro plan as your business grows. The legally binding manual audit is available with our guided offer.',
    recommended: 'Recommended',
    proNote: 'Online payment coming soon — activation within 24 hours by our team.',
    faqTitle: 'Frequently asked questions',
    faq: {
      scope: {
        q: 'What does the automated audit cover?',
        a: 'More than 40 machine-testable RGAA 4.1.2 / WCAG 2.2 rules (images, forms, structure, ARIA, contrast and more), i.e. around 30% of the reference framework. Legally binding compliance requires an additional manual audit, included in the Guided offer.',
      },
      legal: {
        q: 'Am I affected by the legal obligation?',
        a1: 'Since June 2025, the European Accessibility Act has extended accessibility obligations to most private digital services (e-commerce, banking, transport and more). In France, Article 47 of the 2005 act already applies to the public sector and to large companies. ',
        link: 'Learn more about the RGAA',
        a2: '.',
      },
      change: {
        q: 'Can I change plan at any time?',
        a1: 'Yes. The audit quota resets on the ',
        sup: 'st',
        a2: ' of each month, and switching from one plan to another takes effect immediately.',
      },
    },
  },
  de: {
    seoTitle: 'Preise',
    seoDescription:
      'Kostenloses RGAA/WCAG-Barrierefreiheitsaudit für eine Website, Pro-Tarif für Agenturen und Expertenbegleitung zur rechtsverbindlichen Konformität.',
    h1: 'Einfache Preise, ein Ziel: Konformität',
    intro:
      'Starten Sie kostenlos und wechseln Sie zum Pro-Tarif, wenn Ihr Geschäft wächst. Das rechtsverbindliche manuelle Audit ist im begleiteten Angebot enthalten.',
    recommended: 'Empfohlen',
    proNote: 'Online-Zahlung bald verfügbar — Freischaltung innerhalb von 24 Stunden durch unser Team.',
    faqTitle: 'Häufige Fragen',
    faq: {
      scope: {
        q: 'Was deckt das automatisierte Audit ab?',
        a: 'Mehr als 40 maschinell prüfbare Regeln nach RGAA 4.1.2 / WCAG 2.2 (Bilder, Formulare, Struktur, ARIA, Kontraste …), also rund 30 % des Referenzrahmens. Für die rechtsverbindliche Konformität ist ein ergänzendes manuelles Audit erforderlich, das im begleiteten Angebot enthalten ist.',
      },
      legal: {
        q: 'Bin ich von der gesetzlichen Pflicht betroffen?',
        a1: 'Seit Juni 2025 weitet der European Accessibility Act die Barrierefreiheitspflicht auf die meisten privaten digitalen Dienste aus (E-Commerce, Banken, Verkehr …). In Frankreich gilt Artikel 47 des Gesetzes von 2005 bereits für den öffentlichen Sektor und für große Unternehmen. ',
        link: 'Mehr über den RGAA erfahren',
        a2: '.',
      },
      change: {
        q: 'Kann ich den Tarif jederzeit wechseln?',
        a1: 'Ja. Das Audit-Kontingent wird am ',
        sup: '',
        a2: '. jedes Monats zurückgesetzt, und der Wechsel von einem Tarif zum anderen erfolgt sofort.',
      },
    },
  },
  es: {
    seoTitle: 'Tarifas',
    seoDescription:
      'Auditoría de accesibilidad RGAA/WCAG gratuita para un sitio, plan Pro para agencias y acompañamiento experto hacia la conformidad oponible.',
    h1: 'Tarifas sencillas, un objetivo: la conformidad',
    intro:
      'Empiece gratis y pase al plan Pro cuando su actividad crezca. La auditoría manual oponible está disponible en la oferta acompañada.',
    recommended: 'Recomendado',
    proNote: 'Pago en línea disponible próximamente — activación en 24 h por nuestro equipo.',
    faqTitle: 'Preguntas frecuentes',
    faq: {
      scope: {
        q: '¿Qué cubre la auditoría automatizada?',
        a: 'Más de 40 reglas RGAA 4.1.2 / WCAG 2.2 verificables por máquina (imágenes, formularios, estructura, ARIA, contrastes…), es decir, alrededor del 30 % del referencial. La conformidad oponible requiere una auditoría manual complementaria, incluida en la oferta acompañada.',
      },
      legal: {
        q: '¿Me afecta la obligación legal?',
        a1: 'Desde junio de 2025, el European Accessibility Act extiende la obligación de accesibilidad a la mayoría de los servicios digitales privados (comercio electrónico, banca, transporte…). En Francia, el artículo 47 de la ley de 2005 ya se aplica al sector público y a las grandes empresas. ',
        link: 'Más información sobre el RGAA',
        a2: '.',
      },
      change: {
        q: '¿Puedo cambiar de plan en cualquier momento?',
        a1: 'Sí. La cuota de auditorías se restablece el ',
        sup: '',
        a2: '.º de cada mes, y el cambio de un plan a otro es inmediato.',
      },
    },
  },
  it: {
    seoTitle: 'Prezzi',
    seoDescription:
      'Audit di accessibilità RGAA/WCAG gratuito per un sito, piano Pro per le agenzie e accompagnamento esperto verso la conformità con valore legale.',
    h1: 'Prezzi semplici, un obiettivo: la conformità',
    intro:
      'Inizi gratuitamente e passi al piano Pro quando la sua attività cresce. L’audit manuale con valore legale è disponibile nell’offerta assistita.',
    recommended: 'Consigliato',
    proNote: 'Pagamento online presto disponibile — attivazione entro 24 ore da parte del nostro team.',
    faqTitle: 'Domande frequenti',
    faq: {
      scope: {
        q: 'Che cosa copre l’audit automatizzato?',
        a: 'Oltre 40 regole RGAA 4.1.2 / WCAG 2.2 verificabili automaticamente (immagini, moduli, struttura, ARIA, contrasti…), ovvero circa il 30 % del riferimento. La conformità con valore legale richiede un audit manuale complementare, incluso nell’offerta assistita.',
      },
      legal: {
        q: 'Sono soggetto all’obbligo di legge?',
        a1: 'Da giugno 2025 l’European Accessibility Act estende l’obbligo di accessibilità alla maggior parte dei servizi digitali privati (e-commerce, banche, trasporti…). In Francia, l’articolo 47 della legge del 2005 si applica già al settore pubblico e alle grandi imprese. ',
        link: 'Scopra di più sul RGAA',
        a2: '.',
      },
      change: {
        q: 'Posso cambiare piano in qualsiasi momento?',
        a1: 'Sì. La quota di audit si azzera il ',
        sup: '',
        a2: ' di ogni mese e il passaggio da un piano all’altro è immediato.',
      },
    },
  },
})

export function Pricing() {
  const t = useMessages(L)
  const lang = useLang()

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 md:py-20">
      <Seo title={t.seoTitle} description={t.seoDescription} path="/tarifs" localized />

      <header className="text-center max-w-2xl mx-auto mb-16">
        <p className="eyebrow mb-5">EAA · RGAA · WCAG</p>
        <h1 className="text-4xl md:text-5xl font-extrabold text-balance">{t.h1}</h1>
        <p className="text-lg text-text-muted mt-5">{t.intro}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {ORDER.map((plan) => (
          <section
            key={plan.id}
            aria-labelledby={`plan-${plan.id}`}
            className={`relative flex flex-col rounded-[24px] border p-8 ${
              plan.highlighted
                ? 'border-2 border-primary bg-surface shadow-card'
                : 'border-border bg-surface shadow-micro'
            }`}
          >
            {plan.highlighted && (
              <p className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1.5 font-display text-xs font-bold uppercase tracking-[0.12em] text-on-primary">
                {t.recommended}
              </p>
            )}
            <h2 id={`plan-${plan.id}`} className="text-xl font-bold">
              {planName(lang, plan.id)}
            </h2>
            <p className="mt-3">
              <span className="font-display text-4xl font-extrabold tracking-[-0.03em]">{planPrice(lang, plan.id)}</span>{' '}
              <span className="text-sm text-text-dim">{planPeriod(lang, plan.id)}</span>
            </p>
            <p className="text-sm text-text-muted mt-3">{planTagline(lang, plan.id)}</p>

            <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm flex-1">
              {planFeatures(lang, plan.id).map((f) => (
                <li key={f} className="flex gap-2.5">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                    className="mt-0.5 shrink-0"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                to={plan.id === 'free' ? '/login' : localizePath(lang, '/contact')}
                className={cn(buttonVariants({ variant: plan.highlighted ? 'primary' : 'ghost' }), 'w-full')}
              >
                {planCta(lang, plan.id)}
              </Link>
              {plan.id === 'pro' && (
                <p className="mt-2 text-center text-xs text-text-dim">{t.proNote}</p>
              )}
            </div>
          </section>
        ))}
      </div>

      <section aria-labelledby="pricing-faq" className="mt-20 max-w-3xl mx-auto rounded-[24px] bg-surface-2 p-8 md:p-10">
        <h2 id="pricing-faq" className="text-2xl md:text-3xl font-extrabold text-center mb-8">
          {t.faqTitle}
        </h2>
        <dl className="space-y-6">
          <div>
            <dt className="font-display text-lg font-semibold">{t.faq.scope.q}</dt>
            <dd className="text-text-muted mt-1">{t.faq.scope.a}</dd>
          </div>
          <div>
            <dt className="font-display text-lg font-semibold">{t.faq.legal.q}</dt>
            <dd className="text-text-muted mt-1">
              {t.faq.legal.a1}
              <Link to={localizePath(lang, '/rgaa')} className="text-link underline">
                {t.faq.legal.link}
              </Link>
              {t.faq.legal.a2}
            </dd>
          </div>
          <div>
            <dt className="font-display text-lg font-semibold">{t.faq.change.q}</dt>
            <dd className="text-text-muted mt-1">
              {t.faq.change.a1}1<sup>{t.faq.change.sup}</sup>
              {t.faq.change.a2}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
