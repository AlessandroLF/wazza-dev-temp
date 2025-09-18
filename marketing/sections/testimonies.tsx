"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ------- Controls -------
const SECTION_BG = "#E7F4F3"; // light teal
const CANVAS_HEIGHT = 360; // px on desktop (will shrink on small screens)
const CARD_W = 260; // card width in px (world units map to px)
const CARD_H = 330; // card height in px
const GAP = 28; // space between cards in px
const SPEED = 40; // px per second, left -> right
const IMAGE_PATHS = [
  "/testimonies/1.png",
  "/testimonies/2.png",
  "/testimonies/3.png",
  "/testimonies/4.png",
  "/testimonies/5.png",
];

export default function Testimonials() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!wrap || !canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();

    // Ortho camera with world units == pixels
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);

    const group = new THREE.Group();
    scene.add(group);

    const loader = new THREE.TextureLoader();
    const planes: THREE.Mesh[] = [];

    const createPlane = (tex: THREE.Texture) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      const mesh = new THREE.Mesh(geo, mat);
      return mesh;
    };

    // load all textures then layout
    Promise.all(IMAGE_PATHS.map((p) => new Promise<THREE.Texture>((res, rej) => loader.load(p, res, undefined, rej))))
      .then((textures) => {
        textures.forEach((t, i) => {
          const m = createPlane(t);
          group.add(m);
          planes.push(m);
        });
        layout();
        animate(0);
      })
      .catch((e) => console.error("Failed to load testimonial images", e));

    let width = 0;
    let height = 0;

    const setSize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      // clamp height for small screens
      const targetH = Math.min(CANVAS_HEIGHT, Math.max(220, rect.width * 0.38));
      height = targetH;

      renderer.setSize(width, height, false);

      camera.left = -width / 2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = -height / 2;
      camera.updateProjectionMatrix();

      layout();
    };

    const layout = () => {
      if (!planes.length) return;
      const total = planes.length;
      const stripW = total * CARD_W + (total - 1) * GAP;
      // start left so the middle trio sits center-ish
      let startX = -stripW / 2 + CARD_W / 2;
      planes.forEach((m, idx) => {
        m.position.set(startX + idx * (CARD_W + GAP), 0, 0);
      });
    };

    let raf = 0;
    let prev = performance.now();

    const animate = (t: number) => {
      raf = requestAnimationFrame(animate);
      const now = t || performance.now();
      const dt = (now - prev) / 1000;
      prev = now;

      // move right
      const step = SPEED * dt;
      planes.forEach((m) => (m.position.x += step));

      // wrap if off screen to the right
      const halfW = width / 2;
      const span = CARD_W + GAP;
      const rightEdge = halfW + CARD_W;
      const leftReset = -halfW - CARD_W;
      planes.forEach((m) => {
        if (m.position.x - CARD_W / 2 > rightEdge) {
          // find current leftmost
          let minX = Infinity;
          planes.forEach((p) => (minX = Math.min(minX, p.position.x)));
          m.position.x = minX - span;
        }
      });

      renderer.render(scene, camera);
    };

    setSize();
    window.addEventListener("resize", setSize);
    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(raf);
      renderer.dispose();
      planes.forEach((m) => {
        (m.material as THREE.Material).dispose?.();
        (m.geometry as THREE.BufferGeometry).dispose?.();
      });
    };
  }, []);

  return (
    <section id="testimonials" className="w-screen" style={{ backgroundColor: SECTION_BG, padding: "8vh 0" }}>
      <div className="mx-auto max-w-[1200px] px-[4vw]">
        <h2 className="text-center font-display font-extrabold text-[#0B3F3B] text-[clamp(24px,3.2vw,44px)]">Real Testimonials</h2>

        <div ref={wrapRef} className="relative mt-6">
          <canvas ref={canvasRef} className="block w-full h-auto" />
        </div>
      </div>

      {/* Fallback for no-WebGL */}
      <noscript>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 px-[4vw] max-w-[1200px] mx-auto">
          {IMAGE_PATHS.slice(0, 3).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={src} alt="Testimonial" className="rounded-xl shadow" />
          ))}
        </div>
      </noscript>
    </section>
  );
}
