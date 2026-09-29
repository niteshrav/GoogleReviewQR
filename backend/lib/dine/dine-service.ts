import { dineRepository } from "@database/index";
import {
  calculateTableHealthScore,
  deriveFloorPulseStatus,
} from "@backend/lib/dine/table-health";

const ISSUE_TAG_TO_CATEGORY: Record<string, string> = {
  "Food quality": "FOOD",
  "Food temperature": "FOOD",
  "Waiting time": "WAIT_TIME",
  Service: "SERVICE",
  Cleanliness: "CLEANLINESS",
  Billing: "BILLING",
  Staff: "STAFF",
  Ambience: "AMBIENCE",
  Other: "OTHER",
};

export function mapIssueTagToCategory(tag: string): string {
  return ISSUE_TAG_TO_CATEGORY[tag] ?? "OTHER";
}

export function severityFromRatings(input: {
  overallRating: number;
  waitTimeRating?: number | null;
  serviceRating?: number | null;
  tags: string[];
}): "LOW" | "MEDIUM" | "HIGH" {
  if (input.overallRating <= 2) return "HIGH";
  if (
    (input.waitTimeRating != null && input.waitTimeRating <= 2) ||
    (input.serviceRating != null && input.serviceRating <= 2)
  ) {
    return "HIGH";
  }
  if (input.tags.length >= 2 || input.overallRating === 3) return "MEDIUM";
  if (input.tags.length === 1) return "MEDIUM";
  return "LOW";
}

export async function getTableHealthForTable(tableId: string, businessId?: string) {
  const table = await dineRepository.findTableById(tableId);
  const resolvedBusinessId = businessId ?? table?.businessId;
  const recent = await dineRepository.recentFeedbackForTable(tableId, 50);
  const openIssueCount = await dineRepository.openIssueCountForTable(tableId);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const issues = resolvedBusinessId
    ? await dineRepository.listIssues({
        businessId: resolvedBusinessId,
        tableId,
        limit: 100,
      })
    : [];
  const issuesLast7Days = issues.filter((i) => i.createdAt >= weekAgo).length;

  return calculateTableHealthScore({
    overallRatings: recent.map((f) => f.overallRating),
    foodRatings: recent.map((f) => f.foodRating).filter((n): n is number => n != null),
    serviceRatings: recent.map((f) => f.serviceRating).filter((n): n is number => n != null),
    waitTimeRatings: recent.map((f) => f.waitTimeRating).filter((n): n is number => n != null),
    openIssueCount,
    issuesLast7Days,
  });
}

export async function buildFloorPulse(businessId: string, branchId?: string) {
  const tables = await dineRepository.listTables({ businessId, branchId });
  const now = Date.now();

  const cells = await Promise.all(
    tables.map(async (table) => {
      const feedbacks = await dineRepository.recentFeedbackForTable(table.id, 5);
      const openIssues = await dineRepository.listIssues({
        businessId,
        tableId: table.id,
        status: ["OPEN", "IN_PROGRESS"],
        limit: 20,
      });
      const latest = feedbacks[0] ?? null;
      const hoursSinceLastFeedback = latest
        ? (now - latest.createdAt.getTime()) / (1000 * 60 * 60)
        : null;
      const pulse = deriveFloorPulseStatus({
        openHighIssues: openIssues.filter((i) => i.severity === "HIGH").length,
        openMediumIssues: openIssues.filter((i) => i.severity === "MEDIUM").length,
        latestOverallRating: latest?.overallRating ?? null,
        hoursSinceLastFeedback,
      });
      const health = await getTableHealthForTable(table.id);

      return {
        id: table.id,
        tableNumber: table.tableNumber,
        slug: table.slug,
        floorName: table.floor.name,
        branchName: table.branch.name,
        branchId: table.branchId,
        floorId: table.floorId,
        status: pulse.status,
        statusLabel: pulse.label,
        healthScore: health.score,
        healthSampleSize: health.sampleSize,
        latestOverallRating: latest?.overallRating ?? null,
        openIssueCount: openIssues.length,
        lastFeedbackAt: latest?.createdAt?.toISOString() ?? null,
      };
    }),
  );

  return cells;
}

export function slugifyLabel(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
