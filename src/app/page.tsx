"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import AmbientBackground from "@/components/AmbientBackground";
import FormatSelector from "@/components/FormatSelector";
import GenerationStage from "@/components/GenerationStage";
import ChapterCarousel from "@/components/ChapterCarousel";

interface ChatMetadata {
  slang: string[];
  vibes: string[];
}

interface ProgressInfo {
  stage: string;
  percent: number;
}

interface Insights {
  messages: number;
  chunks: number;
  participants: number;
  places: number;
  foods: number;
}

interface CapabilitiesResponse {
  sarvam_available: boolean;
  defaults: {
    llm_provider: string;
    llm_model: string;
  };
}

interface StreamMessage {
  type: "metadata" | "token" | "error" | "progress" | "insights";
  content: ChatMetadata | string | ProgressInfo | Insights;
}

interface ChapterSlide {
  heading: string;
  body: string;
}

function extractStoryParts(rawStory: string) {
  const titleMatch = rawStory.match(/^\*\*[^:\n]+:\s*(?:\[(.+?)\]|(.+?))\*\*/m);
  const extractedTitle = titleMatch?.[1]?.trim() || titleMatch?.[2]?.trim() || null;
  const cleanedStory = rawStory
    .replace(/^\*\*[^:\n]+:\s*(?:\[(.+?)\]|(.+?))\*\*\s*/m, "")
    .trim();
  const paragraphs = cleanedStory
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  return { extractedTitle, paragraphs };
}

function buildChapterSlides(blocks: string[], fallbackTitle: string): ChapterSlide[] {
  if (!blocks.length) return [];

  const expandedBlocks: string[] = [];
  const chapterInlinePattern =
    /(\*\*(?:chapter|part|act)\s+\d+:[^*]+\*\*|(?:chapter|part|act)\s+\d+:[^\n]+)/gi;

  for (const block of blocks) {
    const matches = Array.from(block.matchAll(chapterInlinePattern));
    if (!matches.length) {
      expandedBlocks.push(block);
      continue;
    }

    let cursor = 0;
    for (const match of matches) {
      const start = match.index ?? 0;
      if (start > cursor) {
        const before = block.slice(cursor, start).trim();
        if (before) expandedBlocks.push(before);
      }
      const heading = (match[0] || "").trim();
      if (heading) expandedBlocks.push(heading);
      cursor = start + heading.length;
    }
    const tail = block.slice(cursor).trim();
    if (tail) expandedBlocks.push(tail);
  }

  const sourceBlocks = expandedBlocks.length ? expandedBlocks : blocks;
  const slides: ChapterSlide[] = [];
  let currentHeading = fallbackTitle || "Chapter 1";
  let currentBody: string[] = [];

  for (const block of sourceBlocks) {
    const headingOnly = block.match(/^\*\*(.+?)\*\*$/) || block.match(/^((?:chapter|part|act)\s+\d+:[^\n]+)$/i);
    if (headingOnly) {
      if (currentBody.length) {
        slides.push({ heading: currentHeading, body: currentBody.join("\n\n").replace(/\*\*/g, "") });
      }
      currentHeading = headingOnly[1].trim().replace(/\*\*/g, "");
      currentBody = [];
      continue;
    }
    currentBody.push(block);
  }

  if (currentBody.length) {
    slides.push({ heading: currentHeading, body: currentBody.join("\n\n").replace(/\*\*/g, "") });
  }

  if (slides.length) return slides;

  return blocks.map((block, idx) => ({
    heading: `Chapter ${idx + 1}`,
    body: block.replace(/\*\*/g, ""),
  }));
}

export default function Home() {
  const [stage, setStage] = useState<"setup" | "story">("setup");
  const [file, setFile] = useState<File | null>(null);
  const [generationPhase, setGenerationPhase] = useState<"idle" | "streaming" | "printed">("idle");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [memoirTitle, setMemoirTitle] = useState<string | null>(null);
  const [storyContent, setStoryContent] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("memoir");
  const [wordTarget, setWordTarget] = useState("350");
  const [tone, setTone] = useState("nostalgic");
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [error, setError] = useState<string | null>(null);
  const [progressInfo, setProgressInfo] = useState<ProgressInfo>({ stage: "Initializing", percent: 0 });
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [sarvamAvailable, setSarvamAvailable] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const setupRef = useRef<HTMLDivElement>(null);
  const storySceneRef = useRef<HTMLDivElement>(null);
  const uploadIconRef = useRef<HTMLSpanElement>(null);
  const transitionOverlayRef = useRef<HTMLDivElement>(null);
  const transitionTextRef = useRef<HTMLParagraphElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useGSAP(
    () => {
      if (stage !== "setup" || !setupRef.current) return;
      gsap.fromTo(
        ".setup-reveal",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.1, stagger: 0.13, ease: "power3.out" }
      );
    },
    { dependencies: [stage], scope: setupRef }
  );

  useGSAP(
    () => {
      if (stage !== "story" || !storySceneRef.current) return;
      gsap.fromTo(
        ".story-reveal",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.05, stagger: 0.14, ease: "power2.out" }
      );
    },
    { dependencies: [stage], scope: storySceneRef }
  );

  const chapterSlides = useMemo(
    () => buildChapterSlides(storyContent, memoirTitle || "Memory Reel"),
    [storyContent, memoirTitle]
  );

  const fullNarrativeText = useMemo(() => {
    const heading = memoirTitle ? `${memoirTitle}\n\n` : "";
    const chapters = chapterSlides
      .map((c, i) => `Chapter ${i + 1}: ${c.heading}\n${c.body}`)
      .join("\n\n");
    return `${heading}${chapters}`.trim();
  }, [memoirTitle, chapterSlides]);

  useEffect(() => {
    const loadCapabilities = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/capabilities");
        if (!res.ok) return;
        const data = (await res.json()) as CapabilitiesResponse;
        setSarvamAvailable(Boolean(data.sarvam_available));
      } catch {
        // Keep graceful fallback if backend capability endpoint is unavailable.
      }
    };
    loadCapabilities();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const playMemoryTransition = () =>
    new Promise<void>((resolve) => {
      setIsTransitioning(true);
      requestAnimationFrame(() => {
        if (!transitionOverlayRef.current) {
          resolve();
          return;
        }

        if (uploadIconRef.current) {
          gsap.set(uploadIconRef.current, { clearProps: "all", opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 });
        }

        const fireflies = transitionOverlayRef.current.querySelectorAll(".firefly");
        const tl = gsap.timeline({
          onComplete: () => {
            setIsTransitioning(false);
            resolve();
          },
        });

        tl.set(transitionOverlayRef.current, { pointerEvents: "auto" });
        tl.fromTo(
          transitionOverlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.7, ease: "power2.out" }
        );

        if (uploadIconRef.current) {
          tl.to(
            uploadIconRef.current,
            { y: -130, x: 160, rotation: 16, scale: 0.22, opacity: 0, duration: 0.95, ease: "power3.in" },
            0
          );
        }

        tl.fromTo(
          fireflies,
          { opacity: 0, scale: 0.2 },
          { opacity: 0.95, scale: 1, duration: 0.7, stagger: 0.03, ease: "sine.out" },
          0.2
        );
        tl.to(
          fireflies,
          {
            y: () => gsap.utils.random(-60, 60),
            x: () => gsap.utils.random(-50, 50),
            opacity: () => gsap.utils.random(0.4, 1),
            duration: () => gsap.utils.random(1.2, 2.2),
            repeat: 1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.02,
          },
          0.35
        );
        tl.fromTo(
          transitionTextRef.current,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
          0.38
        );
        tl.to({}, { duration: 0.7 });
        tl.to(
          transitionOverlayRef.current,
          { opacity: 0, duration: 0.6, ease: "power2.inOut" },
          "+=0.15"
        );
      });
    });

  const handleUpload = async () => {
    if (!file) return setError("Please select a file first.");
    if (selectedLanguage !== "en-IN" && !sarvamAvailable) {
      return setError("Add SARVAM_API_KEY in backend/.env to use language translation.");
    }

    setStage("story");
    setGenerationPhase("streaming");
    setError(null);
    setStoryContent([]);
    setMemoirTitle(null);
    setProgressInfo({ stage: "Going back in time", percent: 5 });
    setInsights(null);
    setAudioSrc(null);
    const transitionPromise = playMemoryTransition();

    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("narrative_format", selectedFormat);
    formData.append("word_target", wordTarget);
    formData.append("tone", tone);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/generate-story", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend failed. Is it running?");
      if (!response.body) throw new Error("No readable stream available.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let rawStoryBuffer = "";
      let sseBuffer = "";
      let streamDone = false;

      const processSseEvent = (rawEvent: string) => {
        if (!rawEvent) return;

        const dataLines = rawEvent
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart());

        if (!dataLines.length) return;

        const dataStr = dataLines.join("\n").trim();
        if (!dataStr) return;

        if (dataStr === "[DONE]") {
          streamDone = true;
          return;
        }

        const parsedData = JSON.parse(dataStr) as StreamMessage;

        if (parsedData.type === "metadata") {
          // Metadata currently not rendered in carousel mode.
          return;
        }

        if (parsedData.type === "progress") {
          setProgressInfo(parsedData.content as ProgressInfo);
          return;
        }

        if (parsedData.type === "insights") {
          setInsights(parsedData.content as Insights);
          return;
        }

        if (parsedData.type === "error") {
          setError(String(parsedData.content));
          streamDone = true;
          setGenerationPhase("idle");
          return;
        }

        if (parsedData.type === "token") {
          rawStoryBuffer += String(parsedData.content);
          const { extractedTitle, paragraphs } = extractStoryParts(rawStoryBuffer);
          setMemoirTitle(extractedTitle || "Drafting your story...");
          setStoryContent(paragraphs);
        }
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });

        let eventBoundary = sseBuffer.indexOf("\n\n");
        while (eventBoundary !== -1) {
          const rawEvent = sseBuffer.slice(0, eventBoundary).trim();
          sseBuffer = sseBuffer.slice(eventBoundary + 2);

          try {
            processSseEvent(rawEvent);
          } catch {
            // Ignore malformed/partial event payloads.
          }

          if (streamDone) break;
          eventBoundary = sseBuffer.indexOf("\n\n");
        }
      }

      let finalStory = rawStoryBuffer;
      if (selectedLanguage !== "en-IN") {
        setProgressInfo({ stage: "Translating in selected language", percent: 92 });
        const translateRes = await fetch("http://127.0.0.1:8000/api/sarvam/translate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            text: rawStoryBuffer,
            source_language_code: "en-IN",
            target_language_code: selectedLanguage,
          }),
        });
        if (translateRes.ok) {
          const translated = await translateRes.json();
          const translatedText = translated.translated_text;
          finalStory =
            typeof translatedText === "string"
              ? translatedText
              : typeof translatedText?.output === "string"
                ? translatedText.output
                : rawStoryBuffer;
        } else {
          let detail = "";
          try {
            const errData = await translateRes.json();
            detail = errData?.detail ? String(errData.detail) : "";
          } catch {
            // ignore
          }
          setError(
            detail
              ? `Translation unavailable: ${detail}. Showing original output.`
              : "Translation unavailable right now. Showing original language output."
          );
        }
      }

      const { extractedTitle, paragraphs } = extractStoryParts(finalStory);
      setMemoirTitle(extractedTitle || "Your Story");
      setStoryContent(paragraphs);
      setProgressInfo({ stage: "Final polish complete", percent: 100 });
      setGenerationPhase("printed");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to generate the story right now.";
      setError(message);
      setGenerationPhase("idle");
    } finally {
      await transitionPromise;
    }
  };

  const handleSpeak = async () => {
    if (!fullNarrativeText) return;
    if (!sarvamAvailable) {
      setError("Add SARVAM_API_KEY in backend/.env to use Speak.");
      return;
    }

    try {
      if (!audioSrc) {
        setIsGeneratingAudio(true);
        const ttsRes = await fetch("http://127.0.0.1:8000/api/sarvam/tts", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            text: fullNarrativeText,
            target_language_code: selectedLanguage,
          }),
        });
        if (!ttsRes.ok) {
          let detail = "";
          try {
            const errData = await ttsRes.json();
            detail = errData?.detail ? String(errData.detail) : "";
          } catch {
            // ignore
          }
          throw new Error(detail || "TTS failed. Check SARVAM_API_KEY, speaker/model, and selected language.");
        }
        const ttsData = await ttsRes.json();
        const firstAudio = ttsData?.audios?.[0];
        if (!firstAudio || typeof firstAudio !== "string") {
          throw new Error("No audio returned from Sarvam.");
        }
        const src = firstAudio.startsWith("data:")
          ? firstAudio
          : `data:audio/wav;base64,${firstAudio}`;
        setAudioSrc(src);
        requestAnimationFrame(() => {
          if (audioRef.current) {
            audioRef.current.src = src;
            audioRef.current.play().catch(() => {});
          }
        });
        return;
      }
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to generate speech.";
      setError(message);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!chapterSlides.length || isExportingPdf) return;

    setIsExportingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 52;
      const maxTextWidth = pageWidth - margin * 2;
      const footerY = pageHeight - 30;
      let y = margin;
      let pageNumber = 1;

      const writeFooter = () => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${pageNumber}`, pageWidth - margin, footerY, { align: "right" });
      };

      const ensureSpace = (neededHeight: number) => {
        if (y + neededHeight <= pageHeight - margin) return;
        writeFooter();
        doc.addPage();
        pageNumber += 1;
        y = margin;
      };

      doc.setTextColor(35, 29, 25);
      doc.setFont("times", "italic");
      doc.setFontSize(28);
      const pdfTitle = memoirTitle || "Katha Memoir";
      const titleLines = doc.splitTextToSize(pdfTitle, maxTextWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 32;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(110, 90, 75);
      doc.text(
        `Format: ${selectedFormat.toUpperCase()}   Tone: ${tone.toUpperCase()}   Target: ${wordTarget} words`,
        margin,
        y
      );
      y += 26;

      chapterSlides.forEach((chapter, index) => {
        ensureSpace(56);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(90, 70, 58);
        doc.text(`CHAPTER ${index + 1}`, margin, y);
        y += 16;

        doc.setFont("times", "italic");
        doc.setFontSize(18);
        doc.setTextColor(40, 30, 24);
        const headingLines = doc.splitTextToSize(chapter.heading, maxTextWidth);
        ensureSpace(headingLines.length * 22 + 10);
        doc.text(headingLines, margin, y);
        y += headingLines.length * 22 + 8;

        const paragraphs = chapter.body.split(/\n+/).map((p) => p.trim()).filter(Boolean);
        doc.setFont("times", "normal");
        doc.setFontSize(13);
        doc.setTextColor(35, 30, 28);

        paragraphs.forEach((paragraph) => {
          const bodyLines = doc.splitTextToSize(paragraph, maxTextWidth);
          const needed = bodyLines.length * 19 + 12;
          ensureSpace(needed);
          doc.text(bodyLines, margin, y);
          y += bodyLines.length * 19 + 10;
        });

        y += 8;
      });

      writeFooter();

      const safeTitle = (pdfTitle || "katha-memoir")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      doc.save(`${safeTitle || "katha-memoir"}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleBackToSetup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setAudioSrc(null);
    setIsGeneratingAudio(false);
    setStage("setup");
    setGenerationPhase("idle");
    setStoryContent([]);
    setMemoirTitle(null);
  };

  return (
    <main className="min-h-screen text-[#2f231a] selection:bg-[#7a3f33]/30 relative">
      <AmbientBackground />
      {stage === "story" && generationPhase === "printed" && (
        <div className="pointer-events-none fixed inset-0 z-[4] bg-[radial-gradient(circle_at_50%_45%,rgba(132,171,220,0.42)_0%,rgba(94,137,194,0.28)_38%,rgba(39,64,104,0.46)_100%)] backdrop-blur-[2px]" />
      )}

      {stage === "setup" && (
        <section ref={setupRef} className="relative z-10 min-h-screen px-6 py-10 md:px-12">
          <div className="mx-auto flex min-h-[88vh] w-full max-w-[1500px] flex-col justify-between rounded-[2rem] border border-[#b19077] bg-[#f7ecdd]/75 p-8 shadow-[0_25px_60px_rgba(64,38,20,0.18)] backdrop-blur-sm md:p-12">
            <div className="setup-reveal flex items-start justify-between text-[#7f5f4b]">
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-[0.24em]">Katha</p>
                <p className="mt-1 font-display text-2xl not-italic tracking-[0.08em]">कथा</p>
              </div>
              <span>{new Date().toLocaleDateString("en-GB")}</span>
            </div>

            <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
              <div className="space-y-7">
                <h1 className="setup-reveal font-display text-6xl leading-[0.95] text-[#2f2319] md:text-8xl">
                  We Keep
                  <br />
                  What
                  <br />
                  Fades.
                </h1>
                <p className="setup-reveal max-w-xl text-lg leading-relaxed text-[#5f4d40]">
                  Turn raw chat logs into a living memory film. It should feel nostalgic, slightly broken, warm, and
                  painfully alive.
                </p>
                <p className="setup-reveal text-sm uppercase tracking-[0.22em] text-[#7d5e4b]">
                  Setup Page - Then Story Emergence
                </p>
                <div className="setup-reveal mt-10 max-w-xl rounded-2xl border border-[#b8967d] bg-[#f8ecdc]/75 p-5">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#7a5b49]">Story Controls</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="text-xs uppercase tracking-[0.16em] text-[#6e5140]">
                      Output Length
                      <select
                        value={wordTarget}
                        onChange={(e) => setWordTarget(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#b7967d] bg-[#f7eadb] px-3 py-2 text-sm normal-case tracking-normal text-[#433327]"
                      >
                        <option value="180">Short (180 words)</option>
                        <option value="280">Medium (280 words)</option>
                        <option value="350">Balanced (350 words)</option>
                        <option value="500">Long (500 words)</option>
                        <option value="750">Extended (750 words)</option>
                        <option value="1200">Cinematic Long (1200 words)</option>
                        <option value="2000">Epic (2000 words)</option>
                      </select>
                    </label>
                    <label className="text-xs uppercase tracking-[0.16em] text-[#6e5140]">
                      Tone
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#b7967d] bg-[#f7eadb] px-3 py-2 text-sm normal-case tracking-normal text-[#433327]"
                      >
                        <option value="nostalgic">Nostalgic</option>
                        <option value="griefy">Griefy</option>
                        <option value="cinematic">Cinematic</option>
                        <option value="hopeful">Hopeful</option>
                        <option value="playful">Playful</option>
                      </select>
                    </label>
                    <label className="text-xs uppercase tracking-[0.16em] text-[#6e5140] sm:col-span-2">
                      Language
                      <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#b7967d] bg-[#f7eadb] px-3 py-2 text-sm normal-case tracking-normal text-[#433327]"
                      >
                        <option value="en-IN">English</option>
                        <option value="hi-IN">Hindi</option>
                        <option value="ta-IN">Tamil</option>
                        <option value="te-IN">Telugu</option>
                        <option value="bn-IN">Bengali</option>
                        <option value="gu-IN">Gujarati</option>
                      </select>
                    </label>
                  </div>
                  {selectedLanguage !== "en-IN" && !sarvamAvailable && (
                    <p className="mt-3 text-xs text-[#8a1d1d]">
                      Add `SARVAM_API_KEY` in `backend/.env` to use translation and speech.
                    </p>
                  )}
                </div>
              </div>

              <div className="setup-reveal rounded-[1.4rem] border border-[#b9977f] bg-[#fff5e8]/85 p-6 paper-grain shadow-[0_18px_40px_rgba(91,57,33,0.16)]">
                <div className="mb-6 text-xs uppercase tracking-[0.22em] text-[#7b5c49]">Archive Intake</div>
                <label className="mb-6 block text-sm text-[#5d4b3f]">
                  Upload WhatsApp Export (.txt)
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileChange}
                    className="mt-3 block w-full rounded-xl border border-[#b7967d] bg-[#f7eadb] px-4 py-3 text-sm text-[#4f3e31] file:mr-4 file:rounded-full file:border-0 file:bg-[#7c4537] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.18em] file:text-[#f7e7db] hover:file:bg-[#69372c]"
                  />
                </label>

                <div className="mb-7">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-[#7d5f4d]">Narrative Cut</p>
                  <FormatSelector selected={selectedFormat} onSelect={setSelectedFormat} />
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!file || generationPhase === "streaming" || isTransitioning}
                  className="w-full rounded-full border border-[#5c2f25] bg-[#6d3a2d] px-8 py-4 text-xs uppercase tracking-[0.28em] text-[#f6e5d5] transition-all hover:-translate-y-0.5 hover:bg-[#5f3126] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span ref={uploadIconRef} className="mr-2 inline-block">✦</span>
                  Begin Reconstruction
                </button>
                {error && <p className="mt-4 text-sm text-[#8a1d1d]">{error}</p>}
              </div>
            </div>

          </div>
        </section>
      )}

      {stage === "story" && (
        <section ref={storySceneRef} className="relative z-10 h-screen overflow-hidden px-6 py-6 md:px-12">
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="story-reveal flex flex-wrap items-center justify-between gap-4 border-b border-[#a9856a] pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#7c5c48]">Story Scene</p>
                <h2 className="font-display text-5xl text-[#2c2018] md:text-6xl">{memoirTitle || "Reassembling Memory"}</h2>
              </div>
              <div className="flex items-center gap-2">
                {generationPhase === "printed" && (
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    disabled={isExportingPdf}
                    className="rounded-full border border-[#9f7e65] px-5 py-2 text-xs uppercase tracking-[0.18em] text-[#5e4636] hover:bg-[#f4e5d4] disabled:opacity-50"
                  >
                    {isExportingPdf ? "Preparing PDF..." : "Download PDF"}
                  </button>
                )}
                {generationPhase === "printed" && (
                  <button
                    type="button"
                    onClick={handleSpeak}
                    disabled={isGeneratingAudio}
                    className="rounded-full border border-[#9f7e65] px-5 py-2 text-xs uppercase tracking-[0.18em] text-[#5e4636] hover:bg-[#f4e5d4] disabled:opacity-50"
                  >
                    {isGeneratingAudio ? "Preparing Audio..." : "Speak"}
                  </button>
                )}
                {generationPhase === "printed" && audioSrc && (
                  <a
                    href={audioSrc}
                    download={`${(memoirTitle || "katha-audio").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.wav`}
                    className="rounded-full border border-[#9f7e65] px-5 py-2 text-xs uppercase tracking-[0.18em] text-[#5e4636] hover:bg-[#f4e5d4]"
                  >
                    Download Audio
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleBackToSetup}
                  className="rounded-full border border-[#9f7e65] px-5 py-2 text-xs uppercase tracking-[0.18em] text-[#5e4636] hover:bg-[#f4e5d4]"
                >
                  Back to Setup
                </button>
              </div>
            </div>

            <div className="story-reveal mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-[#7d5d4a]">
              <span className="rounded-full border border-[#b7967c] bg-[#f8eadb]/80 px-3 py-2">{selectedFormat}</span>
              <span className="rounded-full border border-[#b7967c] bg-[#f8eadb]/80 px-3 py-2">
                {generationPhase === "streaming" ? "Live Generation" : "Printed Cut"}
              </span>
            </div>

            {generationPhase === "streaming" && (
              <GenerationStage progress={progressInfo} insights={insights} />
            )}

            {generationPhase === "printed" && (
              <div className="relative z-10 mx-auto mt-4 flex min-h-0 w-full max-w-5xl flex-1 pb-2">
                {error && <p className="mb-6 text-sm text-[#8a1d1d]">{error}</p>}
                <ChapterCarousel chapters={chapterSlides} format={selectedFormat} />
              </div>
            )}
          </div>
        </section>
      )}

      <div
        ref={transitionOverlayRef}
        className={`pointer-events-none fixed inset-0 z-[120] flex items-center justify-center bg-[radial-gradient(circle_at_center,#2a2018_0%,#130d0a_75%)] ${
          isTransitioning ? "block" : "hidden"
        }`}
      >
        <div className="absolute inset-0">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="firefly absolute h-2 w-2 rounded-full bg-[#ffd78c] shadow-[0_0_14px_rgba(255,211,125,0.95)]"
              style={{
                left: `${12 + ((i * 17) % 76)}%`,
                top: `${10 + ((i * 23) % 78)}%`,
              }}
            />
          ))}
        </div>
        <p ref={transitionTextRef} className="px-6 text-center font-display text-4xl italic text-[#f2e0c8] md:text-6xl">
          Bringing back memories from the past...
        </p>
      </div>
      <audio ref={audioRef} className="hidden" />
    </main>
  );
}
