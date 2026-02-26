export interface Article {
  id: string;
  raw_article_id: string;
  headline: string;
  summary: string;
  category: "us" | "israel" | "world" | "business" | "tech" | "health";
  sources: string[];
  is_breaking: boolean;
  importance_score: number;
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
  { value: "all", label: "Top Stories" },
  { value: "us", label: "U.S." },
  { value: "israel", label: "Israel" },
  { value: "world", label: "World" },
  { value: "business", label: "Business" },
  { value: "tech", label: "Technology" },
  { value: "health", label: "Health" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  us: "U.S.",
  israel: "Israel",
  world: "World",
  business: "Business",
  tech: "Technology",
  health: "Health",
};
