-- Fix vector index to use DISTANCE=cosine to match VEC_DISTANCE_COSINE function
-- Run this migration to update the existing index
-- Drop the existing index
DROP INDEX v ON inducks_entryurl_vector;
-- Recreate with DISTANCE=cosine parameter
-- Based on migration.sql syntax: "create index v on inducks_entryurl_vector (v) using vector distance = cosine;"
CREATE INDEX v ON inducks_entryurl_vector (v) USING VECTOR DISTANCE = cosine;
-- Update statistics
ANALYZE TABLE inducks_entryurl_vector;
-- Verify the index was created correctly
SHOW INDEX
FROM inducks_entryurl_vector
WHERE Key_name = 'v';
-- Test that the index can now be used (with LIMIT smaller than table size)
-- Note: With 667k rows, LIMIT 5 should work fine
SET @test_vector = vec_fromtext('[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0]');
EXPLAIN
SELECT entrycode,
    VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM inducks_entryurl_vector
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 5;
-- Expected: type=index, key=v (if LIMIT is smaller than table size)