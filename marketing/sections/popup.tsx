"use client";

import { useEffect, useState } from "react";

export default function CommunityPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const close = () => setOpen(false);
  const onPrimary = () => {
    alert("TODO: connect to WhatsApp community");
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-0 bg-black/55 backdrop-blur-[2px]"
        onClick={close}
      />

      {/* Dialog wrapper */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        className="relative z-10 mx-4 w-[min(740px,92vw)] shadow-2xl"
        style={{ aspectRatio: "740 / 500" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Artwork (no crop) */}
        <img
          src="/popup.png"
          alt=""
          aria-hidden
          className="absolute inset-0 z-0 h-full w-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {/* Close button — put it ABOVE everything */}
        <button
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20 grid h-10 w-10 place-items-center rounded-full bg-[#E7FB62] text-[#282828] shadow-lg"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
          </svg>
        </button>

        {/* Overlay content layer (text + CTA) */}
        <div className="absolute inset-0 z-10 grid grid-rows-[1fr_auto] p-[clamp(16px,3vw,32px)]">
          {/* Text block */}
          <div className="pointer-events-none">
            <h2
              id="popup-title"
              className="text-white font-extrabold leading-tight"
              style={{ fontSize: "clamp(22px, 4.2vw, 40px)" }}
            >
              Don&apos;t Forget To <span className="text-[#E7FB62]">Join</span>
              <br />
              Our <span className="text-[#E7FB62]">WhatsApp Group</span>
            </h2>
            <p
              className="mt-4 text-white/90 max-w-[36ch]"
              style={{ fontSize: "clamp(14px, 2.2vw, 18px)" }}
            >
              And never miss important updates
            </p>
          </div>

          {/* CTA (explicitly clickable) */}
          <div className="self-end pointer-events-auto">
            <button
              onClick={onPrimary}
              className="inline-flex items-center rounded-full bg-[#E7FB62] pl-6 pr-2 py-3 text-[#282828] font-semibold shadow-[0_10px_28px_rgba(0,0,0,0.25)]"
              style={{ fontSize: "clamp(14px, 2.2vw, 16px)" }}
            >
              Join Our Exclusive Community!
              <span className="ml-4 grid h-10 w-10 place-items-center rounded-full bg-[#282828] text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
