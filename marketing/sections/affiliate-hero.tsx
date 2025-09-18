"use client";

import PillButton from "./pill-button";
import Header from "./header";

/**
 * Affiliate Hero – header padding + fruits image
 */

// -------- Controls --------
const BG = "#0B3F3B";
const ACCENT = "#D9FF5B";
const TOP_PAD_VH = 12;
const BOTTOM_PAD_VH = 14;

// Fruits placement
const FRUITS_WIDTH = "80vw"; // e.g. 80vw per your note
const FRUITS_BOTTOM_VH = 10; // distance from the bottom bg

export default function AffiliateHero() {
  return (
    <section
      id="affiliate"
      className="relative w-screen overflow-hidden flex items-center"
      style={{ backgroundColor: BG, minHeight: "100svh", padding: `${TOP_PAD_VH}vh 0 ${BOTTOM_PAD_VH}vh` }}
      aria-label="Affiliate program hero"
    >
      {/* Header with side padding so it doesn't hug the edges */}
      <div className="absolute inset-x-0 top-0 z-40">
        <div className="mx-auto w-full px-[3vw] md:px-[4vw]">
          <Header />
        </div>
      </div>

      {/* Plus accent near the headline */}
      <img
        src="/plus2.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none z-20"
        style={{ top: "18vh", width: "clamp(56px,7vw,120px)", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.35))" }}
      />

      {/* Content */}
      <div className="relative z-30 mx-auto max-w-[1100px] px-[4vw] text-center">
        <h1 className="font-display font-extrabold leading-[1.05] text-white text-[clamp(28px,5vw,64px)]">
          Join Our <span style={{ color: ACCENT }}>Affiliate Program</span>
        </h1>

        <p className="mx-auto mt-4 max-w-[780px] text-white/90 text-[clamp(16px,1.8vw,20px)] leading-snug">
          <span className="block">Earn 25% per new referred user,</span>
          <span className="block">recurring commission. The affiliate program</span>
          <span className="block">is exclusive to our clients.</span>
        </p>

        <div className="mt-6 md:mt-8 flex justify-center">
          <PillButton>Apply Now!</PillButton>
        </div>
      </div>

      {/* Fruits image (behind bottom bg) */}
      <img
        src="/Layer11.png"
        alt=""
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none z-20"
        style={{ bottom: `${FRUITS_BOTTOM_VH}vh`, width: FRUITS_WIDTH }}
      />

      {/* Bottom jagged background (on top of fruits) */}
      <img
        src="/bottom-bg.svg"
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 w-full select-none z-40"
      />
    </section>
  );
}
