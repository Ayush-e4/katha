"use client";

const formats = [
  {
    id: "memoir",
    title: "Memoir Cut",
    description: "Cinematic recollection in chapter beats.",
    tag: "Archive Edit",
  },
  {
    id: "letter",
    title: "Letter",
    description: "Handwritten confession, intimate and grief-tinted.",
    tag: "Handwritten",
  },
  {
    id: "timeline",
    title: "Timeline Reel",
    description: "Moment-by-moment contact sheet of your phases.",
    tag: "Chronicle",
  },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export default function FormatSelector({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {formats.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`text-left p-4 rounded-2xl transition-all border flex flex-col min-h-[214px] relative overflow-hidden ${
            selected === f.id
              ? "border-[#7e4f3d] bg-[#f5e6d2]/95 shadow-[0_12px_30px_rgba(73,41,25,0.18)] -translate-y-1"
              : "border-[#b9987e] bg-[#f9efe3]/70 hover:bg-[#f8ebdc]"
          }`}
        >
          <span className="text-[10px] uppercase tracking-[0.24em] text-[#7e6251] mb-4">{f.tag}</span>
          <h3
            className={`font-display leading-[0.95] mb-3 text-[#2d2017] tracking-tight ${
              f.id === "memoir" ? "text-[2rem]" : "text-[1.9rem]"
            }`}
          >
            {f.title}
          </h3>
          <p className="text-sm text-[#5f4d40] leading-relaxed max-w-[22ch]">
            {f.description}
          </p>
          <div className="mt-auto pt-5 text-xs tracking-[0.16em] uppercase text-[#7c5745]">
            {selected === f.id ? "Selected" : "Choose Style"}
          </div>
        </button>
      ))}
    </div>
  );
}
