"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import anime from "animejs";

interface Chapter {
  heading: string;
  body: string;
}

interface Props {
  chapters: Chapter[];
  format: string;
}

export default function ChapterCarousel({ chapters, format }: Props) {
  const [index, setIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const total = chapters.length;

  useEffect(() => {
    if (!cardRef.current) return;
    anime({
      targets: cardRef.current,
      opacity: [0, 1],
      translateX: [50, 0],
      easing: "easeOutExpo",
      duration: 550,
    });
  }, [index]);

  const safeIndex = total ? Math.min(index, total - 1) : 0;
  const current = chapters[safeIndex];
  const canPrev = safeIndex > 0;
  const canNext = safeIndex < total - 1;

  const pageLabel = useMemo(() => `${safeIndex + 1} / ${total}`, [safeIndex, total]);

  if (!total || !current) return null;

  return (
    <div className="story-reveal mt-6 flex h-full min-h-0 flex-col">
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#6f5342]">
        <span>Chapter Carousel</span>
        <span>{pageLabel}</span>
      </div>

      <div
        key={`chapter-card-${index}`}
        ref={cardRef}
        className="flex min-h-0 flex-1 flex-col rounded-[1.8rem] border border-[#aa876f] bg-[#f8ecdc]/90 p-6 shadow-[0_30px_70px_rgba(73,41,20,0.16)] md:p-10"
      >
        <p className="text-xs uppercase tracking-[0.26em] text-[#7a5c4a]">{current.heading}</p>
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#886b58]">Chapter {safeIndex + 1}</p>
        <div className="mt-5 min-h-0 flex-1 overflow-auto pr-1">
          <p
            className={`text-xl md:text-3xl leading-[1.55] text-[#34281f] whitespace-pre-wrap font-cursive ${
              format === "letter" ? "italic" : ""
            }`}
          >
            {current.body}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex((prev) => Math.max(Math.min(prev, total - 1) - 1, 0))}
          disabled={!canPrev}
          className="rounded-full border border-[#9e7b63] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#5b4132] disabled:opacity-35"
        >
          Previous
        </button>

        <div className="flex items-center gap-2">
          {chapters.map((_, dotIndex) => (
            <button
              key={dotIndex}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={`h-2.5 rounded-full transition-all ${dotIndex === safeIndex ? "w-8 bg-[#6f3e30]" : "w-2.5 bg-[#b69076]"}`}
              aria-label={`Go to chapter ${dotIndex + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setIndex((prev) => Math.min(Math.min(prev, total - 1) + 1, total - 1))}
          disabled={!canNext}
          className="rounded-full border border-[#9e7b63] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[#5b4132] disabled:opacity-35"
        >
          Next
        </button>
      </div>
    </div>
  );
}
