-- Promo: free onboarding/setup for new customers; Core ₹299, Premium ₹699.
-- Updates existing catalog rows only (no duplicate plans).

UPDATE "SubscriptionPlan"
SET
  "setupFeeInr" = 0,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "setupFeeInr" <> 0;

UPDATE "SubscriptionPlan"
SET
  "priceInr" = 299,
  "highlighted" = false,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "key" = 'core';

UPDATE "SubscriptionPlan"
SET
  "priceInr" = 699,
  "highlighted" = true,
  "tagline" = COALESCE(NULLIF("tagline", ''), 'Weekly reports and priority support.'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "key" = 'premium';
