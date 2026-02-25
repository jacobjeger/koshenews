-- Phase 1: Starter sources (10-15 reliable feeds)
INSERT INTO sources (name, feed_url, region, category_hint) VALUES
-- US / General
('AP News', 'https://rsshub.app/apnews/topics/apf-topnews', 'us', 'general'),
('Reuters', 'https://www.rss-bridge.org/bridge01/?action=display&bridge=Reuters&topic=world&format=Atom', 'world', 'general'),
('BBC News', 'https://feeds.bbci.co.uk/news/rss.xml', 'world', 'general'),
('BBC World', 'https://feeds.bbci.co.uk/news/world/rss.xml', 'world', 'general'),
('NPR Top Stories', 'https://feeds.npr.org/1001/rss.xml', 'us', 'general'),

-- Israel
('Times of Israel', 'https://www.timesofisrael.com/feed/', 'israel', 'general'),
('Jerusalem Post', 'https://www.jpost.com/rss/rssfeedsfrontpage.aspx', 'israel', 'general'),
('Ynet English', 'https://www.ynetnews.com/rss/all.xml', 'israel', 'general'),
('i24 News', 'https://www.i24news.tv/en/rss', 'israel', 'general'),

-- Business
('BBC Business', 'https://feeds.bbci.co.uk/news/business/rss.xml', 'world', 'business'),
('CNBC', 'https://www.cnbc.com/id/100003114/device/rss/rss.html', 'us', 'business'),

-- Tech
('The Verge', 'https://www.theverge.com/rss/index.xml', 'world', 'tech'),
('BBC Tech', 'https://feeds.bbci.co.uk/news/technology/rss.xml', 'world', 'tech'),

-- Health / Science
('BBC Health', 'https://feeds.bbci.co.uk/news/health/rss.xml', 'world', 'health'),
('BBC Science', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', 'world', 'health');
