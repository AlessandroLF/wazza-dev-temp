"use client";

import { useEffect, useRef, useState } from "react";
import Header from "./header";

type Props = {
  onLoaded?: () => void;
};

export default function Hero({ onLoaded }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [reported, setReported] = useState(false);

  // the displayed width of the image under object-contain
  const [displayWidth, setDisplayWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const fire = () => {
      if (!reported) {
        setReported(true);
        onLoaded?.();
      }
      // compute display width after we know natural sizes
      computeDisplayWidth();
    };

    const computeDisplayWidth = () => {
      if (!el.naturalWidth || !el.naturalHeight) return;
      const iw = el.naturalWidth;
      const ih = el.naturalHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const scale = Math.min(vw / iw, vh / ih); // object-contain
      const shownWidth = iw * scale;
      setDisplayWidth(shownWidth);
    };

    // initial + resize
    const onResize = () => computeDisplayWidth();

    if (el.complete) fire();
    else el.addEventListener("load", fire, { once: true });

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      el && el.removeEventListener("load", fire);
    };
  }, [onLoaded, reported]);

  return (
    <section className="relative w-screen h-[100vh] md:h-[100svh] overflow-hidden bg-[#09403C]">
      {/* Hero image (object-contain; no crop) */}
      <picture className="absolute inset-0 block">
        <source media="(max-width: 640px)" srcSet="/hero/landing-mobile.png" />
        <source media="(max-width: 1024px)" srcSet="/hero/landing-tablet.png" />
        <img
          ref={imgRef}
          src="/hero/landing-desktop.png"
          alt="Hero"
          className="absolute inset-0 block w-full h-full object-contain object-center select-none pointer-events-none"
          draggable={false}
          loading="eager"
          decoding="async"
        />
      </picture>

      {/* Header: child of the hero, same width as displayed image */}
      <div
  className="absolute top-3 left-1/2 -translate-x-1/2 z-[9997] px-2 md:px-4"
  style={displayWidth ? { width: `${displayWidth}px` } : undefined}
>
  <Header />
</div>

    </section>
  );
}
