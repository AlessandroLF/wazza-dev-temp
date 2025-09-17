"use client";

import Image from "next/image";
import { useMemo } from "react";

/**
 * Wazzap Key Features
 * - Center phone visual
 * - Three tips on the left, three on the right
 * - Flexbox layout, responsive
 * - Lots of small "controls" so you can fine‑tune spacing later
 */

// ---------- Controls (tweak freely) ----------
const BG_COLOR = "#E7F4F3"; // section background
const MAX_W = 1200; // content max width in px
const SECTION_Y_PAD_VH = 10; // vertical padding for the section

// Phone visual controls
const PHONE_SRC = "/0001.png"; // TODO: replace with your actual phone image path
const PHONE_ROT_DEG = -12; // tilt
const PHONE_WIDTH_CLAMP = "clamp(220px,24vw,460px)"; // responsive size
const PHONE_DROP_SHADOW = "0 20px 60px rgba(0,0,0,0.25)";

// Columns
const COL_GAP_CLAMP = "clamp(24px,3vw,48px)"; // gap between side columns and phone
const SIDE_COL_BASIS = "30%"; // width of each side column on desktop

// Card look & spacing
const CARD_BG = "#FFFFFF";
const CARD_RADIUS = 16; // px
const CARD_SHADOW = "0 6px 24px rgba(0,0,0,0.08)";
const CARD_BORDER = "1px solid rgba(0,0,0,0.06)";
const CARD_PAD_CLAMP = "clamp(14px,1.2vw,18px)";
const CARD_GAP_REM = 1.0; // vertical gap between cards in a column

// Stagger (vertical offsets) for cards to mimic the comp
const LEFT_Y_OFFSETS_REM = [0, 1.25, 2.5];
const RIGHT_Y_OFFSETS_REM = [1.25, 0, 2.5];

// Headline
const H1_SIZE = "clamp(24px,3.2vw,42px)";

// CTA under phone
const SHOW_CTA = false;
const CTA_TEXT = "Get 5 Day Free Trial";

// ---------- Data ----------
const FEATURES: Array<{ id: string; text: string }> = [
  { id: "01", text: "Turn your WhatsApp into an AI Chatbot" },
  { id: "02", text: "Send Voice Notes with cloned voices" },
  { id: "03", text: "Automate WhatsApp Groups and extract members" },
  { id: "04", text: "Send Bulk Messages with message variations to avoid spam" },
  { id: "05", text: "Send Buttons and save replies" },
  { id: "06", text: "Connect Multiple Numbers and assign to staff" },
];

export default function Features() {
  const left = useMemo(() => FEATURES.slice(0, 3), []);
  const right = useMemo(() => FEATURES.slice(3), []);

  return (
    <section
      id="features"
      className="w-screen"
      aria-label="Wazzap key features"
      style={{ backgroundColor: BG_COLOR, padding: `${SECTION_Y_PAD_VH}vh 0` }}
    >
      <div className="mx-auto px-[4vw]" style={{ maxWidth: MAX_W }}>
        <h2 className="font-display font-extrabold text-[#103B36] tracking-[-0.01em]" style={{ fontSize: H1_SIZE }}>
          Wazzap Key Features
        </h2>

        {/* 3 columns: left tips, phone, right tips */}
        <div
          className="relative mt-6 md:mt-8 flex flex-wrap md:flex-nowrap items-start justify-center"
          style={{ gap: COL_GAP_CLAMP }}
        >
          {/* Left column */}
          <div className="flex shrink-0 grow-0 basis-full md:basis-[30%] md:max-w-[30%] flex-col"
               style={{ gap: `${CARD_GAP_REM}rem` }}>
            {left.map((f, i) => (
              <FeatureCard key={f.id} id={f.id} text={f.text} mtRem={LEFT_Y_OFFSETS_REM[i] || 0} />
            ))}
          </div>

          {/* Phone visual */}
          <div className="shrink-0 grow-0 basis-full md:basis-[40%] md:max-w-[40%] flex flex-col items-center">
            <div
              className="relative rounded-[28px] overflow-visible"
              style={{ width: PHONE_WIDTH_CLAMP, transform: `rotate(${PHONE_ROT_DEG}deg)`, filter: `drop-shadow(${PHONE_DROP_SHADOW})` }}
            >
              {/* Use next/image if you have the asset; fallback to <img> otherwise */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={PHONE_SRC} alt="App on phone" className="w-full h-auto" />
            </div>

            {SHOW_CTA && (
              <div className="mt-6 flex items-center gap-3">
                <a
                  href="#trial"
                  className="inline-flex items-center rounded-full bg-[#D9FF5B] text-[#0B3F3B] font-semibold px-5 py-2 shadow"
                >
                  {CTA_TEXT}
                </a>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0B3F3B] text-white/90"
                >
                  <span className="sr-only">More</span>●
                </button>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex shrink-0 grow-0 basis-full md:basis-[30%] md:max-w-[30%] flex-col"
               style={{ gap: `${CARD_GAP_REM}rem` }}>
            {right.map((f, i) => (
              <FeatureCard key={f.id} id={f.id} text={f.text} mtRem={RIGHT_Y_OFFSETS_REM[i] || 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Small presentational component ----------
function FeatureCard({ id, text, mtRem = 0 }: { id: string; text: string; mtRem?: number }) {
  return (
    <div
      className="relative"
      style={{ marginTop: `${mtRem}rem` }}
    >
      <div
        className="rounded-2xl"
        style={{
          background: CARD_BG,
          borderRadius: CARD_RADIUS,
          boxShadow: CARD_SHADOW,
          border: CARD_BORDER,
          padding: CARD_PAD_CLAMP,
        }}
      >
        <div className="text-[clamp(12px,1.1vw,14px)] text-[#9EB0AE] font-extrabold">{id}</div>
        <div className="mt-1 text-[clamp(16px,1.45vw,19px)] font-extrabold text-[#103B36] leading-[1.15]">
          {text}
        </div>
      </div>
    </div>
  );
}
