"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { AdminUser } from "@/types";
import {
  Search,
  Filter,
  Users,
  Eye,
  ShieldCheck,
  BookmarkCheck,
  BookOpen,
  RotateCcw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Loader2,
} from "lucide-react";

interface UsersTabProps {
  users: AdminUser[];
  onSelectUser: (user: AdminUser) => void;
  onToggleStatus: (userId: string, currentStatus: "active" | "suspended") => Promise<void>;
}

export default function UsersTab({
  users,
  onSelectUser,
  onToggleStatus,
}: UsersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || u.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleToggle = async (userId: string, currentStatus: "active" | "suspended") => {
    setTogglingId(userId);
    try {
      await onToggleStatus(userId, currentStatus);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#E7E0D3] bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search readers by full name or email address..."
            className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 text-xs text-stone-800 placeholder-stone-400 focus:border-[#174B32] focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 shadow-2xs focus:border-[#174B32] focus:outline-hidden"
          >
            <option value="All">All Member Statuses</option>
            <option value="active">Active Members</option>
            <option value="suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-[#E7E0D3] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-4 pl-6 pr-3">Reader / Member</th>
                <th className="py-4 px-3">Joined Date</th>
                <th className="py-4 px-3 text-center">Total Loans</th>
                <th className="py-4 px-3 text-center">Active</th>
                <th className="py-4 px-3 text-center">Returned</th>
                <th className="py-4 px-3 text-center">Overdue</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No registered readers match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => {
                  const joinDate = u.createdAt
                    ? new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  return (
                    <tr
                      key={u.id}
                      className="group transition-colors hover:bg-stone-50/60"
                    >
                      {/* Avatar & User Details */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => onSelectUser(u)}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#174B32] text-xs font-bold text-[#F4A623]">
                            {u.image ? (
                              <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                                <Image
                                  src={u.image}
                                  alt={u.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              u.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-serif text-xs font-bold text-stone-900 group-hover:text-[#174B32] transition-colors truncate">
                                {u.name}
                              </span>
                              {u.role === "admin" && (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-[#174B32]">
                                  Admin
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-3 text-stone-500">{joinDate}</td>

                      {/* Total Loans */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-serif font-bold text-stone-900">
                          {u.totalBorrowed}
                        </span>
                      </td>

                      {/* Active Loans */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                          {u.currentlyBorrowed}
                        </span>
                      </td>

                      {/* Returned */}
                      <td className="py-3.5 px-3 text-center text-stone-600 font-medium">
                        {u.returnedCount}
                      </td>

                      {/* Overdue */}
                      <td className="py-3.5 px-3 text-center">
                        {u.overdueCount > 0 ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                            {u.overdueCount}
                          </span>
                        ) : (
                          <span className="text-stone-300">0</span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                            u.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onSelectUser(u)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs hover:bg-stone-50"
                          >
                            <Eye className="h-3.5 w-3.5 text-[#174B32]" />
                            <span>Borrow History</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggle(u.id, u.status)}
                            disabled={togglingId === u.id}
                            className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all ${
                              u.status === "active"
                                ? "text-rose-600 hover:bg-rose-50"
                                : "text-emerald-700 hover:bg-emerald-50"
                            }`}
                          >
                            {togglingId === u.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : u.status === "active" ? (
                              "Suspend"
                            ) : (
                              "Activate"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-4 text-xs text-stone-500">
          <span>
            Showing{" "}
            <strong>
              {filteredUsers.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentPage * pageSize, filteredUsers.length)}
            </strong>{" "}
            of <strong>{filteredUsers.length}</strong> readers
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-1.5 font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-2 font-semibold text-stone-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-1.5 font-semibold text-stone-700 shadow-2xs hover:bg-stone-50 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

