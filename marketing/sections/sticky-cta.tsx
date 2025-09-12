"use client";

import { useEffect, useState } from "react";
import FormModal from "./form-modal";

type Props = {
  forceShow?: boolean; // optional override
};

export default function StickyCTA({ forceShow }: Props) {
  // start hidden on SSR to avoid hydration mismatch
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // if preloader already finished, show immediately
    if (typeof document !== "undefined" && !document.body.classList.contains("is-preloading")) {
      setShow(true);
    }
    const onDone = () => setShow(true);
    window.addEventListener("wazzap:preloader:done", onDone);
    return () => window.removeEventListener("wazzap:preloader:done", onDone);
  }, []);

  useEffect(() => {
    if (forceShow) setShow(true);
  }, [forceShow]);

  return (
    <>
      <div
        className={[
          "fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),16px)] z-[55] flex justify-center transition-all duration-300",
          show ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group inline-flex items-center gap-3 rounded-full bg-[#EYFB62] px-6 py-3 text-[#282828] shadow-[0_10px_30px_rgba(0,0,0,0.2)] font-semibold"
          style={{ backgroundColor: "#E7FB62" }} // ensure exact lime
        >
          <span>Get 5 Day Free Trial</span>
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-full bg-[#282828] text-white transition-transform group-hover:translate-x-0.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      </div>

      {/* Modal opens on click */}
      <FormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
