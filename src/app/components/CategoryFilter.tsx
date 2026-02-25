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
    <div className="sticky top-[52px] z-40 bg-gray-50 border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 py-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onSelect(cat.value)}
              className={`category-pill ${
                selected === cat.value
                  ? "category-pill-active"
                  : "category-pill-inactive"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
