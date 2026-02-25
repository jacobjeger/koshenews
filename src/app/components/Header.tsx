"use client";

import { useEffect, useState } from "react";

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
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="border-b border-ink-200">
      {/* Top utility bar */}
      <div className="border-b border-ink-100">
        <div className="max-w-content mx-auto px-5 py-2 flex items-center justify-between">
          <span className="text-caption text-ink-400 uppercase tracking-widest">
            Live
          </span>
          <span className="text-caption text-ink-400">
            <LiveClock />
          </span>
        </div>
      </div>

      {/* Masthead */}
      <div className="max-w-content mx-auto px-5 py-5 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink-950">
          Kosher News
        </h1>
        <div className="mt-1.5 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-ink-200" />
          <p className="text-caption text-ink-400 uppercase tracking-[0.2em]">
            No opinion &middot; No agenda &middot; Just news
          </p>
          <span className="h-px w-8 bg-ink-200" />
        </div>
      </div>

      {/* Date bar */}
      <div className="border-t border-ink-100 bg-ink-50">
        <div className="max-w-content mx-auto px-5 py-1.5">
          <p className="text-caption text-ink-500 text-center tracking-wide">
            {dateStr}
          </p>
        </div>
      </div>
    </header>
  );
}
