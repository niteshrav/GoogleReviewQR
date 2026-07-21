export class DuplicateSlugError extends Error {
  constructor(slug: string) {
    super(`Business slug already exists: ${slug}`);
    this.name = "DuplicateSlugError";
  }
}

export class BusinessNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Business not found: ${identifier}`);
    this.name = "BusinessNotFoundError";
  }
}

export class FeedbackNotFoundError extends Error {
  constructor(id: string) {
    super(`Feedback not found: ${id}`);
    this.name = "FeedbackNotFoundError";
  }
}
