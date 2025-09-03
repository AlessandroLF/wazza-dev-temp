import type React from "react"

interface HappyFaceIconProps {
  className?: string
}

export const HappyFaceIcon: React.FC<HappyFaceIconProps> = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Circle for the face */}
      <circle cx="12" cy="12" r="9" />

      {/* Eyes */}
      <circle cx="8.5" cy="9" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="9" r="1.5" fill="currentColor" />

      {/* Simple smile */}
      <path d="M8.5 14a3.5 3.5 0 0 0 7 0" />

      {/* Tongue sticking out beyond the circle */}
      <line x1="12" y1="14" x2="12" y2="22" strokeWidth="2.5" />
    </svg>
  )
}
