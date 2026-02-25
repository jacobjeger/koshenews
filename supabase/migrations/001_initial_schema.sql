-- Sources table: RSS feed sources
CREATE TABLE sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  feed_url TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'world',
  category_hint TEXT DEFAULT 'general',
  active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  error_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Raw articles: unprocessed articles from RSS feeds
CREATE TABLE raw_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES sources(id),
  original_url TEXT NOT NULL UNIQUE,
  original_title TEXT NOT NULL,
  original_content TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  rejected BOOLEAN DEFAULT false,
  rejection_reason TEXT
);

-- Processed articles: AI-filtered and summarized
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_article_id UUID REFERENCES raw_articles(id),
  headline TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  sources TEXT[] NOT NULL,
  is_breaking BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast queries
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_breaking ON articles(is_breaking) WHERE is_breaking = true;
CREATE INDEX idx_raw_articles_url ON raw_articles(original_url);
CREATE INDEX idx_raw_articles_unprocessed ON raw_articles(processed) WHERE processed = false;
