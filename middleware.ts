import { decrypt, Payload } from "@/utils/session";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export default async function middleware(request: NextRequest) {
  const session = (await cookies()).get("session")?.value;
  const payload = (await decrypt(session)) as Payload;

  if (!payload?.email) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/project/:path*", "/task/:path*"],
};
