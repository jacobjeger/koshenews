import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

Deno.serve(async (_req) => {
  try {
    // 1. Get all active sources
    const { data: sources } = await supabase
      .from("sources")
      .select("*")
      .eq("active", true);

    // 2. Fetch RSS feeds and collect new articles
    const newArticles: any[] = [];

    for (const source of sources || []) {
      try {
        const response = await fetch(source.feed_url, {
          headers: { "User-Agent": "KosherNews/1.0" },
        });
        const xml = await response.text();
        const items = parseRSSItems(xml);

        for (const item of items.slice(0, 10)) {
          // Check if we already have this URL
          const { data: existing } = await supabase
            .from("raw_articles")
            .select("id")
            .eq("original_url", item.link)
            .single();

          if (!existing) {
            // Try to extract full article text
            let fullText = item.description || "";

            try {
              const articleResponse = await fetch(item.link, {
                headers: { "User-Agent": "KosherNews/1.0" },
                signal: AbortSignal.timeout(10000),
              });
              const html = await articleResponse.text();
              fullText = extractArticleText(html) || fullText;
            } catch {
              // Use RSS content if article fetch fails
            }

            const { data: inserted } = await supabase
              .from("raw_articles")
              .insert({
                source_id: source.id,
                original_url: item.link,
                original_title: item.title,
                original_content: fullText.slice(0, 10000),
                published_at: item.pubDate
                  ? new Date(item.pubDate).toISOString()
                  : null,
              })
              .select()
              .single();

            if (inserted) {
              newArticles.push({
                ...inserted,
                source_name: source.name,
                category_hint: source.category_hint,
              });
            }
          }
        }

        // Update last_fetched_at and reset error count on success
        await supabase
          .from("sources")
          .update({
            last_fetched_at: new Date().toISOString(),
            error_count: 0,
          })
          .eq("id", source.id);
      } catch (err) {
        console.error(`Error fetching ${source.name}:`, (err as Error).message);

        // Increment error count; disable source after 3 consecutive failures
        const newErrorCount = (source.error_count || 0) + 1;
        await supabase
          .from("sources")
          .update({
            error_count: newErrorCount,
            active: newErrorCount < 3,
          })
          .eq("id", source.id);
      }
    }

    // 3. Also pick up any previously unprocessed raw articles
    const { data: unprocessed } = await supabase
      .from("raw_articles")
      .select("*, sources!inner(name, category_hint)")
      .eq("processed", false)
      .eq("rejected", false)
      .order("fetched_at", { ascending: true })
      .limit(50);

    const toProcess = [
      ...newArticles,
      ...(unprocessed || [])
        .filter((r: any) => !newArticles.some((n: any) => n.id === r.id))
        .map((r: any) => ({
          ...r,
          source_name: r.sources?.name || "Unknown",
          category_hint: r.sources?.category_hint || "general",
        })),
    ];

    // 4. Process articles through AI
    let processed = 0;
    for (const article of toProcess) {
      await processArticleWithAI(article);
      processed++;
      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return new Response(
      JSON.stringify({ processed }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// --- AI Processing ---

async function processArticleWithAI(article: any) {
  const prompt = `You are a news editor for a clean, factual news service. Your audience is religious Jewish readers who want straight news with no agenda or sensationalism.

Analyze this article and decide:
1. Should it be published? Reject if it contains: explicit sexual content, celebrity gossip, content promoting immodesty, graphic violence details, content that would be inappropriate for a religious family audience, or trivial/clickbait content with no news value.
2. If published, write a detailed factual summary (5-8 paragraphs).

Article title: ${article.original_title}
Article source: ${article.source_name}
Source category hint: ${article.category_hint}
Article content: ${(article.original_content || "").slice(0, 4000)}

If the source article is in Hebrew, translate and summarize in English.

Respond in this exact JSON format:
{
  "publish": true/false,
  "rejection_reason": "reason if rejected, null if published",
  "headline": "Clear, factual headline (no clickbait)",
  "summary": "Detailed multi-paragraph summary. Use \\n\\n between paragraphs. Be factual, thorough, and neutral. Include relevant numbers, names, dates. No opinion or editorial commentary.",
  "category": "us|israel|world|business|tech|health",
  "is_breaking": true/false
}`;

  try {
    // Check for duplicates before processing
    const duplicate = await isDuplicate(article.original_title);
    if (duplicate) {
      // Merge sources instead of creating new article
      await mergeSource(duplicate.id, article.source_name);
      await supabase
        .from("raw_articles")
        .update({ processed: true, rejected: true, rejection_reason: "duplicate" })
        .eq("id", article.id);
      return;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    if (result.publish) {
      // Final duplicate check on AI-generated headline
      const headlineDup = await isDuplicate(result.headline);
      if (headlineDup) {
        await mergeSource(headlineDup.id, article.source_name);
      } else {
        await supabase.from("articles").insert({
          raw_article_id: article.id,
          headline: result.headline,
          summary: result.summary,
          category: result.category,
          sources: [article.source_name],
          is_breaking: result.is_breaking,
          published_at: article.published_at || new Date().toISOString(),
        });
      }
    }

    // Mark as processed
    await supabase
      .from("raw_articles")
      .update({
        processed: true,
        rejected: !result.publish,
        rejection_reason: result.rejection_reason,
      })
      .eq("id", article.id);
  } catch (err) {
    console.error(
      `AI processing error for ${article.original_title}:`,
      (err as Error).message
    );
  }
}

// --- Duplicate Detection ---

async function isDuplicate(
  headline: string
): Promise<{ id: string; sources: string[] } | null> {
  const { data } = await supabase
    .from("articles")
    .select("id, headline, sources")
    .gte(
      "created_at",
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );

  if (!data) return null;

  const lowerHeadline = headline.toLowerCase();
  const words1 = new Set(
    lowerHeadline.split(/\s+/).filter((w) => w.length > 3)
  );

  for (const article of data) {
    const existing = article.headline.toLowerCase();
    const words2 = new Set(existing.split(/\s+/).filter((w) => w.length > 3));
    const overlap = [...words1].filter((w) => words2.has(w)).length;
    const similarity = overlap / Math.max(words1.size, words2.size);
    if (similarity > 0.6) {
      return { id: article.id, sources: article.sources };
    }
  }

  return null;
}

async function mergeSource(existingArticleId: string, newSourceName: string) {
  const { data } = await supabase
    .from("articles")
    .select("sources")
    .eq("id", existingArticleId)
    .single();

  if (data && !data.sources.includes(newSourceName)) {
    await supabase
      .from("articles")
      .update({ sources: [...data.sources, newSourceName] })
      .eq("id", existingArticleId);
  }
}

// --- RSS Parsing ---

function parseRSSItems(
  xml: string
): Array<{
  title: string;
  link: string;
  description: string;
  pubDate: string;
}> {
  const items: any[] = [];

  // Try RSS format first
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      title: extractTag(itemXml, "title"),
      link: extractTag(itemXml, "link"),
      description: extractTag(itemXml, "description"),
      pubDate: extractTag(itemXml, "pubDate"),
    });
  }

  // Try Atom format if no RSS items found
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    while ((match = entryRegex.exec(xml)) !== null) {
      const entryXml = match[1];
      const linkMatch = entryXml.match(
        /<link[^>]*href="([^"]*)"[^>]*\/?>/
      );
      items.push({
        title: extractTag(entryXml, "title"),
        link: linkMatch ? linkMatch[1] : extractTag(entryXml, "link"),
        description:
          extractTag(entryXml, "summary") ||
          extractTag(entryXml, "content"),
        pubDate:
          extractTag(entryXml, "published") ||
          extractTag(entryXml, "updated"),
      });
    }
  }

  return items;
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(
      `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`
    )
  );
  return match ? (match[1] || match[2] || "").trim() : "";
}

// --- Article Text Extraction ---

function extractArticleText(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 10000);
}
