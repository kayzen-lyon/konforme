/* Primitives de mise en forme des documents légaux, partagées entre la
 * version française (src/content/legal.tsx) et les traductions
 * (src/i18n/legal/*.tsx) : la mise en page reste strictement identique. */

export const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold mt-12 mb-4">{children}</h2>
)

export const P = ({ children }: { children: React.ReactNode }) => (
  <p className="text-text-soft leading-relaxed mb-4">{children}</p>
)

export const UL = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="space-y-2 text-text-soft leading-relaxed list-disc pl-5 mb-4">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
)
