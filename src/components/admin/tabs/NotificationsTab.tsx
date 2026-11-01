"use client";

import { useState } from "react";
import { NotificationItem } from "@/types";
import {
  Bell,
  AlertTriangle,
  Clock,
  UserPlus,
  CheckCircle2,
  Trash2,
  Shield,
  Layers,
} from "lucide-react";

interface NotificationsTabProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export default function NotificationsTab({
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
}: NotificationsTabProps) {
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = notifications.filter((n) => {
    if (filterType === "all") return true;
    if (filterType === "unread") return !n.read;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#E7E0D3] bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-serif text-base font-bold text-stone-900">
            System Alerts & Activity Logs
          </h3>
          <p className="text-xs text-stone-500">
            Live automated warnings for loan expirations and inventory depletion
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50"
          >
            Mark All as Read
          </button>
          <button
            type="button"
            onClick={onClearNotifications}
            className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 shadow-2xs hover:bg-rose-50"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Alerts" },
          { id: "unread", label: "Unread Only" },
          { id: "overdue", label: "Overdue Notices" },
          { id: "stock", label: "Stock Warnings" },
          { id: "user", label: "Member Joins" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterType(tab.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filterType === tab.id
                ? "bg-[#174B32] text-white shadow-xs"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="rounded-3xl border border-[#E7E0D3] bg-white p-4 shadow-xs divide-y divide-stone-100">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            No notification items found for this selection.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 rounded-2xl transition-colors ${
                item.read ? "bg-white" : "bg-emerald-50/40"
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  item.type === "overdue"
                    ? "bg-rose-100 text-rose-700"
                    : item.type === "stock"
                    ? "bg-amber-100 text-amber-700"
                    : item.type === "user"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-stone-100 text-stone-700"
                }`}
              >
                {item.type === "overdue" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : item.type === "stock" ? (
                  <Clock className="h-4 w-4" />
                ) : item.type === "user" ? (
                  <UserPlus className="h-4 w-4" />
                ) : (
                  <Bell className="h-4 w-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-xs font-bold text-stone-900 truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-stone-400">
                    {new Date(item.timestamp).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

