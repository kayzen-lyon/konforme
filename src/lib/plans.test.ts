import { describe, it, expect } from 'vitest'
import { monthStartIso, PLANS, scansUsedThisMonth } from '@/lib/plans'

describe('PLANS', () => {
  it('définit des quotas croissants entre free et pro', () => {
    expect(PLANS.free.maxSites).toBeLessThan(PLANS.pro.maxSites)
    expect(PLANS.free.scansPerMonth).toBeLessThan(PLANS.pro.scansPerMonth)
    expect(PLANS.enterprise.maxSites).toBe(Infinity)
  })
  it('a un plan gratuit utilisable', () => {
    expect(PLANS.free.maxSites).toBeGreaterThanOrEqual(1)
    expect(PLANS.free.scansPerMonth).toBeGreaterThanOrEqual(1)
    expect(PLANS.free.pagesPerScan).toBe(Infinity)
  })
})

describe('monthStartIso', () => {
  it('renvoie le 1er du mois en UTC', () => {
    expect(monthStartIso(new Date('2026-07-22T15:30:00Z'))).toBe('2026-07-01T00:00:00.000Z')
    expect(monthStartIso(new Date('2026-01-01T00:00:00Z'))).toBe('2026-01-01T00:00:00.000Z')
  })
})

describe('scansUsedThisMonth', () => {
  const now = new Date('2026-07-22T12:00:00Z')
  it('ne compte que les scans du mois courant', () => {
    const scans = [
      { created_at: '2026-07-02T08:00:00.000Z' },
      { created_at: '2026-07-21T08:00:00.000Z' },
      { created_at: '2026-06-30T23:59:59.000Z' },
    ]
    expect(scansUsedThisMonth(scans, now)).toBe(2)
  })
  it('renvoie 0 sans données', () => {
    expect(scansUsedThisMonth(undefined, now)).toBe(0)
    expect(scansUsedThisMonth([], now)).toBe(0)
  })
})
