"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const BG = "#0B3F3B";
const ACCENT = "#D9FF5B";

// small helper for image fallbacks (srcPrimary -> srcFallback)
function Img({ srcPrimary, srcFallback, className = "", alt = "" }: { srcPrimary: string; srcFallback: string; className?: string; alt?: string; }) {
  const ref = useRef<HTMLImageElement | null>(null);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={srcPrimary}
      alt={alt}
      className={className}
      onError={() => {
        const el = ref.current;
        if (el && el.src !== window.location.origin + srcFallback) el.src = srcFallback;
      }}
      draggable={false}
    />
  );
}

export default function Founders() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    // ---- three.js (orthographic: pixels == world units)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -1000, 1000);
    const group = new THREE.Group();
    scene.add(group);

    const loader = new THREE.TextureLoader();

    // Base size for the stacked card (scaled responsively below)
    const BASE_W = 550;
    const BASE_H = 310;

    const makePlane = (w: number, h: number, tex: THREE.Texture) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
      return new THREE.Mesh(geo, mat);
    };

    let planes: THREE.Mesh[] = [];
    const sources = [
      "/founders/image-107.png", // back plate
      "/founders/image-105.png", // photo
      "/founders/image-106.svg", // frame
    ];

    Promise.all(sources.map((p) => new Promise<THREE.Texture>((res, rej) => loader.load(p, res, undefined, rej))))
      .then(([backTex, photoTex, frameTex]) => {
        // make planes (slightly different sizes for depth)
        const back = makePlane(BASE_W * 1.06, BASE_H * 1.06, backTex);
        const photo = makePlane(BASE_W, BASE_H, photoTex);
        const frame = makePlane(BASE_W + 12, BASE_H + 12, frameTex);

        // initial offsets & rotations
        back.position.set(-18, 12, -5);
        back.rotation.z = THREE.MathUtils.degToRad(-5);

        photo.position.set(0, 0, 0);
        photo.rotation.z = THREE.MathUtils.degToRad(2);

        frame.position.set(10, -6, 6);
        frame.rotation.z = THREE.MathUtils.degToRad(4);

        planes = [back, photo, frame];
        planes.forEach((m) => group.add(m));

        setSize();
        animate(0);
      })
      .catch((e) => console.error("Founders: texture load error", e));

    let W = 0, H = 0, scale = 1;

    const setSize = () => {
      const r = wrap.getBoundingClientRect();
      W = r.width; H = r.height;
      renderer.setSize(W, H, false);

      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();

      // scale the stack to fit comfortably in the column
      const targetW = Math.min(W * 0.92, 700);
      scale = targetW / (BASE_W + 40);
      group.scale.set(scale, scale, 1);
      group.position.set(0, H * 0.06, 0); // slight upward nudge
    };

    // gentle wobble animation
    let raf = 0;
    const animate = (t: number) => {
      raf = requestAnimationFrame(animate);
      const time = (t || performance.now()) * 0.001;

      if (planes.length) {
        const [back, photo, frame] = planes;

        back.rotation.z = THREE.MathUtils.degToRad(-5) + Math.sin(time * 0.35) * 0.035;
        back.position.y = 12 + Math.sin(time * 0.6) * 6;

        photo.rotation.z = THREE.MathUtils.degToRad(2) + Math.sin(time * 0.38 + 0.8) * 0.03;
        photo.position.y = Math.sin(time * 0.55 + 0.4) * 7;

        frame.rotation.z = THREE.MathUtils.degToRad(4) + Math.sin(time * 0.32 + 1.4) * 0.028;
        frame.position.y = -6 + Math.sin(time * 0.62 + 1.2) * 5;
      }

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
    <section id="founders" className="w-screen h-[100svh] overflow-hidden" style={{ backgroundColor: BG }}>
      <div
  className={[
    "grid", "h-full", "w-full", "items-center",
    "gap-x-10", "gap-y-8", "px-[4vw]", "py-[6vh]",
    "md:grid-cols-[0.9fr,1.1fr]",
  ].join(" ")}
>
        {/* LEFT: wobbling stack */}
        <div ref={wrapRef} className="relative h-[56vh] md:h-[72vh]">
          <canvas ref={canvasRef} className="block h-full w-full" />
        </div>

        {/* RIGHT: content — wider column, scrollable, hidden scrollbar */}
        <div className="relative max-h-[82vh] overflow-y-auto pr-2 scrollbar-hide">
          <h3 className="font-display text-white text-[clamp(28px,3.6vw,54px)] leading-[1.02]">
            <span className="block">Meet</span>
            <span className="block">Wazzap</span>
            <span className="block" style={{ color: ACCENT }}>Founders</span>
          </h3>

          <p className="mt-6 text-white/90 text-[clamp(14px,1.1vw,16px)] leading-snug max-w-[60ch]">
            <a href="https://wazzap.mx" target="_blank" className="underline">Wazzap.mx</a> is led by two Mexican partners,
            with over 10 years of combined experience in software development and digital marketing.
          </p>
          <p className="mt-3 text-white/90 text-[clamp(14px,1.1vw,16px)] leading-snug max-w-[60ch]">
            Nair and Miguel, who bring their extensive software background and expertise to the table.
          </p>

          <h4 className="mt-8 font-extrabold text-white text-[clamp(18px,1.6vw,22px)] leading-tight">
            <span style={{ color: ACCENT }}>Nair:</span> Founder of the 🍕 PiSaaS Academy, empowering Latin
            people to effectively use High-level.
          </h4>

          <ul className="mt-3 space-y-3">
            <Bullet>Winner of the High-level Affillionaire Award and Tesla Electric Vehicle gifted by GHL.</Bullet>
            <Bullet>
              Known as the <a href="https://www.youtube.com/@gohighlevelwizard" target="_blank" className="underline">@gohighlevelwizard</a> on YouTube,
              sharing valuable insights and interviews.
            </Bullet>
          </ul>

          {/* Divider */}
          <div className="mt-7">
            <Img
              srcPrimary="/founders/Vector-11.svg"
              srcFallback="/founders/Vector-11.svg"
              className="w-[320px] max-w-[70%] opacity-90"
              alt=""
            />
          </div>

          <h4 className="mt-6 font-extrabold text-white text-[clamp(18px,1.6vw,22px)] leading-tight">
            <span style={{ color: ACCENT }}>Miguel:</span> The Brain Behind Wazzap.mx, an Expert Developer
            and Crypto Enthusiast
          </h4>

          <ul className="mt-3 space-y-3">
            <Bullet>
              He is recognized as a super developer, known for his ability to create innovative solutions in record time.
            </Bullet>
            <Bullet>
              As a crypto enthusiast, Miguel stays updated with the latest trends and technologies in the software world.
            </Bullet>
          </ul>

          <div className="h-10" />
        </div>
      </div>

      {/* Hide scrollbar utility */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

/* ---------- Bullet item using /founders/bullet.svg (fallback to Vector-11.svg) ---------- */
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-white/90 text-[clamp(14px,1.05vw,16px)] leading-snug max-w-[62ch]">
      <Img
        srcPrimary="/founders/bullet.svg"
        srcFallback="/founders/Vector-11.svg"
        className="mt-1 h-[14px] w-[14px] shrink-0"
        alt=""
      />
      <span>{children}</span>
    </li>
  );
}
