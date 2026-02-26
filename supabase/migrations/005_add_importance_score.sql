-- Add importance scoring for Top Stories ranking
ALTER TABLE articles ADD COLUMN importance_score INT DEFAULT 5;

CREATE INDEX idx_articles_importance ON articles(importance_score DESC, created_at DESC);

-- Backfill: give existing breaking articles a higher default score
UPDATE articles SET importance_score = 8 WHERE is_breaking = true;

-- Daily briefings cache table
CREATE TABLE daily_briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  briefing_date DATE NOT NULL UNIQUE,
  content TEXT NOT NULL,
  article_count INT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_briefings_date ON daily_briefings(briefing_date DESC);
