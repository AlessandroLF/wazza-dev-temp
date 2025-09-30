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

/* ---------- Lottie inline helper ---------- */
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
      } catch {
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
    return () => { aborted = true; };
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

  // --- controls (unchanged) ---
  const LINE_NUDGE_PX = -6;
  const SHIFT_VH = 5;
  const LINE_SCALE_Y = 0.40;

  // TRANSFORM-BASED "SCROLL"
  const viewportRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // requested fractions
  const FRACTION_X = 1; // ~45% right
  const FRACTION_Y = 0.85; // ~85% down

  // reveal sequencing state
  const hSeqRef = useRef<{ el: HTMLElement; threshold: number; shown: boolean }[]>([]);
  const vSeqRef = useRef<{ el: HTMLElement; threshold: number; shown: boolean }[]>([]);
  const runIdRef = useRef(0);

  // helper: build ordered sequences, evenly spaced thresholds
  function buildSequence(container: HTMLElement, axis: "h" | "v") {
    const list = Array.from(container.querySelectorAll<HTMLElement>(`[data-reveal-axis="${axis}"]`));
    list.sort((a, b) => (parseFloat(a.dataset.order || "0") - parseFloat(b.dataset.order || "0")));
    const n = list.length || 1;
    const seq = list.map((el, i) => ({
      el,
      threshold: (i + 1) / (n + 1), //  ~even spacing across the motion
      shown: false,
    }));
    // reset classes
    seq.forEach(({ el }) => el.classList.remove("is-in"));
    return seq;
  }

  // animate right -> down and restart on re-enter
  useEffect(() => {
    const viewport = viewportRef.current;
    const scroller = scrollerRef.current;
    if (!viewport || !scroller) return;

    scroller.style.willChange = "transform";

    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const revealProgress = (axis: "h" | "v", p: number) => {
      const seq = axis === "h" ? hSeqRef.current : vSeqRef.current;
      for (const item of seq) {
        if (!item.shown && p >= item.threshold) {
          item.shown = true;
          item.el.classList.add("is-in");
        }
      }
    };

    const animate = (
      fromX: number,
      toX: number,
      fromY: number,
      toY: number,
      ms: number,
      runId: number,
      onProgress?: (p: number) => void
    ) =>
      new Promise<void>((resolve) => {
        const t0 = performance.now();
        const step = (now: number) => {
          if (runIdRef.current !== runId) return resolve(); // cancelled
          const t = Math.min(1, (now - t0) / ms);
          const eased = easeInOut(t);
          const x = fromX + (toX - fromX) * eased;
          const y = fromY + (toY - fromY) * eased;
          scroller.style.transform = `translate3d(${-x}px, ${-y}px, 0)`;
          onProgress?.(eased);
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });

    const startRun = async () => {
      const runId = ++runIdRef.current;
      scroller.style.transform = "translate3d(0,0,0)";

      await new Promise((r) => requestAnimationFrame(r as any));

      // build reveal sequences fresh
      hSeqRef.current = buildSequence(scroller, "h");
      vSeqRef.current = buildSequence(scroller, "v");

      // extents
      const maxX = Math.max(0, scroller.scrollWidth - viewport.clientWidth);
      const maxY = Math.max(0, scroller.scrollHeight - viewport.clientHeight);

      const targetX = Math.round(maxX * FRACTION_X);
      const targetY = Math.round(maxY * FRACTION_Y);

      // right, then down — reveal in lockstep
      await animate(0, targetX, 0, 0, 2600, runId, (p) => revealProgress("h", p));
      await animate(targetX, targetX, 0, targetY, 2000, runId, (p) => revealProgress("v", p));
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) startRun();
        }
      },
      { threshold: [0, 0.6, 1] }
    );
    io.observe(viewport);

    // initial run
    startRun();

    return () => {
      io.disconnect();
      ++runIdRef.current; // cancel any in-flight
    };
  }, [panelWidthPx]);

  return (
    <section
      ref={viewportRef as any}
      id="painpoints"
      aria-label="WhatsApp API pain points"
      className="relative w-screen h-[100vh] bg-[#0B3F3B] overflow-hidden"
      style={{ touchAction: "auto", overscrollBehavior: "auto" }} // allow page scroll
    >
      {/* Sticky left headline */}
      <div className="pointer-events-none absolute left-[4vw] top-[6vh] z-30">
        <h2 className="font-display font-extrabold text-white leading-[0.9] tracking-[-0.01em] text-[clamp(22px,3vw,42px)]">
          <span className="block">The Problem With</span>
          <span className="block">the WhatsApp API</span>
        </h2>
      </div>

      {/* SCROLLER (animated via translate3d) */}
      <div ref={scrollerRef}>
        <div
          className="relative grid"
          style={{ width: widthStyle, gridTemplateRows: "100vh auto" }}
        >
          {/* Row 1 */}
          <div className="relative h-[100vh] pt-[12vh]">
            {svgHTML && (
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 select-none"
                style={{ transform: "translate(-50%, -50%) scale(0.96)" }}
                dangerouslySetInnerHTML={{ __html: svgHTML }}
              />
            )}

            {/* Rope (order 0) */}
            <img
              data-reveal
              data-reveal-axis="h"
              data-order="0"
              src="/painpoints/line.svg"
              alt=""
              className="absolute z-10"
              style={{
                top: "50vh",
                left: "6%",
                width: "63%",
                height: "auto",
                transform: `translateY(calc(-50% + ${LINE_NUDGE_PX}px)) scaleY(${LINE_SCALE_Y})`,
                transformOrigin: "center",
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
              }}
              draggable={false}
            />

            {/* Lottie stays present (no reveal gating) */}
            <LottieInline
              src="/lizard-500x500.json"
              fallback="/painpoints/lizard.png"
              className="absolute z-20 pointer-events-none select-none"
              style={{
                left: "73%",
                top: "0vh",
                width: "clamp(300px,28vw,520px)",
                height: "clamp(300px,28vw,520px)",
                filter: "drop-shadow(0 12px 36px rgba(0,0,0,0.35))",
              }}
            />

            {/* Icons row — each icon gets its own order (1..5) */}
            <div className="absolute left-[8%] right-[24%] z-20" style={{ top: `${22 + SHIFT_VH}vh` }}>
              <div className="flex items-center justify-evenly gap-10">
                {ICONS.map((it, i) => (
                  <div key={i} data-reveal data-reveal-axis="h" data-order={1 + i}>
                    <IconImg srcPrimary={it.primary} srcFallback={it.fallback} />
                  </div>
                ))}
              </div>
            </div>

            {/* Labels row — continue ordering (6..10) */}
            <div className="absolute left-[8%] right-[24%] z-20" style={{ top: `${60 + SHIFT_VH}vh` }}>
              <div className="flex items-start justify-evenly gap-10 text-center text-white/90 leading-[1.05] text-[clamp(18px,2.4vw,28px)]">
                {ICONS.map((it, i) => (
                  <div key={i} data-reveal data-reveal-axis="h" data-order={6 + i}>
                    {it.title.map((line, k) => (
                      <span key={k} className="block">
                        {line}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Rightmost headline (optional: reveal last on horizontal path) */}
            <div
              data-reveal
              data-reveal-axis="h"
              data-order="11"
              className="absolute right-[4vw] top-[9vh] z-20"
            >
              <h3 className="font-display font-extrabold text-white leading-[0.9] tracking-[-0.01em] text-[clamp(20px,2.6vw,38px)] text-right">
                <span className="block">Connect any</span>
                <span className="block">WhatsApp in</span>
                <span className="block">3 Simple Steps</span>
              </h3>
            </div>
          </div>

          {/* Row 2 (steps) */}
          <div className="relative justify-self-end pr-0 w-screen">
            <StepsPanel/>
          </div>
        </div>
      </div>

      {/* Reveal styles */}
      <style jsx>{`
        [data-reveal] {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 600ms ease, transform 600ms ease;
        }
        [data-reveal].is-in {
          opacity: 1;
          transform: none;
        }
      `}</style>
    </section>
  );
}

/* ---------- FINAL StepsPanel with your values + text X controls + sequenced reveals ---------- */
function StepsPanel() {
  // ---- controls (yours — unchanged) ----
  const LINE_NUDGE_PX = -6;           // tiny vertical nudge for Unio.svg (down = +)
  const SHIFT_VH = 0;                 // push markers + text down (vh)
  const PLUS_SIZE_PX = 34;            // /steps/plus.svg size

  // panel/rope sizing
  const PANEL_VH = 180;               // panel height
  const ROPE_HEIGHT_PCT = 75;         // rope = % of panel height
  const ROPE_OVERFLOW_TOP_PX = -458;  // lift rope above panel top (negative = up)

  // horizontal alignment
  const ROPE_X_OFFSET_PX = 80;        // move rope a bit LEFT (negative = left)
  const MARKER_X_PX = [265, 255, 300]; // per-marker X nudges (top→bottom)

  // vertical positions
  const STEP_Y = [0, 43, 81];         // marker/text anchors (vh from top)
  const TEXT_OFFSET_VH = [0, 0, 10];  // extra downshift for each text block

  // per-step X nudges for the text blocks (px)
  const TEXT_X_PX = [0, 500, 370];

  const STEPS: Array<{
    title: string;
    copy: string;
    icon: string;
    side: "left" | "right" | "center";
  }> = [
    { title: "Connect Your Automation Tool", copy: "Integrate with your favorite CRM instantly, without coding or complex setups.", icon: "/steps/2.svg", side: "right" },
    { title: "Scan QR Code", copy: "Easily link any WhatsApp number in seconds — no approval required.", icon: "/steps/1.svg", side: "left" },
    { title: "Start Sending Messages", copy: "Send unlimited messages, template buttons, and voice replies — all from one dashboard.", icon: "/steps/3.svg", side: "center" },
  ];

  return (
    <section
      id="steps"
      className="relative w-full bg-[#0B3F3B] overflow-visible"
      style={{ minHeight: `${PANEL_VH}vh` }}
    >
      <div className="relative w-full px-0 overflow-visible" style={{ height: `${PANEL_VH}vh` }}>
        {/* Steps rope (v order 0) */}
        <img
          data-reveal
          data-reveal-axis="v"
          data-order="0"
          src="/steps/Unio.svg"
          alt=""
          draggable={false}
          className="pointer-events-none absolute left-1/2 select-none z-10"
          style={{
            top: `calc(${LINE_NUDGE_PX}px + ${ROPE_OVERFLOW_TOP_PX}px)`,
            height: `${ROPE_HEIGHT_PCT}%`,
            width: "auto",
            transform: `translateX(calc(-50% + ${ROPE_X_OFFSET_PX}px))`,
            filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.35))",
          }}
        />

        {/* Markers & Texts in alternating vertical sequence:
            1: marker1, 2: text1, 3: marker2, 4: text2, 5: marker3, 6: text3 */}
        {STEP_Y.map((y, i) => (
          <img
            key={`marker-${i}`}
            data-reveal
            data-reveal-axis="v"
            data-order={1 + i * 2}
            src="/steps/plus.svg"
            alt=""
            draggable={false}
            className="absolute z-20"
            style={{
              top: `calc(${y + SHIFT_VH}vh)`,
              left: "50%",
              transform: `translateX(calc(-50% + ${ROPE_X_OFFSET_PX}px)) translateX(${(MARKER_X_PX[i] ?? 0)}px)`,
              width: PLUS_SIZE_PX,
              height: PLUS_SIZE_PX,
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.35))",
            }}
          />
        ))}

        {STEPS.map((s, i) => {
          const y = STEP_Y[i] + SHIFT_VH + (TEXT_OFFSET_VH[i] ?? 0);
          const x = TEXT_X_PX[i] ?? 0;

          const baseText = "text-white leading-tight tracking-[-0.01em] select-none";
          const h4Cls = "font-display font-extrabold text-[clamp(18px,2.4vw,28px)]";
          const pCls = "mt-2 text-white/90 text-[clamp(12px,1.1vw,14px)]";

          const sidePosition =
            s.side === "left" ? "left-[8vw] text-left"
            : s.side === "right" ? "right-[8vw] text-right"
            : "left-1/2 -translate-x-1/2 text-center";

          return (
            <div
              key={`step-${i}`}
              data-reveal
              data-reveal-axis="v"
              data-order={2 + i * 2}
              className={`absolute z-20 ${sidePosition}`}
              style={{ top: `calc(${y}vh)` }}
            >
              <div style={{ transform: `translateX(${x}px)` }}>
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
            </div>
          );
        })}

        {/* Bottom jagged background (reveal last) */}
        <img
          data-reveal
          data-reveal-axis="v"
          data-order="7"
          src="/steps/background-bg.svg"
          alt=""
          className="pointer-events-none absolute bottom-0 left-0 w-full select-none z-0"
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
      onError={() => { if (src !== srcFallback) setSrc(srcFallback); }}
      alt=""
      draggable={false}
      className={className ?? "h-[clamp(56px,7vw,120px)] w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"}
    />
  );
}
