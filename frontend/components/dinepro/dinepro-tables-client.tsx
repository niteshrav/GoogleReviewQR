"use client";

import { DineProQrClient } from "@frontend/components/dinepro/dinepro-qr-client";

/** Tables list reuses QR manager for MVP (search/filter/actions). */
export function DineProTablesClient() {
  return <DineProQrClient />;
}
