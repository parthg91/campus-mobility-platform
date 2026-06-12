import { NextResponse } from "next/server";

function isTokenValid(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp && payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function middleware(request) {
  const token = request.cookies.get("mobility_token")?.value;
  const protectedPath = request.nextUrl.pathname.startsWith("/dashboard");

  const authenticated = token && isTokenValid(token);

  if (protectedPath && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") && authenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"]
};
