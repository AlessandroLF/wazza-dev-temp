"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Proof section:
 * - Mobile: 3 equal cards stacked with Y offset; tap to bring to front; idle float.
 * - Desktop/Tablet (md+): keep your previous 3D canvas block (unchanged).
 */
export default function Proof() {
  return (
    <section
      className="relative w-full bg-[#EBF6F6] py-16 sm:py-20 overflow-x-hidden"
      aria-label="Social proof"
    >
      <div className="mx-auto max-w-6xl px-4">
        <h2
          className="text-center font-extrabold leading-tight text-[#0b3f3a]"
          style={{ fontSize: "clamp(28px,4.6vw,48px)" }}
        >
          We Have Helped
          <br className="hidden sm:block" />
          <span className="sm:ml-2">Thousands of Agencies</span>
        </h2>

        {/* Mobile: stacked and interactive */}
        <div className="mt-10 md:hidden">
          <MobileStack3D />
        </div>

        {/* Desktop / tablet: leave your existing block as-is */}
        <div className="relative mt-12 hidden md:block">
          {/* Mount your previous canvas/three.js here; unchanged from your last version. */}
          <div className="mx-auto h-[520px] max-w-[1100px] rounded-2xl bg-transparent" />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Mobile 3D stack ---------------- */

function MobileStack3D() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = hostRef.current!;
    const canvas = canvasRef.current!;
    if (!host) return;

    // Sizing
    const width = Math.min(380, Math.floor(window.innerWidth * 0.9));
    // We’ll read aspect from first texture later and set real height.
    host.style.width = `${width}px`;
    host.style.marginLeft = "auto";
    host.style.marginRight = "auto";
    host.style.position = "relative";

    // THREE basics
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, 400, -400, -1000, 1000);
    camera.position.z = 10;

    const CARD_SRCS = ["/proof/card-1.png", "/proof/card-2.png", "/proof/card-3.png"];
    const loader = new THREE.TextureLoader();

    let meshes: THREE.Mesh[] = [];
    let targetsY = [0, 0, 0]; // animated Y positions
    let slotsY: number[] = []; // final Y slot positions
    let order: number[] = [0, 1, 2]; // which card is in which slot (0=top, 1=mid, 2=front)

    // helpers
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const rad = (d: number) => (d * Math.PI) / 180;

    // interaction (tap to front)
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    function screenToNDC(ev: MouseEvent | TouchEvent) {
      let cx = 0;
      let cy = 0;
      if ("touches" in ev && ev.touches.length) {
        cx = ev.touches[0].clientX;
        cy = ev.touches[0].clientY;
      } else if ("changedTouches" in ev && ev.changedTouches.length) {
        cx = ev.changedTouches[0].clientX;
        cy = ev.changedTouches[0].clientY;
      } else if ("clientX" in ev) {
        cx = ev.clientX;
        cy = ev.clientY;
      }
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((cy - rect.top) / rect.height) * 2 + 1;
    }

    function bringToFront(hit: THREE.Object3D) {
      const idx = meshes.indexOf(hit as THREE.Mesh);
      if (idx < 0) return;
      // Find which slot this mesh currently occupies:
      const slotOfMesh = order.indexOf(idx);
      if (slotOfMesh === 2) return; // already front
      // Rotate so that the tapped mesh becomes the front slot (2)
      // e.g. [0,1,2] tapping index 0 -> [1,2,0]
      // tapping 1 -> [0,2,1]
      const rotated: number[] = [];
      for (let i = 0; i < 3; i++) rotated.push(order[i]);
      while (rotated.indexOf(idx) !== 2) {
        rotated.push(rotated.shift()!);
      }
      order = rotated;
    }

    function onDown(ev: MouseEvent | TouchEvent) {
      screenToNDC(ev);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(meshes, false);
      if (hits.length) bringToFront(hits[0].object);
    }

    // build
    let stop = false;
    (async () => {
      // Load textures
      const textures = await Promise.all(CARD_SRCS.map((src) => new Promise<THREE.Texture>((res, rej) => loader.load(src, res, undefined, rej))));
      const aspect = textures[0].image.width / textures[0].image.height;
      const cardW = width; // all same width
      const cardH = Math.round(cardW / aspect);
      const gap = Math.round(cardH * 0.18); // vertical offset between cards

      // set real sizes
      renderer.setSize(cardW, cardH + gap * 2, false);
      camera.top = (cardH + gap * 2) / 2;
      camera.bottom = -(cardH + gap * 2) / 2;
      camera.updateProjectionMatrix();

      host.style.height = `${cardH + gap * 2}px`;

      // Slots from top to bottom: top -> mid -> front (bottom)
      slotsY = [gap, 0, -gap];

      // Create 3 same-size planes
      const geo = new THREE.PlaneGeometry(cardW, cardH);
      meshes = textures.map((tex, i) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        const m = new THREE.Mesh(geo, mat);
        m.position.set(0, slotsY[i], i === 2 ? 2 : i === 1 ? 1 : 0); // z-order by slot
        m.renderOrder = i; // ensure painter’s back-to-front consistency
        scene.add(m);
        return m;
      });

      // Initial Y targets match slots (order = [0,1,2])
      targetsY = slotsY.slice();

      // interactions
      canvas.addEventListener("pointerdown", onDown, { passive: true });
      canvas.addEventListener("touchstart", onDown, { passive: true });

      // animate
      let t0 = performance.now();
      const tick = () => {
        if (stop) return;
        const t = performance.now();
        const dt = Math.min(32, t - t0) / 1000;
        t0 = t;

        // Idle float/tilt
        const wob = Math.sin(t * 0.002) * rad(0.6);

        // Recompute targets from order each frame:
        // order[slot] = meshIndex  -> targets for each mesh based on its slot
        for (let slot = 0; slot < 3; slot++) {
          const meshIdx = order[slot];
          targetsY[meshIdx] = slotsY[slot];
          // z order (front-most slot=2 -> highest Z)
          meshes[meshIdx].position.z = slot; // 0..2
          meshes[meshIdx].renderOrder = slot;
        }

        // Lerp positions & small scale/rotation to give depth
        meshes.forEach((m, i) => {
          m.position.y = lerp(m.position.y, targetsY[i], 0.12);
          const slot = order.indexOf(i);
          const scale = slot === 2 ? 1.0 : slot === 1 ? 0.98 : 0.96;
          m.scale.set(lerp(m.scale.x, scale, 0.12), lerp(m.scale.y, scale, 0.12), 1);
          // slight tilt on the non-front ones
          const targetRot = slot === 2 ? 0 : (slot === 1 ? rad(-1.2) : rad(1.2)) + wob * 0.5;
          m.rotation.z = lerp(m.rotation.z, targetRot, 0.1);
        });

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
      };
      tick();
    })();

    // cleanup
    return () => {
      stop = true;
      try {
        renderer.dispose();
      } catch {}
    };
  }, []);

  return (
    <div ref={hostRef} className="relative">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
