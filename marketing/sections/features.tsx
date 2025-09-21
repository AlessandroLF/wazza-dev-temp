"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Wazzap Key Features (drop-in)
 * - Three.js phone with Lottie (from /phone-440x600.json only)
 * - Floating + tilting animations (roll/pitch/yaw)
 * - Same layout and cards you already had
 */

// ---------- Controls ----------
const BG_COLOR = "#E7F4F3";
const MAX_W = 1200;
const SECTION_Y_PAD_VH = 10;

// Phone / stage
const PHONE_WIDTH_CLAMP = "clamp(220px,24vw,460px)";
const PHONE_DROP_SHADOW = "0 20px 60px rgba(0,0,0,0.25)";
const PHONE_ASPECT_W = 440;
const PHONE_ASPECT_H = 600;

// Animation (radians / px)
const PHONE_BASE_ROLL_DEG = -2; // almost straight baseline
const TILT_ROLL_AMPL = THREE.MathUtils.degToRad(7); // ±7° roll (Z)
const TILT_PITCH_AMPL = THREE.MathUtils.degToRad(4); // ±4° pitch (X)
const TILT_YAW_AMPL = THREE.MathUtils.degToRad(5); // ±5° yaw (Y)
const TILT_SPEED = 0.85; // roll/pitch speed
const YAW_SPEED = 0.65; // yaw speed
const FLOAT_AMPL_PX = 10; // bob amplitude (px in CSS space)
const FLOAT_SPEED = 0.6;

// Columns
const COL_GAP_CLAMP = "clamp(24px,3vw,48px)";
const CARD_BG = "#FFFFFF";
const CARD_RADIUS = 16;
const CARD_SHADOW = "0 6px 24px rgba(0,0,0,0.08)";
const CARD_BORDER = "1px solid rgba(0,0,0,0.06)";
const CARD_PAD_CLAMP = "clamp(14px,1.2vw,18px)";
const CARD_GAP_REM = 1.0;

// Stagger
const LEFT_Y_OFFSETS_REM = [0, 1.25, 2.5];
const RIGHT_Y_OFFSETS_REM = [1.25, 0, 2.5];

// Headline
const H1_SIZE = "clamp(24px,3.2vw,42px)";

// Data
const FEATURES: Array<{ id: string; text: string }> = [
  { id: "01", text: "Turn your WhatsApp into an AI Chatbot" },
  { id: "02", text: "Send Voice Notes with cloned voices" },
  { id: "03", text: "Automate WhatsApp Groups and extract members" },
  { id: "04", text: "Send Bulk Messages with message variations to avoid spam" },
  { id: "05", text: "Send Buttons and save replies" },
  { id: "06", text: "Connect Multiple Numbers and assign to staff" },
];

export default function Features() {
  const left = useMemo(() => FEATURES.slice(0, 3), []);
  const right = useMemo(() => FEATURES.slice(3), []);

  return (
    <section
      id="features"
      className="w-screen"
      aria-label="Wazzap key features"
      style={{ backgroundColor: BG_COLOR, padding: `${SECTION_Y_PAD_VH}vh 0` }}
    >
      <div className="mx-auto px-[4vw]" style={{ maxWidth: MAX_W }}>
        <h2
          className="font-display font-extrabold text-[#103B36] tracking-[-0.01em]"
          style={{ fontSize: H1_SIZE }}
        >
          Wazzap Key Features
        </h2>

        {/* 3 columns: left tips, phone, right tips */}
        <div
          className="relative mt-6 md:mt-8 flex flex-wrap md:flex-nowrap items-start justify-center"
          style={{ gap: COL_GAP_CLAMP }}
        >
          {/* Left column */}
          <div
            className="flex shrink-0 grow-0 basis-full md:basis-[30%] md:max-w-[30%] flex-col"
            style={{ gap: `${CARD_GAP_REM}rem` }}
          >
            {left.map((f, i) => (
              <FeatureCard key={f.id} id={f.id} text={f.text} mtRem={LEFT_Y_OFFSETS_REM[i] || 0} />
            ))}
          </div>

          {/* Phone visual (Three.js) */}
          <div className="shrink-0 grow-0 basis-full md:basis-[40%] md:max-w-[40%] flex flex-col items-center">
            <div
              className="relative rounded-[28px] overflow-visible"
              style={{
                width: PHONE_WIDTH_CLAMP,
                filter: `drop-shadow(${PHONE_DROP_SHADOW})`,
              }}
            >
              <PhoneThree baseRollDeg={PHONE_BASE_ROLL_DEG} />
            </div>
          </div>

          {/* Right column */}
          <div
            className="flex shrink-0 grow-0 basis-full md:basis-[30%] md:max-w-[30%] flex-col"
            style={{ gap: `${CARD_GAP_REM}rem` }}
          >
            {right.map((f, i) => (
              <FeatureCard key={f.id} id={f.id} text={f.text} mtRem={RIGHT_Y_OFFSETS_REM[i] || 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Small presentational card ----------
function FeatureCard({ id, text, mtRem = 0 }: { id: string; text: string; mtRem?: number }) {
  return (
    <div className="relative" style={{ marginTop: `${mtRem}rem` }}>
      <div
        className="rounded-2xl"
        style={{
          background: CARD_BG,
          borderRadius: CARD_RADIUS,
          boxShadow: CARD_SHADOW,
          border: CARD_BORDER,
          padding: CARD_PAD_CLAMP,
        }}
      >
        <div className="text-[clamp(12px,1.1vw,14px)] text-[#9EB0AE] font-extrabold">{id}</div>
        <div className="mt-1 text-[clamp(16px,1.45vw,19px)] font-extrabold text-[#103B36] leading-[1.15]">
          {text}
        </div>
      </div>
    </div>
  );
}

// ---------- Three.js phone with Lottie texture ----------
function PhoneThree({ baseRollDeg }: { baseRollDeg: number }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const lottieAnimRef = useRef<any>(null);
  const hiddenDivRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    // Container with fixed aspect ratio (matches the JSON)
    mount.style.position = "relative";
    mount.style.width = "100%";
    mount.style.aspectRatio = `${PHONE_ASPECT_W} / ${PHONE_ASPECT_H}`;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    // Scene & camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
    camera.position.z = 2.2;

    // Plane inside a group so we animate the group
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const planeGeo = new THREE.PlaneGeometry(1, PHONE_ASPECT_H / PHONE_ASPECT_W);
    const mat = new THREE.MeshBasicMaterial({ transparent: true, alphaTest: 0.01 });
    const plane = new THREE.Mesh(planeGeo, mat);
    group.add(plane);

    // Fit content
    const fit = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;

      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const visH = 2 * Math.tan(vFov / 2) * camera.position.z;
      const visW = visH * camera.aspect;
      const s = Math.min(visW * 0.75, visH * 0.75);
      plane.scale.set(s, s, 1);
    };
    fit();
    const onR = () => fit();
    window.addEventListener("resize", onR);

    // Animate
    let t0 = performance.now();
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      const t = (performance.now() - t0) / 1000;

      if (!prefersReduced && group) {
        // CSS px to world units (for vertical bobbing)
        const vFov = THREE.MathUtils.degToRad(camera.fov);
        const visH = 2 * Math.tan(vFov / 2) * camera.position.z;
        const px2world = visH / (mount.clientHeight || 1);

        group.position.y = Math.sin(t * FLOAT_SPEED) * FLOAT_AMPL_PX * px2world;

        const baseRoll = THREE.MathUtils.degToRad(baseRollDeg);
        group.rotation.z = baseRoll + Math.sin(t * TILT_SPEED) * TILT_ROLL_AMPL; // roll (Z)
        group.rotation.x = Math.cos(t * (TILT_SPEED * 0.7)) * TILT_PITCH_AMPL;  // pitch (X)
        group.rotation.y = Math.sin(t * YAW_SPEED) * TILT_YAW_AMPL;            // yaw (Y)
      }

      if (texRef.current) texRef.current.needsUpdate = true;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onR);
      try {
        lottieAnimRef.current?.destroy?.();
      } catch {}
      plane.geometry.dispose();
      (plane.material as THREE.Material).dispose?.();
      texRef.current?.dispose?.();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [baseRollDeg]);

  // Load ONLY /phone-440x600.json (no fallbacks)
  useEffect(() => {
    let disposed = false;

    (async () => {
      try {
        const head = await fetch("/phone-440x600.json", { method: "HEAD" });
        if (!head.ok) throw new Error("phone-440x600.json not found");

        // Hidden off-DOM canvas for Lottie
        const hidden = document.createElement("div");
        hidden.style.position = "absolute";
        hidden.style.left = "-99999px";
        hidden.style.top = "-99999px";
        hidden.style.width = `${PHONE_ASPECT_W}px`;
        hidden.style.height = `${PHONE_ASPECT_H}px`;
        document.body.appendChild(hidden);
        hiddenDivRef.current = hidden;

        const lottie = (await import("lottie-web")).default;
        const anim = lottie.loadAnimation({
          container: hidden,
          renderer: "canvas",
          loop: true,
          autoplay: true,
          path: "/phone-440x600.json",
          rendererSettings: { clearCanvas: true },
        });
        lottieAnimRef.current = anim;

        const attach = () => {
          if (disposed) return;
          const cvs = hidden.querySelector("canvas") as HTMLCanvasElement | null;
          if (!cvs) return;
          const tex = new THREE.CanvasTexture(cvs);
          tex.colorSpace = THREE.SRGBColorSpace;
          texRef.current = tex;

          const mesh = groupRef.current?.children[0] as THREE.Mesh | undefined;
          if (mesh) {
            const m = mesh.material as THREE.MeshBasicMaterial;
            m.map = tex;
            m.transparent = true;
            m.needsUpdate = true;
          }
        };

        anim.addEventListener("DOMLoaded", attach);
        anim.addEventListener("data_ready", attach);
      } catch (e) {
        console.error(e);
        setError("phone-440x600.json not found");
        // Tint placeholder so it's obvious something failed
        const mesh = groupRef.current?.children[0] as THREE.Mesh | undefined;
        if (mesh) {
          const m = mesh.material as THREE.MeshBasicMaterial;
          m.color = new THREE.Color(0xff2d55);
          m.opacity = 0.15;
          m.transparent = true;
          m.needsUpdate = true;
        }
      }
    })();

    return () => {
      disposed = true;
      try {
        lottieAnimRef.current?.destroy?.();
      } catch {}
      const div = hiddenDivRef.current;
      if (div && div.parentNode) div.parentNode.removeChild(div);
      hiddenDivRefRef.current = null;
    };
  }, []);

  return (
    <div ref={mountRef} className="pointer-events-none select-none">
      {error && (
        <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded bg-red-600/90 px-2 py-1 text-[11px] font-semibold text-white">
          {error}
        </div>
      )}
    </div>
  );
}
