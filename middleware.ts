import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAdminPage = req.nexturl.pathname.startsWith("/admin-dashboard");

    // If trying to access admin page but not an admin
    if (isAdminPage && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student-dashboard", req.url));
    }
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
