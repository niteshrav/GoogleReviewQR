type CustomerFooterProps = {
  className?: string;
};

export function CustomerFooter({ className = "" }: CustomerFooterProps) {
  return (
    <footer className={`mt-auto pt-8 text-center text-xs text-muted ${className}`}>
      Powered by{" "}
      <a
        href="https://commiters.in"
        className="font-medium text-brand hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        Commiters
      </a>
    </footer>
  );
}
