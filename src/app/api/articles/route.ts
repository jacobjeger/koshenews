import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("articles")
    .select("*")
    .range(offset, offset + limit - 1);

  if (category && category !== "all") {
    // Category view: show all articles in that category, newest first
    query = query
      .eq("category", category)
      .order("created_at", { ascending: false });
  } else {
    // Top Stories: only important articles, ranked by importance then recency
    query = query
      .gte("importance_score", 6)
      .order("importance_score", { ascending: false })
      .order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
