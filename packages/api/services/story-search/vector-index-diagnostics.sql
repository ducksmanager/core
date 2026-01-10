-- Vector Index Diagnostics for MariaDB 11.8
-- Run these queries to investigate why the vector index is not being used
-- 1. Check MariaDB version and vector support
SELECT VERSION() as mariadb_version;
SHOW VARIABLES LIKE '%vector%';
-- 2. Verify the vector index exists and its definition
SHOW INDEX
FROM inducks_entryurl_vector
WHERE Key_name = 'v';
SHOW CREATE TABLE inducks_entryurl_vector;
-- 3. Check table statistics
SELECT TABLE_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH,
    AUTO_INCREMENT
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inducks_entryurl_vector';
-- 4. Check if vector index appears in statistics (it might not, which is normal)
SELECT TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    CARDINALITY,
    INDEX_TYPE,
    COMMENT
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inducks_entryurl_vector'
    AND INDEX_NAME = 'v';
-- 5. Test simplest possible query - should use vector index
EXPLAIN
SELECT entrycode,
    VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]')) as similarity
FROM inducks_entryurl_vector
ORDER BY VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]'))
LIMIT 5;
-- 6. Test with stored vector variable
SET @test_vector = vec_fromtext('[0.1,0.2,0.3,0.4,0.5]');
EXPLAIN
SELECT entrycode,
    VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM inducks_entryurl_vector
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 5;
-- 7. Test with FORCE INDEX
EXPLAIN
SELECT entrycode,
    VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]')) as similarity
FROM inducks_entryurl_vector FORCE INDEX (v)
ORDER BY VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]'))
LIMIT 5;
-- 8. Test with USE INDEX
EXPLAIN
SELECT entrycode,
    VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]')) as similarity
FROM inducks_entryurl_vector USE INDEX (v)
ORDER BY VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]'))
LIMIT 5;
-- 9. Check if vector functions are working correctly
SELECT vec_fromtext('[1,2,3]') IS NOT NULL as vec_fromtext_works,
    VEC_DISTANCE_COSINE(vec_fromtext('[1,0,0]'), vec_fromtext('[0,1,0]')) as cosine_distance_works;
-- 10. Check index size and status
SELECT INDEX_NAME,
    INDEX_TYPE,
    TABLE_ROWS,
    AVG_ROW_LENGTH,
    DATA_LENGTH,
    INDEX_LENGTH
FROM INFORMATION_SCHEMA.STATISTICS s
    JOIN INFORMATION_SCHEMA.TABLES t ON s.TABLE_NAME = t.TABLE_NAME
    AND s.TABLE_SCHEMA = t.TABLE_SCHEMA
WHERE s.TABLE_SCHEMA = DATABASE()
    AND s.TABLE_NAME = 'inducks_entryurl_vector'
    AND s.INDEX_NAME = 'v';
-- 11. Try recreating the index with explicit parameters (if supported)
-- First, check current index definition
SHOW CREATE TABLE inducks_entryurl_vector \ G -- 11b. Check if vector dimension matches (migration shows vector(1024), but table might be vector(512))
SELECT COLUMN_NAME,
    COLUMN_TYPE,
    DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'inducks_entryurl_vector'
    AND COLUMN_NAME = 'v';
-- 11c. Try recreating the index with explicit M and DISTANCE parameters
-- NOTE: This might require dropping and recreating. Test on a backup first!
-- 
-- Based on diagnostics, the index exists but isn't being used even with FORCE INDEX.
-- Try recreating with explicit parameters:
--
-- Step 1: Drop the existing index
-- DROP INDEX v ON inducks_entryurl_vector;
--
-- Step 2: Recreate with explicit parameters (try one of these):
-- Option A:
-- CREATE VECTOR INDEX v ON inducks_entryurl_vector (v) USING VECTOR WITH (M=8, DISTANCE=cosine);
-- 
-- Option B (alternative syntax):
-- CREATE INDEX v ON inducks_entryurl_vector (v) USING VECTOR WITH (M=16, DISTANCE=cosine);
--
-- Step 3: IMPORTANT - Update statistics after recreating the index
-- ANALYZE TABLE inducks_entryurl_vector;
--
-- Step 4: Test again with query #5 to see if the index is now being used
-- 11d. Check if vector index requires specific syntax in CREATE TABLE vs ALTER TABLE
-- The index was created with: CREATE INDEX v ON inducks_entryurl_vector (v) USING VECTOR;
-- But maybe it needs to be created as part of CREATE TABLE or with VECTOR KEY syntax
-- Try: ALTER TABLE inducks_entryurl_vector DROP INDEX v;
--      ALTER TABLE inducks_entryurl_vector ADD VECTOR KEY v (v);
--      ANALYZE TABLE inducks_entryurl_vector;
-- 12. Test if the issue is with the vector dimension mismatch
-- Check actual vector dimension in table
SELECT entrycode,
    LENGTH(v) as vector_bytes,
    -- Try to get dimension (this might not work, but worth trying)
    v as vector_sample
FROM inducks_entryurl_vector
LIMIT 1;
-- 13. Check optimizer settings that might affect vector index usage
SHOW VARIABLES LIKE 'optimizer%';
SHOW VARIABLES LIKE 'innodb_stats%';
-- 14. Try with optimizer hints
EXPLAIN
SELECT
    /*+ INDEX(v) */
    entrycode,
    VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]')) as similarity
FROM inducks_entryurl_vector
ORDER BY VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]'))
LIMIT 5;
-- 15. Check if there are any table locks or issues
SHOW OPEN TABLES
WHERE Table = 'inducks_entryurl_vector';
-- 16. Try ANALYZE TABLE to update statistics
ANALYZE TABLE inducks_entryurl_vector;
-- 17. Check MariaDB error log for any vector-related errors
-- (This would need to be checked in the MariaDB logs, not via SQL)
-- 18. Test with a smaller dataset to see if index works on small tables
-- Create a test table with vector index
CREATE TABLE IF NOT EXISTS test_vector_index (
    id INT PRIMARY KEY AUTO_INCREMENT,
    v vector(512) NOT NULL,
    VECTOR KEY (v)
);
INSERT INTO test_vector_index (v)
VALUES (vec_fromtext('[0.1,0.2,0.3,0.4,0.5]')),
    (vec_fromtext('[0.2,0.3,0.4,0.5,0.6]')),
    (vec_fromtext('[0.3,0.4,0.5,0.6,0.7]'));
EXPLAIN
SELECT id,
    VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]')) as similarity
FROM test_vector_index
ORDER BY VEC_DISTANCE_COSINE(v, vec_fromtext('[0.1,0.2,0.3,0.4,0.5]'))
LIMIT 2;
-- Clean up test table
DROP TABLE IF EXISTS test_vector_index;