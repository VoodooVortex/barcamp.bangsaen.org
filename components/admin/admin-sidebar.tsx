// Admin sidebar component
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import {
  LayoutDashboard,
  Mic2,
  MapPin,
  LogOut,
  User,
  Users,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

interface AdminSidebarProps {
  user: {
    id: string;
    email?: string;
    role: string;
    isAdmin: boolean;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const currentSlug = pathname.match(/^\/admin\/([^/]+)(?:\/|$)/)?.[1];

  // NOTE: If the slug happens to be "events" or "users" (the global routes), filter it out
  const isGlobalRoute = currentSlug === "events" || currentSlug === "users";
  const actualSlug = isGlobalRoute ? null : currentSlug;

  const dashboardHref = actualSlug
    ? `/admin/${actualSlug}/dashboard`
    : "/admin";
  const sessionsHref = actualSlug
    ? `/admin/${actualSlug}/sessions`
    : "/admin/sessions";
  const venuesHref = actualSlug
    ? `/admin/${actualSlug}/venues`
    : "/admin/venues";

  const navItems = [
    {
      href: dashboardHref,
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: pathname === dashboardHref || pathname === "/admin",
    },
    {
      href: sessionsHref,
      label: "Sessions",
      icon: Mic2,
      isActive:
        pathname === sessionsHref || pathname.startsWith(`${sessionsHref}/`),
    },
    {
      href: venuesHref,
      label: "Venues",
      icon: MapPin,
      isActive:
        pathname === venuesHref || pathname.startsWith(`${venuesHref}/`),
    },
  ];

  if (user.isAdmin) {
    navItems.push(
      {
        href: "/admin/events",
        label: "Events",
        icon: CalendarDays,
        isActive: pathname === "/admin/events" || pathname.startsWith("/admin/events/"),
      },
      {
        href: "/admin/users",
        label: "Team",
        icon: Users,
        isActive:
          pathname === "/admin/users" || pathname.startsWith("/admin/users/"),
      }
    );
  }

  // Close mobile menu on route change implicitly via onClick
  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground border-b border-primary-foreground/10 shrink-0">
        <Link href="/admin" className="font-bold text-base sm:text-lg tracking-tight">
          Barcamp Admin
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          "bg-primary text-primary-foreground border-r border-primary-foreground/10 flex flex-col transition-all duration-300 shadow-xl z-50",
          "fixed inset-y-0 left-0 md:relative",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-16" : "md:w-64",
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-primary-foreground/10 flex items-center justify-between min-h-[73px]">
          {/* Only show logo text when not collapsed, OR if we are on mobile (where it's never collapsed visually via the w-16 class because md:w-16) */}
          {(!collapsed || mobileOpen) && (
            <Link href="/admin" className="font-bold text-base md:text-lg tracking-tight truncate">
              Barcamp Admin
            </Link>
          )}

          {/* Desktop Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex h-8 w-8 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobile}
            className="md:hidden flex h-8 w-8 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground shrink-0"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  item.isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                  (!mobileOpen && collapsed) && "md:justify-center",
                )}
                title={(!mobileOpen && collapsed) ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {(!(!mobileOpen && collapsed)) && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-primary-foreground/10">
          <div
            className={cn(
              "flex items-center gap-3",
              (!mobileOpen && collapsed) && "md:justify-center",
            )}
          >
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-accent" />
            </div>
            {(!(!mobileOpen && collapsed)) && (
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-primary-foreground">
                  {user.email || "Admin"}
                </p>
                <p className="text-xs text-primary-foreground/60 capitalize">
                  {user.role}
                </p>
              </div>
            )}
          </div>

          {(!(!mobileOpen && collapsed)) && (
            <LogoutButton
              variant="ghost"
              size="sm"
              className="w-full mt-2 justify-start text-primary-foreground/70 hover:bg-destructive/20 hover:text-destructive-foreground transition-colors"
              redirectTo="/auth/login"
            >
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </>
            </LogoutButton>
          )}
        </div>
      </aside>
    </>
  );
}
