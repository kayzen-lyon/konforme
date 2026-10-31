# Konforme — accessibilité web RGAA & WCAG automatisée

Plateforme SaaS éditée par **KAYZEN** (Lyon).

Stack : **Vite 8 + React 19 + TypeScript + Tailwind v4 + Appwrite (open source — Auth email/Google, TablesDB, Functions)** + TanStack Query + Zod + Recharts + axe-core.

**Fonctionnalités clés** : test d'accessibilité public sans compte (landing), audits
multi-pages (~100 règles RGAA 4.1 / WCAG 2.2, scores pondérés par sévérité et par page),
corrections guidées + assistant IA optionnel, surveillance planifiée (cron), exports
HTML/CSV/JSON, déclaration légale (art. 47), essai Pro 14 jours, quotas par plan.

> Historique : le backend était initialement sur Supabase (projet `ipxuiffmeceaywnpbtrj`, en
> pause faute de slot gratuit). Migré vers **Appwrite Cloud** en juillet 2026 : open source,
> plan gratuit sans mise en pause, région UE (Francfort).

---

## Démarrage rapide

```bash
npm install
cp .env.example .env.local           # remplir les valeurs (voir ci-dessous)
node scripts/provision-appwrite.cjs  # crée base, tables, index + déploie la fonction scan-site
npm run dev                          # http://localhost:5173
```

## Configuration Appwrite (une seule fois, ~10 minutes)

1. **Créer un compte + projet** sur [cloud.appwrite.io](https://cloud.appwrite.io) —
   choisir la région **Frankfurt (fra)**. Copier le **Project ID** dans `.env.local`
   (`VITE_APPWRITE_PROJECT_ID`).
2. **Plateforme Web** : dans le projet, *Add platform → Web*, hostname `localhost`, puis
   ajouter une deuxième plateforme avec votre domaine de production
   (`konforme.kayzen-lyon.com`).
3. **Clé API** : *Integrations → API keys → Create API key* avec les scopes
   `databases`, `tables`, `columns`, `indexes`, `rows`, `functions`, `deployments`, `teams`
   (read + write) → `APPWRITE_API_KEY` dans `.env.local`.
4. **Provisionner** : `node scripts/provision-appwrite.cjs` (idempotent, relançable).
5. **Google OAuth** : dans la console Appwrite, *Auth → Settings → Google* : coller le
   Client ID/Secret Google (`.env.local`). Dans Google Cloud Console, ajouter l'URI de
   redirection affichée par Appwrite, de la forme
   `https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/<PROJECT_ID>`.

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Build de production (`dist/`) |
| `npm run preview` | Sert le build de production en local |
| `npm run lint` | ESLint |
| `npm test` | Vitest (moteur d'audit + libs front) |
| `node scripts/provision-appwrite.cjs` | Provisionne le backend Appwrite + déploie les fonctions |

## Variables d'environnement

- `VITE_APPWRITE_ENDPOINT` + `VITE_APPWRITE_PROJECT_ID` — exposées au navigateur
- `APPWRITE_API_KEY` — server-only (provisionnement), jamais exposée ni commitée
- `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` — pour mémoire, configurés dans la console Appwrite

---

## Architecture

```
src/
├── App.tsx                       # Router (lazy par route)
├── main.tsx                      # Entry + QueryClientProvider
├── index.css                     # Tailwind v4 + design tokens (contrastes AA)
├── components/
│   ├── Seo.tsx                   # <title>/<meta>/canonical/JSON-LD par route (React 19)
│   ├── ScoreRing.tsx / ScoreChart.tsx (recharts, lazy)
│   ├── layout/                   # Header, Footer, PublicLayout, DashboardLayout
│   └── ui/                       # Button, Card, Badge, Logo…
├── contexts/AuthContext.tsx      # Session Appwrite, OAuth Google, signOut
├── lib/
│   ├── appwrite.ts               # Client + IDs (DB "konforme", tables, fonction scan-site)
│   ├── queries.ts                # Hooks TanStack Query (Teams = organisations, TablesDB)
│   ├── database.types.ts         # Types du domaine
│   ├── declaration.ts            # Générateur de déclaration légale (art. 47)
│   └── format.ts                 # Dates, sévérités, scores
├── content/                      # posts.ts (blog), legal.tsx (pages légales)
└── pages/                        # Landing, Rgaa, Blog(+Post), About, Contact,
                                  # Accessibilite, LegalPage, NotFound, Login,
                                  # DashboardHome + dashboard/ (Sites, Scans,
                                  # ScanDetail, Declarations, Settings)
functions/
├── scan-site/                    # Fonction Appwrite (Node 22) : moteur d'audit
│                                 #  - mode { scan_id } : audit complet multi-pages
│                                 #  - mode { url } : mini-audit public sans compte
│                                 #  - mode { explain } : assistant IA (ANTHROPIC_API_KEY)
└── scan-scheduler/               # Cron quotidien : relance les sites surveillés
scripts/
└── provision-appwrite.cjs        # Setup backend complet (idempotent)
```

### Modèle de données (Appwrite)

- **Organisations = Teams Appwrite** : une team personnelle est créée au premier login ;
  le multi-tenant s'appuie sur les permissions par row (`Role.team(id)`).
- **Tables** (base `konforme`, row security activée) : `sites`, `scans`, `scan_issues`,
  `declarations` — chaque row porte `team_id` + permissions de la team.

### Moteur d'audit (`functions/scan-site`)

Le client crée le scan (`status: pending`) puis déclenche la fonction avec `{ scan_id }`.
La fonction (clé API dynamique, scopes rows/tables/teams) vérifie l'appartenance à la team,
crawle la page d'accueil + pages internes (`max_pages` selon le plan, 25 en Pro), exécute
~40 règles statiques RGAA 4.1 maison **+ axe-core dans jsdom** (locale FR, dédoublonné,
garde-fous CPU : skip > 250 Ko, timeout 15 s/page), calcule des scores **pondérés par
sévérité** (`score` / `rgaa_score` / `wcag_score` + `page_scores` par page) et enregistre
chaque non-conformité avec sélecteur CSS, extrait HTML et correction suggérée. Le front
suit l'avancement par polling (TanStack Query). Un garde anti-SSRF refuse les cibles
locales/privées. Le mode public `{ url }` (exécution synchrone, `Role.any()`) alimente le
test gratuit de la landing sans écrire en base.

---

## Déploiement front

`vercel.json` fournit les rewrites SPA (obligatoires pour les routes profondes), le cache
immutable des assets et les headers de sécurité. Ajouter les variables `VITE_APPWRITE_*`
dans Vercel (Settings → Environment Variables).

---

## Crédit

Édité par **KAYZEN** — 6 rue Pierre Termier, 69009 Lyon — SIREN 493 857 262.
Réalisé par [Kayzen Web](https://internet.kayzen-lyon.fr).
