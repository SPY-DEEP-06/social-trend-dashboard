-- PostgreSQL baseline for the trend intelligence data model.
-- Store one normalized row per provider signal and time-bucketed snapshots.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE data_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  display_name text NOT NULL,
  provider_type text NOT NULL CHECK (provider_type IN ('api','rss','dataset')),
  enabled boolean NOT NULL DEFAULT true,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE trend_categories (
  id smallserial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL UNIQUE
);

CREATE TABLE trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category_id smallint REFERENCES trend_categories(id),
  summary text,
  first_seen_at timestamptz,
  lifecycle_stage text CHECK (lifecycle_stage IN ('discovery','emerging','growing','viral','peak','mature','declining')),
  data_mode text NOT NULL DEFAULT 'live' CHECK (data_mode IN ('live','demo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX trends_category_updated_idx ON trends(category_id, updated_at DESC);
CREATE INDEX trends_mode_stage_idx ON trends(data_mode, lifecycle_stage, updated_at DESC);

CREATE TABLE trend_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES data_providers(id),
  external_id text,
  canonical_url text,
  title text NOT NULL,
  published_at timestamptz,
  observed_at timestamptz NOT NULL DEFAULT now(),
  metric_value double precision,
  metric_name text,
  metadata jsonb NOT NULL DEFAULT '{}',
  UNIQUE(provider_id, external_id)
);

CREATE INDEX trend_sources_trend_observed_idx ON trend_sources(trend_id, observed_at DESC);
CREATE INDEX trend_sources_provider_observed_idx ON trend_sources(provider_id, observed_at DESC);
CREATE INDEX trend_sources_published_idx ON trend_sources(published_at DESC) WHERE published_at IS NOT NULL;

CREATE TABLE trend_snapshots (
  trend_id uuid NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  captured_at timestamptz NOT NULL,
  interval_kind text NOT NULL CHECK (interval_kind IN ('hour','day','week')),
  score numeric(5,2),
  mention_count bigint,
  engagement numeric(14,2),
  sentiment numeric(5,2),
  source_count smallint NOT NULL DEFAULT 0,
  search_interest numeric(5,2),
  geography jsonb,
  component_scores jsonb NOT NULL DEFAULT '{}',
  data_mode text NOT NULL CHECK (data_mode IN ('live','demo')),
  PRIMARY KEY (trend_id, interval_kind, captured_at)
);

CREATE INDEX trend_snapshots_range_idx ON trend_snapshots(interval_kind, captured_at DESC, trend_id);

CREATE TABLE trend_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL,
  title text NOT NULL,
  description text,
  source_id uuid REFERENCES trend_sources(id) ON DELETE SET NULL,
  confidence numeric(4,3),
  data_mode text NOT NULL DEFAULT 'live' CHECK (data_mode IN ('live','demo'))
);

CREATE INDEX trend_events_timeline_idx ON trend_events(trend_id, occurred_at DESC);

CREATE TABLE trend_relationships (
  source_trend_id uuid NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  target_trend_id uuid NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('semantic','co_occurrence','shared_audience','shared_source','temporal')),
  strength numeric(5,4) NOT NULL CHECK (strength BETWEEN 0 AND 1),
  computed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(source_trend_id, target_trend_id, relationship_type),
  CHECK(source_trend_id <> target_trend_id)
);

CREATE INDEX trend_relationships_target_idx ON trend_relationships(target_trend_id, strength DESC);

CREATE TABLE trend_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  generated_at timestamptz NOT NULL DEFAULT now(),
  horizon_days smallint NOT NULL CHECK (horizon_days BETWEEN 1 AND 365),
  continued_growth_probability numeric(4,3),
  estimated_peak_at timestamptz,
  estimated_decline_probability numeric(4,3),
  confidence numeric(4,3),
  explanation text,
  model_name text,
  evidence_source_ids uuid[] NOT NULL DEFAULT '{}',
  data_mode text NOT NULL CHECK (data_mode IN ('live','demo'))
);

CREATE INDEX trend_forecasts_latest_idx ON trend_forecasts(trend_id, generated_at DESC);

CREATE TABLE ai_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  generated_at timestamptz NOT NULL DEFAULT now(),
  analysis_type text NOT NULL CHECK (analysis_type IN ('summary','daily','drivers','forecast')),
  content jsonb NOT NULL,
  evidence_source_ids uuid[] NOT NULL DEFAULT '{}',
  model_name text,
  data_mode text NOT NULL CHECK (data_mode IN ('live','demo'))
);

CREATE INDEX ai_analyses_latest_idx ON ai_analyses(trend_id, analysis_type, generated_at DESC);

CREATE TABLE trend_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id uuid NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES trend_sources(id) ON DELETE CASCADE,
  observed_at timestamptz NOT NULL,
  mention_count integer NOT NULL DEFAULT 1 CHECK (mention_count >= 0),
  engagement numeric(14,2),
  sentiment numeric(5,2),
  region text,
  data_mode text NOT NULL CHECK (data_mode IN ('live','demo')),
  UNIQUE(source_id, region)
);

CREATE INDEX trend_mentions_trend_time_idx ON trend_mentions(trend_id, observed_at DESC);
CREATE INDEX trend_mentions_region_time_idx ON trend_mentions(region, observed_at DESC) WHERE region IS NOT NULL;
