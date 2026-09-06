import { NextRequest, NextResponse } from "next/server";

const canonicalHost = "www.arkansashvacconnect.com";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (host === "arkansashvacconnect.com" || host?.endsWith(".vercel.app")) {
    const canonical = request.nextUrl.clone();
    canonical.protocol = "https";
    canonical.host = canonicalHost;
    canonical.port = "";
    return NextResponse.redirect(canonical, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
