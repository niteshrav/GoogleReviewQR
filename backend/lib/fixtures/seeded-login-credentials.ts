import { PILOT_BUSINESSES, type PilotBusinessSeed } from "@backend/lib/fixtures/pilot-businesses";

export type SeededLoginCredential = {
  name: string;
  slug: string;
  secret: string;
  reviewPath: string;
};

const SEEDED_SECRET_BY_SLUG: Record<string, string> = {
  "cafe-edelweiss": "seed-cafe-edelweiss-admin",
  "jmb-cafe": "seed-jmb-cafe-admin",
  "lakeview-bistro": "seed-lakeview-bistro-admin",
};

function toCredential(business: PilotBusinessSeed): SeededLoginCredential {
  const secret = SEEDED_SECRET_BY_SLUG[business.slug];
  if (!secret) {
    throw new Error(`Missing seeded login secret for slug: ${business.slug}`);
  }

  return {
    name: business.name,
    slug: business.slug,
    secret,
    reviewPath: `/r/${business.slug}`,
  };
}

/** Seeded admin login credentials for each pilot example (local/dev only). */
export function getSeededLoginCredentials(): SeededLoginCredential[] {
  return PILOT_BUSINESSES.map(toCredential);
}

export function listSeededLoginSecrets(): string[] {
  return getSeededLoginCredentials().map((credential) => credential.secret);
}

export function isSeededLoginAllowed(nodeEnv: string | undefined = process.env.NODE_ENV): boolean {
  return nodeEnv !== "production";
}

export function isSeededLoginSecret(
  provided: string,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  if (!isSeededLoginAllowed(nodeEnv)) {
    return false;
  }

  return listSeededLoginSecrets().includes(provided);
}
