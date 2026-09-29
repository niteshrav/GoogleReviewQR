import { z } from "zod";
import { businessRepository, dineRepository } from "@database/index";
import {
  DineAuthError,
  assertBusinessAccess,
  buildTableQrUrl,
  requireDineSession,
  resolveAccessibleDineBusinessId,
} from "@backend/lib/dine/access";
import {
  buildFloorPulse,
  getTableHealthForTable,
  mapIssueTagToCategory,
  severityFromRatings,
  slugifyLabel,
} from "@backend/lib/dine/dine-service";
import { generateQrPngBuffer } from "@backend/lib/qr/generate-qr";
import { jsonError, jsonOk } from "@backend/lib/http";
import { slugSchema } from "@backend/lib/validators";
import { checkRateLimit } from "@backend/lib/rate-limit";
import { sendOwnerAlert } from "@backend/lib/alerts/send-owner-alert";

const ratingSchema = z.number().int().min(1).max(5);

async function handleAuthError(error: unknown) {
  if (error instanceof DineAuthError) {
    return jsonError(error.message, error.status);
  }
  console.error("[dinepro]", error);
  return jsonError("Internal error", 500);
}

export async function listFeedbackHandler(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const url = new URL(request.url);
    const businessId = await resolveAccessibleDineBusinessId(
      ctx,
      url.searchParams.get("businessId"),
    );
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const feedback = await dineRepository.listFeedback({
      businessId,
      since,
      limit: 100,
    });
    return jsonOk({ feedback });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function listDineContext(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const url = new URL(request.url);
    const businessId = await resolveAccessibleDineBusinessId(
      ctx,
      url.searchParams.get("businessId"),
    );
    const business = await businessRepository.findById(businessId);
    const branches = await dineRepository.listBranches(businessId);
    return jsonOk({
      business: business
        ? {
            id: business.id,
            name: business.name,
            slug: business.slug,
            plan: business.plan,
            googleReviewUrl: business.googleReviewUrl,
            logoUrl: business.logoUrl,
          }
        : null,
      branches,
      isPlatform: ctx.isPlatform,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function createBranch(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const body = z
      .object({
        businessId: z.string().uuid().optional(),
        name: z.string().trim().min(1).max(80),
        slug: slugSchema.optional(),
      })
      .parse(await request.json());
    const businessId = await resolveAccessibleDineBusinessId(ctx, body.businessId);
    const slug = body.slug ?? slugifyLabel(body.name);
    const branch = await dineRepository.createBranch({
      businessId,
      name: body.name,
      slug,
    });
    return jsonOk({ branch }, 201);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function createFloor(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const body = z
      .object({
        branchId: z.string().uuid(),
        name: z.string().trim().min(1).max(80),
        slug: slugSchema.optional(),
        sortOrder: z.number().int().optional(),
      })
      .parse(await request.json());
    const branch = await dineRepository.findBranchById(body.branchId);
    if (!branch) return jsonError("Branch not found", 404);
    await assertBusinessAccess(ctx, branch.businessId);
    await resolveAccessibleDineBusinessId(ctx, branch.businessId);
    const floor = await dineRepository.createFloor({
      branchId: body.branchId,
      name: body.name,
      slug: body.slug ?? slugifyLabel(body.name),
      sortOrder: body.sortOrder,
    });
    return jsonOk({ floor }, 201);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function createTable(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const body = z
      .object({
        floorId: z.string().uuid(),
        tableNumber: z.string().trim().min(1).max(20),
        slug: slugSchema.optional(),
      })
      .parse(await request.json());
    const floor = await dineRepository.findFloorById(body.floorId);
    if (!floor) return jsonError("Floor not found", 404);
    await assertBusinessAccess(ctx, floor.branch.businessId);
    await resolveAccessibleDineBusinessId(ctx, floor.branch.businessId);
    const slug = body.slug ?? slugifyLabel(body.tableNumber);
    const table = await dineRepository.createTable({
      businessId: floor.branch.businessId,
      branchId: floor.branchId,
      floorId: floor.id,
      tableNumber: body.tableNumber,
      slug,
    });
    await dineRepository.createActivity({
      businessId: floor.branch.businessId,
      tableId: table.id,
      type: "TABLE_CREATED",
      message: `Table ${table.tableNumber} created`,
    });
    return jsonOk({ table }, 201);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function listTables(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const url = new URL(request.url);
    const businessId = await resolveAccessibleDineBusinessId(
      ctx,
      url.searchParams.get("businessId"),
    );
    const tables = await dineRepository.listTables({
      businessId,
      branchId: url.searchParams.get("branchId") ?? undefined,
      floorId: url.searchParams.get("floorId") ?? undefined,
      includeInactive: url.searchParams.get("includeInactive") === "1",
    });
    const business = await businessRepository.findById(businessId);
    const withQr = tables.map((t) => ({
      ...t,
      qrUrl: business
        ? buildTableQrUrl(business.slug, t.branch.slug, t.slug)
        : null,
    }));
    return jsonOk({ tables: withQr });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function patchTable(
  request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const ctx = await requireDineSession(request);
    const { id } = await params;
    const table = await dineRepository.findTableById(id);
    if (!table) return jsonError("Table not found", 404);
    await assertBusinessAccess(ctx, table.businessId);
    await resolveAccessibleDineBusinessId(ctx, table.businessId);
    const body = z
      .object({
        tableNumber: z.string().trim().min(1).max(20).optional(),
        isActive: z.boolean().optional(),
        status: z.enum(["active", "inactive"]).optional(),
        regenerateQr: z.boolean().optional(),
      })
      .parse(await request.json());

    if (body.regenerateQr) {
      await dineRepository.regenerateQrToken(id);
      await dineRepository.createActivity({
        businessId: table.businessId,
        tableId: id,
        type: "QR_REGENERATED",
        message: `QR regenerated for table ${table.tableNumber}`,
      });
    }
    if (body.tableNumber != null || body.isActive != null || body.status != null) {
      await dineRepository.updateTable(id, {
        tableNumber: body.tableNumber,
        isActive: body.isActive,
        status: body.status,
      });
    }
    const updated = await dineRepository.findTableById(id);
    return jsonOk({ table: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function downloadTableQr(
  request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const ctx = await requireDineSession(request);
    const { id } = await params;
    const table = await dineRepository.findTableById(id);
    if (!table) return jsonError("Table not found", 404);
    await assertBusinessAccess(ctx, table.businessId);
    await resolveAccessibleDineBusinessId(ctx, table.businessId);
    const business = await businessRepository.findById(table.businessId);
    if (!business) return jsonError("Business not found", 404);
    const url = buildTableQrUrl(business.slug, table.branch.slug, table.slug);
    const png = await generateQrPngBuffer(url);
    const preview = new URL(request.url).searchParams.get("preview") === "1";
    return new Response(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "Content-Disposition": preview
          ? "inline"
          : `attachment; filename="table-${table.tableNumber}-qr.png"`,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function getFloorPulse(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const url = new URL(request.url);
    const businessId = await resolveAccessibleDineBusinessId(
      ctx,
      url.searchParams.get("businessId"),
    );
    const cells = await buildFloorPulse(
      businessId,
      url.searchParams.get("branchId") ?? undefined,
    );
    return jsonOk({ cells });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function getOverview(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const url = new URL(request.url);
    const businessId = await resolveAccessibleDineBusinessId(
      ctx,
      url.searchParams.get("businessId"),
    );
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const [totalToday, openIssues, activeTables, feedback] = await Promise.all([
      dineRepository.countFeedbackSince(businessId, since),
      dineRepository.countOpenIssues(businessId),
      dineRepository.countActiveTables(
        businessId,
        url.searchParams.get("branchId") ?? undefined,
      ),
      dineRepository.listFeedback({ businessId, since, limit: 200 }),
    ]);
    const avg =
      feedback.length === 0
        ? null
        : feedback.reduce((s, f) => s + f.overallRating, 0) / feedback.length;
    const recentIssues = await dineRepository.listIssues({
      businessId,
      status: ["OPEN", "IN_PROGRESS"],
      limit: 8,
    });
    return jsonOk({
      totals: {
        feedbackToday: totalToday,
        averageRating: avg == null ? null : Math.round(avg * 10) / 10,
        averageRatingSample: feedback.length,
        activeTables,
        openIssues,
      },
      recentIssues,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function listIssuesHandler(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const url = new URL(request.url);
    const businessId = await resolveAccessibleDineBusinessId(
      ctx,
      url.searchParams.get("businessId"),
    );
    const status = url.searchParams.get("status") ?? undefined;
    const issues = await dineRepository.listIssues({
      businessId,
      status: status ? status.split(",") : undefined,
      tableId: url.searchParams.get("tableId") ?? undefined,
      limit: 100,
    });
    return jsonOk({ issues });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function resolveIssueHandler(
  request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const ctx = await requireDineSession(request);
    const { id } = await params;
    const issue = await dineRepository.findIssueById(id);
    if (!issue) return jsonError("Issue not found", 404);
    await assertBusinessAccess(ctx, issue.businessId);
    await resolveAccessibleDineBusinessId(ctx, issue.businessId);
    const body = z
      .object({
        status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED"]),
        resolutionNote: z.string().trim().max(1000).optional(),
        resolvedBy: z.string().trim().max(120).optional(),
      })
      .parse(await request.json());
    const updated = await dineRepository.resolveIssue(id, {
      status: body.status,
      resolutionNote: body.resolutionNote ?? null,
      resolvedBy: body.status === "RESOLVED" ? (body.resolvedBy ?? "manager") : null,
      resolvedAt: body.status === "RESOLVED" ? new Date() : null,
    });
    await dineRepository.createActivity({
      businessId: issue.businessId,
      tableId: issue.tableId,
      type: body.status === "RESOLVED" ? "ISSUE_RESOLVED" : "ISSUE_UPDATED",
      message:
        body.status === "RESOLVED"
          ? `Issue marked resolved: ${issue.summary}`
          : `Issue status → ${body.status}`,
    });
    return jsonOk({ issue: updated });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function getTableDetail(
  request: Request,
  params: Promise<{ id: string }>,
) {
  try {
    const ctx = await requireDineSession(request);
    const { id } = await params;
    const table = await dineRepository.findTableById(id);
    if (!table) return jsonError("Table not found", 404);
    await assertBusinessAccess(ctx, table.businessId);
    await resolveAccessibleDineBusinessId(ctx, table.businessId);
    const [feedback, issues, activities, health] = await Promise.all([
      dineRepository.recentFeedbackForTable(id, 20),
      dineRepository.listIssues({ businessId: table.businessId, tableId: id, limit: 20 }),
      dineRepository.listActivities(id, 40),
      getTableHealthForTable(id, table.businessId),
    ]);
    return jsonOk({ table, feedback, issues, activities, health });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function getAnalytics(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const url = new URL(request.url);
    const businessId = await resolveAccessibleDineBusinessId(
      ctx,
      url.searchParams.get("businessId"),
    );
    const range = url.searchParams.get("range") ?? "7d";
    const since = new Date();
    if (range === "today") since.setHours(0, 0, 0, 0);
    else if (range === "30d") since.setDate(since.getDate() - 30);
    else since.setDate(since.getDate() - 7);

    const feedback = await dineRepository.listFeedback({
      businessId,
      since,
      limit: 2000,
    });
    const issues = await dineRepository.listIssues({ businessId, limit: 500 });
    const issuesInRange = issues.filter((i) => i.createdAt >= since);
    const resolved = issuesInRange.filter((i) => i.status === "RESOLVED").length;

    const avgOf = (vals: number[]) =>
      vals.length === 0 ? null : Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;

    const byCategory: Record<string, number> = {};
    for (const issue of issuesInRange) {
      byCategory[issue.category] = (byCategory[issue.category] ?? 0) + 1;
    }

    const byTable: Record<string, { tableNumber: string; count: number; sum: number }> = {};
    for (const f of feedback) {
      const key = f.tableId;
      if (!byTable[key]) {
        byTable[key] = {
          tableNumber: f.table.tableNumber,
          count: 0,
          sum: 0,
        };
      }
      byTable[key].count += 1;
      byTable[key].sum += f.overallRating;
    }

    const tableStats = Object.entries(byTable).map(([tableId, v]) => ({
      tableId,
      tableNumber: v.tableNumber,
      count: v.count,
      average: Math.round((v.sum / v.count) * 10) / 10,
    }));

    const hourBuckets: Record<number, number> = {};
    for (const issue of issuesInRange) {
      if (issue.category !== "WAIT_TIME") continue;
      const h = issue.createdAt.getHours();
      hourBuckets[h] = (hourBuckets[h] ?? 0) + 1;
    }
    const peakWaitHour = Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0];

    const insights: string[] = [];
    if (peakWaitHour && peakWaitHour[1] >= 3) {
      insights.push(
        `Most wait-time complaints occurred around ${peakWaitHour[0]}:00–${Number(peakWaitHour[0]) + 1}:00 (${peakWaitHour[1]} reports).`,
      );
    }
    const worst = [...tableStats].sort((a, b) => a.average - b.average)[0];
    if (worst && worst.count >= 3 && worst.average <= 3) {
      insights.push(
        `Table ${worst.tableNumber} averaged ${worst.average}/5 across ${worst.count} responses.`,
      );
    }

    const menuAgg: Record<string, { name: string; sum: number; count: number }> = {};
    for (const f of feedback) {
      if (!f.menuItemId || f.menuItemRating == null || !f.menuItem) continue;
      if (!menuAgg[f.menuItemId]) {
        menuAgg[f.menuItemId] = { name: f.menuItem.name, sum: 0, count: 0 };
      }
      menuAgg[f.menuItemId].sum += f.menuItemRating;
      menuAgg[f.menuItemId].count += 1;
    }

    return jsonOk({
      range,
      sampleSize: feedback.length,
      metrics: {
        totalFeedback: feedback.length,
        averageOverall: avgOf(feedback.map((f) => f.overallRating)),
        averageFood: avgOf(
          feedback.map((f) => f.foodRating).filter((n): n is number => n != null),
        ),
        averageService: avgOf(
          feedback.map((f) => f.serviceRating).filter((n): n is number => n != null),
        ),
        averageAmbience: avgOf(
          feedback.map((f) => f.ambienceRating).filter((n): n is number => n != null),
        ),
        averageWaitTime: avgOf(
          feedback.map((f) => f.waitTimeRating).filter((n): n is number => n != null),
        ),
        issueCount: issuesInRange.length,
        resolutionRate:
          issuesInRange.length === 0
            ? null
            : Math.round((resolved / issuesInRange.length) * 100),
      },
      mostReportedIssues: Object.entries(byCategory)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
      tableStats: tableStats.sort((a, b) => a.average - b.average),
      menuPerformance: Object.values(menuAgg)
        .map((m) => ({
          name: m.name,
          average: Math.round((m.sum / m.count) * 10) / 10,
          count: m.count,
        }))
        .sort((a, b) => b.average - a.average),
      insights,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function createMenuItemHandler(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const body = z
      .object({
        businessId: z.string().uuid().optional(),
        branchId: z.string().uuid().optional().nullable(),
        name: z.string().trim().min(1).max(80),
        category: z.string().trim().max(80).optional().nullable(),
      })
      .parse(await request.json());
    const businessId = await resolveAccessibleDineBusinessId(ctx, body.businessId);
    const item = await dineRepository.createMenuItem({
      businessId,
      branchId: body.branchId,
      name: body.name,
      category: body.category,
    });
    return jsonOk({ item }, 201);
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function listMenuItemsHandler(request: Request) {
  try {
    const ctx = await requireDineSession(request);
    const url = new URL(request.url);
    const businessId = await resolveAccessibleDineBusinessId(
      ctx,
      url.searchParams.get("businessId"),
    );
    const items = await dineRepository.listMenuItems(
      businessId,
      url.searchParams.get("branchId") ?? undefined,
    );
    return jsonOk({ items });
  } catch (error) {
    return handleAuthError(error);
  }
}

/** Public: resolve table context for guest dine page. */
export async function getPublicTableContext(
  _request: Request,
  params: Promise<{ restaurant: string; branch: string; table: string }>,
) {
  const { restaurant, branch, table } = await params;
  const row = await dineRepository.findTableByPath(restaurant, branch, table);
  if (!row || row.branch.business.plan !== "dinepro") {
    return jsonError("Table not found", 404);
  }

  await dineRepository.createActivity({
    businessId: row.businessId,
    tableId: row.id,
    type: "QR_SCAN",
    message: `Guest scanned QR for table ${row.tableNumber}`,
  });

  const menuItems = await dineRepository.listMenuItems(
    row.businessId,
    row.branchId,
  );

  return jsonOk({
    restaurant: {
      name: row.branch.business.name,
      slug: row.branch.business.slug,
      logoUrl: row.branch.business.logoUrl,
      googleReviewUrl: row.branch.business.googleReviewUrl,
    },
    branch: { name: row.branch.name, slug: row.branch.slug },
    floor: { name: row.floor.name, slug: row.floor.slug },
    table: { id: row.id, number: row.tableNumber, slug: row.slug },
    menuItems: menuItems.map((m) => ({ id: m.id, name: m.name, category: m.category })),
  });
}

export async function submitDineFeedback(request: Request) {
  try {
    const body = z
      .object({
        restaurantSlug: slugSchema,
        branchSlug: slugSchema,
        tableSlug: slugSchema,
        foodRating: ratingSchema.optional().nullable(),
        serviceRating: ratingSchema.optional().nullable(),
        ambienceRating: ratingSchema.optional().nullable(),
        waitTimeRating: ratingSchema.optional().nullable(),
        overallRating: ratingSchema,
        comment: z.string().trim().max(1000).optional().nullable(),
        issueTags: z.array(z.string().trim().max(40)).max(8).default([]),
        menuItemId: z.string().uuid().optional().nullable(),
        menuItemRating: ratingSchema.optional().nullable(),
        website: z.string().optional(), // honeypot
      })
      .parse(await request.json());

    if (body.website) {
      return jsonOk({ ok: true });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const limited = checkRateLimit(`dine-feedback:${ip}:${body.tableSlug}`, 8, 60);
    if (!limited.allowed) {
      return jsonError("Too many submissions. Please try again shortly.", 429);
    }

    const table = await dineRepository.findTableByPath(
      body.restaurantSlug,
      body.branchSlug,
      body.tableSlug,
    );
    if (!table || table.branch.business.plan !== "dinepro") {
      return jsonError("Table not found", 404);
    }

    const feedback = await dineRepository.createFeedback({
      businessId: table.businessId,
      tableId: table.id,
      foodRating: body.foodRating,
      serviceRating: body.serviceRating,
      ambienceRating: body.ambienceRating,
      waitTimeRating: body.waitTimeRating,
      overallRating: body.overallRating,
      comment: body.comment,
      issueTags: body.issueTags,
      menuItemId: body.menuItemId,
      menuItemRating: body.menuItemRating,
    });

    await dineRepository.createActivity({
      businessId: table.businessId,
      tableId: table.id,
      type: "FEEDBACK",
      message: `Overall rating: ${body.overallRating}/5`,
    });

    const tags = body.issueTags;
    const shouldOpenIssue =
      tags.length > 0 ||
      body.overallRating <= 3 ||
      (body.waitTimeRating != null && body.waitTimeRating <= 2) ||
      (body.serviceRating != null && body.serviceRating <= 2);

    let issue = null;
    if (shouldOpenIssue) {
      const category =
        tags.length > 0
          ? mapIssueTagToCategory(tags[0]!)
          : body.waitTimeRating != null && body.waitTimeRating <= 2
            ? "WAIT_TIME"
            : body.serviceRating != null && body.serviceRating <= 2
              ? "SERVICE"
              : "OTHER";
      const severity = severityFromRatings({
        overallRating: body.overallRating,
        waitTimeRating: body.waitTimeRating,
        serviceRating: body.serviceRating,
        tags,
      });
      const summary =
        tags[0] ??
        (body.comment?.slice(0, 120) || `${category.replace("_", " ")} concern`);
      issue = await dineRepository.createIssue({
        businessId: table.businessId,
        tableId: table.id,
        feedbackId: feedback.id,
        category,
        severity,
        summary,
      });
      await dineRepository.createActivity({
        businessId: table.businessId,
        tableId: table.id,
        type: "ISSUE",
        message: `Issue: ${summary} (${severity})`,
      });

      if (severity === "HIGH" || severity === "MEDIUM") {
        try {
          await sendOwnerAlert({
            ownerEmail: table.branch.business.ownerEmail,
            ownerWhatsApp: table.branch.business.ownerWhatsApp,
            ownerSmsPhone: table.branch.business.ownerSmsPhone,
            businessName: table.branch.business.name,
            rating: body.overallRating,
            comment: `[DinePro Table ${table.tableNumber}] ${summary}${body.comment ? ` — ${body.comment}` : ""}`,
            timestamp: new Date(),
          });
          await dineRepository.markIssueAlertSent(issue.id);
          await dineRepository.createActivity({
            businessId: table.businessId,
            tableId: table.id,
            type: "ALERT",
            message: "Manager notified",
          });
        } catch (err) {
          console.error("[dinepro] alert failed", err);
        }
      }
    }

    return jsonOk({
      ok: true,
      feedbackId: feedback.id,
      issueId: issue?.id ?? null,
      googleReviewUrl: table.branch.business.googleReviewUrl,
      businessSlug: table.branch.business.slug,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.errors[0]?.message ?? "Invalid input", 400);
    }
    console.error("[dinepro] submit", error);
    return jsonError("Could not submit feedback", 500);
  }
}
