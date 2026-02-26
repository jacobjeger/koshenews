import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Compute a ranking score that blends importance with recency.
// Newer articles get a boost so they can compete with older high-scoring ones.
function rankScore(article: { importance_score: number; created_at: string; is_breaking: boolean }) {
  const hoursAgo = (Date.now() - new Date(article.created_at).getTime()) / 3_600_000;
  const recencyBoost = Math.max(0, 3 - hoursAgo * 0.5); // +3 at 0h, +0 at 6h+
  const breakingBoost = article.is_breaking && hoursAgo < 4 ? 2 : 0;
  return article.importance_score + recencyBoost + breakingBoost;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  if (category && category !== "all") {
    // Category view: newest first
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // Top Stories: fetch a larger pool, rank with time-decay, then paginate
  const poolSize = Math.max(100, offset + limit);
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(poolSize);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ranked = (data || [])
    .sort((a, b) => rankScore(b) - rankScore(a))
    .slice(offset, offset + limit);

  return NextResponse.json(ranked);
}
