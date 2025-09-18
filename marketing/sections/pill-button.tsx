"use client";
import { ReactNode } from "react";

type Props = {
  className?: string;
  onClick?: () => void;
  children: ReactNode;
};

export default function PillButton({ className = "", onClick, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group inline-flex items-center gap-3 rounded-full bg-[#E7FB62] px-6 py-3",
        "text-[#282828] font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.2)]",
        className,
      ].join(" ")}
      style={{ backgroundColor: "#E7FB62" }}
    >
      <span>{children}</span>
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-full bg-[#282828] text-white transition-transform group-hover:translate-x-0.5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
      </span>
    </button>
  );
}
