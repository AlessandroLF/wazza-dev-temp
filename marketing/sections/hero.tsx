"use client";

import { useEffect, useState } from "react";
import Header from "./header";

type Props = { onLoaded?: () => void };

export default function Hero({ onLoaded }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const videoSrc = isMobile ? "/hero/video-mobile.mp4" : "/hero/video-desktop.mp4";

  return (
    <section className="relative w-full">
      {/* Header (as-is) */}
      <div className="absolute left-0 right-0 top-4 z-[30] px-4 md:px-6">
        <Header />
      </div>

      {/* Stage */}
      <div className="relative w-screen h-[min(100svh,900px)]">
        {/* Background video */}
        <video
          key={videoSrc}
          className="absolute inset-0 h-full w-full object-cover"
          src={videoSrc}
          autoPlay
          muted
          playsInline
          loop
          poster="/hero/landing-desktop.png"
          onLoadedData={() => onLoaded?.()}
        />

        {/* Left-to-right shade for text legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />

        {/* TEXTS (unchanged) */}
        <div className="absolute z-20 left-0 right-0 px-6 sm:px-10 md:px-12 lg:px-16 top-[14vh]">
          {/* Headline */}
          <div className="max-w-[820px] pt-1">
            <h1
              className="
                font-display font-extrabold text-white tracking-[-0.01em]
                leading-[0.83]
                text-[clamp(30px,5vw,70px)]
              "
            >
              <span className="block">
                Turn <span className="text-[#E7FB62]">Any</span>
              </span>
              <span className="block">WhatsApp Into</span>
              <span className="block">an AI Assistant</span>
              <span className="block">in Seconds</span>
            </h1>
          </div>

          {/* Secondary copy */}
          <div className="mt-[14vh] sm:mt-[15vh] md:mt-[23vh] max-w-[640px]">
            <p
              className="
                text-white/95 font-sans font-semibold leading-[1.16]
                text-[clamp(16px,2vw,26px)]
              "
            >
              <span className="block">Just scan a QR code and</span>
              <span className="block">plug into your favorite CRM</span>
              <span className="block">– automation made simple</span>
            </p>
          </div>
        </div>

        {/* Integrations (unchanged) */}
        <div className="absolute bottom-10 left-1/2 z-20 -translate-x-1/2 w-full px-6">
          <div className="mx-auto">
            <div className="flex flex-col items-center gap-4">
              <p className="text-white/95 font-semibold tracking-[0.02em] text-[clamp(16px,2.1vw,28px)]">
                We integrate with
              </p>
              <div className="w-full flex flex-wrap items-center justify-evenly gap-x-14 gap-y-8 opacity-95">
                <img src="/integrations/highlevel.svg" alt="HighLevel" className="h-[38px] sm:h-[46px] md:h-[56px] w-auto" draggable={false}/>
                <img src="/integrations/chatwoot.svg"  alt="chatwoot"   className="h-[38px] sm:h-[46px] md:h-[56px] w-auto" draggable={false}/>
                <img src="/integrations/n8n.svg"       alt="n8n"        className="h-[34px] sm:h-[42px] md:h-[50px] w-auto"  draggable={false}/>
                <img src="/integrations/elevenlabs.svg" alt="ElevenLabs" className="h-[38px] sm:h-[46px] md:h-[56px] w-auto" draggable={false}/>
                <img src="/integrations/openai.svg"     alt="OpenAI"     className="h-[38px] sm:h-[46px] md:h-[56px] w-auto" draggable={false}/>
                <img src="/integrations/google-calendar.svg" alt="Google Calendar" className="h-[38px] sm:h-[46px] md:h-[56px] w-auto" draggable={false}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
