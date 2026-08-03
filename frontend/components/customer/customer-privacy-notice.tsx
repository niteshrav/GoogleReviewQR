type CustomerPrivacyNoticeProps = {
  className?: string;
};

/** Short privacy note for customer landing. */
export function CustomerPrivacyNotice({ className = "" }: CustomerPrivacyNoticeProps) {
  return (
    <p className={`text-sm leading-relaxed text-muted ${className}`}>
      Private to this business. No login needed.
    </p>
  );
}
