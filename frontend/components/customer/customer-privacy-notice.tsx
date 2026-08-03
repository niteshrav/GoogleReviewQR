type CustomerPrivacyNoticeProps = {
  className?: string;
};

/** Privacy notice on customer landing + feedback form. */
export function CustomerPrivacyNotice({ className = "" }: CustomerPrivacyNoticeProps) {
  return (
    <p className={`text-sm leading-relaxed text-muted ${className}`}>
      No login required. Feedback is private to this business. Phone / WhatsApp is optional and
      only used to follow up on your issue.
    </p>
  );
}
