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
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/daily-briefing`,
          {
            headers: {
              Authorization: `Bearer ${anonKey}`,
            },
          }
        );
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
        className="relative bg-white w-full max-w-2xl mx-4 my-8 max-h-[calc(100vh-4rem)] overflow-y-auto rounded-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-ink-400 hover:text-ink-700 transition-colors"
          aria-label="Close"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-6 pb-6 border-b border-ink-100">
            <span className="text-caption font-semibold uppercase tracking-widest text-accent">
              Daily Briefing
            </span>
            <h2 className="font-serif text-headline-lg text-ink-950 mt-2">
              Today&apos;s Top Stories
            </h2>
            <p className="text-body-sm text-ink-400 mt-1">{dateStr}</p>
          </div>

          {/* Content */}
          {loading ? (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-4 h-4 border-2 border-ink-200 border-t-ink-500 rounded-full animate-spin" />
                <span className="text-body-sm text-ink-400">
                  Generating your briefing...
                </span>
              </div>
              <div className="space-y-4 animate-pulse">
                <div className="h-4 w-full bg-ink-100 rounded" />
                <div className="h-4 w-5/6 bg-ink-100 rounded" />
                <div className="h-4 w-full bg-ink-100 rounded" />
                <div className="h-4 w-4/5 bg-ink-100 rounded" />
                <div className="h-4 w-full bg-ink-100 rounded" />
                <div className="h-4 w-3/4 bg-ink-100 rounded" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-body-md text-ink-500">
                Unable to load today&apos;s briefing.
              </p>
              <p className="text-body-sm text-ink-400 mt-1">{error}</p>
            </div>
          ) : data ? (
            <div>
              <div className="text-body-md text-ink-700 space-y-3 leading-relaxed">
                {data.briefing.split("\n").map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  if (trimmed.startsWith(">")) {
                    return (
                      <div key={i} className="flex gap-2.5 pl-1">
                        <span className="text-accent font-bold shrink-0 mt-0.5">
                          &#x2022;
                        </span>
                        <p>{trimmed.slice(1).trim()}</p>
                      </div>
                    );
                  }
                  return <p key={i}>{trimmed}</p>;
                })}
              </div>
              {data.article_count > 0 && (
                <p className="text-caption text-ink-400 mt-6 pt-4 border-t border-ink-100">
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
