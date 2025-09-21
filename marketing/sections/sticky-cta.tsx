// sticky-cta.tsx
"use client";
import { useEffect, useState } from "react";
import FormModal from "./form-modal";
import PillButton from "./pill-button";

type Props = { forceShow?: boolean; showInlineMobile?: boolean };

export default function StickyCTA({ forceShow, showInlineMobile = true }: Props) {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined" && !document.body.classList.contains("is-preloading")) setShow(true);
    const onDone = () => setShow(true);
    window.addEventListener("wazzap:preloader:done", onDone);

    const updateDocked = () => setDocked(document.body.classList.contains("cta-docked"));
    updateDocked();
    const mo = new MutationObserver(updateDocked);
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => { window.removeEventListener("wazzap:preloader:done", onDone); mo.disconnect(); };
  }, []);

  useEffect(() => { if (forceShow) setShow(true); }, [forceShow]);

  const visible = show && !docked;

  return (
    <>
      {/* Sticky desktop/tablet only */}
      <div
        className={[
          "hidden md:fixed md:inset-x-0 md:bottom-[max(env(safe-area-inset-bottom),16px)] md:z-[55] md:flex md:justify-center md:transition-all md:duration-300",
          visible ? "md:opacity-100 md:translate-y-0 md:pointer-events-auto" : "md:opacity-0 md:translate-y-4 md:pointer-events-none",
        ].join(" ")}
      >
        <PillButton onClick={() => setOpen(true)}>Get 5 Day Free Trial</PillButton>
      </div>

      {/* Inline mobile pill (appears where the component is mounted) */}
      {showInlineMobile && (
        <div className="md:hidden px-[4vw] py-5 max-w-[720px] mx-auto md:overflow-visible">
          <PillButton className="w-full justify-between" onClick={() => setOpen(true)}>
            Get 5 Day Free Trial
          </PillButton>
        </div>
      )}

      <FormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
