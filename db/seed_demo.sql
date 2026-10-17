-- Explicitly illustrative data. Never join these rows into live-only reports.
INSERT INTO trend_categories(slug,name) VALUES
 ('ai','AI'),('technology','Technology'),('finance','Finance'),('culture','Culture'),
 ('entertainment','Entertainment'),('fashion','Fashion'),('health','Health'),('gaming','Gaming')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO data_providers(slug,display_name,provider_type) VALUES
 ('hacker-news','Hacker News','api'),('github','GitHub','api'),('google-news-rss','Google News RSS','rss'),('wikimedia','Wikimedia Pageviews','api')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO trends(slug,name,category_id,summary,lifecycle_stage,data_mode)
SELECT v.slug,v.name,c.id,v.summary,v.stage,'demo'
FROM (VALUES
 ('ai-agents','AI agents','ai','Software that plans and completes multi-step tasks.','viral'),
 ('humanoid-robots','Humanoid robots','technology','Human-shaped robots for work in human spaces.','growing'),
 ('model-context-protocol','Model Context Protocol','ai','A protocol that connects AI applications with tools and data.','growing'),
 ('ceremonial-matcha','Ceremonial matcha','culture','Interest in premium Japanese green tea.','emerging'),
 ('bitcoin','Bitcoin','finance','Interest in the Bitcoin network, markets and policy.','mature'),
 ('ai-coding-tools','AI coding tools','ai','AI assistants for writing, reviewing and maintaining code.','growing'),
 ('longevity-science','Longevity science','health','Research and products focused on healthy aging.','emerging'),
 ('quiet-luxury','Quiet luxury','fashion','Understated design and discreet branding.','declining'),
 ('spatial-computing','Spatial computing','technology','Digital experiences blended with physical spaces.','mature'),
 ('indie-games','Indie games','gaming','Independent video games and creative studios.','mature')
) AS v(slug,name,category,summary,stage)
JOIN trend_categories c ON c.slug=v.category
ON CONFLICT (slug) DO NOTHING;

-- One synthetic daily point per trend for the trailing year, for demo UI only.
WITH series AS (
  SELECT t.id,t.slug,t.data_mode,g.day,
         row_number() OVER (PARTITION BY t.id ORDER BY g.day)-1 AS n
  FROM trends t CROSS JOIN generate_series(current_date-364,current_date,interval '1 day') AS g(day)
  WHERE t.data_mode='demo'
), values_by_day AS (
  SELECT id,data_mode,day,n,
    CASE WHEN slug='quiet-luxury' THEN 58-n*0.028 ELSE 25+n*0.045 END
      + sin(n*0.19 + length(slug))*4 + sin(n*0.047)*6 AS raw_score,
    CASE WHEN slug='quiet-luxury' THEN 3000-n*2 ELSE 900+n*7 END AS raw_mentions
  FROM series
)
INSERT INTO trend_snapshots(trend_id,captured_at,interval_kind,score,mention_count,source_count,sentiment,component_scores,data_mode)
SELECT id,day,'day',LEAST(99,GREATEST(8,raw_score)),GREATEST(30,raw_mentions),3,
  LEAST(92,GREATEST(30,68+sin(n*0.1)*8)),
  jsonb_build_object('demo',true,'method','deterministic synthetic sample'),data_mode
FROM values_by_day
ON CONFLICT (trend_id,interval_kind,captured_at) DO NOTHING;
