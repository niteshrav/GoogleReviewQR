-- Rename visible plan copy from Opinique → Prooflyn (domain URLs unchanged).
UPDATE "SubscriptionPlan"
SET
  "name" = REPLACE(REPLACE("name", 'Opinique', 'Prooflyn'), 'opinique', 'prooflyn'),
  "tagline" = NULLIF(REPLACE(REPLACE(COALESCE("tagline", ''), 'Opinique', 'Prooflyn'), 'opinique', 'prooflyn'), ''),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE
  "name" ILIKE '%opinique%'
  OR COALESCE("tagline", '') ILIKE '%opinique%';
