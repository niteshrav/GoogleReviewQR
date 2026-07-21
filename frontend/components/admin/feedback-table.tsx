"use client";

type FeedbackTableProps = {
  items: Array<{
    id: string;
    rating: number | null;
    comment: string | null;
    clickedGoogle: boolean;
    alertSentAt: string | null;
    createdAt: string;
  }>;
};

export function FeedbackTable({ items }: FeedbackTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">No feedback yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-border bg-slate-50">
          <tr>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Rating</th>
            <th className="px-4 py-3 font-medium">Comment</th>
            <th className="px-4 py-3 font-medium">Google click</th>
            <th className="px-4 py-3 font-medium">Alert sent</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString()}</td>
              <td className="px-4 py-3">{item.rating ?? "—"}</td>
              <td className="px-4 py-3">{item.comment?.trim() ? item.comment : "No comment"}</td>
              <td className="px-4 py-3">{item.clickedGoogle ? "Yes" : "No"}</td>
              <td className="px-4 py-3">{item.alertSentAt ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
