"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.setAttribute("style", "height:100vh;width:auto;display:block;");

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

  const panelWidthPx = useMemo(() => {
    if (!svgWH) return 0;
    const vh = typeof window !== "undefined" ? window.innerHeight : 0;
    if (!vh) return 0;
    return (svgWH.w / svgWH.h) * vh; // W = (svgW/svgH) * 100vh
  }, [svgWH]);

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

  const STEPS: Array<{ iconPrimary: string; iconFallback: string; title: string; copy: string }> = [
    { iconPrimary: "/steps/1.svg", iconFallback: "/steps/1.svg", title: "Scan QR Code", copy: "Easily link any WhatsApp number in seconds — no approval required." },
    { iconPrimary: "/steps/2.svg", iconFallback: "/steps/2.svg", title: "Connect Your Automation Tool", copy: "Integrate with your favorite CRM instantly, without coding or complex setups." },
    { iconPrimary: "/steps/3.svg", iconFallback: "/steps/3.svg", title: "Start Sending Messages", copy: "Send unlimited messages, template buttons, and voice replies — all from one dashboard." },
  ];

  // --- controls ---
  const LINE_NUDGE_PX = -6;
  const SHIFT_VH = 5;
  const LINE_SCALE_Y = 0.40;

  return (
    <section
      id="painpoints"
      // let the whole “canvas” scroll both ways; keep it full-height at the top
      className="relative w-screen h-[100vh] overflow-x-auto overflow-y-auto bg-[#0B3F3B]"
      aria-label="WhatsApp API pain points"
    >
      {/* L-shaped canvas: row1 = 100vh (horizontal scene), row2 = auto (vertical steps on the far right) */}
      <div
        className="relative grid"
        style={{ width: widthStyle, gridTemplateRows: "100vh auto" }}
      >
        {/* ── Row 1: horizontal scene (unchanged visuals) ───────────────── */}
        <div className="relative h-[100vh]">
          {/* Background outline (inline svg), centered; small scale = side padding */}
          {svgHTML && (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none"
              style={{ transform: "translate(-50%, -50%)) scale(0.96)" }}
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
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
            }}
            draggable={false}
          />

          {/* Lizard replaced with Lottie */}
          <LottieInline
            src="/lizard-500x500.json"
            fallback="/painpoints/lizard.png"
            className="absolute z-20 pointer-events-none select-none"
            style={{
              left: "76%",
              top: "25vh",
              width: "clamp(300px,28vw,520px)",
              aspectRatio: "1 / 1",
              filter: "drop-shadow(0 12px 36px rgba(0,0,0,0.35))",
            }}
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

          {/* Rightmost headline */}
          <div className="absolute right-[4vw] top-[9vh] z-20">
            <h3 className="font-display font-extrabold text-white leading-[0.9] tracking-[-0.01em] text-[clamp(20px,2.6vw,38px)] text-right">
              <span className="block">Connect any</span>
              <span className="block">WhatsApp in</span>
              <span className="block">3 Simple Steps</span>
            </h3>
          </div>
        </div>

        {/* │ Row 2: vertical steps column, pinned to the far right (┐) ───── */}
        <div className="relative justify-self-end pr-[0vw]">
          <StepsPanel/>
        </div>
      </div>
    </section>
  );
}

function StepsPanel() {
  // ---- controls (safe to tweak) ----
  const LINE_NUDGE_PX = -6;          // tiny vertical nudge for Unio.svg (down = +)
  const SHIFT_VH = 5;                // base push for markers (vh)
  const PLUS_SIZE_PX = 34;           // /steps/plus.svg size

  // panel/rope sizing
  const PANEL_VH = 180;              // panel height
  const ROPE_HEIGHT_PCT = 70;        // rope = % of panel height

  // horizontal alignment
  const ROPE_X_OFFSET_PX = -36;      // move rope a bit LEFT (negative = left)
  const MARKER_X_PX = [ +18, -16, -4 ]; // per-marker X nudges (top→bottom)

  // vertical positions
  const STEP_Y = [18, 43, 75];       // marker/text anchors (vh from top)
  const TEXT_OFFSET_VH = [0, 0, 10]; // extra downshift for each text block

  const STEPS: Array<{
    title: string;
    copy: string;
    icon: string;
    side: "left" | "right" | "center";
  }> = [
    {
      title: "Connect Your Automation Tool",
      copy:
        "Integrate with your favorite CRM instantly, without coding or complex setups.",
      icon: "/steps/2.svg",
      side: "right",
    },
    {
      title: "Scan QR Code",
      copy:
        "Easily link any WhatsApp number in seconds — no approval required.",
      icon: "/steps/1.svg",
      side: "left",
    },
    {
      title: "Start Sending Messages",
      copy:
        "Send unlimited messages, template buttons, and voice replies — all from one dashboard.",
      icon: "/steps/3.svg",
      side: "center",
    },
  ];

  return (
    <section
      id="steps"
      className="relative w-full bg-[#0B3F3B] overflow-hidden"
      style={{ minHeight: `${PANEL_VH}vh` }}
    >
      {/* IMPORTANT: height via inline style (dynamic Tailwind classes won't compile) */}
      <div className="relative w-full px-0" style={{ height: `${PANEL_VH}vh` }}>
        {/* Rope (Unio.svg) — centered, shifted slightly left, 70% tall */}
        <img
          src="/steps/Unio.svg"
          alt=""
          draggable={false}
          className="pointer-events-none absolute left-1/2 select-none"
          style={{
            top: `${LINE_NUDGE_PX}px`,
            height: `${ROPE_HEIGHT_PCT}%`,
            width: "auto",
            transform: `translateX(calc(-50% + ${ROPE_X_OFFSET_PX}px))`,
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.35))",
          }}
        />

        {/* Plus markers — along the rope; top two nudged to match the curve */}
        {STEP_Y.map((y, i) => (
          <img
            key={`marker-${i}`}
            src="/steps/plus.svg"
            alt=""
            draggable={false}
            className="absolute"
            style={{
              top: `calc(${y + SHIFT_VH}vh)`,
              left: "50%",
              transform: `translateX(calc(-50% + ${ROPE_X_OFFSET_PX + (MARKER_X_PX[i] ?? 0)}px))`,
              width: PLUS_SIZE_PX,
              height: PLUS_SIZE_PX,
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
            }}
          />
        ))}

        {/* Alternating step text blocks (bottom pulled down) */}
        {STEPS.map((s, i) => {
          const y = STEP_Y[i] + SHIFT_VH + (TEXT_OFFSET_VH[i] ?? 0);
          const baseText =
            "text-white leading-tight tracking-[-0.01em] select-none";
          const h4Cls =
            "font-display font-extrabold text-[clamp(18px,2.4vw,28px)]";
          const pCls = "mt-2 text-white/90 text-[clamp(12px,1.1vw,14px)]";

          const sidePosition =
            s.side === "left"
              ? "left-[8vw] text-left"
              : s.side === "right"
              ? "right-[8vw] text-right"
              : "left-1/2 -translate-x-1/2 text-center";

          return (
            <div
              key={`step-${i}`}
              className={`absolute z-20 ${sidePosition}`}
              style={{ top: `calc(${y}vh)` }}
            >
              <div className="mb-3 inline-flex items-center gap-3">
                <img
                  src={s.icon}
                  alt=""
                  className="h-[clamp(36px,3vw,56px)] w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
                  draggable={false}
                />
                <span className="sr-only">{s.title}</span>
              </div>

              <h4 className={`${baseText} ${h4Cls}`}>{s.title}</h4>
              <p className={`${baseText} ${pCls}`}>{s.copy}</p>
            </div>
          );
        })}

        {/* Bottom jagged background */}
        <img
          src="/steps/background-bg.svg"
          alt=""
          className="pointer-events-none absolute bottom-0 left-0 w-full select-none"
          draggable={false}
        />
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

/* ---------- Lottie inline helper (PNG fallback if lottie-web unavailable) ---------- */
function LottieInline({
  src,
  className,
  style,
  fallback,
}: {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let destroyed = false;
    let anim: any;

    (async () => {
      try {
        const lottie = (window as any).lottie || (await import("lottie-web")).default;
        if (!boxRef.current || destroyed) return;
        anim = lottie.loadAnimation({
          container: boxRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          path: src,
        });
      } catch (e) {
        console.error("Lottie failed; falling back to image", e);
        setFailed(true);
      }
    })();

    return () => {
      destroyed = true;
      try { anim?.destroy?.(); } catch {}
    };
  }, [src]);

  if (failed && fallback) {
    return <img src={fallback} alt="" draggable={false} className={className} style={style} />;
  }
  return <div ref={boxRef} className={className} style={style} />;
}
