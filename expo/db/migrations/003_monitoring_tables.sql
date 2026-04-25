-- ============================================================================
-- Migration 003: Monitoring Tables
-- Qaraj GM Backend — System Health, Error Logs, Bug Reports
-- Run this on the PostgreSQL server to create monitoring tables
-- ============================================================================

-- Create custom enum types
DO $$ BEGIN
  CREATE TYPE severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE bug_report_status AS ENUM ('new', 'acknowledged', 'in_progress', 'resolved', 'wont_fix');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ── Error Logs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity severity NOT NULL DEFAULT 'medium',
  source VARCHAR(50) NOT NULL,           -- 'api', 'mobile', 'system', 'database', 'sms', 'auth'
  endpoint VARCHAR(200),
  message TEXT NOT NULL,
  stack_trace TEXT,
  user_id UUID,
  user_phone VARCHAR(20),
  device_info TEXT,
  app_version VARCHAR(20),
  request_id VARCHAR(50),
  ip_address VARCHAR(50),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMP,
  resolved_by VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS error_logs_severity_idx ON error_logs (severity);
CREATE INDEX IF NOT EXISTS error_logs_source_idx ON error_logs (source);
CREATE INDEX IF NOT EXISTS error_logs_resolved_idx ON error_logs (resolved);
CREATE INDEX IF NOT EXISTS error_logs_created_idx ON error_logs (created_at);

-- ── Bug Reports ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name VARCHAR(100) NOT NULL,
  reporter_phone VARCHAR(20),
  reporter_role VARCHAR(30) NOT NULL DEFAULT 'tester',
  title VARCHAR(300) NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  severity severity NOT NULL DEFAULT 'medium',
  status bug_report_status NOT NULL DEFAULT 'new',
  assigned_to VARCHAR(100),
  resolution TEXT,
  device_info TEXT,
  app_version VARCHAR(20),
  screenshot_urls TEXT[] DEFAULT '{}',
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS bug_reports_status_idx ON bug_reports (status);
CREATE INDEX IF NOT EXISTS bug_reports_severity_idx ON bug_reports (severity);
CREATE INDEX IF NOT EXISTS bug_reports_created_idx ON bug_reports (created_at);

-- ── System Health Snapshots ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS system_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_status VARCHAR(20) NOT NULL,       -- 'healthy', 'degraded', 'down'
  db_status VARCHAR(20) NOT NULL,
  sms_status VARCHAR(20) NOT NULL,
  api_response_time_ms INTEGER,
  db_response_time_ms INTEGER,
  active_users_24h INTEGER,
  total_users INTEGER,
  total_vehicles INTEGER,
  total_appointments INTEGER,
  pending_appointments INTEGER,
  otp_sent_today INTEGER,
  otp_failures_today INTEGER,
  error_count_today INTEGER,
  uptime_seconds INTEGER,
  node_version VARCHAR(30),
  api_version VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS health_snapshots_created_idx ON system_health_snapshots (created_at);

-- ============================================================================
-- Verification: list all tables
-- ============================================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
