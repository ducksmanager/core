-- Minimal reproduction case for MariaDB vector index not being used
-- MariaDB Version: 11.8.5-MariaDB-ubu2404
-- 
-- UPDATE: This was NOT a bug - two configuration issues were found:
-- 1. Index must specify DISTANCE=COSINE to match VEC_DISTANCE_COSINE function
-- 2. LIMIT must be smaller than the number of rows in the table
--
-- Step 1: Create table with vector index
-- Using vector(10) to match the test data dimensions (simpler for reproduction)
-- IMPORTANT: Must specify DISTANCE=cosine to match VEC_DISTANCE_COSINE function
DROP TABLE IF EXISTS test_vector_index_bug;
CREATE TABLE test_vector_index_bug (
    id INT PRIMARY KEY AUTO_INCREMENT,
    v vector(10) NOT NULL,
    VECTOR KEY (v) DISTANCE = cosine
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
-- IMPORTANT: LIMIT must be smaller than the number of rows (3 rows, so LIMIT 2)
SET @test_vector = vec_fromtext('[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0]');
EXPLAIN
SELECT id,
    VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM test_vector_index_bug
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 2;
-- Expected: type=index, key=v
-- With DISTANCE=cosine and LIMIT 2: Should now work!
-- Step 5: Test with FORCE INDEX (should force the index to be used)
EXPLAIN
SELECT id,
    VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM test_vector_index_bug FORCE INDEX (v)
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 2;
-- Expected: type=index, key=v (forced)
-- With DISTANCE=cosine: Should work even without LIMIT constraint
-- Step 6: Update statistics and test again
ANALYZE TABLE test_vector_index_bug;
EXPLAIN
SELECT id,
    VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM test_vector_index_bug
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 2;
-- Cleanup
DROP TABLE IF EXISTS test_vector_index_bug;
-- Summary:
-- The vector index works correctly when:
-- 1. DISTANCE parameter matches the distance function used (COSINE for VEC_DISTANCE_COSINE)
-- 2. LIMIT is smaller than the number of rows in the table (for optimizer to choose index)