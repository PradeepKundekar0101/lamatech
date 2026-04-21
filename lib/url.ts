import { headers } from "next/headers";

/**
 * Resolve the absolute base URL of the current request, so that server
 * components can call our own API routes during render.
 */
export async function getRequestBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");

  if (!host) {
    return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  }
  return `${proto}://${host}`;
}
