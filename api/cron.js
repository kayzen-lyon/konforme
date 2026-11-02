// Konforme — planificateur d'audits déclenché par Vercel Cron (cf. vercel.json).
// Le plan Free d'Appwrite n'a pas de cron : on relance ici les audits des sites
// dont la surveillance est active, selon leur fréquence, et on nettoie les
// scans zombies. Variables : APPWRITE_API_KEY, CRON_SECRET (envoyé par Vercel).
import { Client, TablesDB, Functions, Teams, Query, Permission, Role, ID } from 'node-appwrite'

const DB_ID = 'konforme'
const SCAN_FUNCTION_ID = 'scan-site'
const PAGES = { free: 5, pro: 25, enterprise: 5 }
const SCANS_PER_MONTH = { free: 5, pro: 100, enterprise: Infinity }
const FREQ_MIN_AGE_MS = {
  daily: 12 * 3600_000,
  weekly: 6.5 * 24 * 3600_000,
  monthly: 29 * 24 * 3600_000,
}

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  const apiKey = process.env.APPWRITE_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'APPWRITE_API_KEY manquante' })

  const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || 'konforme')
    .setKey(apiKey)
  const tables = new TablesDB(client)
  const functions = new Functions(client)
  const teams = new Teams(client)

  const now = Date.now()
  const stats = { launched: 0, skipped: 0, cleaned: 0, errors: 0 }
  const planCache = new Map()
  const planOf = async (teamId) => {
    if (!planCache.has(teamId)) {
      let plan = 'free'
      try {
        const prefs = await teams.getPrefs({ teamId })
        if (prefs.plan === 'pro' || prefs.plan === 'enterprise') plan = prefs.plan
      } catch {
        /* plan gratuit par défaut */
      }
      planCache.set(teamId, plan)
    }
    return planCache.get(teamId)
  }

  try {
    const stale = await tables.listRows({
      databaseId: DB_ID,
      tableId: 'scans',
      queries: [Query.equal('status', ['pending', 'running']), Query.limit(100)],
    })
    for (const s of stale.rows) {
      if (now - Date.parse(s.$createdAt) > 10 * 60_000) {
        await tables
          .updateRow({
            databaseId: DB_ID,
            tableId: 'scans',
            rowId: s.$id,
            data: {
              status: 'failed',
              finished_at: new Date().toISOString(),
              error: "Audit interrompu (délai d'exécution dépassé). Relancez l'audit.",
            },
          })
          .then(() => stats.cleaned++)
          .catch(() => {})
      }
    }

    let cursor
    for (;;) {
      const queries = [Query.equal('monitoring_enabled', true), Query.limit(50)]
      if (cursor) queries.push(Query.cursorAfter(cursor))
      const page = await tables.listRows({ databaseId: DB_ID, tableId: 'sites', queries })
      for (const site of page.rows) {
        const freq = FREQ_MIN_AGE_MS[site.monitoring_frequency] ? site.monitoring_frequency : 'weekly'
        const last = site.last_scan_at ? Date.parse(site.last_scan_at) : 0
        if (now - last < FREQ_MIN_AGE_MS[freq]) {
          stats.skipped++
          continue
        }
        try {
          const active = await tables.listRows({
            databaseId: DB_ID,
            tableId: 'scans',
            queries: [Query.equal('site_id', site.$id), Query.equal('status', ['pending', 'running']), Query.limit(1)],
          })
          const plan = await planOf(site.team_id)
          const d = new Date()
          const monthStart = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString()
          const used = await tables.listRows({
            databaseId: DB_ID,
            tableId: 'scans',
            queries: [Query.equal('team_id', site.team_id), Query.greaterThanEqual('$createdAt', monthStart), Query.limit(1)],
            total: true,
          })
          if (active.rows.length > 0 || (used.total ?? 0) >= SCANS_PER_MONTH[plan]) {
            stats.skipped++
            continue
          }
          const scan = await tables.createRow({
            databaseId: DB_ID,
            tableId: 'scans',
            rowId: ID.unique(),
            data: {
              site_id: site.$id,
              team_id: site.team_id,
              status: 'pending',
              trigger: 'scheduled',
              site_name: site.name,
              site_url: site.url,
              started_at: new Date().toISOString(),
              max_pages: PAGES[plan],
            },
            permissions: [
              Permission.read(Role.team(site.team_id)),
              Permission.update(Role.team(site.team_id)),
              Permission.delete(Role.team(site.team_id)),
            ],
          })
          await functions.createExecution({
            functionId: SCAN_FUNCTION_ID,
            body: JSON.stringify({ scan_id: scan.$id }),
            async: true,
          })
          stats.launched++
        } catch {
          stats.errors++
        }
      }
      if (page.rows.length < 50) break
      cursor = page.rows[page.rows.length - 1].$id
    }
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e), ...stats })
  }
  return res.status(200).json(stats)
}
