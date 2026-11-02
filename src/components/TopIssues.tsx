import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchOpenIssues } from '@/lib/queries'
import { topRecurringIssues, type SiteHealth } from '@/lib/dashboard'
import { defineMessages, useMessages } from '@/i18n'

const L = defineMessages({
  fr: { title: 'Problèmes les plus fréquents', occ: (n: number) => `${n} occurrence${n > 1 ? 's' : ''}`, print: 'Imprimer / PDF', sev: { critical: 'Critique', serious: 'Sérieux', moderate: 'Modéré', minor: 'Mineur' } },
  en: { title: 'Most frequent issues', occ: (n: number) => `${n} occurrence${n > 1 ? 's' : ''}`, print: 'Print / PDF', sev: { critical: 'Critical', serious: 'Serious', moderate: 'Moderate', minor: 'Minor' } },
  de: { title: 'Häufigste Probleme', occ: (n: number) => `${n} Vorkommen`, print: 'Drucken / PDF', sev: { critical: 'Kritisch', serious: 'Schwerwiegend', moderate: 'Mittel', minor: 'Gering' } },
  es: { title: 'Problemas más frecuentes', occ: (n: number) => `${n} aparición${n > 1 ? 'es' : ''}`, print: 'Imprimir / PDF', sev: { critical: 'Crítico', serious: 'Grave', moderate: 'Moderado', minor: 'Menor' } },
  it: { title: 'Problemi più frequenti', occ: (n: number) => `${n} occorrenz${n > 1 ? 'e' : 'a'}`, print: 'Stampa / PDF', sev: { critical: 'Critico', serious: 'Grave', moderate: 'Moderato', minor: 'Lieve' } },
})

export function TopIssues({ health }: { health: SiteHealth[] }) {
  const t = useMessages(L)
  const ids = useMemo(() => health.flatMap((h) => (h.latest ? [h.latest.id] : [])), [health])
  const { data } = useQuery({
    queryKey: ['open-issues', ids.join(',')],
    enabled: ids.length > 0,
    queryFn: () => fetchOpenIssues(ids),
  })
  const top = useMemo(() => topRecurringIssues(data ?? []), [data])
  if (top.length === 0) return null
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 print:hidden">
        <h2 className="text-lg font-bold">{t.title}</h2>
        <Button size="sm" variant="outline" onClick={() => window.print()}>{t.print}</Button>
      </div>
      <h2 className="hidden print:block text-lg font-bold mb-3">{t.title}</h2>
      <ol className="space-y-2">
        {top.map((i) => (
          <li key={i.rule_id} className="flex items-center gap-3 text-sm">
            <span className="min-w-0 flex-1 text-text-soft">{i.title}</span>
            <span className="text-xs font-semibold text-text-muted">{t.sev[i.severity]}</span>
            <span className="text-xs text-text-dim">{t.occ(i.count)}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}
