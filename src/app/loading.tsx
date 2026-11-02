/** Transient root boundary: approximate the landing's two-column geometry. */
export default function Loading() {
  return <>
    <p className="sr-only" role="status" aria-live="polite">Loading page content.</p>
    <div className="container route-loading" aria-busy="true">
      <div aria-hidden="true">
        <div className="route-loading-hero">
          <div><div className="skeleton skeleton-eyebrow" /><div className="skeleton route-loading-title" /><div className="skeleton route-loading-title" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div>
          <div className="skeleton route-loading-art" />
        </div>
        <div className="route-loading-section"><div className="skeleton skeleton-title" /><div className="route-loading-grid">{[0, 1].map(index => <div className="skeleton skeleton-card" key={index} />)}</div></div>
      </div>
    </div>
  </>;
}
