import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";

/** GET or POST — clear the session cookie and bounce home. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return logout(request);
}
export async function POST(request: NextRequest): Promise<NextResponse> {
  return logout(request);
}

function logout(request: NextRequest): NextResponse {
  const home = new URL("/", request.url);
  const response = NextResponse.redirect(home, { status: 303 });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
