"use client";

import { useState, useEffect } from "react";
import { Article } from "@/lib/types";

export default function BreakingBanner() {
  const [breaking, setBreaking] = useState<Article | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const res = await fetch("/api/articles?category=all&limit=5&offset=0");
        const articles: Article[] = await res.json();
        const latest = articles.find((a) => a.is_breaking);
        if (latest) {
          // Only show if less than 6 hours old
          const age = Date.now() - new Date(latest.created_at).getTime();
          if (age < 6 * 60 * 60 * 1000) {
            setBreaking(latest);
          }
        }
      } catch {
        // Silently fail
      }
    };

    fetchBreaking();
    const interval = setInterval(fetchBreaking, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!breaking || dismissed) return null;

  return (
    <div className="bg-accent text-white relative overflow-hidden">
      {/* Animated pulse bar */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />

      <div className="max-w-content mx-auto px-5 py-2.5 flex items-center gap-3">
        {/* Breaking badge */}
        <span className="shrink-0 flex items-center gap-1.5 text-caption font-bold uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          Breaking
        </span>

        {/* Divider */}
        <span className="shrink-0 w-px h-4 bg-white/30" />

        {/* Headline */}
        <p className="text-body-sm font-medium truncate flex-1">
          {breaking.headline}
        </p>

        {/* Dismiss */}
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 text-white/70 hover:text-white transition-colors ml-2"
          aria-label="Dismiss"
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
      </div>
    </div>
  );
}
