-- Migration 0035: Prioritize Hymns with Audio
-- Re-sequences hymns so that those with audio appear first (Weeks 1-N)
-- and those without audio appear last (Weeks N+1-M).
-- This ensures families encounter high-quality audio content first.

UPDATE liturgy_items
SET sequence_number = (
    SELECT new_rank
    FROM (
        SELECT
            id,
            ROW_NUMBER() OVER (
                ORDER BY
                    -- Priority 1: Has Audio (0 comes before 1)
                    CASE WHEN audio_url IS NOT NULL AND audio_url != '' THEN 0 ELSE 1 END ASC,
                    -- Priority 2: Original Sequence (maintain relative order)
                    sequence_number ASC
            ) as new_rank
        FROM liturgy_items
        WHERE type = 'hymn'
    ) as Ranked
    WHERE Ranked.id = liturgy_items.id
)
WHERE type = 'hymn';
