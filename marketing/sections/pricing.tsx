"use client";

import { useEffect, useRef, useState } from "react";
import PillButton from "./pill-button";

/**
 * Pricing – sticky CTA docks into first card + Monthly/Yearly toggle
 * Yearly prices are monthly × 12
 */

// ---------- Controls ----------
const SECTION_BG = "#0B3F3B"; // dark teal
const MAX_W = 1200; // px
const Y_PAD_VH = 10;
const DOCK_ENTER_OFFSET_PX = 120; // start docking slightly before slot fully in view

// Card cosmetics
const CARD_BG = "#FFFFFF";
const CARD_RADIUS = 16; // px
const CARD_BORDER = "1px solid rgba(0,0,0,0.08)";
const CARD_SHADOW = "0 12px 40px rgba(0,0,0,0.10)";

// Base monthly prices (USD)
const BASE_PRICES = [39, 129, 199] as const;

export default function Pricing() {
  const dockSlotRef = useRef<HTMLDivElement | null>(null);
  const [docked, setDocked] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  // Observe the dock slot and toggle body class when it enters
  useEffect(() => {
    const el = dockSlotRef.current;
    if (!el) return;

    const onEntries: IntersectionObserverCallback = (entries) => {
      const isIn = entries[0]?.isIntersecting ?? false;
      setDocked(isIn);
      if (typeof document !== "undefined") {
        document.body.classList.toggle("cta-docked", isIn);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cta-dock-change", { detail: isIn }));
      }
    };

    const io = new IntersectionObserver(onEntries, {
      root: null,
      rootMargin: `0px 0px -${DOCK_ENTER_OFFSET_PX}px 0px`,
      threshold: 1.0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Helpers
  const priceFor = (idx: 0 | 1 | 2) => (billing === "monthly" ? BASE_PRICES[idx] : BASE_PRICES[idx] * 12);
  const unit = billing === "monthly" ? "/month" : "/year";

  return (
    <section id="pricing" className="w-screen" style={{ backgroundColor: SECTION_BG, padding: `${Y_PAD_VH}vh 0` }}>
      <div className="mx-auto px-[4vw]" style={{ maxWidth: MAX_W }}>
        <h2 className="font-display font-extrabold text-white text-center text-[clamp(26px,4vw,52px)]">Pricing</h2>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-white/80">Cancel anytime</p>
          {/* Billing toggle */}
          <div className="inline-flex items-center rounded-full bg-white/10 p-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={["px-4 py-1 rounded-full text-sm font-semibold", billing === "monthly" ? "bg-[#D9FF5B] text-[#0B3F3B]" : "text-white"].join(" ")}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={["px-4 py-1 rounded-full text-sm font-semibold", billing === "yearly" ? "bg-[#D9FF5B] text-[#0B3F3B]" : "text-white"].join(" ")}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Cards row */}
        <div className="mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Card 1 (with dock slot) */}
          <PricingCard title="1 Sub-Account" price={priceFor(0)} unit={unit} features={[
            "Connect 1 Whatsapp’s per subaccount",
            "Unlimited Whatsapp Groups",
            "Unlimited Buttons & Lists",
            "Integration with Chatgpt",
            "Reply Messages with Voice Notes",
            "Whatsapp General Support",
          ]}
          >
            {/* sentinel used by IntersectionObserver */}
            <div ref={dockSlotRef} className="h-1" aria-hidden />
            {/* the pill that “falls into place” */}
            <div className="mt-4 flex justify-center">
              <PillButton
                className={[
                  "transition-all duration-300",
                  docked ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1",
                ].join(" ")}
              >
                5 Day Free Trial
              </PillButton>
            </div>
          </PricingCard>

          {/* Card 2 */}
          <PricingCard title="5 Sub-Accounts" price={priceFor(1)} unit={unit} ribbon="Popular" highlight features={[
            "Connect 5 Whatsapp’s per subaccount",
            "Unlimited Whatsapp Groups",
            "Unlimited Buttons & Lists",
            "Integration with Chatgpt",
            "Reply Messages with Voice Notes",
            "Premium Support",
          ]}
          >
            <div className="mt-4 flex justify-center"><PillButton>Pay Now</PillButton></div>
          </PricingCard>

          {/* Card 3 */}
          <PricingCard title="10 Sub-Accounts" price={priceFor(2)} unit={unit} features={[
            "Connect 10 Whatsapp’s per subaccount",
            "Unlimited Whatsapp Groups",
            "Unlimited Buttons & Lists",
            "Integration with Chatgpt",
            "Reply Messages with Voice Notes",
            "VIP Support",
          ]}
          >
            <div className="mt-4 flex justify-center"><PillButton>Pay Now</PillButton></div>
          </PricingCard>
        </div>
      </div>
    </section>
  );
}

function PricingCard({ title, price, unit, ribbon, highlight = false, features, children }: {
  title: string;
  price: number; // already adjusted for monthly/yearly
  unit: string;  // '/month' | '/year'
  ribbon?: string;
  highlight?: boolean;
  features?: string[];
  children?: React.ReactNode;
}) {
  const priceStr = "$" + price.toLocaleString();
  return (
    <div
      className="relative rounded-2xl p-6 md:p-8"
      style={{
        background: CARD_BG,
        borderRadius: CARD_RADIUS,
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        outline: highlight ? "3px solid #D9FF5B" : undefined,
        outlineOffset: "-3px",
      }}
    >
      {ribbon && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#E7FB62] px-3 py-1 text-[12px] font-semibold text-[#0B3F3B] shadow">
          {ribbon}
        </div>
      )}

      <h3 className="font-display text-[#103B36] font-extrabold text-[clamp(18px,2.2vw,26px)]">{title}</h3>
      <div className="font-display mt-2 text-[#103B36] font-extrabold text-[clamp(32px,4.6vw,56px)]">{priceStr}</div>
      <div className="text-[#103B36] opacity-70">{unit}</div>

      {/* Slot for CTA */}
      {children}

      <h4 className="mt-6 font-extrabold text-[#103B36] text-center">Features</h4>
      {features && <FeaturesList items={features} />}
    </div>
  );
}

function FeaturesList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-2 text-[#103B36]">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-2">
          <span className="mt-1 inline-block h-[6px] w-[6px] rounded-full bg-[#86CF00]" />
          <span className="text-[clamp(13px,1.25vw,15px)]">{t}</span>
        </li>
      ))}
    </ul>
  );
}
