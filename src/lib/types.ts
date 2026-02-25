export interface Article {
  id: string;
  raw_article_id: string;
  headline: string;
  summary: string;
  category: "us" | "israel" | "world" | "business" | "tech" | "health";
  sources: string[];
  is_breaking: boolean;
  published_at: string;
  created_at: string;
}

export interface Source {
  id: string;
  name: string;
  feed_url: string;
  region: string;
  category_hint: string;
  active: boolean;
  last_fetched_at: string | null;
  error_count: number;
  created_at: string;
}

export interface RawArticle {
  id: string;
  source_id: string;
  original_url: string;
  original_title: string;
  original_content: string | null;
  published_at: string | null;
  fetched_at: string;
  processed: boolean;
  rejected: boolean;
  rejection_reason: string | null;
}

export type Category = "all" | Article["category"];

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "us", label: "US" },
  { value: "israel", label: "Israel" },
  { value: "world", label: "World" },
  { value: "business", label: "Business" },
  { value: "tech", label: "Tech" },
  { value: "health", label: "Health" },
];

export const CATEGORY_COLORS: Record<string, string> = {
  us: "bg-blue-100 text-blue-800",
  israel: "bg-indigo-100 text-indigo-800",
  world: "bg-green-100 text-green-800",
  business: "bg-amber-100 text-amber-800",
  tech: "bg-purple-100 text-purple-800",
  health: "bg-rose-100 text-rose-800",
};
