import { randomUUID } from "crypto";
import type { PrismaClient } from "@prisma/client";

export type CreateBranchInput = {
  businessId: string;
  name: string;
  slug: string;
};

export type CreateFloorInput = {
  branchId: string;
  name: string;
  slug: string;
  sortOrder?: number;
};

export type CreateTableInput = {
  businessId: string;
  branchId: string;
  floorId: string;
  tableNumber: string;
  slug: string;
};

export type CreateMenuItemInput = {
  businessId: string;
  branchId?: string | null;
  name: string;
  category?: string | null;
  sortOrder?: number;
};

export type CreateDineFeedbackInput = {
  businessId: string;
  tableId: string;
  foodRating?: number | null;
  serviceRating?: number | null;
  ambienceRating?: number | null;
  waitTimeRating?: number | null;
  overallRating: number;
  comment?: string | null;
  issueTags?: string[];
  menuItemId?: string | null;
  menuItemRating?: number | null;
};

export type CreateDineIssueInput = {
  businessId: string;
  tableId: string;
  feedbackId?: string | null;
  category: string;
  severity: string;
  summary: string;
};

export function createDineRepository(prisma: PrismaClient) {
  return {
    // ── Branches ──────────────────────────────────────────────
    listBranches(businessId: string) {
      return prisma.dineBranch.findMany({
        where: { businessId },
        orderBy: { name: "asc" },
        include: { floors: { orderBy: { sortOrder: "asc" } } },
      });
    },

    createBranch(data: CreateBranchInput) {
      return prisma.dineBranch.create({ data });
    },

    findBranchBySlug(businessId: string, slug: string) {
      return prisma.dineBranch.findFirst({
        where: { businessId, slug, isActive: true },
      });
    },

    findBranchById(id: string) {
      return prisma.dineBranch.findUnique({ where: { id } });
    },

    updateBranch(id: string, data: { name?: string; isActive?: boolean }) {
      return prisma.dineBranch.update({ where: { id }, data });
    },

    // ── Floors ────────────────────────────────────────────────
    listFloors(branchId: string) {
      return prisma.dineFloor.findMany({
        where: { branchId },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
    },

    createFloor(data: CreateFloorInput) {
      return prisma.dineFloor.create({
        data: {
          branchId: data.branchId,
          name: data.name,
          slug: data.slug,
          sortOrder: data.sortOrder ?? 0,
        },
      });
    },

    findFloorById(id: string) {
      return prisma.dineFloor.findUnique({
        where: { id },
        include: { branch: true },
      });
    },

    // ── Tables ────────────────────────────────────────────────
    listTables(filters: {
      businessId: string;
      branchId?: string;
      floorId?: string;
      includeInactive?: boolean;
    }) {
      return prisma.dineTable.findMany({
        where: {
          businessId: filters.businessId,
          branchId: filters.branchId,
          floorId: filters.floorId,
          ...(filters.includeInactive ? {} : { isActive: true }),
        },
        include: {
          floor: true,
          branch: true,
        },
        orderBy: [{ tableNumber: "asc" }],
      });
    },

    createTable(data: CreateTableInput) {
      return prisma.dineTable.create({ data });
    },

    findTableById(id: string) {
      return prisma.dineTable.findUnique({
        where: { id },
        include: { floor: true, branch: true },
      });
    },

    findTableByPath(restaurantSlug: string, branchSlug: string, tableSlug: string) {
      return prisma.dineTable.findFirst({
        where: {
          slug: tableSlug,
          isActive: true,
          status: "active",
          branch: {
            slug: branchSlug,
            isActive: true,
            business: { slug: restaurantSlug, isActive: true },
          },
        },
        include: {
          floor: true,
          branch: { include: { business: true } },
        },
      });
    },

    updateTable(
      id: string,
      data: {
        tableNumber?: string;
        isActive?: boolean;
        status?: string;
        qrToken?: string;
      },
    ) {
      return prisma.dineTable.update({ where: { id }, data });
    },

    regenerateQrToken(id: string) {
      return prisma.dineTable.update({
        where: { id },
        data: { qrToken: randomUUID() },
      });
    },

    // ── Menu ──────────────────────────────────────────────────
    listMenuItems(businessId: string, branchId?: string) {
      return prisma.dineMenuItem.findMany({
        where: {
          businessId,
          isActive: true,
          OR: branchId ? [{ branchId }, { branchId: null }] : undefined,
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });
    },

    createMenuItem(data: CreateMenuItemInput) {
      return prisma.dineMenuItem.create({
        data: {
          businessId: data.businessId,
          branchId: data.branchId ?? null,
          name: data.name,
          category: data.category ?? null,
          sortOrder: data.sortOrder ?? 0,
        },
      });
    },

    // ── Feedback ──────────────────────────────────────────────
    createFeedback(data: CreateDineFeedbackInput) {
      return prisma.dineFeedback.create({
        data: {
          businessId: data.businessId,
          tableId: data.tableId,
          foodRating: data.foodRating ?? null,
          serviceRating: data.serviceRating ?? null,
          ambienceRating: data.ambienceRating ?? null,
          waitTimeRating: data.waitTimeRating ?? null,
          overallRating: data.overallRating,
          comment: data.comment ?? null,
          issueTags: data.issueTags ?? [],
          menuItemId: data.menuItemId ?? null,
          menuItemRating: data.menuItemRating ?? null,
        },
      });
    },

    listFeedback(filters: {
      businessId: string;
      tableId?: string;
      since?: Date;
      until?: Date;
      limit?: number;
    }) {
      return prisma.dineFeedback.findMany({
        where: {
          businessId: filters.businessId,
          tableId: filters.tableId,
          createdAt: {
            gte: filters.since,
            lte: filters.until,
          },
        },
        include: {
          table: { include: { floor: true, branch: true } },
          menuItem: true,
        },
        orderBy: { createdAt: "desc" },
        take: filters.limit ?? 100,
      });
    },

    recentFeedbackForTable(tableId: string, limit = 10) {
      return prisma.dineFeedback.findMany({
        where: { tableId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    },

    // ── Issues ────────────────────────────────────────────────
    createIssue(data: CreateDineIssueInput) {
      return prisma.dineIssue.create({
        data: {
          businessId: data.businessId,
          tableId: data.tableId,
          feedbackId: data.feedbackId ?? null,
          category: data.category,
          severity: data.severity,
          summary: data.summary,
        },
      });
    },

    listIssues(filters: {
      businessId: string;
      status?: string | string[];
      tableId?: string;
      limit?: number;
    }) {
      const status = filters.status
        ? Array.isArray(filters.status)
          ? { in: filters.status }
          : filters.status
        : undefined;
      return prisma.dineIssue.findMany({
        where: {
          businessId: filters.businessId,
          status,
          tableId: filters.tableId,
        },
        include: {
          table: { include: { floor: true, branch: true } },
        },
        orderBy: { createdAt: "desc" },
        take: filters.limit ?? 50,
      });
    },

    findIssueById(id: string) {
      return prisma.dineIssue.findUnique({
        where: { id },
        include: { table: true },
      });
    },

    resolveIssue(
      id: string,
      data: {
        status: string;
        resolvedBy?: string | null;
        resolvedAt?: Date | null;
        resolutionNote?: string | null;
      },
    ) {
      return prisma.dineIssue.update({ where: { id }, data });
    },

    markIssueAlertSent(id: string) {
      return prisma.dineIssue.update({
        where: { id },
        data: { alertSentAt: new Date() },
      });
    },

    openIssueCountForTable(tableId: string) {
      return prisma.dineIssue.count({
        where: { tableId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      });
    },

    // ── Activity ──────────────────────────────────────────────
    createActivity(data: {
      businessId: string;
      tableId: string;
      type: string;
      message: string;
      metaJson?: string | null;
    }) {
      return prisma.dineActivity.create({ data });
    },

    listActivities(tableId: string, limit = 40) {
      return prisma.dineActivity.findMany({
        where: { tableId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });
    },

    // ── Aggregates ────────────────────────────────────────────
    countFeedbackSince(businessId: string, since: Date) {
      return prisma.dineFeedback.count({
        where: { businessId, createdAt: { gte: since } },
      });
    },

    countOpenIssues(businessId: string) {
      return prisma.dineIssue.count({
        where: { businessId, status: { in: ["OPEN", "IN_PROGRESS"] } },
      });
    },

    countActiveTables(businessId: string, branchId?: string) {
      return prisma.dineTable.count({
        where: { businessId, branchId, isActive: true, status: "active" },
      });
    },
  };
}

export type DineRepository = ReturnType<typeof createDineRepository>;
