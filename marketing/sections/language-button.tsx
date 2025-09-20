"use client";

import { useEffect, useRef, useState } from "react";

type FlagMeta = { id: string; slug: string; name: string; src: string };

export default function LanguageButton() {
  const [open, setOpen] = useState(false);
  const [flags, setFlags] = useState<FlagMeta[]>([]);
  const [selected, setSelected] = useState<FlagMeta | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/flags");
      const data: FlagMeta[] = await res.json();
      setFlags(data);
      const uk = data.find((f) => f.slug.includes("united-kingdom")) ?? data[0];
      setSelected(uk || null);
    })();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative">
      {/* Give the button a BASE size so it's visible on mobile */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change language"
        className="
          relative size-[34px] overflow-hidden rounded-full   /* base size */
          sm:size-[35px]
          bg-white ring-[6px] ring-white/95
          shadow-[0_4px_20px_rgba(0,0,0,0.12)]
          leading-none
        "
      >
        <img
          src={selected?.src || "/flags/260-united-kingdom.svg"}
          alt=""
          draggable={false}
          className="
            absolute inset-y-0 left-1/2 -translate-x-1/2
            h-full w-auto max-w-none object-cover block
            scale-[1.5]
          "
        />
      </button>

      {/* Simple dropdown */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
          <div className="max-h-64 overflow-y-auto">
            {flags.map((f) => (
              <button
                key={f.id}
                className="flex w-full items-center gap-3 px-3 py-2.5 hover:bg-[#EBF6F6]"
                onClick={() => {
                  setSelected(f);
                  setOpen(false);
                }}
              >
                <div className="h-7 w-7 overflow-hidden rounded-full ring-1 ring-black/10">
                  <img
                    src={f.src}
                    alt=""
                    className="block h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
                <span className="text-sm font-medium text-[#09403C]">{f.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
