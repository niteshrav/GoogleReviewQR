export default function ReviewPageLoading() {
  return (
    <main className="relative min-h-[100dvh] overflow-x-hidden bg-white text-[#0a2e50]">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 12% 8%, rgba(30,136,229,0.16), transparent 32%), radial-gradient(circle at 92% 18%, rgba(10,46,80,0.10), transparent 28%)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-lg flex-col items-center px-5 pt-[max(2rem,env(safe-area-inset-top))] sm:max-w-xl sm:px-8">
        <div className="h-20 w-20 animate-pulse rounded-3xl bg-[#e3f2fd]" />
        <div className="mt-4 h-5 w-40 animate-pulse rounded-full bg-[#e3f2fd]" />
        <div className="mt-8 h-10 w-full max-w-sm animate-pulse rounded-2xl bg-[#e3f2fd]" />
        <div className="mt-4 h-4 w-full max-w-md animate-pulse rounded bg-[#e3f2fd]" />
        <div className="mt-8 h-14 w-full animate-pulse rounded-2xl bg-[#0a2e50]/15" />
        <div className="mt-3 h-14 w-full animate-pulse rounded-2xl bg-[#e3f2fd]" />
        <p className="mt-6 text-sm text-[#506070]">Loading review page…</p>
      </div>
    </main>
  );
}
