import AmbientGL from "./AmbientGL";
import ImmersiveDepthRig from "./ImmersiveDepthRig";

/** CSS fallback is always in the DOM; the GL layer and depth rig are decorative and additive. */
export default function AmbientBackground() {
  return <>
    <ImmersiveDepthRig />
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-spotlight" />
      <div className="ambient-grid" />
      <AmbientGL />
    </div>
  </>;
}
