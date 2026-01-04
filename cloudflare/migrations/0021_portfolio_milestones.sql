-- Migration number: 0021 	 2026-01-04T00:00:00.000Z
-- Phase 2: Portfolio Milestones

-- Add milestone_tag column to portfolio_items
ALTER TABLE portfolio_items ADD COLUMN milestone_tag TEXT;

-- Create index for filtering by milestone
CREATE INDEX IF NOT EXISTS idx_portfolio_milestone ON portfolio_items(milestone_tag);

-- Create index for filtering by item_type (for Phase 2 filtering)
CREATE INDEX IF NOT EXISTS idx_portfolio_type ON portfolio_items(item_type);

-- Create index for filtering by domain (already exists but ensure it's there)
CREATE INDEX IF NOT EXISTS idx_portfolio_domain ON portfolio_items(domain);
