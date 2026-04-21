"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Singleton browser Supabase client. Import in client components only.
 * We don't use it today (all data flows through our API routes) but it's
 * wired up so the same codebase can do direct reads with RLS when needed.
 */
export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY,
    );
  }
  return client;
}
