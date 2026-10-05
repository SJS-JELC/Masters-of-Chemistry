/** Shared, source-owned brand gem facets. */
export function GemPaths({ igcse = false }: { igcse?: boolean }) {
  return (
    <>
      <path className="gem-body" d="M0 -13 L10.5 -4 L8 7.5 L0 14 L-8 7.5 L-10.5 -4 Z" />
      <path className="gem-facet" d="M0 -13 L0 6 L-8 7.5 L-10.5 -4 Z" />
      <path
        className={igcse ? 'gem-facet' : 'gem-facet second'}
        d="M0 6 L8 7.5 L0 14 Z"
        opacity={igcse ? '.45' : undefined}
      />
      {igcse && (
        <>
          <path
            className="spark spark-a"
            d="M-7 -12 L-5.7 -8.7 L-2.5 -7.4 L-5.7 -6.1 L-7 -2.8 L-8.3 -6.1 L-11.5 -7.4 L-8.3 -8.7 Z"
          />
          <path
            className="spark spark-b"
            d="M8 -5 L9 -2.7 L11.3 -1.7 L9 .7 L8 3 L7 .7 L4.7 -1.7 L7 -2.7 Z"
          />
        </>
      )}
    </>
  );
}
