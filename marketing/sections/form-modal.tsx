"use client";

import { useCallback, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FormModal({ open, onClose }: Props) {
  // Define hooks BEFORE any conditional returns
  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      alert("TODO: submit free trial form");
      onClose();
    },
    [onClose]
  );

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Safe early return AFTER hooks are declared
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={onClose} />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="free-trial-title"
        className="relative z-10 mx-4 w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Heading */}
        <h2
          id="free-trial-title"
          className="mb-6 text-center font-extrabold leading-tight text-white"
          style={{ fontSize: "clamp(28px,4.2vw,48px)" }}
        >
          Get 5 Day <span className="text-[#E7FB62]">Free Trial</span>
        </h2>

        {/* Gradient border container */}
        <div className="rounded-[32px] bg-[linear-gradient(120deg,#FF7A7A_0%,#FFC36E_40%,#E7FB62_100%)] p-[3px] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="rounded-[28px] bg-[#0b3f3a] px-5 py-6 sm:px-8 sm:py-8">
            {/* Non-cropping illustration above the form (optional) */}
            {/* <img src="/form.png" alt="" className="mx-auto mb-6 max-h-40 w-auto object-contain" /> */}

            <form onSubmit={submit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  required
                  type="text"
                  placeholder="Full Name *"
                  className="h-12 w-full rounded-full bg-white px-5 text-[#0b3f3a] placeholder:text-[#0b3f3a]/50 shadow"
                />

                {/* Preferred language */}
                <div className="relative">
                  <select
                    required
                    className="h-12 w-full appearance-none rounded-full bg-white px-5 pr-12 text-[#0b3f3a] shadow"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Preferred Language *
                    </option>
                    <option>English</option>
                    <option>Spanish</option>
                    <option>Portuguese</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full bg-[#282828] text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  required
                  type="email"
                  placeholder="Agency Email *"
                  className="h-12 w-full rounded-full bg-white px-5 text-[#0b3f3a] placeholder:text-[#0b3f3a]/50 shadow"
                />

                {/* Phone with flag placeholder */}
                <div className="relative flex h-12 items-center rounded-full bg-white pl-12 pr-5 shadow">
                  <span className="absolute left-2 grid h-8 w-8 place-items-center overflow-hidden rounded-full ring-2 ring-[#0b3f3a]/10">
                    <img src="/flags/260-united-kingdom.svg" className="h-full w-auto" alt="" />
                  </span>
                  <input
                    required
                    type="tel"
                    placeholder="Agency Phone number *"
                    className="h-full w-full bg-transparent text-[#0b3f3a] placeholder:text-[#0b3f3a]/50 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="mx-auto flex items-center rounded-full bg-[#E7FB62] px-6 py-3 font-semibold text-[#282828] shadow-[0_12px_28px_rgba(0,0,0,0.25)]"
                >
                  Request a Free Trial
                  <span className="ml-4 grid h-10 w-10 place-items-center rounded-full bg-[#282828] text-white">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Close (X) */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-5 top-5 z-20 grid h-10 w-10 place-items-center rounded-full bg-[#E7FB62] text-[#282828] shadow-lg"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z" />
        </svg>
      </button>
    </div>
  );
}
