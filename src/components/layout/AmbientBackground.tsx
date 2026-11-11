import AmbientGL from "./AmbientGL";
import ImmersiveDepthRig from "./ImmersiveDepthRig";

/**
 * Full-page Interstellar Orbital Command atmosphere + 3-layer WebGL starfield/nebula + 60fps 3D scroll rig.
 * Fixed viewport starlight, solar-gold/ice-blue nebula orbs, planetary horizon limb, and coordinate grid
 * travel down every route at 0 layout cost, standing down cleanly in projector-mode and reduced-motion.
 */
export default function AmbientBackground() {
  return (
    <>
      <ImmersiveDepthRig />
      <div className="ambient-cosmic-photo" aria-hidden="true" />
      <div className="ambient-viewport-field" aria-hidden="true">
        <div className="ambient-starfield" />
        <div className="ambient-planet-arc" />
        <div className="ambient-cursor-halo" />
        <div className="ambient-orb ambient-orb-indigo" />
        <div className="ambient-orb ambient-orb-emerald" />
        <div className="ambient-horizon-plane" />
      </div>
      <div className="ambient-background" aria-hidden="true">
        <div className="ambient-spotlight" />
        <div className="ambient-grid" />
        <AmbientGL />
      </div>
    </>
  );
}
