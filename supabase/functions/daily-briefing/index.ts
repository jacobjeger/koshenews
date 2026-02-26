import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

Deno.serve(async (_req) => {
  try {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/New_York",
    });

    // Check cache first
    const { data: existing } = await supabase
      .from("daily_briefings")
      .select("*")
      .eq("briefing_date", today)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({
          briefing: existing.content,
          article_count: existing.article_count,
          generated_at: existing.generated_at,
          cached: true,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Fetch today's top articles (last 24 hours, highest importance)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: articles } = await supabase
      .from("articles")
      .select("headline, summary, category, importance_score, sources")
      .gte("created_at", oneDayAgo)
      .order("importance_score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10);

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({
          briefing: "No stories available for today's briefing yet. Check back later.",
          article_count: 0,
          generated_at: new Date().toISOString(),
          cached: false,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Build article list for the prompt
    const articleList = articles
      .map(
        (a, i) =>
          `${i + 1}. [${a.category.toUpperCase()}] ${a.headline}\n   ${a.summary.split("\n\n")[0]}`
      )
      .join("\n\n");

    const prompt = `You are the editor of Kosher News, a conservative, pro-Israel news service for religious Jewish readers.

Write a concise daily briefing summarizing today's most important stories. The briefing should:
- Start with a one-line overview of the day's news theme
- Present each major story as a bullet point (start each bullet with ">")
- Each bullet should be 1-2 sentences capturing the essential facts and significance
- Group related stories together if applicable
- End with a brief closing line
- Keep the total briefing under 400 words
- Maintain a conservative, pro-Israel editorial perspective
- Use clear, professional language appropriate for a religious family audience

Today's top stories:

${articleList}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 800,
      }),
    });

    const data = await response.json();
    const briefingContent = data.choices[0].message.content;

    // Cache the briefing
    await supabase.from("daily_briefings").insert({
      briefing_date: today,
      content: briefingContent,
      article_count: articles.length,
    });

    return new Response(
      JSON.stringify({
        briefing: briefingContent,
        article_count: articles.length,
        generated_at: new Date().toISOString(),
        cached: false,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
