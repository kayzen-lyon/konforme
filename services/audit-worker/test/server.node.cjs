const test = require('node:test')
const assert = require('node:assert/strict')
const scanner = require('../../../functions/scan-site/src/main.js')
const { aggregateScores, isPublicAddress, normalizePageUrl, pageId } = require('../src/server.js')

test('discovers more than 500 same-site links without an implicit page cap', () => {
  const links = Array.from({ length: 520 }, (_, index) => `<a href="/page-${index}">page</a>`).join('')
  const document = scanner.parse(`<main>${links}</main>`)
  const discovered = scanner.discoverLinks(document, new URL('https://example.com/'))
  assert.equal(discovered.length, 520)
})

test('aggregates compliance scores across every processed page', () => {
  const rows = [
    { applicable: JSON.stringify([['a', 'serious', true, true]]), failed: JSON.stringify(['a']) },
    { applicable: JSON.stringify([['b', 'serious', true, false]]), failed: '[]' },
  ]
  assert.deepEqual(aggregateScores(rows), { score: 50, rgaa_score: 50, wcag_score: 0 })
})

test('accepts public IPv4 and IPv6, but rejects private and special-use addresses', () => {
  assert.equal(isPublicAddress('8.8.8.8'), true)
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true)
  assert.equal(isPublicAddress('127.0.0.1'), false)
  assert.equal(isPublicAddress('169.254.169.254'), false)
  assert.equal(isPublicAddress('::1'), false)
  assert.equal(isPublicAddress('::ffff:127.0.0.1'), false)
})

test('normalizes only HTTP(S) pages from the same site and creates stable page IDs', () => {
  const base = new URL('https://www.example.com/start')
  assert.equal(normalizePageUrl('/about/?campaign=1#top', base), 'https://www.example.com/about')
  assert.equal(normalizePageUrl('https://other.example.net/', base), null)
  assert.equal(normalizePageUrl('mailto:test@example.com', base), null)
  assert.equal(pageId('scan-1', 'https://example.com/'), pageId('scan-1', 'https://example.com/'))
  assert.notEqual(pageId('scan-1', 'https://example.com/'), pageId('scan-1', 'https://example.com/about'))
})
