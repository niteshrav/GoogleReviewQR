-- Rename visible plan copy from trustTap → Opinique (domain URLs unchanged).
UPDATE "SubscriptionPlan"
SET
  "name" = REPLACE(REPLACE("name", 'TrustTap', 'Opinique'), 'trustTap', 'Opinique'),
  "tagline" = REPLACE(REPLACE(COALESCE("tagline", ''), 'TrustTap', 'Opinique'), 'trustTap', 'Opinique'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE
  "name" ILIKE '%trusttap%'
  OR COALESCE("tagline", '') ILIKE '%trusttap%';

-- Clear empty taglines created from null coalesce when nothing else changed is not needed;
-- restore null when tagline became empty string from a previously null value:
UPDATE "SubscriptionPlan"
SET "tagline" = NULL
WHERE "tagline" = '';
