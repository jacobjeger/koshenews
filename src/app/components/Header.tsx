"use client";

import { useEffect, useState } from "react";
import DailyBriefing from "./DailyBriefing";

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;
  return <span>{time}</span>;
}

export default function Header() {
  const [showBriefing, setShowBriefing] = useState(false);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    setDateStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <>
      <header className="border-b border-ink-200">
        {/* Top utility bar */}
        <div className="border-b border-ink-100">
          <div className="max-w-content mx-auto px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-caption text-ink-400 uppercase tracking-widest font-medium">
                Live
              </span>
              <span className="w-px h-3 bg-ink-200" />
              <button
                onClick={() => setShowBriefing(true)}
                className="text-caption font-semibold uppercase tracking-widest text-accent hover:text-accent-dark transition-colors"
              >
                Daily Briefing
              </button>
            </div>
            <span className="text-caption text-ink-400 font-medium tabular-nums">
              <LiveClock />
            </span>
          </div>
        </div>

        {/* Masthead */}
        <div className="max-w-content mx-auto px-6 py-7 text-center">
          <h1 className="font-serif text-[2.5rem] sm:text-[2.75rem] font-bold tracking-tight text-ink-950 leading-none">
            Kosher News
          </h1>
          <div className="mt-3 flex items-center justify-center gap-4">
            <span className="h-px w-10 bg-ink-200" />
            <p className="text-caption text-ink-400 uppercase tracking-[0.25em] font-medium">
              No opinion &middot; No agenda &middot; Just news
            </p>
            <span className="h-px w-10 bg-ink-200" />
          </div>
        </div>

        {/* Date bar */}
        <div className="border-t border-ink-100 bg-ink-50/60">
          <div className="max-w-content mx-auto px-6 py-2">
            <p className="text-caption text-ink-500 text-center tracking-wide font-medium">
              {dateStr}
            </p>
          </div>
        </div>
      </header>

      {showBriefing && (
        <DailyBriefing onClose={() => setShowBriefing(false)} />
      )}
    </>
  );
}
