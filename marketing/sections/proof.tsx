"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Proof() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const prefersReduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- three.js setup ---
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: canvasRef.current ?? undefined,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent

    let camera: THREE.OrthographicCamera;
    const group = new THREE.Group();
    scene.add(group);

    const size = { w: 0, h: 0 };
    const fit = () => {
      const rect = wrap.getBoundingClientRect();
      size.w = Math.max(320, Math.floor(rect.width));
      size.h = Math.max(320, Math.floor(rect.height));
      renderer.setSize(size.w, size.h, false);

      // Ortho camera in "pixel space"
      const halfW = size.w / 2;
      const halfH = size.h / 2;
      camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, -2000, 2000);
      camera.position.z = 10;
    };

    // --- assets / planes ---
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    const makePlane = (url: string) =>
      new Promise<THREE.Mesh>((resolve, reject) => {
        loader.load(
          url,
          (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = 4;

            // width scales with container
            const base = Math.min(size.w, 1280);
            const desired = url.includes("card-1")
              ? THREE.MathUtils.clamp(base * 0.33, 300, 460) // center
              : THREE.MathUtils.clamp(base * 0.28, 240, 380); // sides

            const aspect = tex.image.width / tex.image.height;
            const w = desired;
            const h = desired / aspect;

            const geo = new THREE.PlaneGeometry(w, h);
            const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
            const mesh = new THREE.Mesh(geo, mat);
            resolve(mesh);
          },
          undefined,
          reject
        );
      });

    // soft shadow texture (generated once)
    const makeShadowTexture = (w: number, h: number) => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(64, Math.floor(w));
      canvas.height = Math.max(64, Math.floor(h));
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // radial/elliptical blur
      const grd = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) * 0.18,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height) * 0.52
      );
      grd.addColorStop(0, "rgba(0,0,0,0.28)");
      grd.addColorStop(1, "rgba(0,0,0,0.0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
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

    let center!: THREE.Mesh,
      left!: THREE.Mesh,
      right!: THREE.Mesh,
      shadowC!: THREE.Mesh,
      shadowL!: THREE.Mesh,
      shadowR!: THREE.Mesh;
    let targets = { leftX: -260, rightX: 260, revealed: false };
    let current = { leftX: 0, rightX: 0, rotL: 0, rotR: 0, rotC: 0 };

    const build = async () => {
      // clear
      while (group.children.length) group.remove(group.children[0]);

      [center, left, right] = await Promise.all([
        makePlane("/proof/card-1.png"),
        makePlane("/proof/card-2.png"),
        makePlane("/proof/card-3.png"),
      ]);

      // z-order: shadows -> sides -> center
      shadowC = makeShadow(
        center.geometry.parameters.width as number,
        center.geometry.parameters.height as number
      );
      shadowL = makeShadow(
        left.geometry.parameters.width as number,
        left.geometry.parameters.height as number
      );
      shadowR = makeShadow(
        right.geometry.parameters.width as number,
        right.geometry.parameters.height as number
      );

      // initial positions (stacked)
      center.position.set(0, 0, 3);
      left.position.set(0, 0, 2);
      right.position.set(0, 0, 2);

      // shadows slightly below each card
      const offsetY = -((center.geometry.parameters.height as number) / 2) + 18;
      shadowC.position.set(0, offsetY, 1);
      shadowL.position.set(0, offsetY, 1);
      shadowR.position.set(0, offsetY, 1);

      group.add(shadowL, shadowR, shadowC, left, right, center);

      // compute slide X distance
      const gapPx = size.w >= 1024 ? 32 : 20;
      const dx =
        (center.geometry.parameters.width as number) / 2 +
        gapPx +
        Math.max(
          left.geometry.parameters.width as number,
          right.geometry.parameters.width as number
        ) /
          2;

      targets.leftX = -dx;
      targets.rightX = dx;

      // reset current to starting state
      current.leftX = 0;
      current.rightX = 0;
      current.rotL = 0;
      current.rotR = 0;
      current.rotC = 0;

      // shadows follow cards X
      shadowC.position.x = center.position.x;
      shadowL.position.x = left.position.x;
      shadowR.position.x = right.position.x;
    };

    // --- animation loop ---
    let raf = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const rad = (deg: number) => (deg * Math.PI) / 180;
    const BASE_TILT = rad(5); // +/-5deg target tilt when revealed

    let t0 = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(33, now - t0) / 1000;
      t0 = now;

      const speed = prefersReduce ? 1 : 0.085; // slide lerp
      const rotSpeed = prefersReduce ? 1 : 0.08;

      // slide targets
      const goalL = targets.revealed ? targets.leftX : 0;
      const goalR = targets.revealed ? targets.rightX : 0;
      current.leftX = lerp(current.leftX, goalL, speed);
      current.rightX = lerp(current.rightX, goalR, speed);

      // rotation targets (+ tiny idle wobble when revealed)
      const wobble =
        targets.revealed && !prefersReduce ? Math.sin(now * 0.0024) * rad(0.9) : 0;

      const goalRotL = targets.revealed ? +BASE_TILT + wobble : 0;
      const goalRotR = targets.revealed ? -BASE_TILT + wobble : 0;
      const goalRotC = targets.revealed ? Math.sin(now * 0.0018) * rad(0.6) : 0;

      current.rotL = lerp(current.rotL, goalRotL, rotSpeed);
      current.rotR = lerp(current.rotR, goalRotR, rotSpeed);
      current.rotC = lerp(current.rotC, goalRotC, rotSpeed);

      // apply to meshes
      if (left && right && center) {
        left.position.x = current.leftX;
        right.position.x = current.rightX;

        left.rotation.z = current.rotL;
        right.rotation.z = current.rotR;
        center.rotation.z = current.rotC;

        // keep shadows under cards
        shadowL.position.x = left.position.x;
        shadowR.position.x = right.position.x;
        shadowC.position.x = center.position.x;

        // slightly squash/expand shadows with rotation for life
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

    // --- parallax ---
    const onMouse = (e: MouseEvent) => {
      if (!size.w || !size.h) return;
      const rect = wrap.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / size.w - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / size.h - 0.5) * 2;
      const amt = prefersReduce ? 4 : 10;
      group.position.x = nx * amt;
      group.position.y = -ny * amt;
    };

    // --- intersection reveal (70%) ---
    const section = wrap.closest("section") ?? wrap;
    const io = new IntersectionObserver(
      ([entry]) => {
        targets.revealed = entry.isIntersecting && entry.intersectionRatio >= 0.7;
      },
      { threshold: [0, 0.7, 1] }
    );
    io.observe(section);

    // init / events
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
      // dispose meshes/materials
      [left, right, center, shadowL, shadowR, shadowC].forEach((m: any) => {
        if (m) {
          (m.material as THREE.Material)?.dispose?.();
          (m.geometry as THREE.BufferGeometry)?.dispose?.();
        }
      });
    };
  }, []);

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

        <div className="relative mt-12 sm:mt-16">
          <div
            ref={wrapRef}
            className="relative mx-auto flex h-[420px] sm:h-[500px] lg:h-[560px] max-w-[1100px] items-center justify-center"
          >
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
