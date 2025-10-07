"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PhoneThree from "@/marketing/components/phoneThree";

/* ======= Design tokens ======= */
const BG_COLOR = "#E7F4F3";
const MAX_W = 1200;
const SECTION_Y_PAD_VH = 10;

const PHONE_WIDTH_CLAMP = "clamp(220px,24vw,460px)";
const PHONE_DROP_SHADOW = "0 20px 60px rgba(0,0,0,0.25)";

const COL_GAP_CLAMP = "clamp(24px,3vw,48px)";
const CARD_GAP_REM = 1.0;

// Column scroll speed (desktop only)
const SPEED_PX_PER_S = 28;

/* ===================== Data ===================== */
const FEATURES: Array<{ id: string; text: string }> = [
  { id: "01", text: "Turn your WhatsApp into an AI Chatbot" },
  { id: "02", text: "Send Voice Notes with cloned voices" },
  { id: "03", text: "Automate WhatsApp Groups and extract members" },
  { id: "04", text: "Send Bulk Messages with message variations to avoid spam" },
  { id: "05", text: "Send Buttons and save replies" },
  { id: "06", text: "Connect Multiple Numbers and assign to staff" },
];

/* ===================== Helpers ===================== */
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

/* ===================================================== */

export default function Features() {
  const isMobile = useIsMobile();

  const left = useMemo(() => FEATURES.slice(0, 3), []);
  const right = useMemo(() => FEATURES.slice(3), []);

  return (
    <section
      id="features"
      className="w-screen relative"
      aria-label="Wazzap key features"
      style={{ backgroundColor: BG_COLOR, padding: `${SECTION_Y_PAD_VH}vh 0` }}
    >
      <div className="relative z-10 mx-auto px-[4vw]" style={{ maxWidth: MAX_W }}>
        <h2 className="font-display font-extrabold text-[#103B36] tracking-[-0.01em] text-[clamp(24px,3.2vw,42px)]">
          Wazzap Key Features
        </h2>

        {/* Layout switches: static stack on mobile, animated columns on md+ */}
        {isMobile ? (
          // ---------- MOBILE: no phone, no animation ----------
          <div className="mt-6 grid grid-cols-1 gap-6">
            {/* One simple list (or keep two groups stacked) */}
            {[...left, ...right].map((it) => (
              <FeatureCard key={it.id} id={it.id} text={it.text} />
            ))}
          </div>
        ) : (
          // ---------- DESKTOP/TABLET ----------
          <div
            className="relative mt-8 flex flex-nowrap items-start justify-center"
            style={{ gap: COL_GAP_CLAMP }}
          >
            {/* Left column (animated) */}
            <div className="shrink-0 grow-0 basis-[30%] max-w-[30%]">
              <ColumnContinuous items={left} phase={0} />
            </div>

            {/* Center phone */}
            <div className="shrink-0 grow-0 basis-[40%] max-w-[40%] flex-col items-center hidden md:flex">
              <div
                className="relative rounded-[28px] overflow-visible"
                style={{
                  width: PHONE_WIDTH_CLAMP,
                  filter: `drop-shadow(${PHONE_DROP_SHADOW})`,
                  aspectRatio: "440 / 600",
                }}
              >
                <PhoneThree style={{ width: "100%", height: "100%" }} />
              </div>
            </div>

            {/* Right column (animated, phase-shifted) */}
            <div className="shrink-0 grow-0 basis-[30%] max-w-[30%]">
              <ColumnContinuous items={right} phase={0.5} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* =============== Continuous Scrolling Columns (desktop only) =============== */
function ColumnContinuous({
  items,
  phase = 0, // 0..1 fraction of a cycle (offsets left vs right)
}: {
  items: Array<{ id: string; text: string }>;
  phase?: number;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCardRef = useRef<HTMLDivElement>(null);

  const [cardH, setCardH] = useState(0);

  const offsetPxRef = useRef(0);
  const cyclePxRef = useRef(1);

  const VISIBLE_BLOCKS = 3;

  // measure and compute
  useEffect(() => {
    const track = trackRef.current;
    const first = firstCardRef.current;
    const viewport = viewportRef.current;
    if (!track || !first || !viewport) return;

    const compute = () => {
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.rowGap || "0");
      const h = first.offsetHeight;

      setCardH(h);

      // stride = card + spacer + row-gap
      const stride = h + h + gap;
      const cycle = items.length * stride;
      cyclePxRef.current = cycle;

      offsetPxRef.current = (phase % 1) * cycle;
      viewport.style.height = `${VISIBLE_BLOCKS * stride}px`;
    };

    const ro = new ResizeObserver(() => compute());
    ro.observe(track);
    ro.observe(first);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        compute();
        (document as any).fonts?.ready?.then(compute).catch(() => {});
      });
    });

    return () => ro.disconnect();
  }, [items, phase]);

  // seamless continuous motion
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;

      const cycle = cyclePxRef.current;
      let o = offsetPxRef.current + SPEED_PX_PER_S * dt;
      if (cycle > 0 && o >= cycle) o -= cycle;
      offsetPxRef.current = o;

      const track = trackRef.current;
      if (track) track.style.transform = `translateY(${-o}px)`;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const spacerH = cardH;
  const loopNodes = useMemo(() => {
    const cycles = [0, 1]; // two cycles are enough (viewport clamped)
    return cycles.flatMap((cycle) =>
      items.map((it, idx) => (
        <div key={`${it.id}-wrap-${idx}-c${cycle}`} className="contents">
          <div ref={cycle === 0 && idx === 0 ? firstCardRef : undefined}>
            <FeatureCard id={it.id} text={it.text} />
          </div>
          <div style={{ height: spacerH }} aria-hidden="true" />
        </div>
      ))
    );
  }, [items, spacerH]);

  // soft fade mask top/bottom
  const maskStyle: React.CSSProperties = {
    WebkitMaskImage:
      "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)",
    maskImage:
      "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, rgba(0,0,0,0) 100%)",
  };

  return (
    <div ref={viewportRef} className="relative overflow-hidden" style={maskStyle}>
      <div ref={trackRef} className="flex flex-col" style={{ rowGap: `${CARD_GAP_REM}rem` }}>
        {loopNodes}
      </div>
    </div>
  );
}

/* =============== Static Card =============== */
function FeatureCard({ id, text }: { id: string; text: string }) {
  return (
    <div
      className="rounded-2xl bg-white shadow-sm"
      style={{
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
        padding: "clamp(14px,1.2vw,18px)",
      }}
    >
      <div className="text-[clamp(12px,1.1vw,14px)] text-[#9EB0AE] font-extrabold">{id}</div>
      <div className="mt-1 text-[clamp(16px,1.45vw,19px)] font-extrabold text-[#103B36] leading-[1.15]">
        {text}
      </div>
    </div>
  );
}
