"use client";

export default function Header() {
  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Kosher News</h1>
            <p className="text-xs text-blue-200 mt-0.5">
              No opinion &middot; No agenda &middot; Just news
            </p>
          </div>
          <div className="text-xs text-blue-200">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
