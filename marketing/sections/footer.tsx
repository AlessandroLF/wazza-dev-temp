"use client";

// Brand colors
const BG = "#0B3F3B";
// Light fill that matches the jagged SVG background (tweak if yours differs)
const JAGGED_BG = "#EBF6F6";

// Assets
const FLOWER_SRC = "/image-108.png";   // adjust if needed
const JAGGED_SRC = "/bottom-bg-2.svg"; // adjust if needed

// ====== TUNING ======
// (mobile)
const FLOWER_W_MOBILE_VW  = 86;
const MOBILE_STAGE_H_VH   = 10; // container height
const MOBILE_STAGE_MAX    = 340;
const MOBILE_STAGE_SHIFT  = 18; // push DOWN so it sits nearer the jagged
const JAGGED_RISE_MOBILE  = 6;  // lift jagged to overlap the flower a bit
const FLOOR_MOBILE_H      = 6; // smaller floor
// (desktop – unchanged)
const FLOWER_W_DESKTOP_VW = 75;
const DESKTOP_STAGE_H_VH  = 32;
const DESKTOP_STAGE_MAX   = 520;
const DESKTOP_STAGE_SHIFT = 12;
const JAGGED_RISE_DESKTOP = 6;
const FLOOR_DESKTOP_H     = 30;
// =====================

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-screen overflow-visible" style={{ backgroundColor: BG }}>
      {/* wrapper – reduced paddings on mobile to close the gap */}
      <div className="relative mx-auto max-w-[1600px] px-[4vw] pt-[4vh] pb-[14vh] md:pt-[8vh] md:pb-[24vh]">
        {/* Flower stage (below jagged, above floor) */}
        <div className="footer-stage relative mx-auto w-[92vw] max-w-[1400px] z-[3] pointer-events-none">
          <img
            src={FLOWER_SRC}
            alt=""
            draggable={false}
            className="flower-img absolute bottom-0 left-1/2 z-[3] select-none object-contain"
          />
        </div>
      </div>

      {/* Floor block under the jagged – now the same color as jagged */}
      <div className="floor-block absolute inset-x-0 bottom-0 z-[1]" style={{ backgroundColor: JAGGED_BG }} />

      {/* Jagged on top */}
      <img
        src={JAGGED_SRC}
        alt=""
        draggable={false}
        className="footer-jagged pointer-events-none absolute inset-x-0 bottom-0 z-[5] w-full select-none"
      />

      {/* Legal row */}
      <div
        className="relative z-[6] mx-auto max-w-[1600px] px-[4vw] py-6 flex flex-col items-center gap-2 text-center md:flex-row md:items-center md:justify-between md:text-left"
        style={{ color: BG }}
      >
        <span className="font-semibold text-[clamp(16px,3.8vw,20px)] md:text-[clamp(15px,1.3vw,20px)]">
          © {year} Wazzap — All rights reserved.
        </span>
        <a
          href="/terms"
          className="font-semibold text-[clamp(16px,3.8vw,20px)] md:text-[clamp(15px,1.3vw,20px)] underline-offset-2 hover:underline"
        >
          Terms &amp; Conditions
        </a>
      </div>

      <style jsx>{`
        /* MOBILE */
        .footer-stage {
          height: min(${MOBILE_STAGE_H_VH}vh, ${MOBILE_STAGE_MAX}px);
          transform: translateY(${MOBILE_STAGE_SHIFT}vh);
          overflow: visible;
        }
        .flower-img {
          width: ${FLOWER_W_MOBILE_VW}vw;
          height: auto;
          transform: translateX(-50%);
        }
        .footer-jagged {
          transform: translateY(-${JAGGED_RISE_MOBILE}vh);
        }
        .floor-block {
          height: ${FLOOR_MOBILE_H}vh;
        }

        /* DESKTOP (unchanged) */
        @media (min-width: 768px) {
          .footer-stage {
            height: min(${DESKTOP_STAGE_H_VH}vh, ${DESKTOP_STAGE_MAX}px) !important;
            transform: translateY(${DESKTOP_STAGE_SHIFT}vh) !important;
          }
          .flower-img {
            width: ${FLOWER_W_DESKTOP_VW}vw;
          }
          .footer-jagged {
            transform: translateY(-${JAGGED_RISE_DESKTOP}vh);
          }
          .floor-block {
            height: ${FLOOR_DESKTOP_H}vh;
          }
        }
      `}</style>
    </footer>
  );
}
