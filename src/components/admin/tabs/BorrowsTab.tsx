"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { BorrowRecord } from "@/types";
import {
  Search,
  Filter,
  BookmarkCheck,
  RotateCcw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface BorrowsTabProps {
  borrows: BorrowRecord[];
  onProcessReturn: (recordId: string) => Promise<boolean>;
}

export default function BorrowsTab({
  borrows,
  onProcessReturn,
}: BorrowsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [returningId, setReturningId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const now = Date.now();

  const filteredBorrows = useMemo(() => {
    return borrows.filter((b) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        (b.bookTitle && b.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.userName && b.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.userEmail && b.userEmail.toLowerCase().includes(searchTerm.toLowerCase()));

      const dueDateObj = b.dueDate
        ? new Date(b.dueDate)
        : new Date(new Date(b.borrowedAt).getTime() + 14 * 86400000);
      const isOverdue = b.status === "active" && now > dueDateObj.getTime();

      let matchesStatus = true;
      if (statusFilter === "active" || statusFilter === "ongoing") {
        matchesStatus = b.status === "active";
      } else if (statusFilter === "returned") {
        matchesStatus = b.status === "returned";
      } else if (statusFilter === "overdue") {
        matchesStatus = isOverdue;
      }

      return matchesSearch && matchesStatus;
    });
  }, [borrows, searchTerm, statusFilter, now]);

  const totalPages = Math.max(1, Math.ceil(filteredBorrows.length / pageSize));
  const paginatedBorrows = filteredBorrows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleReturn = async (recordId: string) => {
    setReturningId(recordId);
    try {
      await onProcessReturn(recordId);
    } finally {
      setReturningId(null);
    }
  };

  // Summary counts
  const totalLoans = borrows.length;
  const activeLoans = borrows.filter((b) => b.status === "active").length;
  const returnedLoans = borrows.filter((b) => b.status === "returned").length;
  const overdueLoans = borrows.filter((b) => {
    if (b.status !== "active") return false;
    const d = b.dueDate ? new Date(b.dueDate).getTime() : new Date(b.borrowedAt).getTime() + 14 * 86400000;
    return now > d;
  }).length;

  return (
    <div className="space-y-6">
      {/* Metric Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">
            Total Transactions
          </span>
          <p className="mt-1 font-serif text-2xl font-bold text-stone-900">
            {totalLoans}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">
            Ongoing Active
          </span>
          <p className="mt-1 font-serif text-2xl font-bold text-emerald-700">
            {activeLoans}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">
            Restocked Returns
          </span>
          <p className="mt-1 font-serif text-2xl font-bold text-stone-800">
            {returnedLoans}
          </p>
        </div>

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
          <span className="text-xs font-semibold text-stone-500">
            Overdue Loans
          </span>
          <p
            className={`mt-1 font-serif text-2xl font-bold ${
              overdueLoans > 0 ? "text-rose-600" : "text-stone-800"
            }`}
          >
            {overdueLoans}
          </p>
        </div>
      </div>

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
            placeholder="Search by reader name, email, or book title..."
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
            <option value="All">All Loan Statuses</option>
            <option value="active">Ongoing / Active Loans</option>
            <option value="returned">Returned Volumes</option>
            <option value="overdue">Overdue Loans</option>
          </select>
        </div>
      </div>

      {/* Loans Table */}
      <div className="overflow-hidden rounded-3xl border border-[#E7E0D3] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-4 pl-6 pr-3">Borrower Reader</th>
                <th className="py-4 px-3">Volume Borrowed</th>
                <th className="py-4 px-3">Borrow Date</th>
                <th className="py-4 px-3">Due Date (14d)</th>
                <th className="py-4 px-3">Return Date</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 pl-3 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {paginatedBorrows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No borrowing transactions found for this query.
                  </td>
                </tr>
              ) : (
                paginatedBorrows.map((record) => {
                  const borrowDateStr = record.borrowedAt
                    ? new Date(record.borrowedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  const dueDateObj = record.dueDate
                    ? new Date(record.dueDate)
                    : new Date(new Date(record.borrowedAt).getTime() + 14 * 86400000);

                  const dueDateStr = dueDateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  const returnDateStr = record.returnedAt
                    ? new Date(record.returnedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—";

                  const isOverdue =
                    record.status === "active" && now > dueDateObj.getTime();

                  return (
                    <tr
                      key={record.id}
                      className="group transition-colors hover:bg-stone-50/60"
                    >
                      {/* Reader */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="min-w-0 max-w-xs">
                          <p className="font-serif text-xs font-bold text-stone-900 truncate">
                            {record.userName || "Verified Reader"}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate">
                            {record.userEmail || "No email"}
                          </p>
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-xs">
                          <div className="relative h-11 w-8 shrink-0 overflow-hidden rounded bg-stone-100">
                            <Image
                              src={record.bookImage || "/images/hero-showcase.jpg"}
                              alt={record.bookTitle || "Cover"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-serif text-xs font-bold text-stone-900 truncate">
                              {record.bookTitle || "Archived Volume"}
                            </p>
                            <p className="text-[10px] text-stone-400 truncate">
                              {record.category || "General"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Borrow Date */}
                      <td className="py-3.5 px-3 text-stone-600">
                        {borrowDateStr}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-medium ${
                            isOverdue ? "text-rose-600 font-bold" : "text-stone-700"
                          }`}
                        >
                          {dueDateStr}
                        </span>
                      </td>

                      {/* Return Date */}
                      <td className="py-3.5 px-3 text-stone-500">
                        {returnDateStr}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {record.status === "returned" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-bold text-stone-700">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                            <AlertTriangle className="h-3 w-3" />
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            <Clock className="h-3 w-3" />
                            Ongoing
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        {record.status === "active" ? (
                          <button
                            type="button"
                            onClick={() => handleReturn(record.id)}
                            disabled={returningId === record.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#174B32] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#103B29] disabled:opacity-50"
                          >
                            {returningId === record.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F4A623]" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5 text-[#F4A623]" />
                            )}
                            <span>Process Return</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-stone-400">Completed</span>
                        )}
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
              {filteredBorrows.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentPage * pageSize, filteredBorrows.length)}
            </strong>{" "}
            of <strong>{filteredBorrows.length}</strong> loan transactions
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
