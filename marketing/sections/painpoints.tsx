"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// Lazy-load the heavy inner once in view (no SSR).
const Inner = dynamic(() => import("./painpoints-inner"), { ssr: false });

export default function Painpoints() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShow(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "200px 0px" } // mount just before it appears
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id="painpoints"
      className="relative w-full bg-[#0C3F3B] text-white"
      aria-label="Connect any WhatsApp in 3 simple steps"
    >
      {show ? <Inner /> : (
        // reserve some space so layout doesn't jump
        <div className="mx-auto max-w-[1400px] px-6 py-[16vh]">
          <h2 className="font-display text-[clamp(24px,4vw,44px)] font-extrabold text-white/90">
            Connect any WhatsApp in 3 Simple Steps
          </h2>
        </div>
      )}
    </section>
  );
}
