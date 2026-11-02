import { Account, Client, Functions, TablesDB, Teams } from 'appwrite'

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT as string | undefined
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined

/**
 * Vrai uniquement quand le backend est réellement configuré.
 * IMPORTANT : sans projectId, le SDK ciblerait le projet « console »
 * d'Appwrite Cloud — toute action auth créerait un compte sur la console
 * Appwrite elle-même. Les appels doivent donc être bloqués en amont.
 */
export const appwriteConfigured = Boolean(endpoint && projectId)

if (!appwriteConfigured) {
  console.error(
    'Variables Appwrite manquantes. Renseignez VITE_APPWRITE_ENDPOINT et VITE_APPWRITE_PROJECT_ID dans .env.local'
  )
}

export const client = new Client()
  .setEndpoint(endpoint ?? 'https://fra.cloud.appwrite.io/v1')
  .setProject(projectId ?? '')

export const account = new Account(client)
export const tables = new TablesDB(client)
export const teams = new Teams(client)
export const functions = new Functions(client)

/** IDs fixes, créés par scripts/provision-appwrite.cjs */
export const DB_ID = 'konforme'
export const TABLES = {
  sites: 'sites',
  scans: 'scans',
  scan_issues: 'scan_issues',
  criteria_reviews: 'criteria_reviews',
  alerts: 'alerts',
  declarations: 'declarations',
} as const

export const SCAN_FUNCTION_ID = 'scan-site'

export type AppUser = {
  id: string
  email: string
  name: string
  emailVerified: boolean
}
