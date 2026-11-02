const http = require('node:http')
const { lookup } = require('node:dns/promises')
const { createHash } = require('node:crypto')
const { isIP } = require('node:net')
const ipaddr = require('ipaddr.js')
const { Account, Client, Permission, Query, Role, TablesDB, Teams } = require('node-appwrite')
const { CloudTasksClient } = require('@google-cloud/tasks')
const { Agent } = require('undici')
const scanner = require('../../../functions/scan-site/src/main.js')

const DB_ID = 'konforme'
const SCANS = 'scans'
const SCAN_PAGES = 'scan_pages'
const SCAN_ISSUES = 'scan_issues'
const MAX_HTML_BYTES = 1_500_000
const FETCH_TIMEOUT_MS = 15_000
const TASK_BATCH_SIZE = 10
const ISSUE_BATCH_SIZE = 5

function required(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function clients() {
  const endpoint = required('APPWRITE_ENDPOINT')
  const projectId = required('APPWRITE_PROJECT_ID')
  const key = required('APPWRITE_API_KEY')
  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(key)
  return {
    client,
    tables: new TablesDB(client),
    teams: new Teams(client),
  }
}

function pageId(scanId, url) {
  return createHash('sha256').update(`${scanId}\0${url}`).digest('hex').slice(0, 32)
}

function normalizePageUrl(value, baseUrl) {
  let url
  try {
    url = new URL(value, baseUrl)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(url.protocol) || scanner.isForbiddenTarget(url)) return null
  if (!scanner.isSameSite(url, baseUrl)) return null
  url.hash = ''
  url.search = ''
  if (/\.(pdf|jpg|jpeg|png|gif|svg|zip|mp4|webp|css|js|xml|ico)$/i.test(url.pathname)) return null
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '')
  return url.toString()
}

function isPublicAddress(address) {
  try {
    return ipaddr.process(address).range() === 'unicast'
  } catch {
    return false
  }
}

async function resolvePublicHost(url) {
  if (scanner.isForbiddenTarget(url)) throw new Error('Target URL is not allowed')
  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  if (isIP(hostname)) {
    if (!isPublicAddress(hostname)) {
      throw new Error('Target IP address is not public')
    }
    return [{ address: hostname, family: isIP(hostname) }]
  }
  const addresses = await lookup(hostname, { all: true, verbatim: true })
  if (addresses.length === 0 || addresses.some((entry) => !isPublicAddress(entry.address))) {
    throw new Error('Target hostname resolves to a non-public address')
  }
  return addresses
}

async function assertPublicHost(url) {
  await resolvePublicHost(url)
}

async function fetchPage(initialUrl) {
  let url = new URL(initialUrl)
  for (let redirects = 0; redirects <= 5; redirects++) {
    const addresses = await resolvePublicHost(url)
    const address = addresses[0]
    const dispatcher = new Agent({
      connect: {
        lookup: (_hostname, options, callback) => {
          if (options?.all) callback(null, [address])
          else callback(null, address.address, address.family)
        },
      },
    })
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        dispatcher,
        redirect: 'manual',
        headers: {
          'User-Agent': 'KonformeBot/2.0 (+https://konforme.kayzen-lyon.com) accessibility audit',
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Encoding': 'identity',
        },
      })
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location')
        if (!location || redirects === 5) return null
        const redirectedUrl = new URL(location, url)
        if (!scanner.isSameSite(redirectedUrl, url)) return null
        url = redirectedUrl
        continue
      }
      if (!response.ok) return null
      const type = response.headers.get('content-type') || ''
      if (!type.includes('text/html') && !type.includes('xhtml')) return null
      const reader = response.body?.getReader()
      if (!reader) return null
      const chunks = []
      let size = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > MAX_HTML_BYTES) {
          await reader.cancel()
          return null
        }
        chunks.push(value)
      }
      const html = Buffer.concat(chunks).toString('utf8')
      return { html, finalUrl: url }
    } finally {
      clearTimeout(timeout)
      await dispatcher.close()
    }
  }
  return null
}

function authToken(req) {
  const header = req.headers.authorization || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1] || ''
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 64 * 1024) {
        reject(new Error('Request body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, data, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  })
  res.end(status === 204 ? undefined : JSON.stringify(data))
}

function corsHeaders(origin) {
  const allowed = (process.env.ALLOWED_ORIGINS || '').split(',').map((item) => item.trim()).filter(Boolean)
  if (!origin || !allowed.includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Vary': 'Origin',
  }
}

function tasksClient() {
  const client = new CloudTasksClient()
  const project = required('GOOGLE_CLOUD_PROJECT')
  const location = process.env.CLOUD_TASKS_LOCATION || 'europe-west1'
  const queue = process.env.CLOUD_TASKS_QUEUE || 'konforme-audits'
  return { client, project, location, queue, parent: client.queuePath(project, location, queue) }
}

async function createPageRow(tables, scan, url) {
  const id = pageId(scan.$id, url)
  try {
    const row = await tables.createRow({
      databaseId: DB_ID,
      tableId: SCAN_PAGES,
      rowId: id,
      data: {
        scan_id: scan.$id,
        team_id: scan.team_id,
        position: 0,
        page_url: url.slice(0, 1024),
        status: 'pending',
        issues_count: 0,
      },
      permissions: [
        Permission.read(Role.team(scan.team_id)),
        Permission.update(Role.team(scan.team_id)),
        Permission.delete(Role.team(scan.team_id)),
      ],
    })
    return { id: row.$id }
  } catch (error) {
    if (error.code === 409) return { id }
    throw error
  }
}

async function enqueuePage(tasks, parent, taskConfig, scanId, rowId, url) {
  const taskName = tasks.taskPath(taskConfig.project, taskConfig.location, taskConfig.queue, `page-${rowId}`)
  try {
    await tasks.createTask({
      parent,
      task: {
        name: taskName,
        httpRequest: {
          httpMethod: 'POST',
          url: `${taskConfig.workerUrl.replace(/\/+$/, '')}/task`,
          headers: { 'Content-Type': 'application/json' },
          body: Buffer.from(JSON.stringify({ scan_id: scanId, page_id: rowId })).toString('base64'),
          oidcToken: {
            serviceAccountEmail: taskConfig.serviceAccountEmail,
            audience: taskConfig.workerUrl.replace(/\/+$/, ''),
          },
        },
      },
    })
  } catch (error) {
    if (error.code === 6 || error.code === 409) return false
    throw error
  }
  return true
}

async function updateProgress(tables, scanId) {
  const count = async (filters) => {
    const result = await tables.listRows({
      databaseId: DB_ID,
      tableId: SCAN_PAGES,
      queries: [...filters, Query.limit(1)],
      total: true,
    })
    return result.total ?? 0
  }
  const [total, processed, completed, active, issues] = await Promise.all([
    count([Query.equal('scan_id', scanId)]),
    count([Query.equal('scan_id', scanId), Query.equal('status', ['done', 'failed'])]),
    count([Query.equal('scan_id', scanId), Query.equal('status', 'done')]),
    count([Query.equal('scan_id', scanId), Query.equal('status', ['pending', 'running'])]),
    tables.listRows({
      databaseId: DB_ID,
      tableId: SCAN_ISSUES,
      queries: [Query.equal('scan_id', scanId), Query.limit(1)],
      total: true,
    }).then((result) => result.total ?? 0),
  ])
  await tables.updateRow({
    databaseId: DB_ID,
    tableId: SCANS,
    rowId: scanId,
    data: {
      pages_total: total,
      pages_processed: processed,
      pages_count: completed,
      issues_count: issues,
    },
  })
  return { total, processed, completed, active, issues }
}

async function forEachScanRow(tables, tableId, scanId, callback) {
  let cursor
  let count = 0
  for (;;) {
    const queries = [Query.equal('scan_id', scanId), Query.limit(100)]
    if (cursor) queries.push(Query.cursorAfter(cursor))
    const result = await tables.listRows({ databaseId: DB_ID, tableId, queries })
    for (const row of result.rows) {
      count++
      await callback(row)
    }
    if (result.rows.length < 100) break
    cursor = result.rows[result.rows.length - 1].$id
  }
  return count
}

function addScoreRows(rows, applicable, failed) {
  const severityWeight = scanner.SEVERITY_WEIGHT
  for (const row of rows) {
    for (const [id, severity, rgaa, wcag] of JSON.parse(row.applicable || '[]')) {
      const previous = applicable.get(id)
      if (!previous || (severityWeight[severity] ?? 1) > (severityWeight[previous.severity] ?? 1)) {
        applicable.set(id, { severity, rgaa, wcag })
      }
    }
    for (const id of JSON.parse(row.failed || '[]')) failed.add(id)
  }
  return severityWeight
}

function calculateScores(applicable, failed, severityWeight = scanner.SEVERITY_WEIGHT) {
  const rate = (filter) => {
    let denominator = 0
    let failedWeight = 0
    for (const [id, meta] of applicable) {
      if (!filter(meta)) continue
      const weight = severityWeight[meta.severity] ?? 1
      denominator += weight
      if (failed.has(id)) failedWeight += weight
    }
    return denominator === 0 ? null : Math.round((1 - failedWeight / denominator) * 1000) / 10
  }
  return {
    score: rate(() => true),
    rgaa_score: rate((meta) => meta.rgaa),
    wcag_score: rate((meta) => meta.wcag),
  }
}

function aggregateScores(rows) {
  const applicable = new Map()
  const failed = new Set()
  const severityWeight = addScoreRows(rows, applicable, failed)
  return calculateScores(applicable, failed, severityWeight)
}

async function finalizeScan(tables, scan) {
  const applicable = new Map()
  const failed = new Set()
  let pagesTotal = 0
  let pagesCompleted = 0
  await forEachScanRow(tables, SCAN_PAGES, scan.$id, (row) => {
    pagesTotal++
    if (row.status === 'done') {
      pagesCompleted++
      addScoreRows([row], applicable, failed)
    }
  })

  if (pagesCompleted === 0) {
    await tables.updateRow({
      databaseId: DB_ID,
      tableId: SCANS,
      rowId: scan.$id,
      data: {
        status: 'failed',
        finished_at: new Date().toISOString(),
        error: 'Aucune page du site n’a pu être analysée.',
        pages_count: 0,
        pages_processed: pagesTotal,
        pages_total: pagesTotal,
      },
    })
    return
  }

  const scores = calculateScores(applicable, failed)
  const finishedAt = new Date().toISOString()
  const result = {
    status: 'done',
    finished_at: finishedAt,
    duration_ms: Date.now() - Date.parse(scan.started_at || finishedAt),
    pages_count: pagesCompleted,
    pages_processed: pagesTotal,
    pages_total: pagesTotal,
    issues_count: (await tables.listRows({
      databaseId: DB_ID,
      tableId: SCAN_ISSUES,
      queries: [Query.equal('scan_id', scan.$id), Query.limit(1)],
      total: true,
    })).total ?? 0,
    page_scores: '[]',
    ...scores,
  }
  await tables.updateRow({ databaseId: DB_ID, tableId: SCANS, rowId: scan.$id, data: result })
  await tables.updateRow({
    databaseId: DB_ID,
    tableId: 'sites',
    rowId: scan.site_id,
    data: { last_scan_at: finishedAt, last_score: scores.score },
  })
}

async function finalizeIfIdle(tables, scan) {
  const current = await tables.getRow({ databaseId: DB_ID, tableId: SCANS, rowId: scan.$id })
  if (current.status !== 'running') return
  const progress = await updateProgress(tables, scan.$id)
  if (progress.active === 0) {
    const latest = await tables.getRow({ databaseId: DB_ID, tableId: SCANS, rowId: scan.$id })
    if (latest.status === 'running') await finalizeScan(tables, latest)
  }
}

async function authorizeScan(scanId, jwt) {
  if (!jwt) {
    const error = new Error('Authentication required')
    error.status = 401
    throw error
  }
  const client = new Client()
    .setEndpoint(required('APPWRITE_ENDPOINT'))
    .setProject(required('APPWRITE_PROJECT_ID'))
    .setJWT(jwt)
  const user = await new Account(client).get()
  const admin = clients()
  const scan = await admin.tables.getRow({ databaseId: DB_ID, tableId: SCANS, rowId: scanId })
  if (scan.status !== 'pending') {
    const error = new Error('This scan has already been started or completed')
    error.status = 409
    throw error
  }
  const memberships = await admin.teams.listMemberships({
    teamId: scan.team_id,
    queries: [Query.equal('userId', user.$id), Query.limit(1)],
  })
  if (memberships.memberships.length === 0) {
    const error = new Error('Organization access denied')
    error.status = 403
    throw error
  }
  return { ...admin, scan }
}

async function startScan(scanId, jwt) {
  const { tables, scan } = await authorizeScan(scanId, jwt)
  try {
    const baseUrl = new URL(scan.site_url)
    await assertPublicHost(baseUrl)
    const config = tasksClient()
    config.workerUrl = required('AUDIT_WORKER_URL').replace(/\/+$/, '')
    config.serviceAccountEmail = required('TASKS_SERVICE_ACCOUNT')
    const rootUrl = normalizePageUrl(baseUrl.toString(), baseUrl)
    if (!rootUrl) throw new Error('Site URL is not allowed')
    const root = await createPageRow(tables, scan, rootUrl)
    await tables.updateRow({
      databaseId: DB_ID,
      tableId: SCANS,
      rowId: scanId,
      data: {
        status: 'running',
        started_at: new Date().toISOString(),
        pages_count: 0,
        pages_processed: 0,
        pages_total: 1,
        issues_count: 0,
        error: '',
      },
    })
    await enqueuePage(config.client, config.parent, config, scanId, root.id, rootUrl)
  } catch (error) {
    try {
      await tables.updateRow({
        databaseId: DB_ID,
        tableId: SCANS,
        rowId: scanId,
        data: {
          status: 'failed',
          finished_at: new Date().toISOString(),
          error: 'Impossible de démarrer le moteur d’audit. Vérifiez la configuration du service.',
        },
      })
    } catch (updateError) {
      console.error(`Unable to mark scan ${scanId} as failed: ${updateError.message || updateError}`)
    }
    throw error
  }
}

async function createIssueRows(tables, scan, page, pageIdValue) {
  const rows = page.issues.map((issue, index) => {
    const id = createHash('sha256')
      .update(`${scan.$id}\0${pageIdValue}\0${index}\0${issue.rule.id}\0${issue.selector}`)
      .digest('hex')
      .slice(0, 32)
    return {
      rowId: id,
      data: {
        scan_id: scan.$id,
        team_id: scan.team_id,
        rule_id: issue.rule.id,
        severity: issue.rule.severity,
        category: issue.rule.category,
        title: issue.rule.title.slice(0, 256),
        description: (issue.detail ? `${issue.rule.description}\n\nDétail : ${issue.detail}` : issue.rule.description).slice(0, 2048),
        page_url: page.url.slice(0, 1024),
        selector: issue.selector.slice(0, 512),
        html_snippet: issue.snippet.slice(0, 512),
        suggested_fix: issue.rule.fix.slice(0, 1024),
        status: 'open',
      },
    }
  })
  const permissions = [
    Permission.read(Role.team(scan.team_id)),
    Permission.update(Role.team(scan.team_id)),
    Permission.delete(Role.team(scan.team_id)),
  ]
  for (let i = 0; i < rows.length; i += ISSUE_BATCH_SIZE) {
    await Promise.all(rows.slice(i, i + ISSUE_BATCH_SIZE).map((row) =>
      tables.createRow({
        databaseId: DB_ID,
        tableId: SCAN_ISSUES,
        rowId: row.rowId,
        data: row.data,
        permissions,
      }).catch((error) => {
        if (error.code !== 409) throw error
      }),
    ))
  }
}

async function processPage(scanId, pageIdValue) {
  const { tables, teams } = clients()
  const scan = await tables.getRow({ databaseId: DB_ID, tableId: SCANS, rowId: scanId })
  if (scan.status !== 'running') return
  const pageRow = await tables.getRow({ databaseId: DB_ID, tableId: SCAN_PAGES, rowId: pageIdValue })
  if (pageRow.scan_id !== scanId || pageRow.status === 'done' || pageRow.status === 'failed') return

  const pageUrl = new URL(pageRow.page_url)
  await assertPublicHost(pageUrl)
  await tables.updateRow({
    databaseId: DB_ID,
    tableId: SCAN_PAGES,
    rowId: pageIdValue,
    data: { status: 'running', error: '' },
  })
  const fetched = await fetchPage(pageUrl.toString())
  if (!fetched) {
    await tables.updateRow({
      databaseId: DB_ID,
      tableId: SCAN_PAGES,
      rowId: pageIdValue,
      data: { status: 'failed', error: 'Page inaccessible ou contenu non HTML.' },
    })
  } else {
    const page = await scanner.analyzePage(pageUrl.toString(), fetched.html, { axeTimeoutMs: 12_000 })
    await createIssueRows(tables, scan, page, pageIdValue)
    const discovered = scanner.discoverLinks(scanner.parse(fetched.html), fetched.finalUrl, Number.MAX_SAFE_INTEGER)
    const uniqueUrls = [...new Set(discovered
      .map((url) => normalizePageUrl(url, pageUrl))
      .filter((url) => url && url !== pageUrl.toString()))]
    const tasks = tasksClient()
    const config = {
      ...tasks,
      workerUrl: required('AUDIT_WORKER_URL').replace(/\/+$/, ''),
      serviceAccountEmail: required('TASKS_SERVICE_ACCOUNT'),
    }
    for (let i = 0; i < uniqueUrls.length; i += TASK_BATCH_SIZE) {
      const batch = uniqueUrls.slice(i, i + TASK_BATCH_SIZE)
      const created = await Promise.all(batch.map((url) => createPageRow(tables, scan, url)))
      await Promise.all(created.map((row, index) =>
        enqueuePage(config.client, config.parent, config, scanId, row.id, batch[index]),
      ))
    }
    await tables.updateRow({
      databaseId: DB_ID,
      tableId: SCAN_PAGES,
      rowId: pageIdValue,
      data: {
        status: 'done',
        score: page.score,
        issues_count: page.issues.length,
        applicable: JSON.stringify([...page.applicable.entries()].map(([id, meta]) => [
          id, meta.severity, meta.rgaa, meta.wcag,
        ])),
        failed: JSON.stringify([...page.failed]),
      },
    })
  }

  await finalizeIfIdle(tables, scan)
}

async function failTaskPage(scanId, pageIdValue, cause) {
  const { tables } = clients()
  const scan = await tables.getRow({ databaseId: DB_ID, tableId: SCANS, rowId: scanId })
  if (scan.status !== 'running') return
  await tables.updateRow({
    databaseId: DB_ID,
    tableId: SCAN_PAGES,
    rowId: pageIdValue,
    data: { status: 'failed', error: `Échec après plusieurs tentatives : ${String(cause).slice(0, 400)}` },
  })
  await tables.updateRow({
    databaseId: DB_ID,
    tableId: SCANS,
    rowId: scanId,
    data: {
      status: 'failed',
      finished_at: new Date().toISOString(),
      error: 'Le traitement Cloud Tasks a échoué plusieurs fois. Relancez cet audit.',
    },
  })
  await updateProgress(tables, scanId)
}

function createServer() {
  const role = process.env.SERVICE_ROLE
  if (!['api', 'worker'].includes(role)) throw new Error('SERVICE_ROLE must be api or worker')
  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin
    const cors = corsHeaders(origin)
    if (req.method === 'OPTIONS') {
      send(res, 204, {}, cors)
      return
    }
    if (req.method === 'GET' && req.url === '/healthz') {
      send(res, 200, { status: 'ok' })
      return
    }
    try {
      if (role === 'api' && req.method === 'POST' && req.url === '/start') {
        if (origin && Object.keys(cors).length === 0) {
          send(res, 403, { error: 'Origin not allowed' })
          return
        }
        const body = await readBody(req)
        if (typeof body.scan_id !== 'string' || !/^[A-Za-z0-9._-]{1,36}$/.test(body.scan_id)) {
          send(res, 400, { error: 'Invalid scan_id' }, cors)
          return
        }
        await startScan(body.scan_id, authToken(req))
        send(res, 202, { scan_id: body.scan_id, status: 'running' }, cors)
        return
      }
      if (role === 'worker' && req.method === 'POST' && req.url === '/task') {
        const body = await readBody(req)
        if (
          typeof body.scan_id !== 'string' || !/^[A-Za-z0-9._-]{1,36}$/.test(body.scan_id) ||
          typeof body.page_id !== 'string' || !/^[a-f0-9]{32}$/.test(body.page_id)
        ) {
          send(res, 400, { error: 'Invalid task payload' })
          return
        }
        try {
          await processPage(body.scan_id, body.page_id)
        } catch (error) {
          const retryCount = Number(req.headers['x-cloudtasks-taskretrycount'] || 0)
          if (retryCount < 4) throw error
          await failTaskPage(body.scan_id, body.page_id, error.message || error)
          console.error(`Audit page ${body.page_id} failed permanently: ${error.message || error}`)
        }
        send(res, 200, { status: 'processed' })
        return
      }
      send(res, 404, { error: 'Not found' }, cors)
    } catch (error) {
      const status = error.status || 500
      console.error(`Audit service request failed (${status}): ${error.message || error}`)
      send(res, status, { error: status < 500 ? error.message : 'Audit service temporarily unavailable' }, cors)
    }
  })
  return server
}

if (require.main === module) {
  const server = createServer()
  const port = Number(process.env.PORT) || 8080
  server.listen(port, '0.0.0.0', () => console.log(`Audit ${process.env.SERVICE_ROLE} listening on ${port}`))
}

module.exports = {
  aggregateScores,
  assertPublicHost,
  createServer,
  isPublicAddress,
  normalizePageUrl,
  pageId,
}
