"use client";

import { useMemo, useState } from "react";
import { Badge } from "@frontend/components/ui/badge";
import { EmptyState } from "@frontend/components/ui/empty-state";

type FeedbackItem = {
  id: string;
  rating: number | null;
  comment: string | null;
  customerName: string | null;
  customerPhone: string | null;
  clickedGoogle: boolean;
  alertSentAt: string | null;
  createdAt: string;
};

type FeedbackTableProps = {
  items: FeedbackItem[];
};

const PAGE_SIZE = 8;

export function FeedbackTable({ items }: FeedbackTableProps) {
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        !query ||
        (item.comment ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (item.customerName ?? "").toLowerCase().includes(query.toLowerCase()) ||
        (item.customerPhone ?? "").toLowerCase().includes(query.toLowerCase()) ||
        String(item.rating ?? "").includes(query);

      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "none" && item.rating == null) ||
        String(item.rating) === ratingFilter;

      return matchesQuery && matchesRating;
    });
  }, [items, query, ratingFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No feedback yet"
        description="When customers submit private feedback or tap Google review, entries will appear here."
        icon={<span>◎</span>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search comments or ratings…"
          className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-[var(--ring)] sm:max-w-xs"
          aria-label="Search feedback"
        />
        <select
          value={ratingFilter}
          onChange={(event) => {
            setRatingFilter(event.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-[var(--ring)]"
          aria-label="Filter by rating"
        >
          <option value="all">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
          <option value="none">No rating</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matches"
          description="Try a different search or rating filter."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-border bg-slate-50/95 backdrop-blur">
                <tr>
                  <th className="px-4 py-3 font-semibold text-muted">Time</th>
                  <th className="px-4 py-3 font-semibold text-muted">Rating</th>
                  <th className="px-4 py-3 font-semibold text-muted">Comment</th>
                  <th className="px-4 py-3 font-semibold text-muted">Name</th>
                  <th className="px-4 py-3 font-semibold text-muted">Contact</th>
                  <th className="px-4 py-3 font-semibold text-muted">Google</th>
                  <th className="px-4 py-3 font-semibold text-muted">Alert</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {item.rating ?? "—"}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-foreground">
                      {item.comment?.trim() ? item.comment : "No comment"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">
                      {item.customerName?.trim() ? item.customerName : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">
                      {item.customerPhone?.trim() ? item.customerPhone : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.clickedGoogle ? "brand" : "default"}>
                        {item.clickedGoogle ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.alertSentAt ? "warning" : "default"}>
                        {item.alertSentAt ? "Yes" : "No"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-muted">
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-border px-3 py-2 font-medium disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-border px-3 py-2 font-medium disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
