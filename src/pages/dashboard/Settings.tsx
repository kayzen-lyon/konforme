import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Seo } from '@/components/Seo'
import { useAuth } from '@/contexts/AuthContext'
import {
  useMembership,
  useProfile,
  useScans,
  useSites,
  useUpdateOrganization,
  useUpdateProfile,
} from '@/lib/queries'
import { PLANS, scansUsedThisMonth } from '@/lib/plans'
import {
  defineMessages,
  LANG_LABELS,
  LANGS,
  storedLang,
  useLang,
  useMessages,
  type Lang,
} from '@/i18n'
import { planName, planPeriod, planPrice } from '@/i18n/plans-i18n'

const L = defineMessages({
  fr: {
    seoTitle: 'Paramètres',
    seoDesc: 'Compte et organisation.',
    title: 'Paramètres',
    subtitle: 'Votre compte et votre organisation.',
    profileTitle: 'Profil',
    emailLabel: 'Email',
    emailHint: 'Géré par votre compte Google.',
    fullNameLabel: 'Nom complet',
    profileSaved: 'Profil mis à jour.',
    updateError: 'Erreur lors de la mise à jour.',
    saving: 'Enregistrement…',
    save: 'Enregistrer',
    orgTitle: 'Organisation',
    planPrefix: 'Plan',
    planFree: 'Gratuit',
    planPro: 'Pro',
    planEnterprise: 'Entreprise',
    orgNameLabel: "Nom de l'organisation",
    orgAdminOnly: 'Seul un administrateur peut modifier ce nom.',
    orgSaved: 'Organisation mise à jour.',
    subscriptionTitle: 'Abonnement',
    trialBadge: (n: number) => `Essai Pro — ${n} j restants`,
    sitesMonitored: 'Sites surveillés',
    auditsThisMonth: 'Audits ce mois-ci',
    upgradeQuestion: "Besoin de plus de sites ou d'audits ?",
    discoverPro: 'Découvrir le plan Pro',
    languageTitle: 'Langue',
    languageLabel: "Langue de l'interface",
    languageHelp:
      "Ce choix s'applique à l'interface du tableau de bord. La page est rechargée pour appliquer la nouvelle langue.",
    sessionTitle: 'Session',
    sessionText: (email: string) => `Vous êtes connecté avec ${email}.`,
    signOut: 'Se déconnecter',
  },
  en: {
    seoTitle: 'Settings',
    seoDesc: 'Account and organisation.',
    title: 'Settings',
    subtitle: 'Your account and your organisation.',
    profileTitle: 'Profile',
    emailLabel: 'Email',
    emailHint: 'Managed by your Google account.',
    fullNameLabel: 'Full name',
    profileSaved: 'Profile updated.',
    updateError: 'An error occurred while updating.',
    saving: 'Saving…',
    save: 'Save',
    orgTitle: 'Organisation',
    planPrefix: 'Plan',
    planFree: 'Free',
    planPro: 'Pro',
    planEnterprise: 'Enterprise',
    orgNameLabel: 'Organisation name',
    orgAdminOnly: 'Only an administrator can change this name.',
    orgSaved: 'Organisation updated.',
    subscriptionTitle: 'Subscription',
    trialBadge: (n: number) => `Pro trial — ${n} days left`,
    sitesMonitored: 'Monitored websites',
    auditsThisMonth: 'Audits this month',
    upgradeQuestion: 'Need more websites or audits?',
    discoverPro: 'Discover the Pro plan',
    languageTitle: 'Language',
    languageLabel: 'Interface language',
    languageHelp:
      'This choice applies to the dashboard interface. The page is reloaded to apply the new language.',
    sessionTitle: 'Session',
    sessionText: (email: string) => `You are signed in as ${email}.`,
    signOut: 'Sign out',
  },
  de: {
    seoTitle: 'Einstellungen',
    seoDesc: 'Konto und Organisation.',
    title: 'Einstellungen',
    subtitle: 'Ihr Konto und Ihre Organisation.',
    profileTitle: 'Profil',
    emailLabel: 'E-Mail',
    emailHint: 'Von Ihrem Google-Konto verwaltet.',
    fullNameLabel: 'Vollständiger Name',
    profileSaved: 'Profil aktualisiert.',
    updateError: 'Bei der Aktualisierung ist ein Fehler aufgetreten.',
    saving: 'Wird gespeichert…',
    save: 'Speichern',
    orgTitle: 'Organisation',
    planPrefix: 'Tarif',
    planFree: 'Kostenlos',
    planPro: 'Pro',
    planEnterprise: 'Unternehmen',
    orgNameLabel: 'Name der Organisation',
    orgAdminOnly: 'Nur ein Administrator kann diesen Namen ändern.',
    orgSaved: 'Organisation aktualisiert.',
    subscriptionTitle: 'Abonnement',
    trialBadge: (n: number) => `Pro-Testphase — noch ${n} Tage`,
    sitesMonitored: 'Überwachte Websites',
    auditsThisMonth: 'Audits in diesem Monat',
    upgradeQuestion: 'Brauchen Sie mehr Websites oder Audits?',
    discoverPro: 'Den Pro-Tarif entdecken',
    languageTitle: 'Sprache',
    languageLabel: 'Sprache der Oberfläche',
    languageHelp:
      'Diese Auswahl gilt für die Oberfläche des Dashboards. Die Seite wird neu geladen, um die neue Sprache anzuwenden.',
    sessionTitle: 'Sitzung',
    sessionText: (email: string) => `Sie sind mit ${email} angemeldet.`,
    signOut: 'Abmelden',
  },
  es: {
    seoTitle: 'Ajustes',
    seoDesc: 'Cuenta y organización.',
    title: 'Ajustes',
    subtitle: 'Su cuenta y su organización.',
    profileTitle: 'Perfil',
    emailLabel: 'Correo electrónico',
    emailHint: 'Gestionado por su cuenta de Google.',
    fullNameLabel: 'Nombre completo',
    profileSaved: 'Perfil actualizado.',
    updateError: 'Se ha producido un error durante la actualización.',
    saving: 'Guardando…',
    save: 'Guardar',
    orgTitle: 'Organización',
    planPrefix: 'Plan',
    planFree: 'Gratuito',
    planPro: 'Pro',
    planEnterprise: 'Empresa',
    orgNameLabel: 'Nombre de la organización',
    orgAdminOnly: 'Solo un administrador puede modificar este nombre.',
    orgSaved: 'Organización actualizada.',
    subscriptionTitle: 'Suscripción',
    trialBadge: (n: number) => `Prueba Pro — quedan ${n} días`,
    sitesMonitored: 'Sitios supervisados',
    auditsThisMonth: 'Auditorías este mes',
    upgradeQuestion: '¿Necesita más sitios o auditorías?',
    discoverPro: 'Descubrir el plan Pro',
    languageTitle: 'Idioma',
    languageLabel: 'Idioma de la interfaz',
    languageHelp:
      'Esta elección se aplica a la interfaz del panel de control. La página se recarga para aplicar el nuevo idioma.',
    sessionTitle: 'Sesión',
    sessionText: (email: string) => `Ha iniciado sesión con ${email}.`,
    signOut: 'Cerrar sesión',
  },
  it: {
    seoTitle: 'Impostazioni',
    seoDesc: 'Account e organizzazione.',
    title: 'Impostazioni',
    subtitle: 'Il suo account e la sua organizzazione.',
    profileTitle: 'Profilo',
    emailLabel: 'E-mail',
    emailHint: 'Gestita dal suo account Google.',
    fullNameLabel: 'Nome completo',
    profileSaved: 'Profilo aggiornato.',
    updateError: "Errore durante l'aggiornamento.",
    saving: 'Salvataggio…',
    save: 'Salva',
    orgTitle: 'Organizzazione',
    planPrefix: 'Piano',
    planFree: 'Gratuito',
    planPro: 'Pro',
    planEnterprise: 'Azienda',
    orgNameLabel: "Nome dell'organizzazione",
    orgAdminOnly: 'Solo un amministratore può modificare questo nome.',
    orgSaved: 'Organizzazione aggiornata.',
    subscriptionTitle: 'Abbonamento',
    trialBadge: (n: number) => `Prova Pro — ${n} giorni rimanenti`,
    sitesMonitored: 'Siti monitorati',
    auditsThisMonth: 'Audit questo mese',
    upgradeQuestion: 'Le servono più siti o più audit?',
    discoverPro: 'Scopra il piano Pro',
    languageTitle: 'Lingua',
    languageLabel: "Lingua dell'interfaccia",
    languageHelp:
      "Questa scelta si applica all'interfaccia della dashboard. La pagina viene ricaricata per applicare la nuova lingua.",
    sessionTitle: 'Sessione',
    sessionText: (email: string) => `È connesso con ${email}.`,
    signOut: 'Disconnettersi',
  },
})

/** Retire la préposition d'une période (« par mois » → « mois »). */
function shortPeriod(period: string): string {
  return period.replace(/^(par |per |pro |al |a |ao )/i, '')
}

export function Settings() {
  const t = useMessages(L)
  const lang = useLang()
  const { user, signOut } = useAuth()
  const { data: profile } = useProfile()
  const { data: membership } = useMembership()
  const updateProfile = useUpdateProfile()
  const updateOrg = useUpdateOrganization(membership?.organization_id)

  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [orgMsg, setOrgMsg] = useState<string | null>(null)
  const [uiLang, setUiLang] = useState<Lang>(() => storedLang())

  const org = membership?.organizations
  const isAdmin = membership?.role === 'owner' || membership?.role === 'admin'
  const plan = PLANS[org?.plan ?? 'free']
  const { data: sites } = useSites(membership?.organization_id)
  const { data: scans } = useScans(membership?.organization_id)
  const usedScans = scansUsedThisMonth(scans)

  async function onSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileMsg(null)
    const fd = new FormData(e.currentTarget)
    try {
      await updateProfile.mutateAsync({ full_name: String(fd.get('full_name') ?? '').trim() })
      setProfileMsg(t.profileSaved)
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : t.updateError)
    }
  }

  async function onSaveOrg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setOrgMsg(null)
    const fd = new FormData(e.currentTarget)
    try {
      await updateOrg.mutateAsync({ name: String(fd.get('org_name') ?? '').trim() })
      setOrgMsg(t.orgSaved)
    } catch (err) {
      setOrgMsg(err instanceof Error ? err.message : t.updateError)
    }
  }

  function onChangeLang(value: Lang) {
    setUiLang(value)
    try {
      localStorage.setItem('konforme_lang', value)
    } catch {
      /* stockage indisponible */
    }
    window.location.reload()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Seo title={t.seoTitle} description={t.seoDesc} path="/dashboard/settings" noindex />
      <header>
        <h1 className="text-3xl font-extrabold">{t.title}</h1>
        <p className="text-text-muted mt-1">{t.subtitle}</p>
      </header>

      <Card>
        <h2 className="text-lg font-bold mb-4">{t.profileTitle}</h2>
        <form onSubmit={onSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="pf-email" className="block text-sm font-semibold mb-1.5">{t.emailLabel}</label>
            <input
              id="pf-email"
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full rounded-[12px] border border-border bg-surface px-3.5 py-2.5 text-sm text-text-muted"
            />
            <p className="mt-1 text-xs text-text-dim">{t.emailHint}</p>
          </div>
          <div>
            <label htmlFor="pf-name" className="block text-sm font-semibold mb-1.5">{t.fullNameLabel}</label>
            <input
              id="pf-name"
              name="full_name"
              type="text"
              defaultValue={profile?.full_name ?? ''}
              autoComplete="name"
              className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary"
            />
          </div>
          {profileMsg && <p role="status" className="text-sm text-success-soft">{profileMsg}</p>}
          <Button type="submit" variant="primary" size="sm" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? t.saving : t.save}
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t.orgTitle}</h2>
          <Badge className="border-border-strong text-text-muted">
            {t.planPrefix} {org?.plan === 'free' ? t.planFree : org?.plan === 'pro' ? t.planPro : t.planEnterprise}
          </Badge>
        </div>
        <form onSubmit={onSaveOrg} className="space-y-4">
          <div>
            <label htmlFor="org-name" className="block text-sm font-semibold mb-1.5">{t.orgNameLabel}</label>
            <input
              id="org-name"
              name="org_name"
              type="text"
              defaultValue={org?.name ?? ''}
              disabled={!isAdmin}
              className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary disabled:opacity-60"
            />
            {!isAdmin && (
              <p className="mt-1 text-xs text-text-dim">{t.orgAdminOnly}</p>
            )}
          </div>
          {orgMsg && <p role="status" className="text-sm text-success-soft">{orgMsg}</p>}
          {isAdmin && (
            <Button type="submit" variant="primary" size="sm" disabled={updateOrg.isPending}>
              {updateOrg.isPending ? t.saving : t.save}
            </Button>
          )}
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{t.subscriptionTitle}</h2>
          <Badge className="border-border-strong text-text-muted">
            {(membership?.trial_days_left ?? 0) > 0
              ? t.trialBadge(membership!.trial_days_left)
              : `${planName(lang, plan.id)} — ${planPrice(lang, plan.id)}${plan.id !== 'enterprise' ? `/${shortPeriod(planPeriod(lang, plan.id))}` : ''}`}
          </Badge>
        </div>
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-[12px] border border-border px-4 py-3">
            <dt className="text-xs text-text-dim">{t.sitesMonitored}</dt>
            <dd className="mt-1 font-bold">
              {sites?.length ?? '—'} / {Number.isFinite(plan.maxSites) ? plan.maxSites : '∞'}
            </dd>
          </div>
          <div className="rounded-[12px] border border-border px-4 py-3">
            <dt className="text-xs text-text-dim">{t.auditsThisMonth}</dt>
            <dd className="mt-1 font-bold">
              {scans ? usedScans : '—'} / {Number.isFinite(plan.scansPerMonth) ? plan.scansPerMonth : '∞'}
            </dd>
          </div>
        </dl>
        {plan.id === 'free' && (
          <p className="mt-4 text-sm text-text-muted">
            {t.upgradeQuestion}{' '}
            <Link to="/tarifs" className="text-link font-semibold hover:underline">
              {t.discoverPro}
            </Link>
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-4">{t.languageTitle}</h2>
        <div>
          <label htmlFor="ui-lang" className="block text-sm font-semibold mb-1.5">{t.languageLabel}</label>
          <select
            id="ui-lang"
            value={uiLang}
            onChange={(e) => onChangeLang(e.target.value as Lang)}
            aria-describedby="ui-lang-help"
            className="w-full rounded-[16px] border border-border-strong bg-surface px-4 py-3 text-base text-text focus-visible:border-primary"
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>{LANG_LABELS[l]}</option>
            ))}
          </select>
          <p id="ui-lang-help" className="mt-1 text-xs text-text-dim">{t.languageHelp}</p>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold mb-2">{t.sessionTitle}</h2>
        <p className="text-sm text-text-muted mb-4">{t.sessionText(user?.email ?? '')}</p>
        <Button variant="ghost" onClick={() => signOut()}>{t.signOut}</Button>
      </Card>
    </div>
  )
}
