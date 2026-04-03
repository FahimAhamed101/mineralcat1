import { NextResponse } from "next/server";

export function middleware(request) {
  console.log("Middleware triggered:", request.url);

  const token = request.cookies.get("authToken");

  if (!token) {
    console.log("Redirecting to login...");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // If token exists, allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/subscription/pricing", "/questions/test"],
};