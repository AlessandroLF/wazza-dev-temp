// sticky-cta.tsx
"use client";
import { useEffect, useState } from "react";
import FormModal from "./form-modal";
import PillButton from "./pill-button";

type Props = { forceShow?: boolean };

export default function StickyCTA({ forceShow }: Props) {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined" && !document.body.classList.contains("is-preloading")) setShow(true);
    const onDone = () => setShow(true);
    window.addEventListener("wazzap:preloader:done", onDone);

    // watch body class for docking
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
      <div
        className={[
          "fixed inset-x-0 bottom-[max(env(safe-area-inset-bottom),16px)] z-[55] flex justify-center transition-all duration-300",
          visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none",
        ].join(" ")}
      >
        <PillButton onClick={() => setOpen(true)}>Get 5 Day Free Trial</PillButton>
      </div>

      <FormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
