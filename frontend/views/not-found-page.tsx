import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <h1 className="text-2xl font-semibold">This feedback link is not available</h1>
      <p className="mt-3 text-sm text-muted">
        The business may be inactive or the QR code may be outdated.
      </p>
      <Link href="/" className="mt-8 text-sm font-medium text-brand hover:underline">
        Go to FeedbackFlow home
      </Link>
    </main>
  );
}
