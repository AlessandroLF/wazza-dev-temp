"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Proof section:
 * - Mobile (sm): 3 equal cards stacked with Y offset; tap to bring to front; idle float.
 * - Desktop/Tablet (md+): Original 3D canvas block with left/right slide-out, center wobble, and mouse parallax.
 *
 * Assets expected in /public/proof:
 *   /proof/card-1.png
 *   /proof/card-2.png
 *   /proof/card-3.png
 */

export default function Proof() {
  return (
    <section
      className="relative w-full bg-[#EBF6F6] py-16 sm:py-24 pb-[25vh] overflow-x-hidden"
      aria-label="Social proof (3D)"
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

        {/* Desktop / tablet: the original 3D animation restored */}
        <div className="relative mt-12 hidden md:block">
          <DesktopProof3D />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Desktop/Tablet original 3D block ---------------- */

function DesktopProof3D() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    if (!wrap || !canvas) return;

    const prefersReduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ----- sizing tied to the wrapper (full-bleed) -----
    const size = { w: 0, h: 0 };
    const fit = () => {
      const r = wrap.getBoundingClientRect();
      size.w = Math.max(720, Math.floor(r.width));         // full width of wrapper
      size.h = Math.max(440, Math.floor(r.height));        // sane min height

      renderer.setSize(size.w, size.h, false);
      canvas.width = size.w;
      canvas.height = size.h;

      camera.left = -size.w / 2;
      camera.right = size.w / 2;
      camera.top = size.h / 2;
      camera.bottom = -size.h / 2;
      camera.updateProjectionMatrix();
    };

    // --- three basics ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-400, 400, 300, -300, -1000, 1000);
    camera.position.z = 10;

    const group = new THREE.Group();
    scene.add(group);

    // --------- card sizing & spacing ---------
    const CARD_W_RATIO = 0.18;           // a bit smaller to avoid edges
    const MAX_CARD_W   = 420;
    const SAFE_MARGIN  = () => Math.max(72, size.w * 0.08); // keep in from edges
    const GAP_BASE     = 56;              // base px gap
    const GAP_SCALE    = 0.08;            // scales with width
    const TILT_DEG     = 5;

    const makePlane = async (src: string) => {
      const tex = await new Promise<THREE.Texture>((res, rej) =>
        new THREE.TextureLoader().load(src, res, undefined, rej)
      );
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      const aspect = tex.image.width / tex.image.height;
      const targetW = Math.min(size.w * CARD_W_RATIO, MAX_CARD_W);
      const geo = new THREE.PlaneGeometry(targetW, targetW / aspect);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 2;
      return mesh;
    };

    const makeShadowTexture = (w: number, h: number) => {
      const c = document.createElement("canvas");
      c.width = Math.max(2, Math.round(w));
      c.height = Math.max(2, Math.round(h));
      const ctx = c.getContext("2d")!;
      const grd = ctx.createRadialGradient(
        c.width / 2, c.height / 2, Math.min(c.width, c.height) * 0.18,
        c.width / 2, c.height / 2, Math.max(c.width, c.height) * 0.52
      );
      grd.addColorStop(0, "rgba(0,0,0,0.28)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, c.width, c.height);
      const tex = new THREE.CanvasTexture(c);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    const makeShadow = (cardW: number, cardH: number) => {
      const sw = cardW * 0.9;
      const sh = Math.max(32, cardH * 0.18);
      const geo = new THREE.PlaneGeometry(sw, sh);
      const tex = makeShadowTexture(sw, sh);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = 0;
      return mesh;
    };

    let center!: THREE.Mesh, left!: THREE.Mesh, right!: THREE.Mesh;
    let shadowC!: THREE.Mesh, shadowL!: THREE.Mesh, shadowR!: THREE.Mesh;

    const targets = { leftX: -260, rightX: 260, revealed: false };
    let current = { leftX: 0, rightX: 0, rotL: 0, rotR: 0, rotC: 0 };

    const build = async () => {
      while (group.children.length) group.remove(group.children[0]);

      [center, left, right] = await Promise.all([
        makePlane("/proof/card-1.png"),
        makePlane("/proof/card-2.png"),
        makePlane("/proof/card-3.png"),
      ]);

      shadowC = makeShadow(
        center.geometry.parameters.width as number,
        center.geometry.parameters.height as number
      );
      shadowL = makeShadow(left.geometry.parameters.width as number, left.geometry.parameters.height as number);
      shadowR = makeShadow(right.geometry.parameters.width as number, right.geometry.parameters.height as number);

      center.position.set(0, 0, 3);
      left.position.set(0, 0, 2);
      right.position.set(0, 0, 2);

      const offsetY = -((center.geometry.parameters.height as number) / 2) + 18;
      shadowC.position.set(0, offsetY, 1);
      shadowL.position.set(0, offsetY, 1);
      shadowR.position.set(0, offsetY, 1);

      group.add(shadowL, shadowR, shadowC, left, right, center);

      // compute desired gap, then clamp dx to safe half-width
      const gapPx = Math.max(GAP_BASE, Math.round(size.w * GAP_SCALE));
      const halfC = (center.geometry.parameters.width as number) / 2;
      const halfS = Math.max(
        (left.geometry.parameters.width as number) / 2,
        (right.geometry.parameters.width as number) / 2
      );
      let dx = halfC + gapPx + halfS;

      // clamp so cards never cross viewport edges
      dx = Math.min(dx, size.w * 0.5 - SAFE_MARGIN());

      targets.leftX = -dx;
      targets.rightX = dx;

      current.leftX = 0;
      current.rightX = 0;
      current.rotL = 0;
      current.rotR = 0;
      current.rotC = 0;

      shadowC.position.x = center.position.x;
      shadowL.position.x = left.position.x;
      shadowR.position.x = right.position.x;
    };

    // animation
    let raf = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const BASE_TILT = rad(TILT_DEG);

    let t0 = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(33, now - t0) / 1000;
      t0 = now;

      const speed = prefersReduce ? 1 : 0.085;
      const rotSpeed = prefersReduce ? 1 : 0.08;

      const goalL = targets.revealed ? targets.leftX : 0;
      const goalR = targets.revealed ? targets.rightX : 0;
      current.leftX = lerp(current.leftX, goalL, speed);
      current.rightX = lerp(current.rightX, goalR, speed);

      const wobble = targets.revealed && !prefersReduce ? Math.sin(now * 0.0022) * rad(0.9) : 0;
      const goalRotL = targets.revealed ? +BASE_TILT + wobble : 0;
      const goalRotR = targets.revealed ? -BASE_TILT + wobble : 0;
      const goalRotC = targets.revealed ? Math.sin(now * 0.0017) * rad(0.6) : 0;

      current.rotL = lerp(current.rotL, goalRotL, rotSpeed);
      current.rotR = lerp(current.rotR, goalRotR, rotSpeed);
      current.rotC = lerp(current.rotC, goalRotC, rotSpeed);

      if (left && right && center) {
        left.position.x = current.leftX;
        right.position.x = current.rightX;

        left.rotation.z = current.rotL;
        right.rotation.z = current.rotR;
        center.rotation.z = current.rotC;

        shadowL.position.x = left.position.x;
        shadowR.position.x = right.position.x;
        shadowC.position.x = center.position.x;

        const sL = 1 - Math.abs(current.rotL) * 0.35;
        const sR = 1 - Math.abs(current.rotR) * 0.35;
        const sC = 1 - Math.abs(current.rotC) * 0.25;
        shadowL.scale.set(sL, sL, 1);
        shadowR.scale.set(sR, sR, 1);
        shadowC.scale.set(sC, sC, 1);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    // light parallax (smaller so it never pushes off-edge)
    const onMouse = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      const amt = prefersReduce ? 3 : 7;
      group.position.x = nx * amt;
      group.position.y = -ny * amt;
    };

    // reveal
    const section = wrap.closest("section") ?? wrap;
    const io = new IntersectionObserver(
      ([entry]) => (targets.revealed = entry.isIntersecting && entry.intersectionRatio >= 0.7),
      { threshold: [0, 0.7, 1] }
    );
    io.observe(section);

    const onResize = () => {
      fit();
      build();
    };

    fit();
    build();
    tick();

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouse);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      io.disconnect();
      cancelAnimationFrame(raf);
      renderer.dispose();
      [left, right, center, shadowL, shadowR, shadowC].forEach((m: any) => {
        if (m) {
          (m.material as THREE.Material)?.dispose?.();
          (m.geometry as THREE.BufferGeometry)?.dispose?.();
        }
      });
    };
  }, []);

  // FULL-BLEED WRAPPER (ignores parent padding)
  return (
    <div
      ref={wrapRef}
      className="relative h-[60vh] lg:h-[62vh] flex items-center justify-center overflow-visible"
      style={{
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
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
    host.style.width = `${width}px`;
    host.style.marginLeft = "auto";
    host.style.marginRight = "auto";
    host.style.position = "relative";

    // THREE basics
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-width / 2, width / 2, 400, -400, -1000, 1000);
    camera.position.z = 10;

    const CARD_SRCS = ["/proof/card-1.png", "/proof/card-2.png", "/proof/card-3.png"];
    const loader = new THREE.TextureLoader();

    let meshes: THREE.Mesh[] = [];
    let targetsY = [0, 0, 0];
    let slotsY: number[] = [];
    let order: number[] = [0, 1, 2];

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const rad = (d: number) => (d * Math.PI) / 180;

    // tap-to-front
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();

    function screenToNDC(ev: MouseEvent | TouchEvent) {
      let cx = 0,
        cy = 0;
      if ("touches" in ev && ev.touches.length) {
        cx = ev.touches[0].clientX;
        cy = ev.touches[0].clientY;
      } else if ("changedTouches" in ev && ev.changedTouches.length) {
        cx = ev.changedTouches[0].clientX;
        cy = ev.changedTouches[0].clientY;
      } else if ("clientX" in ev) {
        cx = (ev as MouseEvent).clientX;
        cy = (ev as MouseEvent).clientY;
      }
      const rect = canvas.getBoundingClientRect();
      ndc.x = ((cx - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((cy - rect.top) / rect.height) * 2 + 1;
    }

    function bringToFront(hit: THREE.Object3D) {
      const idx = meshes.indexOf(hit as THREE.Mesh);
      if (idx < 0) return;
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

    (async () => {
      const textures = await Promise.all(
        CARD_SRCS.map((src) => new Promise<THREE.Texture>((res, rej) => loader.load(src, res, undefined, rej)))
      );
      const aspect = textures[0].image.width / textures[0].image.height;
      const cardW = width;
      const cardH = Math.round(cardW / aspect);
      const gap = Math.round(cardH * 0.18);

      renderer.setSize(cardW, cardH + gap * 2, false);
      camera.top = (cardH + gap * 2) / 2;
      camera.bottom = -(cardH + gap * 2) / 2;
      camera.updateProjectionMatrix();

      host.style.height = `${cardH + gap * 2}px`;

      // slots top->mid->front(bottom)
      slotsY = [gap, 0, -gap];

      // build meshes
      meshes = textures.map((tex, i) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        const geo = new THREE.PlaneGeometry(cardW, cardH);
        const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
        const m = new THREE.Mesh(geo, mat);
        m.position.set(0, slotsY[i], i === 2 ? 2 : i === 1 ? 1 : 0);
        m.renderOrder = i;
        scene.add(m);
        return m;
      });

      targetsY = slotsY.slice();

      canvas.addEventListener("pointerdown", onDown, { passive: true });
      canvas.addEventListener("touchstart", onDown, { passive: true });

      // animate
      let t0 = performance.now();
      let stop = false;
      const tick = () => {
        if (stop) return;
        const t = performance.now();
        const dt = Math.min(32, t - t0) / 1000;
        t0 = t;

        const wob = Math.sin(t * 0.002) * rad(0.6);

        for (let slot = 0; slot < 3; slot++) {
          const meshIdx = order[slot];
          targetsY[meshIdx] = slotsY[slot];
          meshes[meshIdx].position.z = slot;
          meshes[meshIdx].renderOrder = slot;
        }

        meshes.forEach((m, i) => {
          m.position.y = lerp(m.position.y, targetsY[i], 0.12);
          const slot = order.indexOf(i);
          const scale = slot === 2 ? 1.0 : slot === 1 ? 0.98 : 0.96;
          m.scale.set(lerp(m.scale.x, scale, 0.12), lerp(m.scale.y, scale, 0.12), 1);
          const targetRot = slot === 2 ? 0 : (slot === 1 ? rad(-1.2) : rad(1.2)) + wob * 0.5;
          m.rotation.z = lerp(m.rotation.z, targetRot, 0.1);
        });

        renderer.render(scene, camera);
        requestAnimationFrame(tick);
      };
      tick();

      // cleanup
      return () => {
        stop = true;
        try {
          renderer.dispose();
        } catch {}
      };
    })();

    return () => {
      // inner cleanup handles resources
    };
  }, []);

  return (
    <div ref={hostRef} className="relative">
      <canvas ref={canvasRef} className="block w-full" />
    </div>
  );
}
