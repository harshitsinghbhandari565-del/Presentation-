import AmbientGL from "./AmbientGL";

/** CSS fallback is always in the DOM; the GL layer is decorative and additive. */
export default function AmbientBackground() {
  return <div className="ambient-background" aria-hidden="true">
    <div className="ambient-grid" />
    <AmbientGL />
  </div>;
}
