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

        {/* Right-side actions: Flag + Video Promo */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language picker (circular flag) */}
          <LanguageButton />

          {/* Video Promo pill */}
          <a
            href="#video"
            className="
              group inline-flex items-center rounded-full
              bg-white pl-2 pr-4 py-1.5
              shadow-[0_4px_20px_rgba(0,0,0,0.12)]
            "
          >
            {/* Lime circular cap with play icon */}
            <span
              className="
                mr-2 grid h-8 w-8 place-items-center rounded-full
                bg-[#E7FB62] text-[#282828]
                transition-transform duration-200 group-hover:scale-105
              "
            >
              {/* simple play triangle */}
              <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
                <path d="M0 0l10 6-10 6V0z" />
              </svg>
            </span>
            <span className="font-semibold text-[#09403C]">Video Promo</span>
          </a>
        </div>
      </div>
    </header>
  );
}
