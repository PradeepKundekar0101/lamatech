import "server-only";
import { cookies } from "next/headers";
import { isRole, ROLE_COOKIE } from "@/lib/auth";
import type { Role } from "@/lib/types";

/**
 * Demo-only role resolution. In production this would come from a Supabase
 * session + a `user_roles` table, with RLS enforcing access in the database.
 */
export async function getCurrentRole(): Promise<Role> {
  const store = await cookies();
  const value = store.get(ROLE_COOKIE)?.value;
  return isRole(value) ? value : "guest";
}
