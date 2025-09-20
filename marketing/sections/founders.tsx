"use client";

import { useEffect, useMemo, useRef } from "react";

const BG = "#0B3F3B";
const ACCENT = "#D9FF5B";

// assets
const IMG_BACK = "/founders/image-107.png";
const IMG_PHOTO = "/founders/image-105.png";
const IMG_FRAME = "/founders/image-106.svg";
const DIVIDER   = "/founders/Vector-11.svg";
const BULLET    = "/founders/bullet.svg";

// --- auto-scroll tuning ---
const SCROLL_PX_PER_SEC = 140; // fast per your tweak
const DWELL_MS = 2500;         // pause at top/bottom before bouncing

export default function Founders() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const webglHostRef = useRef<HTMLDivElement | null>(null);
  const hoveringRef = useRef(false);

  const prefersReduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    []
  );

  /** Continuous auto-scroll with hover pause + top/bottom dwell */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();
    let dir: 1 | -1 = 1;    // 1 = down, -1 = up
    let holdEnd = 0;        // timestamp until which we dwell
    let edge: -1 | 0 | 1 = 0; // -1 top, 1 bottom, 0 none

    const step = (t: number) => {
      raf = requestAnimationFrame(step);

      if (prefersReduced) return;
      if (el.scrollHeight <= el.clientHeight) return;

      const dt = t - last;
      last = t;

      if (hoveringRef.current) return; // pause while hovering
      if (t < holdEnd) return;         // dwell time active

      const eps = 2;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - eps;
      const atTop = el.scrollTop <= eps;

      if (atBottom && edge !== 1) {
        el.scrollTop = el.scrollHeight - el.clientHeight;
        edge = 1;
        holdEnd = t + DWELL_MS;
        dir = -1;
        return;
      }
      if (atTop && edge !== -1) {
        el.scrollTop = 0;
        edge = -1;
        holdEnd = t + DWELL_MS;
        dir = 1;
        return;
      }
      if (!atTop && !atBottom) edge = 0;

      const delta = Math.min((SCROLL_PX_PER_SEC * dt) / 1000, el.clientHeight * 0.02);
      el.scrollTop += dir * delta;
    };

    if (el.scrollTop === 0) el.scrollTop = 1; // avoid edge-stuck
    raf = requestAnimationFrame(step);

    return () => cancelAnimationFrame(raf);
  }, [prefersReduced]);

  /** Subtle Three.js lime glow behind the right column (optional) */
  useEffect(() => {
    let mounted = true;
    let renderer: any, scene: any, camera: any, mesh: any, raf = 0;

    (async () => {
      try {
        const host = webglHostRef.current;
        if (!host) return;
        const THREE = await import("three");

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
        renderer.setSize(host.clientWidth, host.clientHeight);
        Object.assign(renderer.domElement.style, {
          position: "absolute",
          inset: "0",
          pointerEvents: "none",
        } as CSSStyleDeclaration);
        host.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const uniforms = { u_time: { value: 0 } };
        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms,
          vertexShader: `void main(){gl_Position=vec4(position,1.0);}`,
          fragmentShader: `
            precision highp float;
            uniform float u_time;
            float blob(vec2 p, vec2 c, float r){ return smoothstep(r, r-0.25, length(p-c)); }
            void main(){
              vec2 uv = gl_FragCoord.xy / vec2(1024.0, 768.0);
              uv = (uv*2.0 - 1.0);
              uv.x *= 1.2;
              float t = u_time*0.06;
              vec2 c1 = vec2(sin(t*0.7)*0.3 - 0.2, cos(t*0.5)*0.25);
              vec2 c2 = vec2(cos(t*0.6)*0.3 + 0.25, sin(t*0.8)*0.2);
              float g = 0.0;
              g += blob(uv, c1, 0.85);
              g += blob(uv, c2, 0.85);
              g = clamp(g, 0.0, 1.0);
              vec3 lime = vec3(0.85, 1.0, 0.35);
              vec3 col = lime * 0.18 * g;
              gl_FragColor = vec4(col, g*0.18);
            }
          `,
        });

        const geo = new THREE.PlaneGeometry(2, 2);
        mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        const onResize = () => renderer.setSize(host.clientWidth, host.clientHeight);
        window.addEventListener("resize", onResize);
        onResize();

        const loop = (t: number) => {
          raf = requestAnimationFrame(loop);
          if (!mounted) return;
          (mesh.material as any).uniforms.u_time.value = t / 1000;
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(loop);

        return () => window.removeEventListener("resize", onResize);
      } catch { /* three not available */ }
    })();

    return () => {
      mounted = false;
      if (raf) cancelAnimationFrame(raf);
      if (renderer) {
        renderer.dispose?.();
        renderer.domElement?.remove?.();
      }
    };
  }, []);

  return (
    <section className="relative w-screen overflow-hidden" style={{ backgroundColor: BG }}>
      {/* Full-height row; md+ = 2 columns, mobile = single scroll pane */}
      <div className="relative h-[100svh] min-h-0 px-[4vw] py-[6vh] flex flex-col md:flex-row md:items-stretch md:gap-12 overflow-hidden">
        {/* LEFT (desktop/tablet only) — title + wobble stack */}
        <div className="hidden md:flex md:basis-[44%] flex-col shrink-0">
          <h3 className="mb-10 font-display font-extrabold leading-[0.98] text-white text-[clamp(40px,6vw,82px)]">
            <span className="block">Meet</span>
            <span className="block">Wazzap</span>
            <span className="block" style={{ color: ACCENT }}>Founders</span>
          </h3>

          <div className="relative" style={{ width: "clamp(300px,38vw,580px)", height: "clamp(210px,28vw,380px)" }} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_BACK}  alt="" className="absolute inset-0 m-auto h-full w-auto select-none wobble-1 -rotate-3 translate-x-[-2%] translate-y-[2%] drop-shadow-[0_16px_40px_rgba(0,0,0,0.35)]" draggable={false}/>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_PHOTO} alt="" className="absolute inset-0 m-auto h-[92%] w-auto select-none wobble-2 rotate-[1.5deg] drop-shadow-[0_20px_60px_rgba(0,0,0,0.35)]" draggable={false}/>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG_FRAME} alt="" className="absolute inset-0 m-auto h-full w-auto select-none wobble-3 rotate-[3deg] translate-x-[1%] -translate-y-[2%] drop-shadow-[0_14px_36px_rgba(0,0,0,0.30)]" draggable={false}/>
          </div>
        </div>

        {/* RIGHT — scroll pane (also hosts MOBILE title/stack at the top) */}
        <div className="relative md:basis-[56%] min-h-0 h-full flex">
          {/* subtle glow backdrop */}
          <div ref={webglHostRef} className="pointer-events-none absolute inset-0 z-0" />
          {/* scrollable content */}
          <div
            ref={scrollRef}
            className="relative z-10 flex-1 overflow-y-auto overscroll-contain pr-4 scrollbar-hide"
            onMouseEnter={() => (hoveringRef.current = true)}
            onMouseLeave={() => (hoveringRef.current = false)}
          >
            {/* MOBILE-ONLY: left column content moved to top */}
            <div className="md:hidden mb-10">
              <h3 className="mb-6 font-display font-extrabold leading-[0.98] text-white text-[clamp(36px,8vw,64px)]">
                <span className="block">Meet</span>
                <span className="block">Wazzap</span>
                <span className="block" style={{ color: ACCENT }}>Founders</span>
              </h3>
              <div className="relative mx-auto" style={{ width: "min(92%, 520px)", height: "min(60vw, 320px)" }} aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG_BACK}  alt="" className="absolute inset-0 m-auto h-full w-auto select-none wobble-1 -rotate-3 translate-x-[-2%] translate-y-[2%] drop-shadow-[0_16px_40px_rgba(0,0,0,0.35)]" draggable={false}/>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG_PHOTO} alt="" className="absolute inset-0 m-auto h-[92%] w-auto select-none wobble-2 rotate-[1.5deg] drop-shadow-[0_20px_60px_rgba(0,0,0,0.35)]" draggable={false}/>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMG_FRAME} alt="" className="absolute inset-0 m-auto h-full w-auto select-none wobble-3 rotate-[3deg] translate-x-[1%] -translate-y-[2%] drop-shadow-[0_14px_36px_rgba(0,0,0,0.30)]" draggable={false}/>
              </div>
            </div>

            {/* main right content (unchanged) */}
            <div className="space-y-20 md:space-y-24 lg:space-y-28">
              {/* Intro */}
              <div className="text-white/90 font-semibold text-[clamp(18px,1.6vw,24px)] leading-snug max-w-[74ch]">
                <span className="block">
                  <a href="https://wazzap.mx" target="_blank" className="underline">Wazzap.mx</a> is led by two Mexican partners, we
                </span>
                <span className="block">have over 10 years of combined experience in software</span>
                <span className="block">development and digital marketing.</span>

                <span className="block mt-5">Nair and Miguel, who bring their extensive software</span>
                <span className="block">background and expertise to the table.</span>
              </div>

              {/* Nair */}
              <div className="space-y-8">
                <h4 className="font-extrabold text-white text-[clamp(24px,2.2vw,30px)] leading-tight max-w-[74ch]">
                  <span className="block" style={{ color: ACCENT }}>Nair:</span>
                  <span className="block">Founder of the 🍕 PiSaaS Academy,  empowering Latin</span>
                  <span className="block">people to effectively use High-level.</span>
                </h4>
                <ul className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-16 md:gap-y-12 max-w-[76ch]">
                  <Bullet>Winner of the High-level Affillionaire Award and Tesla Electric Vehicle gifted by GHL.</Bullet>
                  <Bullet>Known as the <a href="https://www.youtube.com/@gohighlevelwizard" target="_blank" className="underline">@gohighlevelwizard</a> on YouTube, sharing valuable insights and interviews.</Bullet>
                </ul>
              </div>

              {/* Divider */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DIVIDER} alt="" className="w-full h-[14px] object-cover" style={{ objectPosition: "left center" }} draggable={false}/>

              {/* Miguel */}
              <div className="space-y-8">
                <h4 className="font-extrabold text-white text-[clamp(24px,2.2vw,30px)] leading-tight max-w-[74ch]">
                  <span className="block" style={{ color: ACCENT }}>Miguel:</span>
                  <span className="block">The Brain Behind Wazzap.mx, an Expert Developer</span>
                  <span className="block">and Crypto Enthusiast</span>
                </h4>
                <ul className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-16 md:gap-y-12 max-w-[76ch]">
                  <Bullet>He is recognized as a super developer, known for his ability to create innovative solutions in record time.</Bullet>
                  <Bullet>As a crypto enthusiast, Miguel stays updated with the latest trends and technologies in the software world.</Bullet>
                </ul>
              </div>

              <div className="h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* utils */}
      <style jsx global>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }

        @keyframes wobble1 { 0% { transform: translate(-2%,2%) rotate(-3deg); }
                             50% { transform: translate(-2%,6%) rotate(-1deg); }
                             100% { transform: translate(-2%,2%) rotate(-3deg);} }
        @keyframes wobble2 { 0% { transform: rotate(1.5deg) translateY(0); }
                             50% { transform: rotate(2.4deg) translateY(8px); }
                             100% { transform: rotate(1.5deg) translateY(0);} }
        @keyframes wobble3 { 0% { transform: translate(1%,-2%) rotate(3deg); }
                             50% { transform: translate(1%,1%) rotate(4.1deg); }
                             100% { transform: translate(1%,-2%) rotate(3deg);} }
        .wobble-1 { animation: wobble1 8s ease-in-out infinite; }
        .wobble-2 { animation: wobble2 8.8s ease-in-out infinite; }
        .wobble-3 { animation: wobble3 9.4s ease-in-out infinite; }
      `}</style>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-white/90 text-[clamp(18px,1.4vw,22px)] leading-snug font-semibold">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BULLET} alt="" className="mt-[4px] h-[15px] w-[15px] shrink-0" draggable={false} />
      <span className="block">{children}</span>
    </li>
  );
}
