"use client";

/**
 * compare.tsx – Feature comparison table
 * Assets expected:
 *  - /features/yes.svg
 *  - /features/no.svg
 *  - /header-logo.svg  (brand mark for the last column header)
 */

import { useMemo } from "react";

// ---------- Controls ----------
const SECTION_BG = "#0B3F3B"; // matches the site’s dark teal
const MAX_W = 1200; // px
const Y_PAD_VH = 8; // vertical padding for the section

const GRID_COL_GAP = "clamp(16px,2.2vw,28px)";
const ROW_GAP = 10; // px vertical gap between rows
const CELL_PAD_Y = 14; // px
const CELL_PAD_X = 14; // px

const RADIUS = 12; // card/cell rounding for header & first column cards
const HEADER_BG = "rgba(255,255,255,0.08)";
const HEADER_TEXT = "#F1FFF2";
const BORDER = "1px solid rgba(255,255,255,0.08)";

const YES_ICON = "/features/yes.svg";
const NO_ICON = "/features/no.svg";
const BRAND_LOGO = "/header-logo.svg";

// Column labels
const COL_LABELS = { left: "Compare us with other companies", c1: "AppLevel", c2: "WaGHL", c3: "" };

// ---------- Data (edit freely) ----------
// NOTE: Booleans below are placeholders so you can quickly tweak copy/marks in one place.
const ROWS = [
  { label: "Unlimited Whatsapp Messages", c1: true,  c2: true,  c3: true },
  { label: "Connecting multiple numbers",  c1: true,  c2: true,  c3: true },
  { label: "Whitelabel Dashboard",       c1: true,  c2: true,  c3: true },
  { label: "Integration with Highlevel CRM", c1: true, c2: true, c3: true },
  { label: "Send Voicenotes with cloned voices", c1: false, c2: false, c3: true },
  { label: "Integration with n8n",       c1: false,  c2: false, c3: true },
  { label: "Integration with Chatwoot CRM", c1: false, c2: false, c3: true },
  { label: "Whatsapp Groups Automations", c1: false, c2: false, c3: true },
  { label: "Extract Group Members",      c1: false, c2: false, c3: true },
  { label: "Bulk Messages with Spintax to avoid bans", c1: false, c2: false, c3: true },
  { label: "Add your own Proxy to avoid bans", c1: false, c2: false, c3: true },
  { label: "Sending Buttons in Message", c1: false, c2: false, c3: true },
];

export default function Compare() {
  const header = useMemo(() => COL_LABELS, []);
  return (
    <section id="compare" className="w-screen" style={{ backgroundColor: SECTION_BG, padding: `${Y_PAD_VH}vh 0` }}>
      <div className="mx-auto px-[4vw]" style={{ maxWidth: MAX_W }}>
        {/* Headline */}
        <h2 className="font-display font-extrabold leading-tight text-white text-[clamp(24px,3.4vw,44px)]">
          It’s Time to <span className="text-[#D9FF5B]">Level Up</span>
          <br />Your Whatsapp Marketing!
        </h2>

        {/* Table Wrapper */}
        <div className="mt-6 md:mt-8 rounded-2xl" style={{ border: BORDER }}>
          {/* Header Row */}
          <div
            className="grid items-stretch"
            style={{ gridTemplateColumns: "1.35fr 0.55fr 0.55fr 0.65fr", columnGap: GRID_COL_GAP, background: HEADER_BG, color: HEADER_TEXT }}
          >
            <div className="p-4 md:p-5" style={{ borderRight: BORDER }}>
              <div className="text-[clamp(13px,1.3vw,15px)] opacity-90">{header.left}</div>
            </div>
            <div className="p-4 md:p-5 text-center" style={{ borderRight: BORDER }}>
              <div className="font-extrabold text-[clamp(14px,1.3vw,16px)]">{header.c1}</div>
            </div>
            <div className="p-4 md:p-5 text-center" style={{ borderRight: BORDER }}>
              <div className="font-extrabold text-[clamp(14px,1.3vw,16px)]">{header.c2}</div>
            </div>
            <div className="p-4 md:p-5 text-center">
              {/* brand logo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BRAND_LOGO} alt="Wazzap" className="mx-auto h-[28px] w-auto" />
            </div>
          </div>

          {/* Body Rows */}
          <div className="grid" style={{ gridTemplateColumns: "1.35fr 0.55fr 0.55fr 0.65fr", columnGap: GRID_COL_GAP }}>
            {ROWS.map((r, i) => (
              <div key={i} className="contents">
                {/* Left label cell */}
                <div
                  className="flex items-center"
                  style={{ padding: `${CELL_PAD_Y}px ${CELL_PAD_X}px`, borderRight: BORDER, borderBottom: BORDER }}
                >
                  <span className="text-white/90 text-[clamp(14px,1.35vw,16px)]">{r.label}</span>
                </div>
                {/* AppLevel cell */}
                <CellMark value={r.c1} />
                {/* WaGHL cell */}
                <CellMark value={r.c2} />
                {/* Wazzap cell */}
                <CellMark value={r.c3} />
              </div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <p className="mt-4 text-white/70 text-[clamp(12px,1.05vw,14px)]">...and much more…</p>
      </div>
    </section>
  );
}

// ---------- Small cell component
function CellMark({ value }: { value: boolean }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ padding: `${CELL_PAD_Y}px ${CELL_PAD_X}px`, borderRight: BORDER, borderBottom: BORDER, background: "transparent" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={value ? YES_ICON : NO_ICON}
        alt={value ? "Yes" : "No"}
        className="h-[20px] w-[20px] md:h-[22px] md:w-[22px]"
      />
    </div>
  );
}
