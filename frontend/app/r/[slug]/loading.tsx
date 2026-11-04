export default function ReviewPageLoading() {
  return (
    <main className="min-h-[100dvh] bg-white">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-5 pt-16 sm:max-w-xl">
        <div className="h-20 w-20 animate-pulse rounded-3xl bg-[#e3f2fd]" />
        <div className="mt-4 h-5 w-40 animate-pulse rounded-full bg-[#e3f2fd]" />
        <div className="mt-8 h-10 w-full max-w-sm animate-pulse rounded-2xl bg-[#e3f2fd]" />
        <div className="mt-8 h-14 w-full animate-pulse rounded-2xl bg-[#0a2e50]/10" />
        <div className="mt-3 h-14 w-full animate-pulse rounded-2xl bg-[#e3f2fd]" />
        <p className="mt-6 text-sm text-[#506070]">Loading review page…</p>
      </div>
    </main>
  );
}
