-- Add conservative and diverse news sources
INSERT INTO sources (name, feed_url, region, category_hint) VALUES
-- US Conservative / Right-leaning
('Fox News', 'https://moxie.foxnews.com/google-publisher/latest.xml', 'us', 'general'),
('Fox News Politics', 'https://moxie.foxnews.com/google-publisher/politics.xml', 'us', 'general'),
('New York Post', 'https://nypost.com/feed/', 'us', 'general'),
('Daily Wire', 'https://www.dailywire.com/feeds/rss.xml', 'us', 'general'),
('Washington Examiner', 'https://www.washingtonexaminer.com/feed', 'us', 'general'),
('Washington Free Beacon', 'https://freebeacon.com/feed/', 'us', 'general'),
('National Review', 'https://www.nationalreview.com/feed/', 'us', 'general'),
('The Federalist', 'https://thefederalist.com/feed/', 'us', 'general'),
('Breitbart', 'https://feeds.feedburner.com/breitbart', 'us', 'general'),

-- Jewish News
('Jewish Press', 'https://www.jewishpress.com/feed/', 'us', 'general'),
('Arutz Sheva', 'https://www.israelnationalnews.com/Rss/Rss.aspx/headlines', 'israel', 'general'),
('Hamodia', 'https://hamodia.com/feed/', 'us', 'general'),
('Mishpacha', 'https://mishpacha.com/feed/', 'us', 'general'),

-- Israel (additional right-leaning)
('Israel Hayom', 'https://www.israelhayom.com/feed/', 'israel', 'general'),

-- Business
('Forbes', 'https://www.forbes.com/innovation/feed2', 'us', 'business'),

-- Tech
('TechCrunch', 'https://techcrunch.com/feed/', 'world', 'tech');
