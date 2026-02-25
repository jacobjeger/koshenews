import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = getSupabase();

  const [
    { count: totalArticles },
    { count: totalRaw },
    { count: totalRejected },
    { count: totalSources },
    { count: activeSources },
    { data: categoryData },
    { data: recentArticles },
    { data: breakingCount },
  ] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }),
    supabase.from("raw_articles").select("*", { count: "exact", head: true }),
    supabase
      .from("raw_articles")
      .select("*", { count: "exact", head: true })
      .eq("rejected", true),
    supabase.from("sources").select("*", { count: "exact", head: true }),
    supabase
      .from("sources")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
    supabase.from("articles").select("category"),
    supabase
      .from("articles")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("is_breaking", true),
  ]);

  // Count articles by category
  const categoryCounts: Record<string, number> = {};
  if (categoryData) {
    for (const row of categoryData) {
      categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
    }
  }

  // Count articles from last 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: last24h } = await supabase
    .from("articles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneDayAgo);

  return NextResponse.json({
    totalArticles: totalArticles || 0,
    totalRaw: totalRaw || 0,
    totalRejected: totalRejected || 0,
    totalSources: totalSources || 0,
    activeSources: activeSources || 0,
    breakingCount: breakingCount || 0,
    categoryCounts,
    last24h: last24h || 0,
    lastArticleAt: recentArticles?.[0]?.created_at || null,
  });
}
