"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const inStudentDashboard = pathname?.startsWith("/student-dashboard");
  const inAdminDashboard = pathname?.startsWith("/admin-dashboard");

  const coursesHref = inStudentDashboard
    ? "/student-dashboard/courses"
    : inAdminDashboard
      ? "/admin-dashboard/courses"
      : "/courses";
  const aboutHref = inStudentDashboard ? "/student-dashboard" : "/about";
  const contactHref = inStudentDashboard ? "/student-dashboard" : "/contact";

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={
              inStudentDashboard
                ? "/student-dashboard"
                : inAdminDashboard
                  ? "/admin-dashboard"
                  : "/"
            }
            className="flex items-center gap-2 font-semibold text-xl"
          >
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>SkillHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href={coursesHref}
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Courses
            </Link>
            <Link
              href={aboutHref}
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href={contactHref}
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          {/* Hide auth links when inside dashboards to avoid navigating away */}
          {!inStudentDashboard && !inAdminDashboard && (
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Signup</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link
                href={coursesHref}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                Courses
              </Link>
              <Link
                href={aboutHref}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href={contactHref}
                className="text-foreground/70 hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              {!inStudentDashboard && !inAdminDashboard && (
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
