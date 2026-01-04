-- Migration 0021: Portfolio Milestones

-- Add milestone_tag column to portfolio_items
ALTER TABLE portfolio_items ADD COLUMN milestone_tag TEXT;

-- Create index for filtering by milestone
CREATE INDEX IF NOT EXISTS idx_portfolio_milestone ON portfolio_items(milestone_tag);

-- Create index for filtering by item_type (for Phase 2 filtering)
CREATE INDEX IF NOT EXISTS idx_portfolio_type ON portfolio_items(item_type);

-- Create index for filtering by domain
CREATE INDEX IF NOT EXISTS idx_portfolio_domain ON portfolio_items(domain);