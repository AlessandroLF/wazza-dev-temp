"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Social proof section:
 * - center card is static on top (z-20)
 * - left/right cards are ABSOLUTE, initially centered under the middle card,
 *   then slide outward to their final positions.
 * - animation is slower and reverses when scrolling back above the section
 * - no rotation or fade
 * - large bottom padding so the section can breathe
 */
export default function Proof() {
  const sectionRef = useRef<HTMLElement | null>(null);

  // px offset we need to slide the side cards away from center
  const [dx, setDx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // refs to measure sizes
  const centerRef = useRef<HTMLImageElement | null>(null);
  const leftRef = useRef<HTMLImageElement | null>(null);
  const rightRef = useRef<HTMLImageElement | null>(null);

  // measure the amount we need to slide to clear the center card
  const measure = () => {
    const c = centerRef.current;
    const l = leftRef.current;
    const r = rightRef.current;
    if (!c || !l || !r) return;

    const cw = c.getBoundingClientRect().width;
    const lw = l.getBoundingClientRect().width;
    const rw = r.getBoundingClientRect().width;

    // match your gap visually (≈ gap-5 sm:gap-8)
    const gap = window.innerWidth >= 1024 ? 32 : 20;

    // distance from the center of the middle card to the center of the side card
    const distance = cw / 2 + gap + Math.max(lw, rw) / 2;

    setDx(distance);
  };

  // measure once images are loaded + on resize
  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (centerRef.current) ro.observe(centerRef.current);
    if (leftRef.current) ro.observe(leftRef.current);
    if (rightRef.current) ro.observe(rightRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // intersection observer to play/reverse animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setRevealed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        // reveal when at least 70% visible, reverse when it drops below
        setRevealed(e.isIntersecting && e.intersectionRatio >= 0.7);
      },
      { threshold: [0, 0.7, 1] }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-[#EBF6F6] py-16 sm:py-24 pb-[25vh] overflow-x-hidden"
      aria-label="Social proof"
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

        {/* Stage */}
        <div className="relative mt-12 sm:mt-16">
          {/* Keep enough height to contain the biggest card so nothing jumps */}
          <div className="relative mx-auto flex justify-center">
            {/* CENTER (always on top) */}
            <img
              ref={centerRef}
              src="/proof/card-1.png"
              alt="5000+ users active"
              draggable={false}
              className="relative z-20 w-[300px] sm:w-[360px] lg:w-[420px] rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.28)] select-none"
              onLoad={measure}
            />

            {/* LEFT — absolute, start perfectly behind center then slide LEFT */}
            <img
              ref={leftRef}
              src="/proof/card-2.png"
              alt="-50% in savings"
              draggable={false}
              className="hidden sm:block absolute top-1/2 left-1/2 z-10 w-[260px] md:w-[320px] lg:w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.28)] select-none will-change-transform"
              style={{
                transition:
                  "transform 1600ms cubic-bezier(.22,1,.36,1) 160ms", // slower + small delay
                transform: `translate(calc(-50% - ${revealed ? dx : 0}px), -50%)`,
              }}
              onLoad={measure}
            />

            {/* RIGHT — absolute, start perfectly behind center then slide RIGHT */}
            <img
              ref={rightRef}
              src="/proof/card-3.png"
              alt="35M conversations started"
              draggable={false}
              className="hidden sm:block absolute top-1/2 left-1/2 z-10 w-[260px] md:w-[320px] lg:w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.28)] select-none will-change-transform"
              style={{
                transition:
                  "transform 1600ms cubic-bezier(.22,1,.36,1) 240ms", // slower + slightly more delay
                transform: `translate(calc(-50% + ${revealed ? dx : 0}px), -50%)`,
              }}
              onLoad={measure}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
