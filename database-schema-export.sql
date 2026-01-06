-- Run this query in Supabase SQL Editor to export your complete database structure
-- Copy the results and save them to a file called database-schema.md in the project root

-- ===========================================
-- PART 1: ALL TABLES AND THEIR COLUMNS
-- ===========================================
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ===========================================
-- PART 2: PRIMARY KEYS
-- ===========================================
SELECT
    tc.table_name,
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ===========================================
-- PART 3: FOREIGN KEYS AND RELATIONSHIPS
-- ===========================================
SELECT
    tc.table_name AS from_table,
    kcu.column_name AS from_column,
    ccu.table_name AS to_table,
    ccu.column_name AS to_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ===========================================
-- PART 4: ALL STORED FUNCTIONS/PROCEDURES
-- ===========================================
SELECT
    routine_name,
    routine_type,
    data_type AS return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ===========================================
-- PART 5: FUNCTION PARAMETERS
-- ===========================================
SELECT
    p.specific_name,
    r.routine_name,
    p.parameter_name,
    p.parameter_mode,
    p.data_type
FROM information_schema.parameters p
JOIN information_schema.routines r 
    ON p.specific_name = r.specific_name
    AND p.specific_schema = r.specific_schema
WHERE p.specific_schema = 'public'
ORDER BY r.routine_name, p.ordinal_position;

-- ===========================================
-- PART 6: ALL VIEWS
-- ===========================================
SELECT
    table_name AS view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- ===========================================
-- ALTERNATIVE: Get a more readable table structure
-- ===========================================
SELECT 
    t.table_name,
    json_agg(
        json_build_object(
            'column', c.column_name,
            'type', c.data_type,
            'nullable', c.is_nullable,
            'default', c.column_default
        ) ORDER BY c.ordinal_position
    ) as columns
FROM information_schema.tables t
JOIN information_schema.columns c 
    ON t.table_name = c.table_name 
    AND t.table_schema = c.table_schema
WHERE t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;
