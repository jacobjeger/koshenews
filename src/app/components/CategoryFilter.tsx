"use client";

import { CATEGORIES, Category } from "@/lib/types";

interface CategoryFilterProps {
  selected: Category;
  onSelect: (category: Category) => void;
}

export default function CategoryFilter({
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-ink-200">
      <div className="max-w-content mx-auto px-6">
        <div className="flex overflow-x-auto no-scrollbar -mb-px">
          {CATEGORIES.map((cat) => {
            const isActive = selected === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onSelect(cat.value)}
                className={`
                  relative px-4 py-3.5 text-body-sm whitespace-nowrap transition-all
                  ${
                    isActive
                      ? "text-ink-950 font-semibold"
                      : "text-ink-400 hover:text-ink-700 font-medium"
                  }
                `}
              >
                {cat.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
