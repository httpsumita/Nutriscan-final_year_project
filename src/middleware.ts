import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = ["/auth/signin", "/auth/signup", "/"]

export async function middleware(request: NextRequest) {
  const session = await auth()

  if (!session && !publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
