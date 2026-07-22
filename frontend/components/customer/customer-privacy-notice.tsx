type CustomerPrivacyNoticeProps = {
  className?: string;
};

/** Anonymous feedback notice — required on customer landing + feedback form (Phase 1 BRD). */
export function CustomerPrivacyNotice({ className = "" }: CustomerPrivacyNoticeProps) {
  return (
    <p
      className={`rounded-xl border border-border/80 bg-white/60 px-3 py-2.5 text-xs leading-relaxed text-muted ${className}`}
    >
      Your feedback is anonymous. No login required. We use it only to improve service at this
      business.
    </p>
  );
}
