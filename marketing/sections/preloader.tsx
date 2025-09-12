"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** true when hero image is ready */
  ready: boolean;
  /** fires the instant we begin to hide (progress reached 100%) */
  onWillHide?: () => void;
  /** fires after the preloader fade completes */
  onDone?: () => void;
};

export default function Preloader({ ready, onWillHide, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const rafRef = useRef<number | null>(null);
  const willHideCalled = useRef(false);
  const doneCalled = useRef(false);

  // >>> Add the body class on mount
  useEffect(() => {
    document.body.classList.add("is-preloading");
    return () => {
      document.body.classList.remove("is-preloading");
    };
  }, []);

  // While !ready: ramp to 95%. When ready: finish to 100 quickly.
  useEffect(() => {
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      setProgress((p) => {
        const cap = ready ? 100 : 95;
        const speed = ready ? 90 : 28; // % per second
        return Math.min(cap, p + speed * dt);
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [ready]);

  // When we hit 100, notify reveal to start and fade this overlay out.
  useEffect(() => {
    if (!willHideCalled.current && progress >= 100) {
      willHideCalled.current = true;
      onWillHide?.();          // <-- mount + start tiles
      setFading(true);         // begin our fade-out
      const t = setTimeout(() => {
        if (!doneCalled.current) {
          doneCalled.current = true;

          // >>> Tell the rest of the app we're done
          document.body.classList.remove("is-preloading");
          window.dispatchEvent(new Event("wazzap:preloader:done"));

          onDone?.();          // <-- preloader fully gone
        }
      }, 520); // match CSS fade duration below
      return () => clearTimeout(t);
    }
  }, [progress, onWillHide, onDone]);

  return (
    <div
      className={`fixed inset-0 z-[10000] grid place-items-center bg-[#09403C] text-white transition-opacity duration-500 ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={fading}
    >
      <div className="flex flex-col items-center gap-8">
        {/* LOGO + RIGHT→LEFT thin sweep, 100% peak brightness */}
        <div className="relative w-[220px] sm:w-[260px]">
          <img src="/wazzap.svg" alt="wazzap!!" className="w-full opacity-25" />
          <img src="/wazzap.svg" alt="" aria-hidden className="w-full absolute inset-0 sweep-mask" />
        </div>

        <div className="text-sm uppercase tracking-widest opacity-70">loading</div>
        <div className="text-3xl sm:text-4xl font-semibold tabular-nums">
          {Math.round(progress)}%
        </div>

        <div className="h-2 w-64 sm:w-80 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-white transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style jsx>{`
        .sweep-mask {
          opacity: 1; /* 100% peak brightness */
          -webkit-mask-image: linear-gradient(
            90deg,
            transparent 0%,
            transparent 48%,
            rgba(0, 0, 0, 0.55) 49%,
            black 50%,
            rgba(0, 0, 0, 0.55) 51%,
            transparent 52%,
            transparent 100%
          );
          mask-image: linear-gradient(
            90deg,
            transparent 0%,
            transparent 48%,
            rgba(0, 0, 0, 0.55) 49%,
            black 50%,
            rgba(0, 0, 0, 0.55) 51%,
            transparent 52%,
            transparent 100%
          );
          -webkit-mask-size: 160% 100%;
          mask-size: 160% 100%;
          -webkit-mask-repeat: no-repeat;
          mask-repeat: no-repeat;
          animation: sweep-rtl 2.1s linear infinite; /* RIGHT → LEFT */
          will-change: -webkit-mask-position, mask-position;
        }
        @keyframes sweep-rtl {
          0%   { -webkit-mask-position: 130% 0; mask-position: 130% 0; }
          100% { -webkit-mask-position: -30% 0;  mask-position: -30% 0;  }
        }
      `}</style>
    </div>
  );
}
