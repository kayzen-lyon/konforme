import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route, Outlet, useParams } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { isLang, LangProvider, storedLang, type Lang } from '@/i18n'
import { Landing } from '@/pages/Landing'

// Code-splitting par route : seul l'accueil est chargé immédiatement.
const DashboardLayout = lazy(() =>
  import('@/components/layout/DashboardLayout').then((m) => ({ default: m.DashboardLayout })),
)
const Login = lazy(() => import('@/pages/Login').then((m) => ({ default: m.Login })))
const AuthCallback = lazy(() => import('@/pages/AuthCallback').then((m) => ({ default: m.AuthCallback })))
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail').then((m) => ({ default: m.VerifyEmail })))
const DashboardHome = lazy(() => import('@/pages/DashboardHome').then((m) => ({ default: m.DashboardHome })))
const Sites = lazy(() => import('@/pages/dashboard/Sites').then((m) => ({ default: m.Sites })))
const Scans = lazy(() => import('@/pages/dashboard/Scans').then((m) => ({ default: m.Scans })))
const ScanDetail = lazy(() => import('@/pages/dashboard/ScanDetail').then((m) => ({ default: m.ScanDetail })))
const Declarations = lazy(() => import('@/pages/dashboard/Declarations').then((m) => ({ default: m.Declarations })))
const Settings = lazy(() => import('@/pages/dashboard/Settings').then((m) => ({ default: m.Settings })))
const Blog = lazy(() => import('@/pages/Blog').then((m) => ({ default: m.Blog })))
const BlogPost = lazy(() => import('@/pages/BlogPost').then((m) => ({ default: m.BlogPost })))
const Rgaa = lazy(() => import('@/pages/Rgaa').then((m) => ({ default: m.Rgaa })))
const GuideAccessibilite = lazy(() =>
  import('@/pages/GuideAccessibilite').then((m) => ({ default: m.GuideAccessibilite })),
)
const Glossaire = lazy(() => import('@/pages/Glossaire').then((m) => ({ default: m.Glossaire })))
const PublicReport = lazy(() => import('@/pages/PublicReport').then((m) => ({ default: m.PublicReport })))
const CriterePage = lazy(() => import('@/pages/CriterePage').then((m) => ({ default: m.CriterePage })))
const Developpeurs = lazy(() => import('@/pages/Developpeurs').then((m) => ({ default: m.Developpeurs })))
const Pricing = lazy(() => import('@/pages/Pricing').then((m) => ({ default: m.Pricing })))
const About = lazy(() => import('@/pages/About').then((m) => ({ default: m.About })))
const Contact = lazy(() => import('@/pages/Contact').then((m) => ({ default: m.Contact })))
const LegalPage = lazy(() => import('@/pages/LegalPage').then((m) => ({ default: m.LegalPage })))
const Accessibilite = lazy(() => import('@/pages/Accessibilite').then((m) => ({ default: m.Accessibilite })))
const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

function PageLoader() {
  return (
    <div className="min-h-[50vh] grid place-items-center" role="status">
      <div className="size-10 rounded-full border-4 border-border border-t-primary-2 animate-spin" aria-hidden="true" />
      <span className="sr-only">Chargement…</span>
    </div>
  )
}

/** Pages publiques, identiques pour la racine (fr) et chaque préfixe de langue. */
function publicRoutes() {
  return (
    <>
      <Route index element={<Landing />} />
      <Route path="blog" element={<Blog />} />
      <Route path="blog/:slug" element={<BlogPost />} />
      <Route path="rgaa" element={<Rgaa />} />
      <Route path="rgaa/critere/:id" element={<CriterePage />} />
      <Route path="guide-accessibilite" element={<GuideAccessibilite />} />
      <Route path="glossaire" element={<Glossaire />} />
      <Route path="developpeurs" element={<Developpeurs />} />
      <Route path="tarifs" element={<Pricing />} />
      <Route path="a-propos" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="accessibilite" element={<Accessibilite />} />
      <Route path="legal/:slug" element={<LegalPage />} />
      <Route path="r/:token" element={<PublicReport />} />
    </>
  )
}

/** Coque publique française (racine). */
function PublicShellFr() {
  return (
    <LangProvider lang="fr">
      <PublicLayout />
    </LangProvider>
  )
}

/** Coque publique préfixée /:lang — 404 si le préfixe n'est pas une langue. */
function PublicShellLang() {
  const { lang } = useParams<{ lang: string }>()
  if (!isLang(lang)) {
    return (
      <LangProvider lang="fr">
        <PublicLayout>
          <Suspense fallback={<PageLoader />}>
            <NotFound />
          </Suspense>
        </PublicLayout>
      </LangProvider>
    )
  }
  return (
    <LangProvider lang={lang}>
      <PublicLayout />
    </LangProvider>
  )
}

/** Coque du dashboard : langue = préférence utilisateur (localStorage). */
function DashboardShell() {
  const [lang] = useState<Lang>(() => storedLang())
  return (
    <LangProvider lang={lang}>
      <Outlet />
    </LangProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public — français à la racine */}
            <Route element={<PublicShellFr />}>
              {publicRoutes()}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Public — préfixes de langue /en /de /es /it */}
            <Route path=":lang" element={<PublicShellLang />}>
              {publicRoutes()}
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Auth */}
            <Route element={<DashboardShell />}>
              <Route path="/login" element={<Login />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/verify-email" element={<VerifyEmail />} />

              {/* Dashboard (protégé) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="sites" element={<Sites />} />
                <Route path="scans" element={<Scans />} />
                <Route path="scans/:scanId" element={<ScanDetail />} />
                <Route path="declarations" element={<Declarations />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
