import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Helper to check if token is expired
const isTokenExpired = (exp?: number): boolean => {
  if (!exp) return false;
  return Date.now() >= exp * 1000;
};

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/api/auth",
  "/api/upload",
  "/api/public",
  "/auth",
];

// Define admin routes
const adminRoutes = ["/admin-dashboard"];

// Define student routes
const studentRoutes = ["/student-dashboard"];

// Type definition for the token
interface AuthToken {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
}

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // Safely access the token
    const token = (req as any).nextauth?.token as AuthToken | undefined;

    // Check if path is public
    const isPublicRoute = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    );

    // Check if path is admin route
    const isAdminRoute = adminRoutes.some(
      (route) => pathname.startsWith(`${route}/`) || pathname === route,
    );

    // Check if path is student route
    const isStudentRoute = studentRoutes.some(
      (route) => pathname.startsWith(`${route}/`) || pathname === route,
    );

    // Check for session cookies
    const hasSessionCookie =
      !!req.cookies.get("next-auth.session-token") ||
      !!req.cookies.get("__Secure-next-auth.session-token");

    // Check if token is expired
    const tokenExpired = token?.exp ? isTokenExpired(token.exp) : false;

    // ========== PUBLIC ROUTES HANDLING ==========
    if (isPublicRoute) {
      // If user is already authenticated and tries to access login/signup
      if (
        (pathname.startsWith("/login") || pathname.startsWith("/signup")) &&
        token
      ) {
        const role = token.role as string;
        const redirectUrl =
          role === "ADMIN" ? "/admin-dashboard" : "/student-dashboard";

        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }

      // Allow access to public routes
      return NextResponse.next();
    }

    // ========== AUTHENTICATION CHECK ==========
    // If no token and no session cookie, redirect to login
    if (!token && !hasSessionCookie) {
      console.log("No token or session cookie, redirecting to login");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }

    // If token exists but is expired
    if (token && tokenExpired) {
      console.log("Token expired, redirecting to login");
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", encodeURIComponent(pathname));
      loginUrl.searchParams.set("expired", "true");
      return NextResponse.redirect(loginUrl);
    }

    // ========== ROLE-BASED ACCESS CONTROL ==========
    const role = token?.role as string | undefined;

    // If no role in token, redirect to login (shouldn't happen but for safety)
    if (!role) {
      console.log("No role in token, redirecting to login");
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Admin accessing student route
    if (isStudentRoute && role === "ADMIN") {
      console.log(
        "Admin trying to access student route, redirecting to admin dashboard",
      );
      return NextResponse.redirect(new URL("/admin-dashboard", req.url));
    }

    // Student accessing admin route
    if (isAdminRoute && role !== "ADMIN") {
      console.log(
        "Non-admin trying to access admin route, redirecting to student dashboard",
      );
      return NextResponse.redirect(new URL("/student-dashboard", req.url));
    }

    // If user is authenticated but accessing a protected route without specific role check
    // (e.g., /certificate route)
    if (pathname.startsWith("/certificate")) {
      // Allow both admin and student to access certificates
      // Add any additional checks here if needed
      return NextResponse.next();
    }

    // All checks passed, allow access
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl?.pathname || "";

        // Check if route is public
        const isPublicRoute = publicRoutes.some(
          (route) => pathname === route || pathname.startsWith(`${route}/`),
        );

        // Allow access to public routes without requiring token
        if (isPublicRoute) {
          return true;
        }

        // For protected routes, require token
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
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
