"use client";

import { useState } from "react";
import Image from "next/image";
import { AdminUser, BorrowRecord } from "@/types";
import {
  X,
  User,
  Mail,
  Calendar,
  BookOpen,
  BookmarkCheck,
  RotateCcw,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Shield,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface UserDetailsModalProps {
  user: AdminUser | null;
  borrows: BorrowRecord[];
  isOpen: boolean;
  onClose: () => void;
  onProcessReturn: (recordId: string) => Promise<boolean>;
  onToggleStatus: (userId: string, currentStatus: "active" | "suspended") => void;
}

export default function UserDetailsModal({
  user,
  borrows,
  isOpen,
  onClose,
  onProcessReturn,
  onToggleStatus,
}: UserDetailsModalProps) {
  const [returningId, setReturningId] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleReturnClick = async (recordId: string) => {
    setReturningId(recordId);
    try {
      const ok = await onProcessReturn(recordId);
      if (ok) {
        toast.success("Book returned and inventory updated!");
      }
    } finally {
      setReturningId(null);
    }
  };

  const registeredDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#E7E0D3] bg-[#FAF7F0] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#174B32] text-sm font-bold text-[#F4A623]">
              {user.image ? (
                <div className="relative h-11 w-11 overflow-hidden rounded-xl">
                  <Image
                    src={user.image}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  {user.name}
                </h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    user.status === "active"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {user.status}
                </span>
                {user.role === "admin" && (
                  <span className="rounded-full bg-[#174B32] px-2 py-0.5 text-[10px] font-bold text-[#F4A623]">
                    Curator Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Top Metric Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">
                  Total Borrowed
                </span>
                <BookmarkCheck className="h-4 w-4 text-[#174B32]" />
              </div>
              <p className="mt-2 font-serif text-2xl font-bold text-[#174B32]">
                {user.totalBorrowed}
              </p>
              <span className="text-[10px] text-stone-400">All-time loans</span>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">
                  Currently Active
                </span>
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 font-serif text-2xl font-bold text-emerald-700">
                {user.currentlyBorrowed}
              </p>
              <span className="text-[10px] text-stone-400">In reader possession</span>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">
                  Returned
                </span>
                <RotateCcw className="h-4 w-4 text-stone-500" />
              </div>
              <p className="mt-2 font-serif text-2xl font-bold text-stone-800">
                {user.returnedCount}
              </p>
              <span className="text-[10px] text-stone-400">Restocked copies</span>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">
                  Overdue Books
                </span>
                <AlertTriangle className="h-4 w-4 text-rose-500" />
              </div>
              <p
                className={`mt-2 font-serif text-2xl font-bold ${
                  user.overdueCount > 0 ? "text-rose-600" : "text-stone-800"
                }`}
              >
                {user.overdueCount}
              </p>
              <span className="text-[10px] text-stone-400">Passed 14-day window</span>
            </div>
          </div>

          {/* User Account Details Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-6 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[#174B32]" />
                <span>
                  Member since: <strong>{registeredDate}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4 text-[#174B32]" />
                <span>
                  User ID: <code className="text-[11px] bg-stone-100 px-1.5 py-0.5 rounded">{user.id}</code>
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleStatus(user.id, user.status)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                user.status === "active"
                  ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {user.status === "active" ? "Suspend Account" : "Activate Account"}
            </button>
          </div>

          {/* CRITICAL SECTION: Complete Borrowing History (Exact books borrowed) */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Complete Borrowing History & Books Taken
                </h3>
                <p className="text-xs text-stone-500">
                  Detailed timeline of every specific title borrowed by {user.name}
                </p>
              </div>
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                {borrows.length} Total Loans
              </span>
            </div>

            {borrows.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-500">
                This reader has not borrowed any books from the catalog yet.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-stone-100">
                {borrows.map((record) => {
                  const now = Date.now();
                  const borrowedDateStr = record.borrowedAt
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

                  const returnedDateStr = record.returnedAt
                    ? new Date(record.returnedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : null;

                  const isOverdue =
                    record.status === "active" && now > dueDateObj.getTime();

                  const overdueDays = isOverdue
                    ? Math.ceil((now - dueDateObj.getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <div
                      key={record.id}
                      className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* Left: Book Cover + Title */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-stone-100 shadow-xs">
                          <Image
                            src={record.bookImage || "/images/hero-showcase.jpg"}
                            alt={record.bookTitle || "Book"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif text-sm font-bold text-stone-900 truncate">
                            {record.bookTitle || "Archived Volume"}
                          </h4>
                          <p className="text-xs text-stone-500 truncate">
                            By {record.bookAuthor || "Curated Author"}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            {record.category && (
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  record.category === "Story"
                                    ? "bg-amber-100 text-amber-800"
                                    : record.category === "Tech"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {record.category}
                              </span>
                            )}
                            <span className="text-[11px] text-stone-400">
                              Borrowed: {borrowedDateStr}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Due Date + Status + Action */}
                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 shrink-0">
                        <div className="text-right text-xs">
                          {record.status === "returned" ? (
                            <div>
                              <span className="inline-flex items-center gap-1 font-semibold text-stone-600">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Returned
                              </span>
                              <p className="text-[10px] text-stone-400">
                                on {returnedDateStr}
                              </p>
                            </div>
                          ) : isOverdue ? (
                            <div>
                              <span className="inline-flex items-center gap-1 font-bold text-rose-600">
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                                Overdue ({overdueDays}d)
                              </span>
                              <p className="text-[10px] text-rose-500">
                                Due was {dueDateStr}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                                Active Loan
                              </span>
                              <p className="text-[10px] text-stone-500">
                                Due: {dueDateStr}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Admin Action for Active Loans */}
                        {record.status === "active" && (
                          <button
                            type="button"
                            onClick={() => handleReturnClick(record.id)}
                            disabled={returningId === record.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#174B32] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#103B29] disabled:opacity-50"
                          >
                            {returningId === record.id ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F4A623]" />
                                <span>Restocking...</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="h-3.5 w-3.5 text-[#F4A623]" />
                                <span>Process Return</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-stone-200/80 bg-white px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 bg-white px-5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}

