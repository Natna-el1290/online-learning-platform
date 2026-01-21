import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth?.token;

    // Check for session cookie presence
    const hasSessionCookie =
      !!req.cookies.get("next-auth.session-token") ||
      !!req.cookies.get("__Secure-next-auth.session-token");

    const isAuthRoute =
      pathname.startsWith("/login") || pathname.startsWith("/signup");

    // 1. If user is authenticated and tries to access login/signup, redirect them
    if (isAuthRoute) {
      if (token) {
        const role = token.role as string;
        if (role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin-dashboard", req.url));
        } else {
          // Default to student dashboard or home
          return NextResponse.redirect(new URL("/student-dashboard", req.url));
        }
      }
      // If has cookie but no token yet, let it pass (or wait), usually it resolves quickly.
      // If we redirect here without token, we might not know the role.
      // But if we let them view login, it might be confusing.
      // For now, if no token, we let them see the page, client side will redirect if needed (Login page has check).
      return NextResponse.next();
    }

    // 2. Protected Routes Logic
    // Token is null if not authenticated
    // withAuth wrapper usually handles the "if (!token) redirect to login" for us if `authorized` callback returns false.
    // But here `authorized` maps to true, so we handle it manually.

    if (
      !token &&
      !hasSessionCookie &&
      !isAuthRoute &&
      !pathname.startsWith("/api/auth")
    ) {
      // This block currently only triggers on matched routes (admin/student dashboard)
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 3. Role-based access control
    const role = token?.role as string | undefined;

    const isAdminPage = pathname.startsWith("/admin-dashboard");
    const isStudentPage = pathname.startsWith("/student-dashboard");

    if (isAdminPage && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student-dashboard", req.url));
    }

    if (isStudentPage && role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin-dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // We handle redirection in the middleware function
    },
  },
);

export const config = {
  matcher: [
    "/admin-dashboard/:path*",
    "/student-dashboard/:path*",
    "/certificate/:path*",
    "/login",
    "/signup",
  ],
};
