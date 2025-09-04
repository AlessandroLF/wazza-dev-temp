"use client";
import { useEffect, useRef } from "react";

export default function WazzapFace({ className = "" }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    // ensure a clean restart (helps after SSR/hydration)
    el.classList.remove("play");
    // force reflow, then add .play to kick animations
    void el.getBoundingClientRect();
    el.classList.add("play");
  }, []);


  // Start the animation on hover; keep playing even if mouse leaves
  const handleMouseEnter = () => {
    const el = svgRef.current;
    if (!el) return;
    el.classList.remove("play");      // reset
    // force reflow so animation can restart
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (el as any).offsetWidth;
    el.classList.add("play");
  };

  // When the tongue finishes, drop .play so it can replay next time
  const handleAnimationEnd: React.AnimationEventHandler<SVGSVGElement> = (e) => {
    if ((e.target as Element).id === "tongue") {
      svgRef.current?.classList.remove("play");
    }
  };

  return (
    <div className={className} onMouseEnter={handleMouseEnter}>
      <svg
        ref={svgRef}
        onAnimationEnd={handleAnimationEnd}
        viewBox="0 0 194.05 150"        // ⬅️ trimmed height (no dead bottom space)
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: "block",             // ⬅️ removes inline-svg baseline gap
          overflow: "visible",          // ⬅️ prevents top clipping when it grows
          pointerEvents: "none"         // ⬅️ clicks pass through empty areas
        }}
      >
        <defs>
          <style>
            {`
            .cls-1 { fill: none; stroke-miterlimit: 10; stroke: #020202; }
            .cls-2 { fill: #52f09b; stroke: #060707; stroke-miterlimit: 10; }
            .cls-3 { fill: #ce6583; stroke: #000; stroke-miterlimit: 10; }
            .cls-4 { fill: #043343; stroke: #060707; stroke-miterlimit: 10; }
            .cls-5 { fill: #4342e6; stroke: #020202; stroke-miterlimit: 10; }
            .cls-7 { fill: #060707; stroke-width: 0; }
            .cls-8 { fill: #b8f9d7; stroke-width: 0; }
            .cls-10 { fill: #52f09b; stroke-width: 0; }

            /* keyframes */
            @keyframes wobbleGrow {
              0%   { transform: rotate(0deg) scale(1); }
              12%  { transform: rotate(-3deg) scale(1.04); }
              24%  { transform: rotate(3deg)  scale(1.07); }
              36%  { transform: rotate(-2deg) scale(1.09); }
              48%  { transform: rotate(2deg)  scale(1.10); }
              60%  { transform: rotate(0.5deg) scale(1.06); }
              78%  { transform: rotate(-0.5deg) scale(1.02); }
              100% { transform: rotate(0deg)  scale(1); }
            }
            @keyframes eyeSpiral {
              0%   { transform: rotate(0deg)   scale(1); }
              50%  { transform: rotate(540deg) scale(1.12); }
              100% { transform: rotate(720deg) scale(1); }
            }
            @keyframes tongueCurve {
              0%   { transform: translateX(0)   scaleY(1)    rotate(0deg); }
              30%  { transform: translateX(-4px) scaleY(1.25) rotate(-12deg); }
              60%  { transform: translateX(4px)  scaleY(1.25) rotate(12deg); }
              100% { transform: translateX(0)   scaleY(1)    rotate(0deg); }
            }

            /* geometry + origins (pointer events stay off on the svg) */
            #face, #eyeLeft, #eyeRight, #tongue {
              transform-box: fill-box;
              transform-origin: center;
              pointer-events: auto; /* allow hover visual effects if you add any later */
            }
            #tongue { transform-origin: 50% 0%; }

            /* run animations while .play is on the <svg> */
            .play #face     { animation: wobbleGrow 900ms ease-out 1; }
            .play #eyeLeft,
            .play #eyeRight { animation: eyeSpiral 900ms cubic-bezier(.22,.9,.24,1) 1; }
            .play #tongue   { animation: tongueCurve 900ms ease-in-out 1; }

            @media (prefers-reduced-motion: reduce) {
              .play #face, .play #eyeLeft, .play #eyeRight, .play #tongue { animation: none !important; }
            }
          `}
          </style>
        </defs>

        <g id="face">
          <path className="cls-2" d="m117.79,73.73c0,10.59,4.64,19.42,10.81,21.45-7.52,11.67-19.98,19.37-35.21,19.37s-27.26-7.46-34.38-18.94c7.38-.14,13.34-9.87,13.34-21.88s-6.04-21.88-13.5-21.88c-1.58,0-3.1.44-4.51,1.26C61.58,29.19,81.79,1.59,90.63.52c7.66-.91,33.09,27.28,42.37,51.51-.56-.11-1.13-.18-1.7-.18-7.46,0-13.51,9.8-13.51,21.88Z"/>
          <path className="cls-5" d="m72.36,73.73c0,12.01-5.96,21.74-13.34,21.88h-.15c-7.46,0-13.51-9.8-13.51-21.88,0-9.52,3.75-17.61,9-20.63,1.41-.81,2.94-1.26,4.51-1.26,7.46,0,13.5,9.8,13.5,21.88Z"/>
          <path className="cls-5" d="m144.79,73.73c0,12.09-6.04,21.88-13.5,21.88-.93,0-1.82-.15-2.69-.43-6.18-2.03-10.81-10.87-10.81-21.45,0-12.09,6.05-21.88,13.51-21.88.57,0,1.14.06,1.7.18,6.66,1.35,11.79,10.55,11.79,21.71Z"/>

          <path className="cls-4" d="m77.43,92.23c-3.92,0-6.72,3.08-5.43,6.04,3.13,7.15,11.3,7.49,21.32,7.49s18.89-.34,22.02-7.49c1.29-2.95-1.51-6.04-5.43-6.04h-32.48Z"/>

          <g id="eyeLeft">
            <path className="cls-1" d="m45.41,71.58c1.3-8.51,7.76-14.32,14.1-12.58,5.07,1.4,8.33,8.05,7.29,14.86-.83,5.45-4.79,8.95-8.85,7.83-3.24-.9-5.33-5.15-4.66-9.51.53-3.49,3.07-5.73,5.66-5.01,2.07.57,3.41,3.3,2.99,6.09-.34,2.23-1.96,3.67-3.62,3.21-1.33-.37-2.18-2.11-1.91-3.9.22-1.43,1.26-2.35,2.32-2.05"/>
          </g>
          <g id="eyeRight">
            <path className="cls-1" d="m144.7,71.31c-1.3-8.51-7.76-14.32-14.1-12.58-5.07,1.4-8.33,8.05-7.29,14.86.83,5.45,4.79,8.95,8.85,7.83,3.24-.9,5.33-5.15,4.66-9.51-.53-3.49-3.07-5.73-5.66-5.01-2.07.57-3.41,3.3-2.99,6.09.34,2.23,1.96,3.67,3.62,3.21,1.33-.37,2.18-2.11,1.91-3.9-.22-1.43-1.26-2.35-2.32-2.05"/>
          </g>

          <g id="tongue">
            <path className="cls-3" d="m81.07,104.77c-.71-.15-.99-1.03-.5-1.57,3.24-3.53,14.28-13.21,28.45-.38,13.52,12.25,6.13,23.76,2.59,27.91-1.46,1.71-3.5,2.87-5.75,3-1.32.08-3.62-.15-4.77-1.56-2.97-3.64,2.11-9.68,2.2-17.13.06-5.32-4.41-9.59-9.73-9.56-3.89.02-9.39-.08-12.49-.72Z"/>
            <path className="cls-1" d="m88.34,97.66s11.48-2.27,19.33,8.65c4.06,5.65,4.02,13.31-.06,18.95-.3.41-.61.83-.95,1.26"/>
          </g>

          <g>
            <path className="cls-10" d="m91.4,15.14s9.43,24.58,5.48,36.71"/>
            <path className="cls-7" d="m91.86,14.96c3.56,10.69,8.16,25.84,5.05,36.9,0,0-.06-.02-.06-.02,2.81-11.12-2.12-25.94-5.92-36.52,0,0,.93-.36.93-.36h0Z"/>
          </g>
          <circle className="cls-8" cx="71.52" cy="34.42" r="2.41"/>
          <circle className="cls-8" cx="66.69" cy="41.61" r="2.41"/>
          <circle className="cls-8" cx="74.49" cy="42.7" r="2.41"/>
        </g>
      </svg>
    </div>
  );
}

