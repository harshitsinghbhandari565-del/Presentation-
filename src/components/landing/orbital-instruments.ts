import { BufferGeometry, Float32BufferAttribute, Group, LineBasicMaterial, LineSegments } from "three";

/** Fine segmented orbital scales, drawn as instruments rather than solid toy-like objects. */
export function createOrbitalInstrument(isLight: boolean) {
  const group = new Group();
  const resources: { dispose: () => void }[] = [];

  function scale(radius: number, color: number, opacity: number, rotation: [number, number, number]) {
    const vertices: number[] = [];
    const add = (a: number, r1: number, b: number, r2: number) => {
      vertices.push(Math.cos(a) * r1, Math.sin(a) * r1, 0, Math.cos(b) * r2, Math.sin(b) * r2, 0);
    };
    // Three separated arcs and calibrated tick marks leave breathing room around the cards.
    const segments = 144;
    for (let i = 0; i < segments; i++) {
      const a = i * Math.PI * 2 / segments;
      if ((i >= 7 && i < 44) || (i >= 55 && i < 96) || (i >= 108 && i < 140)) {
        add(a, radius, (i + 1) * Math.PI * 2 / segments, radius);
      }
    }
    for (let i = 0; i < 48; i++) {
      const angle = i * Math.PI * 2 / 48;
      add(angle, radius + 0.025, angle, radius + (i % 4 === 0 ? 0.11 : 0.055));
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    const material = new LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
    const lines = new LineSegments(geometry, material);
    lines.rotation.set(...rotation);
    group.add(lines);
    resources.push(geometry, material);
    return lines;
  }

  const outer = scale(2.72, isLight ? 0x036296 : 0x7dd3fc, isLight ? 0.34 : 0.46, [0.42, 0.12, 0.1]);
  const inner = scale(2.43, isLight ? 0x8a5d10 : 0xf3c979, isLight ? 0.29 : 0.36, [-0.48, -0.22, 0.3]);
  group.position.z = -1.2;
  return { group, outer, inner, dispose: () => resources.forEach(resource => resource.dispose()) };
}
