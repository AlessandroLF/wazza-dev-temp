"use client";

import { useId, useState } from "react";

const BG = "#0B3F3B";
const LIME = "#D9FF5B";

type FaqItem = { q: string; a: string[] };

const ITEMS: FaqItem[] = [
  {
    q: "Is Wazzap using the official WhatsApp API?",
    a: [
      "No, Wazzap does not use the official WhatsApp API. However, this allows us to offer a unique advantage — sending unlimited WhatsApp messages at a flat fee, without any additional costs.",
    ],
  },
  {
    q: "How does Wazzap ensure safety and prevent number bans or spam issues?",
    a: [
      "Wazzap provides safety measures to mitigate the risk of number bans or spam. You can connect up to 5 WhatsApp numbers in one subaccount and easily switch the sending number.",
      "Additionally, our spintax feature allows you to create message variations, reducing the chances of being marked as spam. It’s important to note that while there is a risk of number bans, our community group can provide valuable insights on how to avoid them. (Join here)",
    ],
  },
  {
    q: "Is there a risk of getting my number banned with Wazzap?",
    a: [
      "There is a risk of number bans as Wazzap does not use the official WhatsApp API. However, by following best practices such as warming up your number and leveraging the advice and experiences shared in our community group, you can minimize this risk and ensure a stable and successful messaging strategy.",
    ],
  },
  {
    q: "How does the GHL conversation tab work with Wazzap?",
    a: [
      "With Wazzap, the GHL conversation tab is designed to replace SMS functionality. You can still utilize variables for appointment reminders, just as you would in a typical SMS workflow. Instead of sending an SMS, Wazzap sends a WhatsApp message, offering a more convenient and engaging communication channel for your customers.",
    ],
  },
  {
    q: "Can Wazzap integrate with ChatGPT to create a bot easily?",
    a: [
      "Absolutely! Wazzap offers seamless integration with ChatGPT, allowing you to effortlessly create a bot using the power of AI. Simply provide your OpenAI API key, and you'll be able to leverage ChatGPT's capabilities to build intelligent conversational experiences. Additionally, Wazzap enables you to reply with voice notes and transcribe them in your preferred language, enhancing the interactive nature of your bot.",
    ],
  },
  {
    q: "Can I connect a number to Gohighlevel while using Wazzap?",
    a: [
      "Absolutely! With Wazzap, you can seamlessly connect your number (Leadconnector or Twilio) to Gohighlevel. This integration enables you to make and receive phone calls as usual but you CAN'T send SMS anymore. Additionally, Wazzap enhances the functionality of Gohighlevel's missed call text back feature by sending a WhatsApp message instead of an SMS. This offers a more convenient and engaging communication experience for your customers. Moreover, Wazzap empowers you to leverage webhooks and allows you to respond to incoming WhatsApp calls with automated messages. Yes, you can even handle Missed WhatsApp calls with Wazzap!",
    ],
  },
];

export default function FAQ() {
  // Start with everything closed
  const [open, setOpen] = useState<number>(-1);

  const mid = Math.ceil(ITEMS.length / 2);
  const left = ITEMS.slice(0, mid);
  const right = ITEMS.slice(mid);

  return (
    <section id="faq" className="w-screen" style={{ backgroundColor: BG }}>
      <div className="mx-auto max-w-[1200px] px-[4vw] py-[8vh]">
        <h2 className="mb-12 text-center font-display font-extrabold leading-[1.02] text-white text-[clamp(34px,6vw,72px)]">
          Frequently Asked <span style={{ color: LIME }}>Questions</span>
        </h2>

        <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
          <Column items={left} startIndex={0} open={open} onToggle={setOpen} />
          <Column items={right} startIndex={left.length} open={open} onToggle={setOpen} />
        </div>
      </div>
    </section>
  );
}

function Column({
  items, startIndex, open, onToggle,
}: {
  items: FaqItem[]; startIndex: number; open: number; onToggle: (i: number) => void;
}) {
  return (
    <div className="flex flex-col">
      {items.map((it, i) => {
        const idx = startIndex + i;
        const isOpen = open === idx;
        return (
          <FaqRow
            key={idx}
            idx={idx}
            item={it}
            isOpen={isOpen}
            onToggle={() => onToggle(isOpen ? -1 : idx)}
          />
        );
      })}
    </div>
  );
}

function FaqRow({
  idx, item, isOpen, onToggle,
}: {
  idx: number; item: FaqItem; isOpen: boolean; onToggle: () => void;
}) {
  const uid = useId();
  const panelId = `faq-panel-${idx}-${uid}`;
  const LIME = "#D9FF5B";

  return (
    <div className="border-b border-white/15">
      {/* Header */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
        className="group flex w-full items-center justify-between gap-8 py-6 text-left"
      >
        <h3
          className="font-extrabold leading-tight text-[clamp(18px,3vw,34px)]"
          style={{ color: isOpen ? LIME : "#FFFFFF" }}
        >
          {item.q}
        </h3>

        {/* perfect circle arrow */}
        <span
          className="shrink-0 grid place-items-center aspect-square rounded-full transition-all"
          style={{
            width: 56,
            height: 56,
            backgroundColor: isOpen ? "transparent" : LIME,
            boxShadow: isOpen ? `inset 0 0 0 2px ${LIME}` : "0 8px 22px rgba(0,0,0,0.28)",
            borderRadius: 9999,
          }}
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/arrow.svg"
            alt=""
            className="h-[18px] w-[18px] select-none transition-transform"
            style={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}
            draggable={false}
          />
        </span>
      </button>

      {/* Answer – clipper prevents any peek when closed */}
      <div
        id={panelId}
        className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        {/* clipper has NO padding; inner content holds padding */}
        <div className="min-h-0 overflow-hidden" aria-hidden={!isOpen}>
          <div className="pt-4 pb-6 pr-16 text-white/90 text-[clamp(14px,1.4vw,18px)] leading-relaxed space-y-3">
            {item.a.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
