"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

type FlagMeta = { id: string; slug: string; name: string; src: string };

// Minimal phone code mapping (extend as needed)
const PHONE_CODES: Record<string, string> = {
  "united-kingdom": "+44",
  "united-states": "+1",
  "canada": "+1",
  "mexico": "+52",
  "brazil": "+55",
  "spain": "+34",
  "italy": "+39",
  "france": "+33",
  "germany": "+49",
  "india": "+91",
};

function getPhoneCode(slug?: string) {
  if (!slug) return "";
  return PHONE_CODES[slug] ?? "";
}

export default function FormModal({ open, onClose }: Props) {
  const [flags, setFlags] = useState<FlagMeta[]>([]);
  const [selected, setSelected] = useState<FlagMeta | null>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Fetch flags once
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await fetch("/api/flags");
        const data: FlagMeta[] = await res.json();
        setFlags(data);

        // Default to UK if nothing selected yet
        if (!selected) {
          const uk = data.find((f) => f.slug === "united-kingdom") ?? data[0];
          setSelected(uk ?? null);
        }
      } catch (e) {
        console.error("flags fetch failed", e);
      }
    })();
  }, [open, selected]);

  const code = useMemo(() => getPhoneCode(selected?.slug), [selected]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      alert("TODO: submit free trial form");
      onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80]"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="relative w-full max-w-[920px] rounded-[28px] bg-[#0C3F3B] text-white shadow-2xl ring-1 ring-white/10
            pt-8 pb-10 md:pb-12 max-h-[90vh] overflow-auto">
          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-[#E7FB62] text-black shadow-md"
          >
            ✕
          </button>

          {/* Title */}
          <div className="px-6 pb-4 pt-8 sm:px-10">
            <h2 className="text-center font-display text-[clamp(28px,4vw,44px)] font-extrabold">
              Get 5 Day <span className="text-[#E7FB62]">Free Trial</span>
            </h2>
          </div>

          {/* Form body */}
          <form onSubmit={submit} className="px-6 pb-10 sm:px-10
                                              bg-[url('/Rectangle-19.svg')]
                                              bg-no-repeat
                                              bg-center
                                              bg-cover
                                              bg-origin-content
                                              md:bg-[length:870px_auto]
                                              md:bg-[position:-15px_-25px]
                                              p-6">
            <div className="mx-auto max-w-[860px] rounded-[34px] bg-[#0E514B]/40 px-4 py-6 sm:px-8 sm:py-8">
            
              {/* Row 1 */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/90">
                    Full Name *
                  </label>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="w-full rounded-[26px] bg-white px-5 py-4 text-[17px] text-[#222] outline-none ring-1 ring-black/10 placeholder:text-black/40"
                  />
                </div>

                {/* Preferred language (flag button + dropdown; name in field) */}
                <PreferredLanguageField
                  flags={flags}
                  selected={selected}
                  onSelect={setSelected}
                />
              </div>

              {/* Row 2 */}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/90">
                    Agency Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-[26px] bg-white px-5 py-4 text-[17px] text-[#222] outline-none ring-1 ring-black/10 placeholder:text-black/40"
                  />
                </div>

                {/* Phone with flag + code */}
                <PhoneField
                  selected={selected}
                  code={code}
                  value={phone}
                  onChange={setPhone}
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8 grid place-items-center">
              <button
                type="submit"
                className="inline-flex items-center gap-4 rounded-full bg-[#E7FB62] px-8 py-4 text-[18px] font-bold text-[#222] shadow-[0_6px_26px_rgba(0,0,0,0.18)]"
              >
                Request a Free Trial
                <span className="grid size-10 place-items-center rounded-full bg-[#282828] text-white">
                  ➝
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Preferred Language ---------------------------- */

function PreferredLanguageField({
  flags,
  selected,
  onSelect,
}: {
  flags: FlagMeta[];
  selected: FlagMeta | null;
  onSelect: (f: FlagMeta) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !btnRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  // default button final version from you
  const FlagCap = (
    <button
      ref={btnRef}
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-label="Change language"
      className="
        relative overflow-hidden rounded-full
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
  );

  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-semibold text-white/90">
        Preferred Language *
      </label>

      {/* read-only field showing the selected country name */}
      <div className="flex items-center gap-3">
        <input
          value={selected?.name ?? ""}
          readOnly
          placeholder="Select a language"
          className="w-full rounded-[26px] bg-white px-5 py-4 text-[17px] text-[#222] outline-none ring-1 ring-black/10 placeholder:text-black/40"
        />
        {FlagCap}
      </div>

      {/* dropdown */}
      {open && (
        <div
          ref={popRef}
          className="absolute z-50 mt-2 w-full min-w-[320px] overflow-hidden rounded-2xl bg-white p-1 text-[#1b1b1b] shadow-xl ring-1 ring-black/10"
        >
          <div className="max-h-[300px] overflow-auto">
            {flags.map((f) => (
              <button
                key={f.id + f.slug}
                type="button"
                onClick={() => {
                  onSelect(f);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-black/[0.06]"
              >
                <span className="relative overflow-hidden rounded-full size-7 bg-white ring-[3px] ring-white/95">
                  <img
                    src={f.src}
                    alt=""
                    className="absolute inset-y-0 left-1/2 h-full w-auto -translate-x-1/2 scale-[1.35]"
                  />
                </span>
                <span className="text-[15px]">{f.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Phone Field -------------------------------- */

function PhoneField({
  selected,
  code,
  value,
  onChange,
}: {
  selected: FlagMeta | null;
  code: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <label className="mb-2 block text-sm font-semibold text-white/90">
        Agency Phone number *
      </label>

      <div className="relative">
        {/* left prefix: flag + code */}
        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center gap-2">
          <span className="relative overflow-hidden rounded-full size-7 bg-white ring-[3px] ring-white/95">
            <img
              src={selected?.src || "/flags/260-united-kingdom.svg"}
              alt=""
              className="absolute inset-y-0 left-1/2 h-full w-auto -translate-x-1/2 scale-[1.35]"
              draggable={false}
            />
          </span>
          <span className="text-[15px] text-black/70">
            {code || ""}
          </span>
        </div>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="tel"
          placeholder="Agency Phone number *"
          className="
            w-full rounded-[26px] bg-white py-4 pr-5 pl-[86px]
            text-[17px] text-[#222] outline-none ring-1 ring-black/10
            placeholder:text-black/40
          "
          required
        />
      </div>
    </div>
  );
}
