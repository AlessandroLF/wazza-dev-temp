"use client";

import { useEffect, useRef } from "react";

const BG = "#0B3F3B";
const FLOWER_SRC = "/image-108.png";   // must exist in /public
const BOTTOM_BG  = "/bottom-bg-2.svg"; // must exist in /public

// ---- easy tuning ----
const MOBILE_HEIGHT_VH  = 20;  // how tall the flower stage is on mobile
const MOBILE_SHIFT_VH   = 30;  // push DOWN on mobile (increase to lower more)
const DESKTOP_SHIFT_VH  = -6;  // your desktop value that looked good (up is negative)
// ----------------------
const BOTTOM_BG_RISE_VH_MOBILE  = 5;  // e.g., 0–12
const BOTTOM_BG_RISE_VH_DESKTOP = 3;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-screen overflow-hidden" style={{ backgroundColor: BG }}>
      {/* Scene */}
      <div className="relative mx-auto max-w-[1600px] px-[4vw] pt-[8vh] pb-[24vh]">
        {/* Flower wrapper */}
        <div
          className="relative mx-auto pointer-events-none w-[90vw] max-w-[1400px] md:h-[min(30vh,50px)] z-0"
          style={{
            height: `min(${MOBILE_HEIGHT_VH}vh, 300px)`,
            transform: `translateY(${MOBILE_SHIFT_VH}vh)`,
          }}
        >
          {/* Desktop keeps your original -6vh nudge */}
          <style>{`
            @media (min-width: 768px) {
              .footer-shift-desktop {
                transform: translateY(${DESKTOP_SHIFT_VH}vh);
              }
            }
          `}</style>
          <div className="footer-shift-desktop absolute inset-0">
            {/* Base image (always visible) — anchor to bottom to avoid teal gap */}
            <img
              src={FLOWER_SRC}
              alt=""
              className="absolute inset-0 h-full w-full select-none object-contain object-bottom"
              draggable={false}
            />

            {/* Breeze overlay (desktop only) */}
            <div className="hidden md:block">
              <BreezyOverlay src={FLOWER_SRC} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
  @media (min-width: 768px) {
    .footer-bottom-bg {
      transform: translateY(-${BOTTOM_BG_RISE_VH_DESKTOP}vh);
    }
  }
`}</style>
<img
  src={BOTTOM_BG}
  alt=""
  className="footer-bottom-bg pointer-events-none absolute inset-x-0 bottom-0 z-[5] w-full select-none transition-transform duration-300"
  style={{ transform: `translateY(-${BOTTOM_BG_RISE_VH_MOBILE}vh)` }}
  draggable={false}
/>

      {/* Legal row */}
      <div
        className={[
          "relative z-[7] mx-auto max-w-[1600px] px-[4vw] py-6",
          "flex flex-col items-center gap-2 text-center",
          "md:flex-row md:items-center md:justify-between md:text-left",
        ].join(" ")}
        style={{ color: BG }}
      >
        <span className="font-semibold text-[clamp(16px,3.8vw,20px)] md:text-[clamp(15px,1.3vw,20px)]">
          © {year} Wazzap — All rights reserved.
        </span>
        <a
          href="/terms"
          className="font-semibold text-[clamp(16px,3.8vw,20px)] md:text-[clamp(15px,1.3vw,20px)] underline-offset-2 hover:underline"
        >
          Terms &amp; Conditions
        </a>
      </div>
    </footer>
  );
}

/* ------------------------ Three.js overlay (desktop only) ------------------------ */
function BreezyOverlay({ src }: { src: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let renderer: any, scene: any, camera: any, mesh: any, group: any, raf = 0;
    let imgAspect = 1;

    (async () => {
      try {
        const host = hostRef.current;
        if (!host) return;

        const reduce =
          typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        if (reduce) return;

        const THREE = await import("three");

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
        renderer.setSize(host.clientWidth, host.clientHeight);
        renderer.setClearAlpha(0);
        Object.assign(renderer.domElement.style, {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          display: "block",
          zIndex: "3",
          pointerEvents: "none",
        } as CSSStyleDeclaration);
        host.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
        camera.position.z = 1;

        const loader = new THREE.TextureLoader();
        const tex = await new Promise<any>((resolve, reject) => {
          loader.load(src, resolve, undefined, reject);
        });
        tex.flipY = false;
        tex.anisotropy = 4;

        const w = (tex.image as HTMLImageElement).naturalWidth || tex.image.width || 1;
        const h = (tex.image as HTMLImageElement).naturalHeight || tex.image.height || 1;
        imgAspect = w / h;

        const geo = new THREE.PlaneGeometry(2, 2, 120, 160);
        const uniforms = {
          u_time:  { value: 0 },
          u_tex:   { value: tex },
          u_amp:   { value: 0.035 },
          u_freq:  { value: 5.0 },
          u_speed: { value: 0.6 },
          u_pin:   { value: 0.15 },
        };

        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms,
          vertexShader: `
            uniform float u_time, u_amp, u_freq, u_speed, u_pin;
            varying vec2 vUv;
            void main() {
              vUv = uv;
              float w = smoothstep(u_pin, 1.0, vUv.y);
              w = pow(w, 1.6);
              float t = u_time * u_speed;
              float s1 = sin((vUv.y * u_freq) + t);
              float s2 = cos((vUv.x * (u_freq * 0.7)) + t * 0.8);
              float dx = (s1 * 0.6 + s2 * 0.4) * u_amp * w;
              float dy = (cos((vUv.y * u_freq * 0.6) - t * 0.9)) * u_amp * 0.4 * w;
              vec3 p = position + vec3(dx, dy, 0.0);
              gl_Position = vec4(p, 1.0);
            }
          `,
          fragmentShader: `
            precision highp float;
            uniform sampler2D u_tex;
            varying vec2 vUv;
            void main() {
              vec4 c = texture2D(u_tex, vec2(vUv.x, 1.0 - vUv.y));
              if (c.a < 0.05) discard;
              gl_FragColor = c;
            }
          `,
        });

        mesh = new THREE.Mesh(geo, mat);
        group = new THREE.Group();
        group.add(mesh);
        scene.add(group);

        const fit = () => {
          const W = host.clientWidth || 1;
          const H = host.clientHeight || 1;
          renderer.setSize(W, H);
          const viewAspect = W / H;
          let sx = 2, sy = 2;
          if (imgAspect > viewAspect) sy = 2 * (viewAspect / imgAspect);
          else sx = 2 * (imgAspect / viewAspect);
          mesh.scale.set(sx, sy, 1);
        };
        fit();
        const onResize = () => fit();
        window.addEventListener("resize", onResize);

        const loop = (t: number) => {
          raf = requestAnimationFrame(loop);
          if (!mounted) return;
          (mesh.material as any).uniforms.u_time.value = t / 1000;
          const tt = t / 1000;
          group.rotation.z = 0.03 * Math.sin(tt * 0.55);
          group.position.y = 0.02 * Math.sin(tt * 0.9);
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(loop);

        return () => window.removeEventListener("resize", onResize);
      } catch {
        /* keep base <img> if overlay fails */
      }
    })();

    return () => {
      mounted = false;
      if (raf) cancelAnimationFrame(raf);
      try {
        // @ts-ignore
        renderer?.dispose?.();
        renderer?.domElement?.remove?.();
      } catch {}
    };
  }, [src]);

  return <div ref={hostRef} className="pointer-events-none absolute inset-0" />;
}
