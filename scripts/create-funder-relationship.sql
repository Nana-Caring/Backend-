-- Insert Funder-Dependent Relationship
-- Funder: John Smith (ID: 12)
-- Dependent: Emma Johnson (ID: 13)

-- First, check if relationship already exists
SELECT * FROM "FunderDependents" WHERE "funderId" = 12 AND "dependentId" = 13;

-- Insert the relationship if it doesn't exist
INSERT INTO "FunderDependents" ("funderId", "dependentId", "createdAt", "updatedAt")
VALUES (12, 13, NOW(), NOW())
ON CONFLICT ("funderId", "dependentId") DO NOTHING;

-- Verify the insertion
SELECT 
    fd.*,
    f.name as funder_name,
    f.email as funder_email,
    d.name as dependent_name,
    d.email as dependent_email
FROM "FunderDependents" fd
JOIN "Users" f ON fd."funderId" = f.id
JOIN "Users" d ON fd."dependentId" = d.id
WHERE fd."funderId" = 12 AND fd."dependentId" = 13;

-- Check all funder-dependent relationships
SELECT COUNT(*) as total_relationships FROM "FunderDependents";
