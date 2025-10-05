"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* =========================
   Tuning knobs
   ========================= */
const SECTION_BG = "#E7F4F3";        // light teal page bg
const CARD_W = 300;                  // target card width (px). Height follows image ratio.
const GAP = 28;                      // space between cards (px)
const SPEED = 60;                    // px/sec of the camera pan (ping-pong)
const MAX_DEVICE_PIXEL_RATIO = 2;    // cap for perf

// Placeholder images. When Dropppin is wired, these are replaced by fetched items.
const PLACEHOLDER_IMAGES = [
  "/testimonies/1.png",
  "/testimonies/2.png",
  "/testimonies/3.png",
  "/testimonies/4.png",
  "/testimonies/5.png",
];

/* ================
   Dropppin wiring (stub)
   What I’ll need from you:
   1) API base URL (e.g. https://api.dropppin.com/v1 …)
   2) API token (Bearer …) with read access
   3) Space/Workspace (or Collection/Board) ID that contains your testimonials
   4) Which fields hold:
      - image/video URL (preferred: a web-optimized poster image)
      - author / name
      - optional title/role and caption
   5) Any tag or filter (e.g. tag:"testimonials") to limit results
   6) CORS allowance for your domain (if needed)
   Put secrets in env vars and fetch server-side if you prefer.
================ */
type DropppinItem = {
  id: string;
  imageUrl: string;
  author?: string;
  caption?: string;
};
// Example client-side fetch (disabled by default)
async function fetchDropppinItems(): Promise<DropppinItem[]> {
  // TODO: fill with real endpoint + auth header once we have credentials.
  // return (await fetch("/api/dropppin/testimonials")).json();
  // For now, convert placeholders to the expected shape:
  return PLACEHOLDER_IMAGES.map((src, i) => ({
    id: `ph-${i}`,
    imageUrl: src,
  }));
}

export default function Testimonials() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO));

    const scene = new THREE.Scene();

    // Ortho camera where "world units == pixels"
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);

    const group = new THREE.Group();
    scene.add(group);

    const loader = new THREE.TextureLoader();

    // Plane + metadata so we can lay out accurately
    type PlaneRec = {
      mesh: THREE.Mesh;
      width: number;
      height: number;
    };
    const planes: PlaneRec[] = [];

    const buildCard = (tex: THREE.Texture): PlaneRec => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const img = tex.image as { width?: number; height?: number } | undefined;
      const iw = Math.max(1, Number(img?.width ?? CARD_W));
      const ih = Math.max(1, Number(img?.height ?? CARD_W));
      const ratio = ih / iw;

      const w = CARD_W;            // fixed width
      const h = Math.round(CARD_W * ratio); // height follows image ratio (taller if portrait)

      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.frustumCulled = false;

      return { mesh, width: w, height: h };
    };

    // Layout state
    let width = 0;
    let height = 0;
    let scale = 1;
    let cardW = CARD_W;
    let gap = GAP;

    // Ping-pong motion
    let dir = -1;          // start panning to the right (content moves left)
    let minX = 0;          // left limit for group.position.x (negative)
    let maxX = 0;          // right limit (=0, flush left)
    let raf = 0;
    let prev = performance.now();

    const setSize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;

      // Target visible count heuristics → scale everything down a bit if too tight
      const targetVisible = width > 1500 ? 5 : width > 1200 ? 4 : width > 900 ? 3 : 2.2;
      const idealRowW = targetVisible * CARD_W + (targetVisible - 1) * GAP;
      scale = Math.min(1, width / (idealRowW + 40));
      cardW = CARD_W * scale;
      gap = GAP * scale;

      // Height: fit canvas to tallest card (after scale) with comfy padding
      const tallest = planes.length ? Math.max(...planes.map((p) => p.height)) : CARD_W * 1.2;
      height = Math.max(Math.min((wrap.clientHeight || window.innerHeight) * 0.72, tallest * scale + 160), 280);

      renderer.setSize(width, height, false);

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();

      layout(); // also recomputes ping-pong limits
    };

    const layout = () => {
      if (!planes.length) return;

      // Position the strip so the first card starts FLUSH at the left edge.
      const total = planes.length;
      const stripW = total * cardW + (total - 1) * gap;

      // Center each plane vertically around Y=0
      let x = -width / 2 + cardW / 2; // left edge + half card → first center
      planes.forEach((rec, idx) => {
        rec.mesh.position.set(x, 0, 0);
        rec.mesh.scale.set(scale, scale, 1);
        x += cardW + gap;
      });

      // Ping-pong limits: from fully flush-left (group.x = 0) to fully flush-right
      maxX = 0;
      minX = stripW > width ? -(stripW - width) : 0; // negative (or 0 if no need to scroll)
      group.position.x = 0; // start at left
      dir = stripW > width ? -1 : 0; // no motion if everything fits
    };

    const animate = (t: number) => {
      raf = requestAnimationFrame(animate);
      const now = t || performance.now();
      const dt = (now - prev) / 1000;
      prev = now;

      if (dir !== 0) {
        group.position.x += dir * SPEED * dt;

        if (group.position.x <= minX) {
          group.position.x = minX;
          dir = +1; // bounce back to the left
        } else if (group.position.x >= maxX) {
          group.position.x = maxX;
          dir = -1; // bounce to the right
        }
      }

      renderer.render(scene, camera);
    };

    // Load images (or from Dropppin later), then build + start
    (async () => {
      const items = await fetchDropppinItems(); // currently returns placeholders
      const textures = await Promise.all(
        items.map(
          (it) =>
            new Promise<THREE.Texture>((resolve, reject) =>
              loader.load(it.imageUrl, resolve, undefined, reject)
            )
        )
      );

      textures.forEach((tex) => {
        const rec = buildCard(tex);
        planes.push(rec);
        group.add(rec.mesh);
      });

      setSize();
      animate(0);
    })().catch((e) => console.error("Testimonials load failed", e));

    const onResize = () => setSize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
      renderer.dispose();
      planes.forEach((p) => {
        (p.mesh.material as THREE.Material).dispose?.();
        (p.mesh.geometry as THREE.BufferGeometry).dispose?.();
      });
    };
  }, []);

  return (
    <section
      id="testimonials"
      className="w-screen flex items-center"
      style={{ backgroundColor: SECTION_BG, padding: "8vh 0" }}
      aria-label="Real Testimonials"
    >
      <div className="mx-auto w-full px-[2vw]">
        <h2 className="text-center font-display font-extrabold text-[#0B3F3B] text-[clamp(24px,3.2vw,44px)]">
          Real Testimonials
        </h2>

        {/* Stage */}
        <div ref={wrapRef} className="relative mt-6 mx-auto w-[min(96vw,1700px)]">
          <canvas ref={canvasRef} className="block w-full h-auto" />
        </div>

        {/* Mobile blurb */}
        <div className="md:hidden mt-8 text-center px-[6vw]">
          <h3 className="font-display font-extrabold text-[#0B3F3B] text-[22px] leading-tight">
            Learn Now to Build
            <br />
            Your Whatsapp
            <br />
            Marketing Agency
          </h3>
          <p className="mt-2 text-[#0B3F3B]/80 text-[14px]">
            How to launch, market, sell and deliver
          </p>
        </div>

        {/* No-JS fallback */}
        <noscript>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 px-[4vw] max-w-[1200px] mx-auto">
            {PLACEHOLDER_IMAGES.slice(0, 3).map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt="Testimonial" className="rounded-xl shadow" />
            ))}
          </div>
        </noscript>
      </div>
    </section>
  );
}
