"use client";

import { useEffect, useState } from "react";

interface DailyBriefingProps {
  onClose: () => void;
}

interface BriefingData {
  briefing: string;
  article_count: number;
  generated_at: string;
  cached: boolean;
}

export default function DailyBriefing({ onClose }: DailyBriefingProps) {
  const [data, setData] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => {
    const fetchBriefing = async () => {
      try {
        const res = await fetch("/api/briefing");
        if (!res.ok) throw new Error("Failed to load briefing");
        const json: BriefingData = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchBriefing();
  }, []);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white w-full max-w-2xl mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-lg shadow-modal animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-ink-50 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-all"
          aria-label="Close"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        <div className="px-8 sm:px-10 py-10">
          {/* Header */}
          <div className="mb-8 pb-8 border-b border-ink-100">
            <span className="text-caption font-semibold uppercase tracking-widest text-accent">
              Daily Briefing
            </span>
            <h2 className="font-serif text-headline-xl text-ink-950 mt-2 leading-snug">
              Today&apos;s Top Stories
            </h2>
            <p className="text-body-sm text-ink-400 mt-2 font-medium">{dateStr}</p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-8">
                <span className="w-4 h-4 border-2 border-ink-200 border-t-accent rounded-full animate-spin" />
                <span className="text-body-sm text-ink-400 font-medium">
                  Generating your briefing...
                </span>
              </div>
              <div className="space-y-4 animate-pulse">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-ink-100 rounded"
                    style={{ width: `${75 + Math.random() * 25}%` }}
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-body-md text-ink-500">
                Unable to load today&apos;s briefing.
              </p>
              <p className="text-body-sm text-ink-400 mt-2">{error}</p>
            </div>
          ) : data ? (
            <div>
              <div className="text-body-md text-ink-700 space-y-4 leading-[1.75]">
                {data.briefing.split("\n").map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;

                  // Strip markdown bold markers for display
                  const clean = trimmed.replace(/\*\*/g, "");

                  // Detect bullet lines (>, -, or bullet)
                  const bulletMatch = clean.match(/^[>\-•]\s*(.+)/);
                  if (bulletMatch) {
                    return (
                      <div key={i} className="flex gap-3 pl-1">
                        <span className="text-accent font-bold shrink-0 mt-1">
                          &#x2022;
                        </span>
                        <p>{bulletMatch[1]}</p>
                      </div>
                    );
                  }
                  return <p key={i}>{clean}</p>;
                })}
              </div>
              {data.article_count > 0 && (
                <p className="text-caption text-ink-400 mt-8 pt-5 border-t border-ink-100 font-medium">
                  Based on {data.article_count} top stories
                  {data.generated_at && (
                    <>
                      {" "}
                      &middot; Generated{" "}
                      {new Date(data.generated_at).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
