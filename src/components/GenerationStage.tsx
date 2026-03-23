"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import anime from "animejs";

interface Insights {
  messages: number;
  chunks: number;
  participants: number;
  places: number;
  foods: number;
}

interface ProgressInfo {
  stage: string;
  percent: number;
}

interface Props {
  progress: ProgressInfo;
  insights: Insights | null;
}

const STAGES = [
  "Collecting fragments",
  "Going back in time",
  "Indexing inside jokes",
  "Finding emotional pivots",
  "Building narrative rhythm",
  "Composing first draft",
  "Final voice polish",
];

const ARTIFACTS = [
  "Late-night planning thread recovered",
  "Inside-joke cluster detected",
  "Conflict-to-repair pattern found",
  "Memory hotspot around a key date",
  "Tone-shift sequence mapped",
  "Callback motif extracted",
];

function approach(current: number, target: number, step: number) {
  if (current >= target) return target;
  return Math.min(target, current + step);
}

export default function GenerationStage({ progress, insights }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  const [stageIndex, setStageIndex] = useState(0);
  const [artifactIndex, setArtifactIndex] = useState(0);

  const [uiMessages, setUiMessages] = useState(180);
  const [uiChunks, setUiChunks] = useState(2);
  const [uiParticipants, setUiParticipants] = useState(2);
  const [uiPlaces, setUiPlaces] = useState(1);
  const [uiFoods, setUiFoods] = useState(1);

  useEffect(() => {
    if (titleRef.current) {
      anime({
        targets: titleRef.current,
        opacity: [0, 1],
        translateY: [18, 0],
        easing: "easeOutExpo",
        duration: 900,
      });
    }

    if (subtitleRef.current) {
      anime({
        targets: subtitleRef.current,
        opacity: [0, 1],
        delay: 260,
        duration: 900,
        easing: "easeOutSine",
      });
    }

    if (dotsRef.current) {
      anime({
        targets: dotsRef.current.querySelectorAll(".memory-dot"),
        translateY: [0, -10, 0],
        opacity: [0.35, 1, 0.35],
        scale: [0.9, 1.15, 0.9],
        delay: anime.stagger(120),
        easing: "easeInOutSine",
        duration: 1400,
        loop: true,
      });
    }
  }, []);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGES.length);
    }, 2200);

    const artifactTimer = setInterval(() => {
      setArtifactIndex((prev) => (prev + 1) % ARTIFACTS.length);
    }, 1900);

    return () => {
      clearInterval(stageTimer);
      clearInterval(artifactTimer);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const targetMessages = insights?.messages ?? 3200;
      const targetChunks = insights?.chunks ?? 26;
      const targetParticipants = insights?.participants ?? 2;
      const targetPlaces = insights?.places ?? 18;
      const targetFoods = insights?.foods ?? 7;

      setUiMessages((v) => approach(v, targetMessages, Math.max(7, Math.ceil(targetMessages / 110))));
      setUiChunks((v) => approach(v, targetChunks, 1));
      setUiParticipants((v) => approach(v, targetParticipants, 1));
      setUiPlaces((v) => approach(v, targetPlaces, 1));
      setUiFoods((v) => approach(v, targetFoods, 1));
    }, 280);

    return () => clearInterval(timer);
  }, [insights]);

  const stageText = useMemo(() => {
    if (progress.percent >= 88) return "Final voice polish";
    if (progress.percent >= 70) return "Composing first draft";
    if (progress.percent >= 52) return "Finding emotional pivots";
    return STAGES[stageIndex];
  }, [progress.percent, stageIndex]);

  return (
    <div className="story-reveal mt-6 rounded-[1.6rem] border border-[#a98368] bg-[radial-gradient(circle_at_20%_10%,#f8efdf_0%,#ecdbc6_70%,#e1ccb3_100%)] p-6 shadow-[0_24px_50px_rgba(60,35,20,0.2)] md:p-10">
      <div className="mb-6 flex items-center gap-4" ref={dotsRef}>
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="memory-dot h-2.5 w-2.5 rounded-full bg-[#f6c97a] shadow-[0_0_12px_rgba(246,201,122,0.75)]"
          />
        ))}
      </div>

      <h3 ref={titleRef} className="font-display text-5xl italic text-[#2d2119] md:text-6xl">
        Bringing back memories...
      </h3>
      <p ref={subtitleRef} className="mt-3 text-sm uppercase tracking-[0.26em] text-[#725645]">
        {stageText}
      </p>

      <div className="mt-6 rounded-full border border-[#af8d74] bg-[#f7ead9]/80 p-1">
        <div
          className="h-2.5 rounded-full bg-[#6f3e30] transition-all duration-700"
          style={{ width: `${Math.max(6, Math.min(progress.percent || 0, 100))}%` }}
        />
      </div>

      <div className="mt-4 rounded-xl border border-[#b18f75] bg-[#f7ead9]/85 px-4 py-3">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#6e5140]">Recovered Artifact</p>
        <p className="mt-1 text-base font-display italic text-[#352a22]">{ARTIFACTS[artifactIndex]}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <div className="rounded-xl border border-[#b18f75] bg-[#f7ead9]/85 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a5d4b]">Messages</p>
          <p className="mt-2 font-display text-3xl text-[#32261e]">{uiMessages.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-[#b18f75] bg-[#f7ead9]/85 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a5d4b]">Phases</p>
          <p className="mt-2 font-display text-3xl text-[#32261e]">{uiChunks}</p>
        </div>
        <div className="rounded-xl border border-[#b18f75] bg-[#f7ead9]/85 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a5d4b]">People</p>
          <p className="mt-2 font-display text-3xl text-[#32261e]">{uiParticipants}</p>
        </div>
        <div className="rounded-xl border border-[#b18f75] bg-[#f7ead9]/85 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a5d4b]">Places</p>
          <p className="mt-2 font-display text-3xl text-[#32261e]">{uiPlaces}</p>
        </div>
        <div className="rounded-xl border border-[#b18f75] bg-[#f7ead9]/85 p-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a5d4b]">Food Items</p>
          <p className="mt-2 font-display text-3xl text-[#32261e]">{uiFoods}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          "Chapter 1 • developing emotional spine",
          "Chapter 2 • recovering turning point",
          "Chapter 3 • polishing after-feeling",
        ].map((label) => (
          <div key={label} className="rounded-xl border border-[#b18f75] bg-[#f7ead9]/85 p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#7a5d4b]">Draft Queue</p>
            <p className="mt-2 text-sm text-[#47372b]">{label}</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#e5d4bf]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[#7d4a3a]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
