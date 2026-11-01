"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { BorrowRecord } from "@/types";
import {
  RotateCcw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  Loader2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

interface ReturnsOverdueTabProps {
  borrows: BorrowRecord[];
  onProcessReturn: (recordId: string) => Promise<boolean>;
}

export default function ReturnsOverdueTab({
  borrows,
  onProcessReturn,
}: ReturnsOverdueTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "overdue_only" | "on_schedule">("all");
  const [returningId, setReturningId] = useState<string | null>(null);

  const now = Date.now();

  // Filter only active / currently borrowed records
  const activeLoans = useMemo(() => {
    return borrows.filter((b) => b.status === "active");
  }, [borrows]);

  const processedLoans = useMemo(() => {
    return activeLoans
      .map((record) => {
        const borrowedAtMs = new Date(record.borrowedAt).getTime();
        const dueDateObj = record.dueDate
          ? new Date(record.dueDate)
          : new Date(borrowedAtMs + 14 * 86400000);
        const diffMs = now - dueDateObj.getTime();
        const isOverdue = diffMs > 0;
        const daysOverdue = isOverdue ? Math.ceil(diffMs / 86400000) : 0;
        const daysLeft = !isOverdue ? Math.ceil(Math.abs(diffMs) / 86400000) : 0;

        return {
          ...record,
          dueDateObj,
          isOverdue,
          daysOverdue,
          daysLeft,
        };
      })
      .filter((loan) => {
        const matchesSearch =
          searchTerm.trim() === "" ||
          (loan.bookTitle && loan.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (loan.userName && loan.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (loan.userEmail && loan.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesUrgency =
          urgencyFilter === "all"
            ? true
            : urgencyFilter === "overdue_only"
            ? loan.isOverdue
            : !loan.isOverdue;

        return matchesSearch && matchesUrgency;
      })
      .sort((a, b) => {
        // Sort overdue first, then by earliest due date
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.dueDateObj.getTime() - b.dueDateObj.getTime();
      });
  }, [activeLoans, searchTerm, urgencyFilter, now]);

  const totalOverdueCount = activeLoans.filter((b) => {
    const d = b.dueDate ? new Date(b.dueDate).getTime() : new Date(b.borrowedAt).getTime() + 14 * 86400000;
    return now > d;
  }).length;

  const handleReturn = async (recordId: string) => {
    setReturningId(recordId);
    try {
      const ok = await onProcessReturn(recordId);
      if (ok) {
        toast.success("Volume returned and stock restored!");
      }
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overdue Announcement Header */}
      {totalOverdueCount > 0 ? (
        <div className="flex flex-col gap-4 rounded-3xl border border-rose-200 bg-rose-50/70 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-rose-900">
                {totalOverdueCount} Overdue {totalOverdueCount === 1 ? "Book" : "Books"} Requiring Check-In
              </h3>
              <p className="text-xs text-rose-700">
                These loans have passed their standard 14-day window. Process check-ins to make copies available to other readers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUrgencyFilter("overdue_only")}
            className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 sm:self-center"
          >
            Filter Overdue Only
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h3 className="font-serif text-sm font-bold text-emerald-900">
              Inventory Check-In Status: 100% Up-to-Date
            </h3>
            <p className="text-xs text-emerald-700">
              There are currently zero overdue volumes across all reader accounts.
            </p>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#E7E0D3] bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search active borrowers or book titles..."
            className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 text-xs text-stone-800 placeholder-stone-400 focus:border-[#174B32] focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-3">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value as any)}
            className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 shadow-2xs focus:border-[#174B32] focus:outline-hidden"
          >
            <option value="all">All Active Loans ({activeLoans.length})</option>
            <option value="overdue_only">Overdue First ({totalOverdueCount})</option>
            <option value="on_schedule">On Schedule ({activeLoans.length - totalOverdueCount})</option>
          </select>
        </div>
      </div>

      {/* Return Table */}
      <div className="overflow-hidden rounded-3xl border border-[#E7E0D3] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-4 pl-6 pr-3">Volume</th>
                <th className="py-4 px-3">Borrower Reader</th>
                <th className="py-4 px-3">Borrowed On</th>
                <th className="py-4 px-3">Due Date</th>
                <th className="py-4 px-3">Timeline / Urgency</th>
                <th className="py-4 pl-3 pr-6 text-right">One-Click Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {processedLoans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No active loan records match your current filter.
                  </td>
                </tr>
              ) : (
                processedLoans.map((loan) => {
                  const borrowDateStr = new Date(loan.borrowedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  const dueDateStr = loan.dueDateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr
                      key={loan.id}
                      className={`group transition-colors ${
                        loan.isOverdue
                          ? "bg-rose-50/30 hover:bg-rose-50/60"
                          : "hover:bg-stone-50/60"
                      }`}
                    >
                      {/* Volume */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3 min-w-0 max-w-xs">
                          <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100 shadow-2xs">
                            <Image
                              src={loan.bookImage || "/images/hero-showcase.jpg"}
                              alt={loan.bookTitle || "Cover"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-serif text-xs font-bold text-stone-900 truncate">
                              {loan.bookTitle || "Archived Volume"}
                            </p>
                            <p className="text-[11px] text-stone-500 truncate">
                              By {loan.bookAuthor || "Curated Author"}
                            </p>
                            <span className="text-[10px] text-stone-400">
                              {loan.category || "General"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Borrower */}
                      <td className="py-3.5 px-3">
                        <div className="min-w-0 max-w-xs">
                          <p className="font-serif text-xs font-bold text-stone-900 truncate">
                            {loan.userName || "Verified Reader"}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">
                            {loan.userEmail || "—"}
                          </p>
                        </div>
                      </td>

                      {/* Borrowed On */}
                      <td className="py-3.5 px-3 text-stone-600">
                        {borrowDateStr}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-semibold ${
                            loan.isOverdue ? "text-rose-600" : "text-stone-800"
                          }`}
                        >
                          {dueDateStr}
                        </span>
                      </td>

                      {/* Timeline / Urgency */}
                      <td className="py-3.5 px-3">
                        {loan.isOverdue ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {loan.daysOverdue} {loan.daysOverdue === 1 ? "day" : "days"} overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                            <Clock className="h-3.5 w-3.5 text-emerald-600" />
                            {loan.daysLeft} {loan.daysLeft === 1 ? "day" : "days"} left
                          </span>
                        )}
                      </td>

                      {/* One-Click Return Action */}
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleReturn(loan.id)}
                          disabled={returningId === loan.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#174B32] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#103B29] hover:shadow-md disabled:opacity-50"
                        >
                          {returningId === loan.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F4A623]" />
                              <span>Restocking...</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-3.5 w-3.5 text-[#F4A623]" />
                              <span>Process Return & Restock</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="border-t border-stone-200 bg-white px-6 py-4 text-xs text-stone-500">
          Showing <strong>{processedLoans.length}</strong> active circulating copies requiring check-in management.
        </div>
      </div>
    </div>
  );
}

