-- Auto-fetch news every 30 minutes using pg_cron + pg_net
-- pg_cron and pg_net are pre-installed on Supabase hosted projects

SELECT cron.schedule(
  'fetch-news-every-30min',
  '*/30 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://xbxcxwzrxntkydweywio.supabase.co/functions/v1/fetch-news',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhieGN4d3pyeG50a3lkd2V5d2lvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTI5MDMsImV4cCI6MjA4NzYyODkwM30.pLh0jR8bLRHSD9S2t3xWauoHc4zs8uS4CvqOwQ6Nzbo"}'::jsonb
  ) AS request_id;
  $$
);
