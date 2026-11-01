"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  PlusCircle,
  Calendar,
  ExternalLink,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { AdminTab } from "./AdminSidebar";
import { NotificationItem } from "@/types";

interface AdminHeaderProps {
  activeTab: AdminTab;
  onOpenSidebar: () => void;
  onOpenAddBookModal: () => void;
  user: {
    name?: string | null;
    email?: string | null;
  };
  notifications?: NotificationItem[];
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
}

export default function AdminHeader({
  activeTab,
  onOpenSidebar,
  onOpenAddBookModal,
  user,
  notifications = [],
  globalSearch,
  setGlobalSearch,
}: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const tabMeta: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: {
      title: "Dashboard Overview",
      subtitle: "Live library metrics, borrowing trends, and inventory health",
    },
    books: {
      title: "Books Management",
      subtitle: "Full literary catalog, stock allocation, and publication records",
    },
    users: {
      title: "User Management",
      subtitle: "Registered readers, active loans, and complete borrowing histories",
    },
    borrows: {
      title: "Borrow Transactions",
      subtitle: "Real-time records of active, returned, and overdue loans",
    },
    returns: {
      title: "Return & Overdue Center",
      subtitle: "Track loan expiration, process check-ins, and restock volumes",
    },
    analytics: {
      title: "Analytics & Intelligence",
      subtitle: "Borrowing ratios, category popularity, and member engagement",
    },
    notifications: {
      title: "System Alerts & Activity",
      subtitle: "Urgent inventory warnings, overdue notices, and system logs",
    },
    settings: {
      title: "Library Settings",
      subtitle: "Loan duration rules, admin whitelists, and database health",
    },
  };

  const currentMeta = tabMeta[activeTab] || tabMeta.overview;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const todayStr = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#E7E0D3] bg-[#FAF7F0]/95 px-4 backdrop-blur-md sm:px-8">
      {/* Left: Mobile Toggle + Title */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-xs hover:bg-stone-50 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-serif text-lg font-bold tracking-tight text-[#174B32] sm:text-2xl">
            {currentMeta.title}
          </h1>
          <p className="hidden text-xs text-stone-500 sm:block">
            {currentMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Date, Add Book, Notifications, Profile */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="Search books, users, loans..."
            className="h-10 w-52 rounded-xl border border-stone-200 bg-white pl-9 pr-4 text-xs text-stone-800 placeholder-stone-400 shadow-2xs transition-all focus:w-64 focus:border-[#174B32] focus:outline-hidden focus:ring-2 focus:ring-[#174B32]/10 lg:w-64"
          />
          {globalSearch && (
            <button
              type="button"
              onClick={() => setGlobalSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
            >
              Clear
            </button>
          )}
        </div>

        {/* Date Display */}
        <div className="hidden items-center gap-1.5 rounded-xl border border-stone-200/80 bg-white px-3 py-2 text-xs font-medium text-stone-600 shadow-2xs xl:flex">
          <Calendar className="h-3.5 w-3.5 text-[#174B32]" />
          <span>{todayStr}</span>
        </div>

        {/* Add Book Primary Action Button */}
        <button
          type="button"
          onClick={onOpenAddBookModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#174B32] px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#103B29] hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-[#174B32] focus:ring-offset-2"
        >
          <PlusCircle className="h-4 w-4 text-[#F4A623]" />
          <span className="hidden sm:inline">Add Book</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-700 shadow-2xs hover:bg-stone-50 focus:outline-hidden"
            aria-label="Toggle notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl sm:w-96">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm font-bold text-stone-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-stone-400 hover:text-stone-700"
                >
                  Close
                </button>
              </div>

              <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">
                    No new library notifications
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 rounded-xl p-2.5 text-xs transition-colors ${
                        n.read ? "bg-stone-50/60" : "bg-emerald-50/60 ring-1 ring-emerald-200/50"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          n.type === "overdue"
                            ? "bg-rose-100 text-rose-700"
                            : n.type === "stock"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {n.type === "overdue" ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : n.type === "stock" ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900">{n.title}</p>
                        <p className="line-clamp-2 text-stone-600">{n.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar Mini Pill */}
        <div className="flex items-center gap-2.5 border-l border-stone-200/80 pl-2.5 sm:pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#174B32] font-semibold text-[#F4A623] shadow-xs">
            {user.name ? user.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="hidden flex-col text-left text-xs lg:flex">
            <span className="font-bold text-stone-900 truncate max-w-[110px]">
              {user.name || "Administrator"}
            </span>
            <span className="text-[10px] font-semibold text-emerald-800">
              Verified Curator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
