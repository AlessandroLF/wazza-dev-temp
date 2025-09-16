"use client";

import { useMemo, useState } from "react";
import type { FlagMeta } from "@/lib/flags";

type Props = {
  open: boolean;
  flags: FlagMeta[];
  selected: FlagMeta | null;
  onSelect: (f: FlagMeta) => void;
  onClose: () => void;
};

export default function FlagPicker({ open, flags, selected, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const base = query
      ? flags.filter(
          (f) =>
            f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.slug.toLowerCase().includes(query.toLowerCase()) ||
            f.id.includes(query)
        )
      : flags;
    return base.slice(0, 300);
  }, [flags, query]);

  if (!open) return null;

  return (
    <div
      className="
        absolute right-0 z-50 mt-2 w-[min(420px,92vw)]
        rounded-2xl border border-white/10 bg-white/95 backdrop-blur
        shadow-[0_24px_60px_rgba(0,0,0,0.20)]
      "
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
    >
      {/* Search */}
      <div className="p-3 border-b border-black/5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search language or country"
          className="
            h-10 w-full rounded-full border border-black/10 bg-white px-4
            text-sm text-[#0b3f3a] placeholder:text-[#0b3f3a]/50
            focus:outline-none focus:ring-2 focus:ring-[#E7FB62]
          "
        />
      </div>

      {/* List */}
      <div role="listbox" aria-label="Select language / flag" className="max-h-[56vh] overflow-auto p-2">
        {list.map((f) => {
          const active = f.src === selected?.src;
          return (
            <button
              key={f.src}
              type="button"
              onClick={() => onSelect(f)}
              className={[
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
                active ? "bg-[#E7FB62] text-[#282828]" : "hover:bg-black/5 text-[#0b3f3a]",
              ].join(" ")}
            >
              {/* Flag circle */}
              <span className="relative inline-flex h-8 w-8 overflow-hidden rounded-full ring-1 ring-black/10">
                <img
                  src={f.src}
                  alt={f.name}
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              </span>

              <span className="text-sm font-medium">{f.name}</span>
              <span className="ml-auto text-[11px] text-black/40">{`${f.id}-${f.slug}`}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
