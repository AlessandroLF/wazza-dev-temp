"use client";

import React from "react";

export default function AffiliateHero() {
  const brandGradient: React.CSSProperties = {
    color: "transparent",
    backgroundImage:
      "linear-gradient(90deg,#EAFF4F 0%,#CFFF58 35%,#7FF083 70%,#55E0A0 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    textShadow: "0 0 10px rgba(122,255,130,0.12)",
  };

  return (
    <section id="affiliate-hero" className="relative overflow-hidden bg-[#0B3F3B]">
      {/* Content */}
      <div className="mx-auto max-w-[1000px] px-6 pt-[10vh] pb-[22vh] text-center md:pb-[24vh]">
        <h2 className="font-display text-[clamp(26px,5.2vw,56px)] font-extrabold leading-[1.05] tracking-[-0.01em] text-white">
          <span className="mr-2">Join Our</span>
          <span style={brandGradient}>Affiliate Program</span>
        </h2>

        <p className="mx-auto mt-5 max-w-[680px] text-[clamp(14px,2.1vw,18px)] leading-snug text-white/90">
          Earn 25% per new referred user, recurring commission. The affiliate
          program is exclusive to our clients.
        </p>

        {/* CTA */}
        <div className="mt-7 flex items-center justify-center">
          <a
            href="#"
            className="group inline-flex items-center gap-3 rounded-full bg-[#E8FE60] px-6 py-3 font-display text-[clamp(14px,2.2vw,18px)] font-semibold text-[#073733] shadow-[0_10px_35px_rgba(0,0,0,0.25)] transition-transform active:scale-[0.98]"
          >
            Apply Now!
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#133F39] text-white transition-transform group-hover:translate-x-[2px]">
              ▶
            </span>
          </a>
        </div>
      </div>

      {/* Fruit image — sits behind the jagged bottom */}
      <img
        src="/Layer11.png"
        alt=""
        className={`
          fruits pointer-events-none absolute left-1/2 -translate-x-1/2 select-none
          z-[10]
          w-[95vw] max-w-[680px]
          md:w-[58vw] md:max-w-[920px]
        `}
      />

      {/* Jagged bottom — on top */}
      <img
        src="/bottom-bg.svg"
        alt=""
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[60] w-full select-none"
      />

      {/* Floor to prevent teal showing below jagged on tall screens */}
      <div
        aria-hidden
        className="absolute inset-x-0 -bottom-px h-[6vh] bg-[#EBF6F6] z-[5] md:h-[8vh]"
      />

      <style jsx>{`
        /* Mobile: fruit just above the jagged edge (behind it) */
        .fruits {
          bottom: calc(env(safe-area-inset-bottom, 0px) + 1.2vh);
        }
        /* Desktop: fruit larger and closer to jagged (peek) */
        @media (min-width: 768px) {
          .fruits {
            bottom: 4.5vh;
          }
        }
      `}</style>
    </section>
  );
}
