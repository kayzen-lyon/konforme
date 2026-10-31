import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ORGANIZATION_JSONLD, Seo } from '@/components/Seo'
import { defineMessages, useMessages } from '@/i18n'

const L = defineMessages({
  fr: {
    seoTitle: 'Contact',
    seoDescription:
      "Une question sur l'accessibilité de votre site, le RGAA ou l'EAA ? L'équipe Konforme (Lyon) vous répond sous 24 h ouvrées.",
    eyebrow: 'Contact',
    h1: 'Parlons de votre conformité',
    intro:
      'Audit accompagné, question technique ou demande de devis : nous répondons sous 24 h ouvrées.',
    formTitle: 'Écrivez-nous',
    nameLabel: 'Votre nom',
    subjectLabel: 'Sujet',
    subjects: {
      quote: 'Demande de devis',
      audit: 'Question sur un audit',
      a11y: 'Accessibilité / RGAA',
      other: 'Autre',
    },
    defaultSubject: 'Contact Konforme',
    messageLabel: 'Message',
    submit: 'Envoyer via votre messagerie',
    sent: "Votre logiciel de messagerie s'est ouvert avec le message pré-rempli. Si rien ne s'est passé, écrivez-nous directement à contact@kayzen-lyon.fr.",
    detailsTitle: 'Coordonnées',
    hours: 'Du lundi au vendredi, 9 h – 18 h.',
  },
  en: {
    seoTitle: 'Contact',
    seoDescription:
      'A question about your website’s accessibility, the RGAA or the EAA? The Konforme team (Lyon) replies within one business day.',
    eyebrow: 'Contact',
    h1: 'Let’s talk about your compliance',
    intro:
      'Guided audit, technical question or quote request: we reply within one business day.',
    formTitle: 'Write to us',
    nameLabel: 'Your name',
    subjectLabel: 'Subject',
    subjects: {
      quote: 'Quote request',
      audit: 'Question about an audit',
      a11y: 'Accessibility / RGAA',
      other: 'Other',
    },
    defaultSubject: 'Konforme enquiry',
    messageLabel: 'Message',
    submit: 'Send via your email client',
    sent: 'Your email client has opened with the message pre-filled. If nothing happened, write to us directly at contact@kayzen-lyon.fr.',
    detailsTitle: 'Contact details',
    hours: 'Monday to Friday, 9 a.m. – 6 p.m.',
  },
  de: {
    seoTitle: 'Kontakt',
    seoDescription:
      'Eine Frage zur Barrierefreiheit Ihrer Website, zum RGAA oder zum EAA? Das Konforme-Team (Lyon) antwortet innerhalb eines Werktags.',
    eyebrow: 'Kontakt',
    h1: 'Sprechen wir über Ihre Konformität',
    intro:
      'Begleitetes Audit, technische Frage oder Angebotsanfrage: Wir antworten innerhalb eines Werktags.',
    formTitle: 'Schreiben Sie uns',
    nameLabel: 'Ihr Name',
    subjectLabel: 'Betreff',
    subjects: {
      quote: 'Angebotsanfrage',
      audit: 'Frage zu einem Audit',
      a11y: 'Barrierefreiheit / RGAA',
      other: 'Sonstiges',
    },
    defaultSubject: 'Anfrage Konforme',
    messageLabel: 'Nachricht',
    submit: 'Über Ihr E-Mail-Programm senden',
    sent: 'Ihr E-Mail-Programm wurde mit der vorausgefüllten Nachricht geöffnet. Falls nichts passiert ist, schreiben Sie uns direkt an contact@kayzen-lyon.fr.',
    detailsTitle: 'Kontaktdaten',
    hours: 'Montag bis Freitag, 9 – 18 Uhr.',
  },
  es: {
    seoTitle: 'Contacto',
    seoDescription:
      '¿Una pregunta sobre la accesibilidad de su sitio, el RGAA o el EAA? El equipo de Konforme (Lyon) le responde en 24 h laborables.',
    eyebrow: 'Contacto',
    h1: 'Hablemos de su conformidad',
    intro:
      'Auditoría acompañada, pregunta técnica o solicitud de presupuesto: le respondemos en 24 h laborables.',
    formTitle: 'Escríbanos',
    nameLabel: 'Su nombre',
    subjectLabel: 'Asunto',
    subjects: {
      quote: 'Solicitud de presupuesto',
      audit: 'Pregunta sobre una auditoría',
      a11y: 'Accesibilidad / RGAA',
      other: 'Otro',
    },
    defaultSubject: 'Consulta Konforme',
    messageLabel: 'Mensaje',
    submit: 'Enviar desde su correo',
    sent: 'Su programa de correo se ha abierto con el mensaje ya redactado. Si no ha ocurrido nada, escríbanos directamente a contact@kayzen-lyon.fr.',
    detailsTitle: 'Datos de contacto',
    hours: 'De lunes a viernes, de 9:00 a 18:00.',
  },
  it: {
    seoTitle: 'Contatti',
    seoDescription:
      'Una domanda sull’accessibilità del suo sito, sul RGAA o sull’EAA? Il team Konforme (Lione) le risponde entro 24 ore lavorative.',
    eyebrow: 'Contatti',
    h1: 'Parliamo della sua conformità',
    intro:
      'Audit assistito, domanda tecnica o richiesta di preventivo: rispondiamo entro 24 ore lavorative.',
    formTitle: 'Ci scriva',
    nameLabel: 'Il suo nome',
    subjectLabel: 'Oggetto',
    subjects: {
      quote: 'Richiesta di preventivo',
      audit: 'Domanda su un audit',
      a11y: 'Accessibilità / RGAA',
      other: 'Altro',
    },
    defaultSubject: 'Richiesta Konforme',
    messageLabel: 'Messaggio',
    submit: 'Invii dal suo programma di posta',
    sent: 'Il suo programma di posta si è aperto con il messaggio già compilato. Se non è successo nulla, ci scriva direttamente a contact@kayzen-lyon.fr.',
    detailsTitle: 'Recapiti',
    hours: 'Dal lunedì al venerdì, 9:00 – 18:00.',
  },
})

export function Contact() {
  const [sent, setSent] = useState(false)
  const t = useMessages(L)

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') ?? '')
    const subject = String(fd.get('subject') ?? t.defaultSubject)
    const message = String(fd.get('message') ?? '')
    const body = `${message}\n\n— ${name}`
    // Pas de serveur d'email : on ouvre le client mail de l'utilisateur, pré-rempli.
    window.location.href = `mailto:contact@kayzen-lyon.fr?subject=${encodeURIComponent(`[Konforme] ${subject}`)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Seo
        title={t.seoTitle}
        description={t.seoDescription}
        path="/contact"
        localized
        jsonLd={[ORGANIZATION_JSONLD]}
      />
      <p className="eyebrow mb-5">{t.eyebrow}</p>
      <h1 className="text-4xl md:text-5xl font-extrabold text-balance mb-5">{t.h1}</h1>
      <p className="text-lg text-text-muted mb-10">{t.intro}</p>

      <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <Card>
          <h2 className="text-lg font-bold mb-4">{t.formTitle}</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="ct-name" className="block text-sm font-semibold mb-1.5">{t.nameLabel}</label>
              <input
                id="ct-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary"
              />
            </div>
            <div>
              <label htmlFor="ct-subject" className="block text-sm font-semibold mb-1.5">{t.subjectLabel}</label>
              <select
                id="ct-subject"
                name="subject"
                className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary"
              >
                <option>{t.subjects.quote}</option>
                <option>{t.subjects.audit}</option>
                <option>{t.subjects.a11y}</option>
                <option>{t.subjects.other}</option>
              </select>
            </div>
            <div>
              <label htmlFor="ct-message" className="block text-sm font-semibold mb-1.5">{t.messageLabel}</label>
              <textarea
                id="ct-message"
                name="message"
                required
                rows={5}
                className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary"
              />
            </div>
            <Button type="submit" variant="primary">{t.submit}</Button>
            {sent && (
              <p role="status" className="text-sm text-success-soft">
                {t.sent}
              </p>
            )}
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-4">{t.detailsTitle}</h2>
          <address className="not-italic space-y-3 text-sm text-text-soft leading-relaxed">
            <p>
              <strong className="text-text">KAYZEN</strong>
              <br />6 rue Pierre Termier
              <br />69009 Lyon, France
            </p>
            <p>
              <a href="tel:+33487776861" className="text-link hover:underline">+33 (0)4 87 77 68 61</a>
              <br />
              <a href="mailto:contact@kayzen-lyon.fr" className="text-link hover:underline">contact@kayzen-lyon.fr</a>
            </p>
            <p className="text-xs text-text-dim">{t.hours}</p>
          </address>
        </Card>
      </div>
    </div>
  )
}
