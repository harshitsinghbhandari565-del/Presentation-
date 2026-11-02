import {
  AmbientLight, BoxGeometry, Color, DirectionalLight, Group, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer,
} from "three";

/** Named imports only; no namespace import and no initial-bundle inclusion. */
export function mountShelf(host: HTMLElement, subjects: { name: string; count: number }[]): (() => void) | undefined {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
  } catch {
    return undefined;
  }
  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 1.4, 6);
  const group = new Group();
  scene.add(group);
  scene.add(new AmbientLight(0xffffff, 0.7));
  const key = new DirectionalLight(0xa5aaff, 1.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const geometries: BoxGeometry[] = [];
  const materials: MeshStandardMaterial[] = [];
  const items = (subjects.length ? subjects : [{ name: "English", count: 1 }]).slice(0, 6);
  items.forEach((subject, index) => {
    const height = 1.1 + Math.min(subject.count, 6) * 0.12;
    const geometry = new BoxGeometry(0.55, height, 0.85);
    const material = new MeshStandardMaterial({ color: new Color().setHSL(0.65 + index * 0.02, 0.35, 0.35 + index * 0.04), roughness: 0.85, metalness: 0.05 });
    const book = new Mesh(geometry, material);
    book.position.set((index - (items.length - 1) / 2) * 0.7, height / 2 - 0.6, 0);
    book.rotation.y = (index - (items.length - 1) / 2) * 0.06;
    group.add(book);
    geometries.push(geometry); materials.push(material);
  });
  const shelfGeometry = new BoxGeometry(items.length * 0.75 + 0.6, 0.12, 1.1);
  const shelfMaterial = new MeshStandardMaterial({ color: 0x242a37, roughness: 0.9 });
  const shelf = new Mesh(shelfGeometry, shelfMaterial);
  shelf.position.y = -0.66;
  group.add(shelf);
  geometries.push(shelfGeometry); materials.push(shelfMaterial);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");
  const resize = () => {
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  let dragging = false;
  let lastX = 0;
  const down = (event: PointerEvent) => { dragging = true; lastX = event.clientX; renderer.domElement.setPointerCapture(event.pointerId); };
  const move = (event: PointerEvent) => { if (!dragging) return; group.rotation.y += (event.clientX - lastX) * 0.008; lastX = event.clientX; renderer.render(scene, camera); };
  const up = () => { dragging = false; };
  const lost = (event: Event) => { event.preventDefault(); dispose(); host.dataset.state = "fallback"; };
  const dispose = () => {
    window.removeEventListener("resize", resize);
    renderer.domElement.removeEventListener("pointerdown", down);
    renderer.domElement.removeEventListener("pointermove", move);
    renderer.domElement.removeEventListener("pointerup", up);
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
  renderer.domElement.addEventListener("pointerdown", down);
  renderer.domElement.addEventListener("pointermove", move);
  renderer.domElement.addEventListener("pointerup", up);
  renderer.domElement.addEventListener("webglcontextlost", lost);
  window.addEventListener("resize", resize);
  resize();
  return dispose;
}
