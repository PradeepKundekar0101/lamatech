import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE } from "@/lib/auth";

const ADMIN_ONLY_PATHS = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresAdmin = ADMIN_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!requiresAdmin) {
    return NextResponse.next();
  }

  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (role === "admin") {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/forbidden";
  url.searchParams.set("from", pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
