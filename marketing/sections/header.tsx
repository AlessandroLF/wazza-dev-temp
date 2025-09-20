"use client";

import LanguageButton from "./language-button";

export default function Header() {
  return (
    <header className="w-full">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <a href="/" aria-label="Wazzap home">
          <img
            src="/header-logo.svg"
            alt="wazzap!!"
            className="h-10 w-auto"
            draggable={false}
          />
        </a>

        {/* Right-side actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language picker (circular flag) */}
          <LanguageButton />

          {/* Video Promo: circle on mobile, pill on >=sm */}
          <a
            href="#video"
            aria-label="Play promo video"
            className={[
              // mobile: only the lime circle shows (no pill chrome)
              "group inline-flex items-center rounded-full",
              "sm:bg-white sm:pl-2 sm:pr-4 sm:py-1.5",
              "sm:shadow-[0_4px_20px_rgba(0,0,0,0.12)]",
            ].join(" ")}
          >
            {/* Lime circle with play icon (always visible) */}
            <span
              className={[
                "grid size-9 place-items-center rounded-full",
                "bg-[#E7FB62] text-[#282828]",
                "transition-transform duration-200 group-hover:scale-105",
                "sm:mr-2",
              ].join(" ")}
            >
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
                <path d="M0 0l10 6-10 6V0z" />
              </svg>
            </span>

            {/* Label only on >=sm */}
            <span className="hidden sm:inline font-semibold text-[#09403C]">
              Video Promo
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
