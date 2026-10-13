"use client";

import { useEffect, useState } from "react";

const SELECTED_COOKIE = "dinepro_business";

type Restaurant = { id: string; name: string; slug: string };

/** Platform-admin only: owners get 403 from the API and see nothing. */
export function DineProRestaurantPicker() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("/api/dinepro/restaurants").catch(() => null);
      if (!res?.ok || cancelled) return;
      const json = (await res.json()) as { restaurants: Restaurant[]; selectedId: string | null };
      setRestaurants(json.restaurants);
      setSelectedId(json.selectedId ?? "");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (restaurants.length === 0) {
    return null;
  }

  function choose(id: string) {
    document.cookie = `${SELECTED_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=31536000; samesite=lax`;
    window.location.reload();
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Restaurant</span>
      <select
        value={selectedId}
        onChange={(event) => choose(event.target.value)}
        className="max-w-[12rem] rounded-xl border border-border bg-white px-2.5 py-1.5 text-sm font-medium text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-[var(--ring)] sm:max-w-[16rem]"
        aria-label="Choose restaurant"
      >
        {restaurants.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
    </label>
  );
}
