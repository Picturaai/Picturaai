-- Add image history table for storing generated images
CREATE TABLE IF NOT EXISTS image_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  full_prompt TEXT,
  model VARCHAR(50) NOT NULL,
  style_preset VARCHAR(50),
  width INTEGER NOT NULL DEFAULT 1024,
  height INTEGER NOT NULL DEFAULT 1024,
  image_url TEXT NOT NULL,
  generation_time_ms INTEGER,
  provider VARCHAR(50),
  credits_used DECIMAL(10,4) DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by developer
CREATE INDEX IF NOT EXISTS idx_image_history_developer ON image_history(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_history_favorites ON image_history(developer_id, is_favorite) WHERE is_favorite = TRUE;

-- Add credit alert settings table
CREATE TABLE IF NOT EXISTS credit_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  threshold_amount DECIMAL(10,2) NOT NULL,
  alert_type VARCHAR(20) NOT NULL DEFAULT 'email', -- 'email', 'webhook', 'both'
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(developer_id, threshold_amount)
);

-- Add webhook logs for tracking
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  response_status INTEGER,
  response_body TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Add usage analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint VARCHAR(100) NOT NULL,
  model VARCHAR(50),
  prompt_length INTEGER,
  generation_time_ms INTEGER,
  credits_used DECIMAL(10,4),
  status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'rate_limited'
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_usage_analytics_developer ON usage_analytics(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_analytics_daily ON usage_analytics(developer_id, DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_usage_analytics_endpoint ON usage_analytics(endpoint, created_at DESC);

-- Add batch jobs table
CREATE TABLE IF NOT EXISTS batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  total_images INTEGER NOT NULL,
  completed_images INTEGER DEFAULT 0,
  failed_images INTEGER DEFAULT 0,
  prompts JSONB NOT NULL,
  results JSONB DEFAULT '[]',
  model VARCHAR(50) NOT NULL,
  style_preset VARCHAR(50),
  width INTEGER DEFAULT 1024,
  height INTEGER DEFAULT 1024,
  credits_used DECIMAL(10,4) DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_batch_jobs_developer ON batch_jobs(developer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status) WHERE status IN ('pending', 'processing');
