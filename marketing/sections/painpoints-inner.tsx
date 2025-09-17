"use client";

import { useEffect, useMemo, useState } from "react";

function getWHFromViewBox(svg: SVGSVGElement): { w: number; h: number } | null {
  const vb = svg.getAttribute("viewBox");
  if (!vb) return null;
  const p = vb.trim().split(/\s+/);
  if (p.length !== 4) return null;
  const w = parseFloat(p[2]);
  const h = parseFloat(p[3]);
  if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return null;
  return { w, h };
}

export default function Painpoints() {
  const [svgHTML, setSvgHTML] = useState<string | null>(null);
  const [svgWH, setSvgWH] = useState<{ w: number; h: number } | null>(null);

  // Inline the SVG and force outline-only + controllable sizing
  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch("/wazzap.svg");
        const raw = await res.text();
        if (aborted) return;

        const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) return;

        const wh = getWHFromViewBox(svg);
        if (wh) setSvgWH(wh);

        // let CSS drive size
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.setAttribute("style", "height:100vh;width:auto;display:block;");

        // outline-only + lower opacity (0.15)
        const style = doc.createElementNS("http://www.w3.org/2000/svg", "style");
        style.textContent = `
          svg * {
            fill: none !important;
            stroke: rgba(255,255,255,0.15) !important;
            stroke-width: 1.5;
            vector-effect: non-scaling-stroke;
          }
        `;
        svg.prepend(style);

        const serialized = new XMLSerializer().serializeToString(doc.documentElement);
        setSvgHTML(serialized);
      } catch (e) {
        console.error("Failed to load/parse /wazzap.svg", e);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  // total width so the whole outline fits at 100vh tall
  const panelWidthPx = useMemo(() => {
    if (!svgWH) return 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;
    if (!vh) return 0;
    return (svgWH.w / svgWH.h) * vh; // W = (svgW/svgH) * 100vh
  }, [svgWH]);

  // recompute on resize
  useEffect(() => {
    const onR = () => setSvgWH((v) => (v ? { ...v } : v));
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  const widthStyle = panelWidthPx ? `${panelWidthPx}px` : "300vw";

  // Painpoints content
  const ICONS: Array<{ title: string[]; primary: string; fallback: string }> = [
    { primary: "/painpoints/1.svg", fallback: "/1.svg", title: ["Requires approval", "process"] },
    { primary: "/painpoints/2.svg", fallback: "/2.svg", title: ["24-hour", "messaging rule"] },
    { primary: "/painpoints/3.svg", fallback: "/3.svg", title: ["Templates must", "be pre-approved"] },
    { primary: "/painpoints/4.svg", fallback: "/4.svg", title: ["Cost per", "message/session"] },
    { primary: "/painpoints/5.svg", fallback: "/5.svg", title: ["Works only with", "approved business", "numbers"] },
  ];

  // Steps rail data
  const STEPS: Array<{ iconPrimary: string; iconFallback: string; title: string; copy: string }> = [
    { iconPrimary: "/steps/1.svg", iconFallback: "/steps/1.svg", title: "Scan QR Code", copy: "Easily link any WhatsApp number in seconds — no approval required." },
    { iconPrimary: "/steps/2.svg", iconFallback: "/steps/2.svg", title: "Connect Your Automation Tool", copy: "Integrate with your favorite CRM instantly, without coding or complex setups." },
    { iconPrimary: "/steps/3.svg", iconFallback: "/steps/3.svg", title: "Start Sending Messages", copy: "Send unlimited messages, template buttons, and voice replies — all from one dashboard." },
  ];

  // --- controls ---
  // Nudge line to match union (positive = move line slightly down)
  const LINE_NUDGE_PX = -6;
  // Drop the icons + labels by this many viewport-height units
  const SHIFT_VH = 5;
  // Vertically shrink the rope line (1 = no shrink)
  const LINE_SCALE_Y = 0.40;

  return (
    <>
    <section
      id="painpoints"
      className="relative h-screen w-screen overflow-hidden bg-[#0B3F3B]"
      aria-label="WhatsApp API pain points"
    >
      {/* Horizontally scrollable area fills the viewport */}
      <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
        <div className="relative h-full" style={{ width: widthStyle }}>
          {/* Background outline (inline svg), centered; small scale = side padding */}
          {svgHTML && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none"
              style={{ transform: "translate(-50%, -50%) scale(0.96)" }}
              dangerouslySetInnerHTML={{ __html: svgHTML }}
            />
          )}

          {/* Left heading (bigger) */}
          <div className="absolute left-[4vw] top-[7vh] z-20">
            <h2 className="font-display font-extrabold text-white leading-[0.9] tracking-[-0.01em] text-[clamp(22px,3vw,42px)]">
              <span className="block">The Problem With</span>
              <span className="block">the WhatsApp API</span>
            </h2>
          </div>

          {/* Rope: now also scaled on Y */}
          <img
            src="/painpoints/line.svg"
            alt=""
            className="absolute z-10"
            style={{
              top: "50vh",
              left: "6%",
              width: "58%",
              height: "auto",
              transform: `translateY(calc(-50% + ${LINE_NUDGE_PX}px)) scaleY(${LINE_SCALE_Y})`,
              transformOrigin: "center",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
            }}
            draggable={false}
          />

          <img
            src="/painpoints/Union.svg"
            alt=""
            className="absolute z-10"
            style={{
              top: "50vh",
              left: "64%",
              width: "30%",
              height: "auto",
              // no translate here
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
            }}
            draggable={false}
          />

          {/* Lizard on the right (slightly bigger) */}
          <img
            src="/painpoints/lizard.png"
            alt=""
            className="absolute z-20 h-auto"
            style={{
              left: "76%",
              top: "25vh",
              width: "clamp(300px,28vw,520px)",
              filter: "drop-shadow(0 12px 36px rgba(0,0,0,0.35))",
            }}
            draggable={false}
          />

          {/* Icons row — moved DOWN by SHIFT_VH */}
          <div className="absolute left-[8%] right-[24%] z-20" style={{ top: `${22 + SHIFT_VH}vh` }}>
            <div className="flex items-center justify-evenly gap-10">
              {ICONS.map((it, i) => (
                <IconImg key={i} srcPrimary={it.primary} srcFallback={it.fallback} />
              ))}
            </div>
          </div>

          {/* Labels row — moved DOWN by SHIFT_VH */}
          <div className="absolute left-[8%] right-[24%] z-20" style={{ top: `${60 + SHIFT_VH}vh` }}>
            <div className="flex items-start justify-evenly gap-10 text-center text-white/90 leading-[1.05] text-[clamp(18px,2.4vw,28px)]">
              {ICONS.map((it, i) => (
                <div key={i}>
                  {it.title.map((line, k) => (
                    <span key={k} className="block">
                      {line}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute right-[4vw] top-[9vh] z-20">
            <h3 className="font-display font-extrabold text-white leading-[0.9] tracking-[-0.01em] text-[clamp(20px,2.6vw,38px)] text-right">
              <span className="block">Connect any</span>
              <span className="block">WhatsApp in</span>
              <span className="block">3 Simple Steps</span>
            </h3>
          </div>
        </div>
      </div>
      <StepsPanel steps={STEPS} />
    </section>

    </>
  );
}

/* ---------- steps panel (new component) ---------- */
function StepsPanel({ steps }: { steps: Array<{ iconPrimary: string; iconFallback: string; title: string; copy: string }> }) {
  return (
    <section id="steps" className="relative w-screen min-h-[80vh] bg-[#0B3F3B]">
      <div className="mx-auto max-w-[1200px] px-[4vw] py-[10vh]">
        <div className="ml-auto w-[min(40rem,34vw)]">
          <div className="flex flex-col gap-8">
            {steps.map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <IconImg
                  srcPrimary={s.iconPrimary}
                  srcFallback={s.iconFallback}
                  className="h-[clamp(40px,3.2vw,56px)] w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                />
                <div className="text-white">
                  <h4 className="text-[clamp(18px,2vw,28px)] font-extrabold leading-tight">{s.title}</h4>
                  <p className="mt-1 text-white/90 text-[clamp(12px,1.1vw,14px)] leading-snug">{s.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- small helper so icons show even if folder differs ---------- */
function IconImg({
  srcPrimary,
  srcFallback,
  className,
}: {
  srcPrimary: string;
  srcFallback: string;
  className?: string;
}) {
  const [src, setSrc] = useState(srcPrimary);
  return (
    <img
      src={src}
      onError={() => {
        if (src !== srcFallback) setSrc(srcFallback);
      }}
      alt=""
      draggable={false}
      className={className ?? "h-[clamp(56px,7vw,120px)] w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"}
    />
  );
}
