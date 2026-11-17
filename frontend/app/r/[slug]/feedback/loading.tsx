export default function FeedbackPageLoading() {
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
      <div className="relative mx-auto flex w-full max-w-lg flex-col px-5 pt-[max(2rem,env(safe-area-inset-top))] sm:max-w-xl sm:px-8">
        <div className="flex flex-col items-center">
          <div className="h-20 w-20 animate-pulse rounded-3xl bg-[#e3f2fd]" />
          <div className="mt-4 h-5 w-36 animate-pulse rounded-full bg-[#e3f2fd]" />
        </div>
        <div className="mt-6 h-4 w-16 animate-pulse rounded bg-[#e3f2fd]" />
        <div className="mt-3 rounded-2xl border border-[#e3eef8] bg-white p-5 shadow-sm">
          <div className="h-7 w-3/4 max-w-xs animate-pulse rounded-lg bg-[#e3f2fd]" />
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#e3f2fd]" />
          <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-[#e3f2fd]" />
          <div className="mt-6 flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-11 w-11 animate-pulse rounded-full bg-[#e3f2fd]" />
            ))}
          </div>
          <div className="mt-6 h-24 w-full animate-pulse rounded-xl bg-[#e3f2fd]" />
          <div className="mt-4 h-11 w-full animate-pulse rounded-2xl bg-[#0a2e50]/15" />
        </div>
        <p className="mt-6 text-center text-sm text-[#506070]">Opening feedback…</p>
      </div>
    </main>
  );
}
