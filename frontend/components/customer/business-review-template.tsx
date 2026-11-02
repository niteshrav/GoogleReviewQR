import Link from "next/link";
import { ProoflynLogo } from "@frontend/components/brand/prooflyn-logo";
import { BusinessLogo } from "@frontend/components/customer/business-logo";
import { GoogleReviewButton } from "@frontend/components/google-review-button";
import { JustdialReviewLink } from "@frontend/components/justdial-review-link";

const features = [
  { label: "Better Services", icon: "services" },
  { label: "Higher Quality", icon: "quality" },
  { label: "A Great Experience", icon: "experience" },
  { label: "Private & Secure", icon: "secure" },
] as const;

type BusinessReviewTemplateProps = {
  slug: string;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  googleReviewUrl: string;
  justdialReviewUrl?: string | null;
};

function FeatureIcon({ name }: { name: (typeof features)[number]["icon"] }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    "aria-hidden": true as const,
  };

  if (name === "services") {
    return (
      <svg {...common}>
        <path d="M4 14.5 12 4l8 10.5" strokeLinejoin="round" />
        <path d="M7 14.5h10v5.5H7z" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "quality") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="m8.5 12.2 2.3 2.3 4.7-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "experience") {
    return (
      <svg {...common}>
        <path
          d="M12 19s-6.2-3.7-7.8-7.4C3 8.8 4.7 6 7.6 6c1.7 0 2.9 1 3.5 2.1h1.8C13.5 7 14.7 6 16.4 6c2.9 0 4.6 2.8 3.4 5.6C18.2 15.3 12 19 12 19z"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 3.5 5 6.2v5.2c0 4.2 2.8 7.2 7 8.6 4.2-1.4 7-4.4 7-8.6V6.2L12 3.5z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
      <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" />
      </svg>
    </span>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path d="M12 4.2c-4.4 0-8 3-8 6.8 0 1.9.9 3.6 2.4 4.9L5.6 19.2l3.4-1.6c.9.2 1.9.4 3 .4 4.4 0 8-3 8-6.8s-3.6-6.8-8-6.8z" strokeLinejoin="round" />
    </svg>
  );
}

export function BusinessReviewTemplate({
  slug,
  name,
  tagline,
  logoUrl,
  googleReviewUrl,
  justdialReviewUrl,
}: BusinessReviewTemplateProps) {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-white text-[#0a2e50]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(30,136,229,0.16), transparent 32%), radial-gradient(circle at 92% 18%, rgba(10,46,80,0.10), transparent 28%), radial-gradient(circle at 80% 88%, rgba(30,136,229,0.12), transparent 30%)",
        }}
      />
      <div className="pointer-events-none absolute -left-16 top-24 h-40 w-40 rounded-full bg-[#1e88e5]/10 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -right-10 bottom-16 h-48 w-48 rounded-full bg-[#0a2e50]/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-lg flex-col px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))] sm:max-w-xl sm:px-8">
        <div className="flex flex-col items-center text-center">
          <BusinessLogo name={name} logoUrl={logoUrl} />
          <p className="mt-4 text-lg font-semibold tracking-tight sm:text-xl">{name}</p>
          {tagline ? <p className="mt-1 max-w-sm text-sm text-[#506070]">{tagline}</p> : null}

          <h1 className="mt-8 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            How was your experience with {name}?
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#506070]">
            Your feedback helps us improve our services and create a better experience for you.
          </p>
        </div>

        <section className="mt-8 space-y-3">
          <GoogleReviewButton
            businessSlug={slug}
            googleReviewUrl={googleReviewUrl}
            className="customer-cta flex items-center justify-center gap-3 rounded-2xl bg-[#0a2e50] px-4 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#1565c0]"
          >
            <GoogleMark />
            <span className="flex-1 text-left">Leave a Google Review</span>
          </GoogleReviewButton>

          <Link
            href={`/r/${slug}/feedback`}
            className="customer-cta flex items-center justify-center gap-3 rounded-2xl border border-[#d7e3f0] bg-white px-4 py-3 text-base font-semibold text-[#0a2e50] shadow-sm transition-colors hover:bg-[#e3f2fd]"
          >
            <ChatIcon />
            <span className="flex-1 text-left">Send Private Feedback</span>
          </Link>

          <JustdialReviewLink
            justdialReviewUrl={justdialReviewUrl}
            className="customer-cta flex items-center justify-center rounded-2xl border border-[#d7e3f0] bg-white px-4 py-3 text-base font-medium text-[#0a2e50]"
          />
        </section>

        <p className="mt-4 text-center text-xs leading-relaxed text-[#506070]">
          Google reviews are always available — we never hide them by rating.
        </p>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {features.map((feature) => (
            <li
              key={feature.label}
              className="flex flex-col items-center rounded-2xl border border-[#e3eef8] bg-white/80 px-2 py-4 text-center shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e3f2fd] text-[#1565c0]">
                <FeatureIcon name={feature.icon} />
              </span>
              <span className="mt-2 text-xs font-semibold leading-snug">{feature.label}</span>
            </li>
          ))}
        </ul>

        <footer className="mt-auto flex flex-col items-center gap-2 pt-10 text-center">
          <p className="text-xs font-medium text-[#506070]">Powered by</p>
          <ProoflynLogo variant="horizontal" className="text-sm" markClassName="h-8 w-auto" />
        </footer>
      </div>
    </main>
  );
}
