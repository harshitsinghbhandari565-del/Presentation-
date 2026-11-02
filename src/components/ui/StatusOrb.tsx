/** A source descriptor, not an external uptime/permission check. */
export default function StatusOrb({ label = "Original source" }: { label?: string }) {
  return <span className="resource-meta"><span className="tiny-dot" aria-hidden="true" />{label}</span>;
}
