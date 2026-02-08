
-- ==========================================
-- FORMLY AI: ANALYTICAL MATERIALIZED VIEWS
-- Optimized for High-Concurrency Decision Dashboards
-- ==========================================

-- 1. Segment Intelligence Report
-- Pre-computes alignment, risk, and volume metrics across organizational segments.
-- This view powers the comparative bar charts and heatmaps in the Intelligence Hub.

CREATE MATERIALIZED VIEW mv_segment_intelligence_report AS
SELECT 
    f.id as form_id,
    s.id as segment_id,
    s.name as segment_name,
    COUNT(DISTINCT c.id) as response_volume,
    AVG(CASE WHEN ss.score_type = 'alignment' THEN ss.score_value END) * 100 as avg_alignment,
    AVG(CASE WHEN ss.score_type = 'risk' THEN ss.score_value END) * 100 as avg_risk,
    AVG(CASE WHEN ss.score_type = 'sentiment' THEN ss.score_value END) * 100 as avg_sentiment
FROM 
    forms f
JOIN segments s ON s.organization_id = f.organization_id
LEFT JOIN respondents r ON r.segment_id = s.id
LEFT JOIN conversations c ON c.respondent_id = r.id AND c.form_id = f.id
LEFT JOIN conversation_messages cm ON cm.conversation_id = c.id
LEFT JOIN semantic_scores ss ON ss.message_id = cm.id
GROUP BY 
    f.id, s.id, s.name
WITH DATA;

-- Create unique index to allow CONCURRENT refresh (no locking during update)
CREATE UNIQUE INDEX idx_mv_segment_intel_unique ON mv_segment_intelligence_report (form_id, segment_id);


-- 2. Form Global Semantic Profile
-- Aggregates all semantic scores into a radar-ready format.
-- Powers the 'Semantic Profile' radar charts.

CREATE MATERIALIZED VIEW mv_form_global_radar AS
SELECT 
    c.form_id,
    ss.score_type as subject,
    AVG(ss.score_value) * 100 as avg_score,
    COUNT(ss.id) as data_points
FROM 
    semantic_scores ss
JOIN conversation_messages cm ON cm.id = ss.message_id
JOIN conversations c ON c.id = cm.conversation_id
GROUP BY 
    c.form_id, ss.score_type
WITH DATA;

CREATE UNIQUE INDEX idx_mv_form_radar_unique ON mv_form_global_radar (form_id, subject);


-- 3. Outlier Criticality Monitor
-- Summarizes outlier distribution and audit status.
-- Powers the 'Outlier Management' sidebar.

CREATE MATERIALIZED VIEW mv_outlier_monitoring AS
SELECT 
    form_id,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed_count,
    MAX(created_at) as last_detected_at
FROM 
    outliers
GROUP BY 
    form_id
WITH DATA;

CREATE UNIQUE INDEX idx_mv_outlier_monitor_unique ON mv_outlier_monitoring (form_id);


-- ==========================================
-- REFRESH STRATEGY & AUTOMATION
-- ==========================================

-- Function to trigger a concurrent refresh of all intelligence views
CREATE OR REPLACE FUNCTION refresh_intelligence_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_segment_intelligence_report;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_form_global_radar;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_outlier_monitoring;
END;
$$ LANGUAGE plpgsql;

-- SCHEDULED REFRESH (Using Supabase pg_cron)
-- Note: Ensure pg_cron is enabled in your Supabase dashboard (Database -> Extensions)
-- This runs the refresh every 30 minutes.

-- SELECT cron.schedule(
--     'refresh-formly-intelligence', -- unique name
--     '*/30 * * * *',                -- cron expression (every 30 mins)
--     'SELECT refresh_intelligence_views();'
-- );

-- ON-DEMAND REFRESH TRIGGER
-- This ensures the view is refreshed whenever a new batch of AI insights is generated.
-- Hook this into your /api/recompute-insights route.

COMMENT ON MATERIALIZED VIEW mv_segment_intelligence_report IS 'Pre-computed segment metrics for strategic alignment dashboards.';
