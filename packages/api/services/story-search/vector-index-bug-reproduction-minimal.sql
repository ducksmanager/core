-- Minimal reproduction case for MariaDB vector index not being used
-- MariaDB Version: 11.8.5-MariaDB-ubu2404
-- Issue: Vector index exists but EXPLAIN shows type=ALL, key=NULL even with ORDER BY VEC_DISTANCE and LIMIT
-- Related: MDEV-35305 (but that issue shows index IS used, just slow log reports incorrectly)
-- Step 1: Create table with vector index
-- Using vector(10) to match the test data dimensions (simpler for reproduction)
DROP TABLE IF EXISTS test_vector_index_bug;
CREATE TABLE test_vector_index_bug (
    id INT PRIMARY KEY AUTO_INCREMENT,
    v vector(10) NOT NULL,
    VECTOR KEY (v)
) ENGINE = InnoDB;
-- Step 2: Insert test data (10-dimensional vectors)
INSERT INTO test_vector_index_bug (v)
VALUES (
        vec_fromtext('[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0]')
    ),
    (
        vec_fromtext('[0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1]')
    ),
    (
        vec_fromtext('[0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2]')
    );
-- Step 3: Verify the index exists
SHOW INDEX
FROM test_vector_index_bug
WHERE Key_name = 'v';
-- Expected: Shows index 'v' with Index_type='VECTOR'
-- Step 4: Test query that SHOULD use the vector index
-- According to MariaDB docs, ORDER BY VEC_DISTANCE_* + LIMIT should use the vector index
SET @test_vector = vec_fromtext('[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0]');
EXPLAIN
SELECT id,
    VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM test_vector_index_bug
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 5;
-- Expected: type=index, key=v
-- Actual: type=ALL, key=NULL (full table scan)
-- Step 5: Test with FORCE INDEX (should force the index to be used)
EXPLAIN
SELECT id,
    VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM test_vector_index_bug FORCE INDEX (v)
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 5;
-- Expected: type=index, key=v (forced)
-- Actual: type=ALL, key=NULL (FORCE INDEX is ignored!)
-- Step 6: Update statistics and test again
ANALYZE TABLE test_vector_index_bug;
EXPLAIN
SELECT id,
    VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM test_vector_index_bug
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 5;
-- Still: type=ALL, key=NULL
-- Cleanup
DROP TABLE IF EXISTS test_vector_index_bug;
-- Summary:
-- The vector index is created successfully and exists (SHOW INDEX confirms it),
-- but EXPLAIN shows it's never used, even with:
-- 1. ORDER BY VEC_DISTANCE_COSINE + LIMIT (the documented way to use vector indexes)
-- 2. FORCE INDEX hint
-- 3. ANALYZE TABLE to update statistics
--
-- This suggests the optimizer doesn't recognize vector indexes as usable for these queries,
-- which is a bug in MariaDB 11.8.5.