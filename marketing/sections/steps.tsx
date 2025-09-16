"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

/** A step node anchored along the curve (t in [0..1]) with label + optional icon */
type Step = {
  id: string;
  label: string;         // allow \n for multiline
  desc?: string;
  t: number;             // normalized along the curve
  dx?: number;           // pixel nudge in screen-space
  dy?: number;           // pixel nudge in screen-space
};

const STEPS: Step[] = [
  {
    id: "connect",
    label: "Connect Your\nAutomation Tool",
    desc: "Integrate with your favorite CRM in seconds.",
    t: 0.22, dx: 90, dy: -10,
  },
  {
    id: "qr",
    label: "Scan QR Code",
    desc: "Easily link your WhatsApp business.",
    t: 0.52, dx: -120, dy: 10,
  },
  {
    id: "start",
    label: "Start Sending\nMessages",
    desc: "Kick off outbound fast. Templates ready.",
    t: 0.86, dx: 110, dy: 4,
  },
];

/** Scroll span in viewport heights. Pinned viewport is 100vh. */
const HEIGHT_VH = 180;
const PIN_VH = 100;

/** Tube look */
const TUBE_RADIUS_PX = 4;         // thickness of the path
const TUBE_SEGMENTS = 600;        // smoothness
const GLOW_COLOR = 0xE7FB62;      // core color
const GLOW_DARK = 0x86E58C;       // tail color

export default function Steps3D() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const mountRef   = useRef<HTMLDivElement | null>(null);
  const canvasRef  = useRef<HTMLCanvasElement | null>(null);
  const [labels, setLabels] = useState<{ id: string; x: number; y: number }[]>(
    []
  );

  /** three objects */
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const tubeRef = useRef<THREE.Mesh<THREE.TubeGeometry, THREE.MeshBasicMaterial>>();
  const curveRef = useRef<THREE.CatmullRomCurve3>();
  const lizardRef = useRef<THREE.Sprite>();
  const lizardTexRef = useRef<THREE.Texture>();

  /** resize helpers */
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  /** build curve points in screen pixel space, top-left origin */
  const makeCurvePoints = (w: number, h: number) => {
    // you can tweak these to match your Figma curve
    // coordinates are in pixels inside the sticky viewport (w x h)
    return [
      new THREE.Vector3(0.80 * w, 0.10 * h, 0),
      new THREE.Vector3(0.62 * w, 0.18 * h, 0),
      new THREE.Vector3(0.56 * w, 0.27 * h, 0),
      new THREE.Vector3(0.50 * w, 0.38 * h, 0),
      new THREE.Vector3(0.45 * w, 0.49 * h, 0),
      new THREE.Vector3(0.46 * w, 0.62 * h, 0),
      new THREE.Vector3(0.50 * w, 0.72 * h, 0),
      new THREE.Vector3(0.57 * w, 0.84 * h, 0),
      new THREE.Vector3(0.57 * w, 0.95 * h, 0),
    ];
  };

  /** init three once */
  useEffect(() => {
    const mount = mountRef.current!;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvasRef.current = canvas;
    mount.appendChild(canvas);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas,
    });
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const cam = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
    cameraRef.current = cam;

    // lizard sprite (transparent png)
    const tex = new THREE.TextureLoader().load("/steps/lizard.png");
    lizardTexRef.current = tex;
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(sprMat);
    sprite.scale.set(80, 80, 1); // pixels because we use ortho pixel camera
    sprite.position.set(-9999, -9999, 10);
    scene.add(sprite);
    lizardRef.current = sprite;

    // two-tone gradient-ish tube: we’ll just lerp color over geometry via two meshes
    const tubeMat = new THREE.MeshBasicMaterial({ color: GLOW_COLOR });
    // built later after we know curve & size

    // keep RAF driving renderer (cheap scene)
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      renderer.render(scene, cam);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      try { renderer.dispose(); } catch {}
      try { tex.dispose(); } catch {}
      mount.removeChild(canvas);
    };
  }, []);

  /** handle sizing + rebuild curve/tube */
  useEffect(() => {
    const mount = mountRef.current!;
    const renderer = rendererRef.current!;
    const cam = cameraRef.current!;
    const scene = sceneRef.current!;

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      sizeRef.current = { w, h, dpr };

      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);

      // “pixel space” orthographic camera
      cam.left = 0; cam.right = w;
      cam.top = 0;  cam.bottom = h;
      cam.updateProjectionMatrix();

      // (re)build curve + tube
      const pts = makeCurvePoints(w, h);
      const curve = new THREE.CatmullRomCurve3(pts);
      curveRef.current = curve;

      // TubeGeometry builds in +y down? Our camera is top-down so it matches.
      const geo = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, TUBE_RADIUS_PX, 16, false);
      const mat = new THREE.MeshBasicMaterial({ color: GLOW_DARK });
      const tube = new THREE.Mesh(geo, mat);
      tube.renderOrder = 1;

      // Remove previous tube
      if (tubeRef.current) {
        scene.remove(tubeRef.current);
        tubeRef.current.geometry.dispose();
        tubeRef.current.material.dispose();
      }
      scene.add(tube);
      tubeRef.current = tube;

      // start hidden
      geo.setDrawRange(0, 0);

      // recompute HTML labels right away at t positions
      const newLabels = STEPS.map((s) => {
        const p = curve.getPointAt(s.t);
        // top-left pixel projection -> already pixel units
        return { id: s.id, x: p.x + (s.dx ?? 0), y: p.y + (s.dy ?? 0) };
      });
      setLabels(newLabels);
    };

    onResize();
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  /** scroll driving: reveal tube + move sprite */
  useEffect(() => {
    const section = sectionRef.current!;
    const tube = tubeRef.current;
    const curve = curveRef.current;
    const sprite = lizardRef.current;
    const geo = tube?.geometry as THREE.TubeGeometry | undefined;

    if (!tube || !curve || !sprite || !geo) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const playPx = (HEIGHT_VH - PIN_VH) * window.innerHeight * 0.01; // px to play
      const progress = clamp((0 - rect.top) / playPx, 0, 1);

      // draw tube
      const count = geo.index ? geo.index.count : geo.attributes.position.count;
      geo.setDrawRange(0, Math.floor(progress * count));

      // move sprite
      const p = curve.getPointAt(progress);
      const tan = curve.getTangentAt(Math.max(0, Math.min(1, progress + 0.0005)));
      const angle = Math.atan2(tan.y, tan.x);
      sprite.position.set(p.x, p.y, 10);
      sprite.rotation.z = angle;
    };

    const onScroll = () => {
      handleScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(handleScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** recompute label positions if size changes (steers from curve points) */
  useEffect(() => {
    const curve = curveRef.current;
    if (!curve) return;
    const newLabels = STEPS.map((s) => {
      const p = curve.getPointAt(s.t);
      return { id: s.id, x: p.x + (s.dx ?? 0), y: p.y + (s.dy ?? 0) };
    });
    setLabels(newLabels);
  }, [sizeRef.current.w, sizeRef.current.h]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#0E4A45] text-white"
      style={{ height: `${HEIGHT_VH}vh` }}
      aria-label="Connect any WhatsApp in 3 Simple Steps (3D)"
    >
      {/* Sticky viewport */}
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ height: `${PIN_VH}vh` }}
      >
        {/* Header */}
        <div className="absolute left-1/2 top-6 z-10 -translate-x-1/2 text-center">
          <h3 className="font-display text-[clamp(22px,3.8vw,34px)] font-extrabold">
            Connect any WhatsApp in{" "}
            <span className="text-[#E7FB62]">3 Simple Steps</span>
          </h3>
        </div>

        {/* Three canvas */}
        <div ref={mountRef} className="absolute inset-0">
          <canvas ref={canvasRef} className="block size-full" />
        </div>

        {/* Pins & labels as HTML (projected from curve points) */}
        <div className="pointer-events-none absolute inset-0 z-10">
          {labels.map((s) => (
            <div
              key={s.id}
              className="absolute max-w-[220px] -translate-x-1/2 -translate-y-1/2 select-none"
              style={{ left: s.x, top: s.y }}
            >
              <div className="pointer-events-auto mb-2 grid size-9 place-items-center rounded-md bg-[#E7FB62] text-[#182]">
                {/* swap with your exported step icons */}
                ▢
              </div>
              <p className="whitespace-pre-line font-semibold leading-tight">
                {STEPS.find((t) => t.id === s.id)?.label}
              </p>
              {STEPS.find((t) => t.id === s.id)?.desc && (
                <p className="mt-1 text-[12px] text-white/80">
                  {STEPS.find((t) => t.id === s.id)?.desc}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Bottom ground + CTA slot */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <svg className="block h-[90px] w-full" viewBox="0 0 1200 100" preserveAspectRatio="none">
            <path
              d="M0,100 L90,70 L160,90 L260,60 L360,95 L460,70 L560,88 L660,64 L760,92 L860,68 L960,98 L1060,72 L1200,100 L1200,100 L0,100 Z"
              fill="#FFFFFF"
            />
          </svg>
          <div className="mb-5 flex items-center justify-center">
            {/* Leave empty; you already have sticky CTA elsewhere */}
          </div>
        </div>
      </div>
    </section>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
