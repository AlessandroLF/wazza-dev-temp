"use client";

import { useEffect, useRef, useState } from "react";
import PillButton from "./pill-button";

const BG = "#E7F4F3";
const LIME = "#D9FF5B";

export default function CommunityHeroFullScreen() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // pick desktop/mobile video
  useEffect(() => {
    const update = () =>
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // hide global sticky CTA while section is on screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const toggle = (v: boolean) =>
      document.body.classList.toggle("cta-docked", v);
    const io = new IntersectionObserver(
      (entries) => toggle(entries[0]?.isIntersecting ?? false),
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      toggle(false);
    };
  }, []);

  // lock scroll and hide sticky while modal open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("cta-docked");
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const videoSrc = isMobile
    ? "/hero/video-mobile.mp4"
    : "/hero/video-desktop.mp4";

  return (
    <>
      <section
        ref={sectionRef}
        id="community"
        className="w-screen"
        style={{ backgroundColor: BG, minHeight: "100svh" }}
      >
        {/* 2-row layout: header (auto) + card (fills remaining height) */}
        <div className="mx-auto grid h-[100svh] w-full grid-rows-[auto,1fr] gap-4 px-[4vw] py-6">
          {/* Header block */}
          <div className="grid grid-cols-1 gap-2 items-end md:grid-cols-3">
  <h2 className="md:col-span-3 font-display font-extrabold leading-[1.05] text-[#0B3F3B] text-[clamp(26px,4.6vw,56px)]">
    <span className="block">Learn Now to Build</span>
    <span className="block">Your Whatsapp</span>
    <span className="block">Marketing Agency</span>
  </h2>

  <p className="md:col-span-3 mt-1 text-center text-[#0B3F3B]/85 font-semibold leading-snug text-[clamp(16px,1.6vw,22px)]">
    <span className="block">How to launch, market,</span>
    <span className="block">sell and deliver</span>
  </p>
</div>

          {/* Card row — fills leftover height */}
          <div className="relative mx-auto h-full w-full overflow-hidden rounded-[22px] shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            {/* Clickable image background */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Play promo video"
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/video.png"
                alt=""
                className="h-full w-full select-none object-cover"
                draggable={false}
              />
              {/* subtle dim to match mock */}
              <span className="pointer-events-none absolute inset-0 bg-black/25" />
            </button>

            {/* Play button (top-left) */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="absolute left-5 top-5 grid h-[54px] w-[54px] place-items-center rounded-full shadow-lg"
              style={{ backgroundColor: LIME }}
              aria-label="Play promo video"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-[#0B3F3B]"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            {/* Pill CTA centered at bottom */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
              <PillButton>Join Our Community</PillButton>
            </div>

            {/* hairline inner border (optional) */}
            <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      {/* Full-screen video modal (X on top, NO controls) */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black">
          {/* Close button sits above video */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-[110] grid h-10 w-10 place-items-center rounded-full bg-white/90 text-black"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.4 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.29z" />
            </svg>
          </button>

          <video
            key={videoSrc}
            src={videoSrc}
            className="absolute inset-0 z-[105] h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            // controls removed on purpose
          />
        </div>
      )}
    </>
  );
}
