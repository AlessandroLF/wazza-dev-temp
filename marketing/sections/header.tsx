"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Flag = { id: string; slug: string; name: string; src: string };

// simple i18n stub; later wire this to your translation system
function useI18n(locale = "en") {
  const dict: Record<string, Record<string, string>> = {
    en: { videoPromo: "Video Promo", language: "Language" },
  };
  const t = (k: string) => dict[locale]?.[k] ?? dict.en[k] ?? k;
  return { t };
}

export default function Header() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [selected, setSelected] = useState<Flag | null>(null);

  const { t } = useI18n("en");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/flags", { cache: "no-store" });
      const data: Flag[] = await res.json();

      if (cancelled) return;

      setFlags(data);
      const uk = data.find((f) => f.id === "260" && f.slug.includes("united-kingdom"));
      setSelected(uk ?? data[0] ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center justify-between text-[#282828]">
      {/* Brand pill with your header logo */}
      <a
        href="/"
      >
        <img src="/header-logo.svg" alt="wazzap!!" className="h-[40px] w-auto" draggable={false} />
      </a>

      <div className="flex items-center gap-3">
        <FlagPicker
          flags={flags}
          value={selected}
          onChange={(f) => setSelected(f)}
          ariaLabel={`${t("language")}${selected ? `: ${selected.name}` : ""}`}
        />

        <a
          href="#video"
          className="inline-flex items-center gap-3 rounded-full bg-[#E7FB62] pl-4 pr-2 py-2 font-semibold shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
        >
          <span>{t("videoPromo")}</span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#282828] text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  );
}

function FlagPicker({
  flags,
  value,
  onChange,
  ariaLabel,
}: {
  flags: Flag[];
  value: Flag | null;
  onChange: (f: Flag) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // virtualization-lite: lazy load in chunks as user scrolls
  const CHUNK = 40;
  const [visibleCount, setVisibleCount] = useState(CHUNK);

  useEffect(() => setVisibleCount(CHUNK), [flags.length, open]); // reset when reopened/list changes

  const visible = useMemo(() => flags.slice(0, visibleCount), [flags, visibleCount]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
        setVisibleCount((c) => Math.min(flags.length, c + CHUNK));
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [open, flags.length]);

  // Close on outside click + ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!open) return;
      const target = e.target as Node;
      if (!btnRef.current?.contains(target) && !listRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div className="relative">
      {/* Button: circle; flag fills fully (sides can crop) */}
      <button
        ref={btnRef}
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className="relative h-10 w-10 rounded-full ring-4 ring-white shadow-[0_4px_18px_rgba(0,0,0,0.18)] overflow-hidden"
      >
        {value && (
          <span
            aria-hidden
            className="absolute inset-0 block bg-center"
            style={{
              backgroundImage: `url(${value.src})`,
              // Force vertical fill; sides may crop:
              backgroundSize: "auto 110%", // try 110–120% if you want a bit more zoom
              backgroundRepeat: "no-repeat",
            }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-64 rounded-xl bg-white shadow-[0_10px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/10 z-[1]"
          role="listbox"
          aria-label="Select language"
        >
          {/* ~5 rows tall */}
          <div ref={listRef} className="max-h-[220px] overflow-auto overscroll-contain">
            {visible.map((f) => (
              <button
                key={`${f.id}-${f.slug}`}
                type="button"
                onClick={() => {
                  onChange(f);
                  setOpen(false);
                }}
                role="option"
                aria-selected={value?.id === f.id && value?.slug === f.slug}
                className={`flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-black/5 ${
                  value?.id === f.id && value?.slug === f.slug ? "bg-black/5" : ""
                }`}
              >
                <div className="h-7 w-7 rounded-full overflow-hidden ring-2 ring-white shadow">
                  <img
                    src={f.src}
                    alt={f.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                </div>
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-xs text-black/50">{f.id}</span>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 text-[11px] text-black/60">Scroll for more…</div>
        </div>
      )}
    </div>
  );
}
