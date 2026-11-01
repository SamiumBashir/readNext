"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookmarkCheck,
  RotateCcw,
  BarChart3,
  Bell,
  Settings,
  Library,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  X,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "books"
  | "users"
  | "borrows"
  | "returns"
  | "analytics"
  | "notifications"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpen: boolean;
  onClose: () => void;
  user: {
    name?: string | null;
    email?: string | null;
  };
  unreadNotificationsCount?: number;
  overdueCount?: number;
}

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  user,
  unreadNotificationsCount = 0,
  overdueCount = 0,
}: AdminSidebarProps) {
  const navItems = [
    {
      id: "overview" as AdminTab,
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "books" as AdminTab,
      label: "Books Catalog",
      icon: BookOpen,
      badge: null,
    },
    {
      id: "users" as AdminTab,
      label: "User Members",
      icon: Users,
      badge: null,
    },
    {
      id: "borrows" as AdminTab,
      label: "Borrow Records",
      icon: BookmarkCheck,
      badge: null,
    },
    {
      id: "returns" as AdminTab,
      label: "Return & Overdue",
      icon: RotateCcw,
      badge: overdueCount > 0 ? `${overdueCount}` : null,
      badgeColor: "bg-rose-500 text-white",
    },
    {
      id: "analytics" as AdminTab,
      label: "Analytics & Reports",
      icon: BarChart3,
      badge: null,
    },
    {
      id: "notifications" as AdminTab,
      label: "Notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : null,
      badgeColor: "bg-[#F4A623] text-stone-900 font-bold",
    },
    {
      id: "settings" as AdminTab,
      label: "System Settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#103B29] text-stone-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between border-b border-emerald-900/50 px-6">
          <Link
            href="/admin"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
            onClick={onClose}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4A623] to-[#e09214] text-stone-950 shadow-md">
              <Library className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl font-bold tracking-tight text-white">
                  ReadNext
                </span>
                <span className="rounded-full bg-emerald-800/80 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-200 uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-emerald-300/80">Curator Dashboard</p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-emerald-300 hover:bg-emerald-900/60 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-emerald-300/60 uppercase">
            Management Hub
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#174B32] text-white shadow-sm ring-1 ring-emerald-500/30"
                      : "text-emerald-100/80 hover:bg-emerald-900/40 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-5 w-5 transition-colors ${
                        isActive
                          ? "text-[#F4A623]"
                          : "text-emerald-300/70 group-hover:text-emerald-200"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${item.badgeColor || "bg-emerald-800 text-emerald-200"}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Shortcuts */}
          <div className="mt-8 border-t border-emerald-900/50 pt-5">
            <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-emerald-300/60 uppercase">
              Library Access
            </p>
            <div className="space-y-1">
              <Link
                href="/"
                target="_blank"
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-emerald-200/80 transition-all hover:bg-emerald-900/40 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-4 w-4 text-emerald-400" />
                  <span>Public Library</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>

              <Link
                href="/books"
                target="_blank"
                className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-emerald-200/80 transition-all hover:bg-emerald-900/40 hover:text-white"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-emerald-400" />
                  <span>Public Catalog</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            </div>
          </div>
        </div>

        {/* Admin Footer Pill */}
        <div className="border-t border-emerald-900/50 bg-[#0c2f21] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-emerald-950/40 p-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#174B32] text-sm font-bold text-[#F4A623] ring-1 ring-emerald-500/30">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-xs font-semibold text-white">
                  {user.name || "Curator Admin"}
                </p>
                <ShieldCheck className="h-3.5 w-3.5 text-[#F4A623]" />
              </div>
              <p className="truncate text-[11px] text-emerald-300/70">
                {user.email || "admin@readnest.org"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

