"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Hero from "./sections/hero";
import Preloader from "./sections/preloader";
import CommunityPopup from "./sections/popup";
import StickyCTA from "./sections/sticky-cta";
import Proof from "./sections/proof";
import PainPoints from "./sections/painpoints";
import Features from "./sections/features";
import Compare from "./sections/compare";
import Pricing from "./sections/pricing";
import AffiliateHero from "./sections/affiliate-hero";
import Testimonials from "./sections/testimonies";

export default function LandingPage() {
  const [heroReady, setHeroReady] = useState(false);

  // preloader lifecycle
  const [preStartedToHide, setPreStartedToHide] = useState(false);
  const [preHidden, setPreHidden] = useState(false);

  // reveal lifecycle
  const [revealMounted, setRevealMounted] = useState(false);
  const [revealStart, setRevealStart] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setHeroReady(true), 8000);
    return () => clearTimeout(id);
  }, []);

  const handleHeroLoaded = useCallback(() => setHeroReady(true), []);

  const handlePreloaderWillHide = useCallback(() => {
    setRevealMounted(true);
    setRevealStart(true);
    setPreStartedToHide(true);
  }, []);

  const handlePreloaderDone = useCallback(() => {
    setPreHidden(true);
    const t = setTimeout(() => {
      setRevealMounted(false);
      setRevealStart(false);
    }, REVEAL_TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  return (
     <main className="relative min-h-screen w-full overflow-x-hidden bg-[#EBF6F6] ">
      <Hero onLoaded={handleHeroLoaded} />
      <Proof />
      <PainPoints />
      <Features />
      <Compare />
      <Pricing />
      <AffiliateHero />
      <Testimonials />
      

      {!preHidden && (
        <Preloader
          ready={heroReady}
          onWillHide={handlePreloaderWillHide}
          onDone={handlePreloaderDone}
        />
      )}

      {revealMounted && <TealReveal start={revealStart} />}
      <StickyCTA />
      <CommunityPopup /> 
    </main>
  );
}

/* -------------------- TEAL REVEAL (4 × 5, BR → TL) -------------------- */
const ROWS = 4;
const COLS = 5;
const STEP_DELAY = 80;
const TILE_DURATION = 220;
const MAX_DIST = (ROWS - 1) + (COLS - 1);
const REVEAL_TOTAL_MS = STEP_DELAY * MAX_DIST + TILE_DURATION + 120;

function TealReveal({ start }: { start: boolean }) {
  const tiles = useMemo(() => {
    const arr: { key: string; top: number; left: number; w: number; h: number; delay: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const distFromBR = (ROWS - 1 - r) + (COLS - 1 - c);
        arr.push({
          key: `${r}-${c}`,
          top: (r / ROWS) * 100,
          left: (c / COLS) * 100,
          w: 100 / COLS,
          h: 100 / ROWS,
          delay: distFromBR * STEP_DELAY,
        });
      }
    }
    return arr;
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="absolute inset-0">
        {tiles.map((t) => (
          <div
            key={t.key}
            style={{
              position: "absolute",
              top: `${t.top}%`,
              left: `${t.left}%`,
              width: `${t.w}%`,
              height: `${t.h}%`,
              background: "#09403C",
              opacity: 1,
              ...(start
                ? { animation: `tileFade ${TILE_DURATION}ms ease forwards`, animationDelay: `${t.delay}ms` }
                : {}),
              willChange: start ? ("opacity" as any) : undefined,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes tileFade {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
