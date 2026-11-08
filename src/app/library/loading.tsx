export default function LibraryLoading() {
  return <>
    <p className="sr-only" role="status" aria-live="polite">Loading the resource library.</p>
    <div className="container inner-page library-page" aria-busy="true" aria-hidden="true">
      <div className="page-intro"><div className="skeleton skeleton-eyebrow" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line" /></div>
      <div className="skeleton skeleton-search" />
      <div className="library-layout"><div className="skeleton skeleton-sidebar" /><div className="library-results"><div className="skeleton skeleton-toolbar" /><div className="resource-grid">{Array.from({ length: 6 }, (_, i) => <div className="resource-card skeleton-card" key={i}><div className="skeleton skeleton-cover" /><div className="resource-card-body"><div className="skeleton skeleton-line short" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line short" /></div></div>)}</div></div></div>
    </div>
  </>;
}
