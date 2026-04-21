import type { Role } from "@/lib/types";

export const ROLE_COOKIE = "demo_role";

const VALID_ROLES: Role[] = ["admin", "viewer", "guest"];

export function isRole(value: string | undefined | null): value is Role {
  return !!value && (VALID_ROLES as string[]).includes(value);
}
