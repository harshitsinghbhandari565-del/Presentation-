import AmbientGL from "./AmbientGL";
import ImmersiveDepthRig from "./ImmersiveDepthRig";

/**
 * Full-page 3D spatial atmosphere + volumetric hero shader + 60fps scroll rig.
 * Fixed viewport depth planes travel down the entire page at 0 layout cost,
 * standing down cleanly in projector-mode, forced-colors, and reduced-motion.
 */
export default function AmbientBackground() {
  return <>
    <ImmersiveDepthRig />
    <div className="ambient-viewport-field" aria-hidden="true">
      <div className="ambient-orb ambient-orb-indigo" />
      <div className="ambient-orb ambient-orb-emerald" />
      <div className="ambient-horizon-plane" />
    </div>
    <div className="ambient-background" aria-hidden="true">
      <div className="ambient-spotlight" />
      <div className="ambient-grid" />
      <AmbientGL />
    </div>
  </>;
}
