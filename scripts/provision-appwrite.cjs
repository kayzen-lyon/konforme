/* Provisionne le backend Appwrite de Konforme (idempotent).
 *
 * Prérequis (.env.local) :
 *   VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
 *   VITE_APPWRITE_PROJECT_ID=<id du projet>
 *   APPWRITE_API_KEY=<clé API avec scopes databases/tables/rows/functions/teams>
 *
 * Usage : node scripts/provision-appwrite.cjs
 */
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const { execFileSync } = require('node:child_process')
const { Client, TablesDB, Functions, Permission, Role } = require('node-appwrite')
const { InputFile } = require('node-appwrite/file')

const DB_ID = 'konforme'
const FUNCTION_ID = 'scan-site'

function isUnsupportedScheduleError(error) {
  const message = String(error && error.message || error)
  return /schedule|cron/i.test(message) && /plan|free|support|available|allow|upgrade/i.test(message)
}

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) throw new Error('.env.local introuvable')
  const env = {}
  // BOM + fins de ligne CRLF/CR tolérés (fichiers édités sous Windows)
  for (const line of fs.readFileSync(envPath, 'utf8').replace(/^﻿/, '').split(/\r\n|\r|\n/)) {
    const m = line.match(/^([A-Z_]+)\s*=\s*(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, '$2')
  }
  return env
}

/** Ignore les erreurs 409 (« existe déjà ») pour rester idempotent. */
async function ensure(label, fn) {
  try {
    await fn()
    console.log(`✓ ${label}`)
  } catch (e) {
    if (e && (e.code === 409 || /already exists/i.test(String(e.message)))) {
      console.log(`· ${label} (déjà présent)`)
    } else {
      const cause = e && e.cause
      const causeDetail = cause
        ? ` (cause : ${cause.code || cause.name || 'erreur'}${cause.message ? ` — ${cause.message}` : ''})`
        : ''
      throw new Error(`${label} : ${e.message || e}${causeDetail}`, { cause: e })
    }
  }
}

const S = (key, size, required = false, xdefault = undefined) => ({ kind: 'string', key, size, required, xdefault })
const B = (key, xdefault = undefined) => ({ kind: 'boolean', key, required: false, xdefault })
const F = (key) => ({ kind: 'float', key, required: false })
const I = (key, xdefault = undefined) => ({ kind: 'integer', key, required: false, xdefault })
const D = (key) => ({ kind: 'datetime', key, required: false })

const TABLES = [
  {
    id: 'sites',
    columns: [
      S('team_id', 64, true), S('name', 256, true), S('url', 1024, true),
      S('description', 2048), B('monitoring_enabled', false), S('monitoring_frequency', 16, false, 'weekly'),
      D('last_scan_at'), F('last_score'),
    ],
    indexes: [{ key: 'idx_team', columns: ['team_id'] }],
  },
  {
    id: 'scans',
    columns: [
      S('team_id', 64, true), S('site_id', 64, true), S('status', 16, true),
      S('trigger', 16, false, 'manual'), S('site_name', 256), S('site_url', 1024),
      D('started_at'), D('finished_at'), I('duration_ms'), I('pages_count', 0), I('pages_total', 0), I('pages_processed', 0), I('issues_count', 0),
      F('score'), F('rgaa_score'), F('wcag_score'), S('error', 2000),
      I('max_pages', 5), S('page_scores', 8000),
      S('worker_token_hash', 64),
      // Jeton de partage public du rapport (null = non partagé)
      S('share_token', 64),
    ],
    indexes: [
      { key: 'idx_team', columns: ['team_id'] },
      { key: 'idx_site', columns: ['site_id'] },
      { key: 'idx_share', columns: ['share_token'] },
    ],
  },
  {
    id: 'scan_pages',
    columns: [
      S('scan_id', 64, true), S('team_id', 64, true), I('position', 0),
      S('page_url', 1024, true), S('status', 16, true), F('score'), I('issues_count', 0),
      S('applicable', 8192), S('failed', 4096), S('error', 512),
    ],
    indexes: [
      { key: 'idx_scan', columns: ['scan_id'] },
      { key: 'idx_scan_position', columns: ['scan_id', 'position'] },
      { key: 'idx_scan_status', columns: ['scan_id', 'status'] },
      { key: 'idx_scan_status_position', columns: ['scan_id', 'status', 'position'] },
    ],
  },
  {
    id: 'scan_issues',
    columns: [
      S('scan_id', 64, true), S('team_id', 64, true), S('rule_id', 64, true), S('severity', 16, true),
      S('category', 64), S('title', 256, true), S('description', 2048), S('page_url', 1024),
      S('selector', 512), S('html_snippet', 512), S('suggested_fix', 1024),
      S('status', 16, false, 'open'), D('fixed_at'),
    ],
    indexes: [{ key: 'idx_scan', columns: ['scan_id'] }],
  },
  {
    // Alertes (régression de score détectée par le moteur après un audit)
    id: 'alerts',
    columns: [
      S('team_id', 64, true), S('site_id', 64, true), S('scan_id', 64),
      S('type', 24, false, 'regression'), S('message', 512),
      F('previous_score'), F('new_score'), B('read', false),
    ],
    indexes: [
      { key: 'idx_team', columns: ['team_id'] },
      { key: 'idx_site', columns: ['site_id'] },
    ],
  },
  {
    // Évaluations manuelles des critères RGAA (audit complet « méthode officielle » :
    // conforme / non conforme / non applicable, par site et par critère)
    id: 'criteria_reviews',
    columns: [
      S('team_id', 64, true), S('site_id', 64, true), S('criterion_id', 8, true),
      S('status', 16, true), S('note', 2048), D('reviewed_at'),
    ],
    indexes: [
      { key: 'idx_site', columns: ['site_id'] },
      { key: 'idx_team', columns: ['team_id'] },
    ],
  },
  {
    id: 'declarations',
    columns: [
      S('team_id', 64, true), S('site_id', 64, true), S('site_name', 256), S('site_url', 1024),
      S('conformity_level', 16, true), F('conformity_rate'),
      S('reference_standard', 32, false, 'RGAA-4.1.2'), S('audit_method', 16, false, 'auto'),
      S('contact_email', 256), D('published_at'),
    ],
    indexes: [{ key: 'idx_team', columns: ['team_id'] }],
  },
]

async function createColumn(tables, tableId, col) {
  const base = { databaseId: DB_ID, tableId, key: col.key, required: col.required ?? false }
  if (col.kind === 'string') {
    await tables.createStringColumn({ ...base, size: col.size, xdefault: col.xdefault })
  } else if (col.kind === 'boolean') {
    await tables.createBooleanColumn({ ...base, xdefault: col.xdefault })
  } else if (col.kind === 'float') {
    await tables.createFloatColumn({ ...base })
  } else if (col.kind === 'integer') {
    await tables.createIntegerColumn({ ...base, xdefault: col.xdefault })
  } else if (col.kind === 'datetime') {
    await tables.createDatetimeColumn({ ...base })
  }
}

async function waitColumnsAvailable(tables, tableId, keys) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const res = await tables.listColumns({ databaseId: DB_ID, tableId })
    const byKey = new Map(res.columns.map((c) => [c.key, c.status]))
    const pending = keys.filter((k) => byKey.get(k) !== 'available')
    if (pending.length === 0) return
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error(`Colonnes toujours indisponibles pour ${tableId}`)
}

async function main() {
  const env = loadEnv()
  const endpoint = env.VITE_APPWRITE_ENDPOINT
  const projectId = env.VITE_APPWRITE_PROJECT_ID
  const apiKey = process.env.APPWRITE_API_KEY || env.APPWRITE_API_KEY
  if (!endpoint || !projectId || !apiKey) {
    throw new Error('VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID et APPWRITE_API_KEY sont requis dans .env.local')
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey)
  const tables = new TablesDB(client)
  const functions = new Functions(client)

  console.log(`Provisionnement du projet ${projectId} (${endpoint})\n`)

  // 1. Base de données (vérifie l'existence d'abord : sur plan gratuit,
  // l'erreur de quota masque l'erreur « existe déjà »)
  try {
    await tables.get({ databaseId: DB_ID })
    console.log(`· database "${DB_ID}" (déjà présente)`)
  } catch (e) {
    if (e.code !== 404) {
      const cause = e.cause
      const causeDetail = cause
        ? ` (cause : ${cause.code || cause.name || 'erreur'}${cause.message ? ` — ${cause.message}` : ''})`
        : ''
      throw new Error(`Impossible de vérifier la base "${DB_ID}" : ${e.message || e}${causeDetail}`, { cause: e })
    }
    await ensure(`database "${DB_ID}"`, () => tables.create({ databaseId: DB_ID, name: 'Konforme' }))
  }

  // 2. Tables + colonnes + index
  for (const t of TABLES) {
    await ensure(`table "${t.id}"`, () =>
      tables.createTable({
        databaseId: DB_ID,
        tableId: t.id,
        name: t.id,
        permissions: [Permission.create(Role.users())],
        rowSecurity: true,
      }),
    )
    // Vérifie l'existant d'abord : sur plan gratuit, les erreurs de quota
    // masquent les erreurs « existe déjà »
    const existingCols = new Set(
      (await tables.listColumns({ databaseId: DB_ID, tableId: t.id })).columns.map((c) => c.key),
    )
    for (const col of t.columns) {
      if (existingCols.has(col.key)) {
        console.log(`·   colonne ${t.id}.${col.key} (déjà présente)`)
        continue
      }
      await ensure(`  colonne ${t.id}.${col.key}`, () => createColumn(tables, t.id, col))
    }
    await waitColumnsAvailable(tables, t.id, t.columns.map((c) => c.key))
    const existingIdx = new Set(
      (await tables.listIndexes({ databaseId: DB_ID, tableId: t.id })).indexes.map((i) => i.key),
    )
    for (const idx of t.indexes) {
      if (existingIdx.has(idx.key)) {
        console.log(`·   index ${t.id}.${idx.key} (déjà présent)`)
        continue
      }
      await ensure(`  index ${t.id}.${idx.key}`, () =>
        tables.createIndex({ databaseId: DB_ID, tableId: t.id, key: idx.key, type: 'key', columns: idx.columns }),
      )
    }
  }

  // 3. Fonctions serverless (création + synchronisation de la config + code)
  const FUNCTIONS = [
    {
      id: FUNCTION_ID,
      name: 'scan-site',
      dir: 'scan-site',
      // Role.any() : le mode public { url } est ouvert aux visiteurs (mini-audit
      // de la landing). Les scans complets restent contrôlés dans la fonction.
      execute: [Role.any()],
      scopes: ['rows.read', 'rows.write', 'tables.read', 'teams.read', 'executions.write'],
      timeout: 300,
    },
    {
      id: 'scan-scheduler',
      name: 'scan-scheduler',
      dir: 'scan-scheduler',
      execute: [],
      schedule: '0 6 * * *', // tous les jours à 06:00 UTC
      scopes: ['rows.read', 'rows.write', 'tables.read', 'executions.write'],
      timeout: 120,
    },
  ]

  for (const fn of FUNCTIONS) {
    const config = {
      name: fn.name,
      runtime: 'node-22',
      execute: fn.execute,
      timeout: fn.timeout,
      entrypoint: 'src/main.js',
      commands: 'npm install',
      logging: true,
      scopes: fn.scopes,
      ...(fn.schedule ? { schedule: fn.schedule } : {}),
    }
    let created = false
    let exists = false
    try {
      await functions.get({ functionId: fn.id })
      exists = true
      console.log(`· function "${fn.id}" (déjà présente)`)
    } catch {
      /* absente : on la crée */
    }
    if (!exists) {
      try {
        await functions.create({ functionId: fn.id, ...config })
        created = true
        console.log(`✓ function "${fn.id}"`)
      } catch (e) {
        if (fn.schedule && isUnsupportedScheduleError(e)) {
          console.warn(`! function "${fn.id}" ignorée : le forfait Appwrite ne prend pas en charge les horaires cron (${e.message || e})`)
          continue
        }
        throw new Error(`function ${fn.id} : ${e.message || e}`)
      }
    }
    if (!created) {
      // Synchronise la config (rôles d'exécution, scopes, cron) d'une fonction existante
      try {
        await functions.update({ functionId: fn.id, ...config })
      } catch (e) {
        if (fn.schedule && isUnsupportedScheduleError(e)) {
          console.warn(`! function "${fn.id}" non synchronisée : le forfait Appwrite ne prend pas en charge les horaires cron (${e.message || e})`)
          continue
        }
        throw new Error(`function ${fn.id} : ${e.message || e}`)
      }
      console.log(`✓ function "${fn.id}" mise à jour (execute/scopes/cron)`)
    }

    const fnDir = path.join(__dirname, '..', 'functions', fn.dir)
    const tarPath = path.join(os.tmpdir(), `konforme-${fn.id}-${Date.now()}.tar.gz`)
    execFileSync('tar', ['--exclude=node_modules', '-czf', tarPath, '-C', fnDir, '.'])
    console.log(`→ déploiement du code de ${fn.id} (${(fs.statSync(tarPath).size / 1024).toFixed(0)} ko)…`)
    const deployment = await functions.createDeployment({
      functionId: fn.id,
      code: InputFile.fromPath(tarPath, 'code.tar.gz'),
      activate: true,
      entrypoint: 'src/main.js',
      commands: 'npm install',
    })
    fs.unlinkSync(tarPath)
    console.log(`✓ déploiement ${deployment.$id} créé (build en cours côté Appwrite)`)
  }

  // Assistant IA (mode explain de scan-site) : pousse la clé Anthropic si
  // présente dans .env.local. Le plan gratuit limite à 2 fonctions, l'IA est
  // donc intégrée à scan-site plutôt qu'en fonction dédiée.
  if (env.ANTHROPIC_API_KEY) {
    try {
      await functions.createVariable({ functionId: FUNCTION_ID, key: 'ANTHROPIC_API_KEY', value: env.ANTHROPIC_API_KEY, secret: true })
      console.log('✓ variable ANTHROPIC_API_KEY posée sur scan-site')
    } catch (e) {
      if (e && e.code === 409) {
        console.log('· variable ANTHROPIC_API_KEY déjà présente sur scan-site')
      } else {
        console.log(`! variable ANTHROPIC_API_KEY non posée : ${e.message || e}`)
      }
    }
  } else {
    console.log("· ANTHROPIC_API_KEY absent de .env.local : l'assistant IA restera désactivé (le front le masque)")
  }

  console.log(`\nTerminé. Dernière étape manuelle (console Appwrite) :
  Overview > Integrations > Platforms > Add platform > Web :
    ajouter "localhost" ET votre domaine de prod (ex. konforme-neon.vercel.app)
    — sans cela le navigateur est bloqué par CORS.
  Optionnel : Auth > Settings > provider Google (Client ID/Secret de .env.local)
    — la connexion email/mot de passe fonctionne sans.`)
}

main().catch((e) => {
  console.error('✗', e.message || e)
  if (e.cause && e.cause.cause) console.error('Détail réseau :', e.cause.cause)
  process.exit(1)
})
