"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Users,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
  { name: "Manage Courses", href: "/admin-dashboard/courses", icon: BookOpen },
  { name: "Manage Lessons", href: "/admin-dashboard/lessons", icon: FileText },
  {
    name: "Manage Quizzes",
    href: "/admin-dashboard/quizzes",
    icon: HelpCircle,
  },
  { name: "View Students", href: "/admin-dashboard/students", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card/50 h-screen sticky top-0 hidden md:flex md:flex-col">
      <div className="p-6 flex-1">
        <Link
          href="/admin-dashboard"
          className="flex items-center gap-2 font-semibold text-xl mb-8"
        >
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <span>LearnHub Admin</span>
        </Link>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
