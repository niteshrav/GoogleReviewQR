export type PilotBusinessSeed = {
  slug: string;
  name: string;
  ownerEmail: string;
  ownerWhatsApp: string;
  googleReviewUrl: string;
};

/** Seeded pilot used by `npm run db:seed` and flow tests. */
export const CAFE_EDELWEISS: PilotBusinessSeed = {
  slug: "cafe-edelweiss",
  name: "Cafe Edelweiss",
  ownerEmail: "owner@example.com",
  ownerWhatsApp: "+919876543210",
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=REPLACE_WITH_PLACE_ID_1",
};

export const JMB_CAFE: PilotBusinessSeed = {
  slug: "jmb-cafe",
  name: "JMB Cafe",
  ownerEmail: "owner@example.com",
  ownerWhatsApp: "+919876543211",
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=REPLACE_WITH_PLACE_ID_2",
};

export const LAKEVIEW_BISTRO: PilotBusinessSeed = {
  slug: "lakeview-bistro",
  name: "Lakeview Bistro",
  ownerEmail: "owner@example.com",
  ownerWhatsApp: "+919876543212",
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=REPLACE_WITH_PLACE_ID_3",
};

export const PILOT_BUSINESSES: PilotBusinessSeed[] = [
  CAFE_EDELWEISS,
  JMB_CAFE,
  LAKEVIEW_BISTRO,
];
