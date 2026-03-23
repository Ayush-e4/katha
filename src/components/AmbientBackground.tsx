"use client";

export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[radial-gradient(circle_at_20%_0%,#f7efe4_0%,#ede0cf_35%,#dcc9b2_100%)]">
      <div className="absolute inset-0 paper-grain" />

      <div className="absolute inset-0 flicker-overlay bg-[linear-gradient(100deg,rgba(255,245,224,0.45),rgba(120,70,40,0.1)_40%,rgba(255,238,220,0.35))]" />

      <div className="absolute -top-[12%] -left-[8%] h-[46vw] w-[46vw] rounded-full bg-[#fff6ea] opacity-60 blur-[120px]" />
      <div className="absolute -bottom-[18%] -right-[15%] h-[50vw] w-[50vw] rounded-full bg-[#c9916f] opacity-30 blur-[140px]" />
      <div className="absolute top-[20%] right-[10%] h-[30vw] w-[30vw] rounded-full bg-[#7f5a49] opacity-20 blur-[120px]" />

      <div className="absolute inset-0 opacity-15 mix-blend-multiply" style={{ backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 5px, rgba(77,50,34,0.08) 5px, rgba(77,50,34,0.08) 6px)" }} />
    </div>
  );
}
