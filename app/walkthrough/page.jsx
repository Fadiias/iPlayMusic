"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    title: "Where Words Fail,\nMusic Speaks",
    subtitle: "Vivamus auctor dui dignissim, sollicitudin nunc ac, aliquam justo. Vestibulum pellentesque lacinia eleifend.",
  },
  {
    title: "No Music\nNo Life",
    subtitle: "Vivamus auctor dui dignissim, sollicitudin nunc ac, aliquam justo. Vestibulum pellentesque lacinia eleifend.",
  },
  {
    title: "Peace.Love\nMusic",
    subtitle: "Vivamus auctor dui dignissim, sollicitudin nunc ac, aliquam justo. Vestibulum pellentesque lacinia eleifend.",
  },
];

export default function WalkthroughPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FF6A00] to-[#EE0979] flex flex-col items-center justify-center px-6">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-[325px]">
        <h2 className="text-[24px] font-bold leading-[32px] text-white text-center whitespace-pre-line mb-6">
          {current.title}
        </h2>
        <p className="text-[15px] font-light leading-[22px] text-white text-center">
          {current.subtitle}
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-4 mb-8">
        {STEPS.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`w-[75px] h-[75px] rounded-full border-[3px] transition-all ${
              i === step
                ? "bg-white border-white"
                : "bg-transparent border-white"
            }`}
          >
            {i === 0 && (
              <svg className="w-8 h-8 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            )}
            {i === 1 && (
              <svg className="w-8 h-8 mx-auto text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
            {i === 2 && (
              <svg className="w-8 h-8 mx-auto text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {/* Skip */}
      <button
        onClick={() => router.push("/login")}
        className="text-white font-light text-[15px] pb-8 hover:underline"
      >
        SKIP
      </button>
    </div>
  );
}
