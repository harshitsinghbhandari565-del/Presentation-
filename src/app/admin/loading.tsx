/** Private workspace boundary; never imply that public resources are loading. */
export default function AdminLoading() {
  return <>
    <p className="sr-only" role="status" aria-live="polite">Loading the administrator workspace.</p>
    <div aria-busy="true" aria-hidden="true">
      <div className="page-intro"><div className="skeleton skeleton-eyebrow" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line short" /></div>
      <div className="skeleton skeleton-admin-nav" /><div className="skeleton skeleton-admin-search" /><div className="skeleton skeleton-admin-table" />
    </div>
  </>;
}
