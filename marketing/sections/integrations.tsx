import Image from "next/image";

const logos = [
  { src: "/integrations/highlevel.svg", alt: "HighLevel" },
  { src: "/integrations/chatwoot.svg", alt: "chatwoot" },
  { src: "/integrations/n8n.svg", alt: "n8n" },
  { src: "/integrations/elevenlabs.svg", alt: "ElevenLabs" },
  { src: "/integrations/openai.svg", alt: "OpenAI" },
  { src: "/integrations/google-calendar.svg", alt: "Google Calendar" },
];

export default function Integrations() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="mt-6 sm:mt-10 rounded-[28px] overflow-hidden bg-gradient-to-r
                        from-brand-lime/70 via-brand-lime/30 to-brand-teal/50">
          <div className="px-6 sm:px-10 py-8 sm:py-10 text-center text-white">
            <p className="font-semibold tracking-wide">We integrate with</p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-10 place-items-center">
              {logos.map((l) => (
                <div key={l.src} className="opacity-90">
                  <Image src={l.src} alt={l.alt} width={160} height={40} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
