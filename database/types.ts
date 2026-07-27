export type CreateBusinessInput = {
  name: string;
  slug: string;
  ownerEmail: string;
  ownerWhatsApp?: string | null;
  ownerSmsPhone?: string | null;
  googleReviewUrl: string;
};

export type UpdateBusinessInput = {
  name?: string;
  ownerEmail?: string;
  ownerWhatsApp?: string | null;
  ownerSmsPhone?: string | null;
  googleReviewUrl?: string;
  isActive?: boolean;
};

export type CreateFeedbackInput = {
  businessId: string;
  rating?: number | null;
  comment?: string | null;
  clickedGoogle?: boolean;
  locationLabel?: string | null;
};

export type ListFeedbackOptions = {
  businessId: string;
  limit?: number;
};
