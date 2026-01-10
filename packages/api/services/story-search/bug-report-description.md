# Description

## Summary

The MariaDB optimizer does not use vector indexes for queries with `ORDER BY VEC_DISTANCE_*` and `LIMIT`, even when the index exists and is properly defined. The optimizer performs a full table scan (`type=ALL, key=NULL`) instead of using the vector index, and this behavior persists even when using `FORCE INDEX` hints.

## Environment

- **MariaDB Version:** 11.8.5-MariaDB-ubu2404
- **Storage Engine:** InnoDB
- **Table Size:** Tested with both small tables (3 rows) and production tables (667k rows)

## Steps to Reproduce

1. Create a table with a vector column and vector index:
```sql
CREATE TABLE test_vector_index_bug (
  id INT PRIMARY KEY AUTO_INCREMENT,
  v vector(10) NOT NULL,
  VECTOR KEY (v)
) ENGINE=InnoDB;
```

2. Insert test data:
```sql
INSERT INTO test_vector_index_bug (v) VALUES
  (vec_fromtext('[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0]')),
  (vec_fromtext('[0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1]')),
  (vec_fromtext('[0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2]'));
```

3. Verify the index exists:
```sql
SHOW INDEX FROM test_vector_index_bug WHERE Key_name = 'v';
-- Shows: Index_type='VECTOR' ✓
```

4. Run a query that should use the vector index:
```sql
SET @test_vector = vec_fromtext('[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0]');

EXPLAIN 
SELECT id, VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM test_vector_index_bug
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 5;
```

5. Try with FORCE INDEX:
```sql
EXPLAIN 
SELECT id, VEC_DISTANCE_COSINE(v, @test_vector) as similarity
FROM test_vector_index_bug FORCE INDEX (v)
ORDER BY VEC_DISTANCE_COSINE(v, @test_vector)
LIMIT 5;
```

## Expected Behavior

According to MariaDB documentation, queries with `ORDER BY VEC_DISTANCE_*` and `LIMIT` should use the vector index. The EXPLAIN output should show:
- `type=index` or `type=range`
- `key=v` (the vector index name)
- Estimated rows should be much lower than the table size

## Actual Behavior

EXPLAIN shows:
- `type=ALL` (full table scan)
- `key=NULL` (no index used)
- `rows=3` (or full table size for larger tables)

This occurs even with:
- `FORCE INDEX (v)` hint
- `USE INDEX (v)` hint
- `ANALYZE TABLE` to update statistics
- Recreating the index with explicit parameters (`M=8, DISTANCE=cosine`)

## Impact

- **Performance:** Vector similarity searches perform full table scans instead of using the optimized vector index
- **Scalability:** Query performance degrades linearly with table size instead of logarithmically
- **Functionality:** Vector indexes are effectively non-functional for their intended use case

## Additional Information

- Vector functions (`vec_fromtext`, `VEC_DISTANCE_COSINE`) work correctly
- The vector index is created successfully and appears in `SHOW INDEX`
- The issue occurs even on tables with just 3 rows, indicating it's not a statistics/cost estimation problem
- Related issue: MDEV-35305 (but that issue shows the index IS used, just slow log reports incorrectly - this is a different, more severe issue)

## Test Case

See attached file: `vector-index-bug-reproduction-minimal.sql`

## Workaround

None available. Must perform full table scans for vector similarity searches, which severely impacts performance on large tables.
