import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl?.pathname || "/";
    console.log("TOKEN IN MIDDLEWARE:", token);
    console.log("PATHNAME:", pathname);

    const isAdminPage =
      pathname === "/admin-dashboard" ||
      pathname.startsWith("/admin-dashboard/");
    const isStudentPage =
      pathname === "/student-dashboard" ||
      pathname.startsWith("/student-dashboard/");

    // If non-admin tries to access admin page → redirect to student dashboard
    if (isAdminPage && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student-dashboard", req.url));
    }

    // If admin tries to access student page → redirect to admin dashboard
    if (isStudentPage && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin-dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    "/admin-dashboard/:path*",
    "/student-dashboard/:path*",
    "/certificate/:path*",
  ],
};
