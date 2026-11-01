"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BookOpen,
  Users,
  BookmarkCheck,
  RotateCcw,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Book, BorrowRecord, DashboardStats } from "@/types";

interface OverviewTabProps {
  stats: DashboardStats;
  analytics: {
    activityTrend: {
      weekly: { label: string; borrowed: number; returned: number }[];
      monthly: { label: string; borrowed: number; returned: number }[];
      yearly: { label: string; borrowed: number; returned: number }[];
    };
    mostBorrowedBooks: {
      id: string;
      title: string;
      author: string;
      image_url: string;
      category: string;
      borrowCount: number;
      available_quantity: number;
    }[];
    recentBorrows: BorrowRecord[];
    overdueBorrows: BorrowRecord[];
  };
  onNavigateTab: (tab: any) => void;
  onProcessReturn: (recordId: string) => Promise<boolean>;
  onSelectBook: (bookId: string) => void;
}

export default function OverviewTab({
  stats,
  analytics,
  onNavigateTab,
  onProcessReturn,
  onSelectBook,
}: OverviewTabProps) {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "yearly">("weekly");
  const [returningId, setReturningId] = useState<string | null>(null);

  const trendData = analytics.activityTrend[timeframe] || [];

  // Calculate highest count for SVG chart scaling
  const maxVal = Math.max(
    ...trendData.map((d) => Math.max(d.borrowed, d.returned)),
    5
  );

  const handleReturn = async (recordId: string) => {
    setReturningId(recordId);
    try {
      await onProcessReturn(recordId);
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Statistics Cards (6 Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* Total Books */}
        <div className="group rounded-3xl border border-[#E7E0D3] bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">
              Total Books
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#174B32]">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold tracking-tight text-[#174B32]">
              {stats.totalBooks}
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className="font-semibold text-emerald-700">
                {stats.categoryCounts.tech}T / {stats.categoryCounts.story}S / {stats.categoryCounts.science}Sc
              </span>
            </div>
          </div>
        </div>

        {/* Registered Users */}
        <div className="group rounded-3xl border border-[#E7E0D3] bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">
              Registered Users
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold tracking-tight text-stone-900">
              {stats.registeredUsers}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
              <span className="text-emerald-700 font-medium">Verified</span>
              <span>library readers</span>
            </div>
          </div>
        </div>

        {/* Total Borrowed Books */}
        <div className="group rounded-3xl border border-[#E7E0D3] bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">
              Total Borrowed
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-[#F4A623]">
              <BookmarkCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold tracking-tight text-stone-900">
              {stats.totalBorrowed}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
              <span className="font-medium text-[#174B32]">
                {stats.returnRate}% return rate
              </span>
            </div>
          </div>
        </div>

        {/* Currently Borrowed */}
        <div className="group rounded-3xl border border-[#E7E0D3] bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">
              Active Loans
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold tracking-tight text-emerald-800">
              {stats.currentlyBorrowed}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
              <span>Circulating copies</span>
            </div>
          </div>
        </div>

        {/* Overdue Books */}
        <div className="group rounded-3xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">
              Overdue Books
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold tracking-tight text-rose-700">
              {stats.overdueBooks}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-600 font-medium">
              <span>{stats.overdueBooks > 0 ? "Action required" : "Zero overdue"}</span>
            </div>
          </div>
        </div>

        {/* Available Books */}
        <div className="group rounded-3xl border border-[#E7E0D3] bg-white p-5 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">
              Available Books
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="font-serif text-3xl font-bold tracking-tight text-stone-900">
              {stats.availableBooks}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
              <span>of {stats.totalCopies} copies in stock</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Analytics Chart: Books Borrowed vs Returned */}
      <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Borrowing & Return Trends
              </h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                Live Analytics
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Real-time transactional comparison between borrowed volumes and returned copies
            </p>
          </div>

          {/* Timeframe Pill Buttons */}
          <div className="flex rounded-xl bg-stone-100 p-1">
            {(["weekly", "monthly", "yearly"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                  timeframe === t
                    ? "bg-[#174B32] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 border-b border-stone-100 pb-4 text-xs font-medium text-stone-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-[#174B32]" />
            <span>Books Borrowed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-md bg-[#F4A623]" />
            <span>Books Returned</span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="mt-6 h-64 w-full">
          {trendData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-stone-400">
              No loan records for this period yet.
            </div>
          ) : (
            <div className="flex h-full items-end justify-between gap-2 pt-6 sm:gap-6">
              {trendData.map((item, idx) => {
                const borrowHeight = Math.max(6, (item.borrowed / maxVal) * 180);
                const returnHeight = Math.max(6, (item.returned / maxVal) * 180);

                return (
                  <div
                    key={idx}
                    className="group relative flex flex-1 flex-col items-center justify-end h-full"
                  >
                    {/* Tooltip Hover */}
                    <div className="pointer-events-none absolute -top-12 z-20 hidden flex-col items-center rounded-xl bg-stone-900 px-3 py-1.5 text-[10px] text-white shadow-lg group-hover:flex whitespace-nowrap">
                      <span>{item.label}</span>
                      <span className="text-emerald-300">
                        Borrowed: {item.borrowed}
                      </span>
                      <span className="text-[#F4A623]">
                        Returned: {item.returned}
                      </span>
                    </div>

                    {/* Bars Container */}
                    <div className="flex items-end justify-center gap-1.5 w-full">
                      {/* Borrow Bar */}
                      <div
                        style={{ height: `${borrowHeight}px` }}
                        className="w-full max-w-[20px] rounded-t-lg bg-[#174B32] transition-all group-hover:bg-[#103B29]"
                      />
                      {/* Return Bar */}
                      <div
                        style={{ height: `${returnHeight}px` }}
                        className="w-full max-w-[20px] rounded-t-lg bg-[#F4A623] transition-all group-hover:bg-[#e09214]"
                      />
                    </div>

                    {/* Label */}
                    <span className="mt-3 truncate text-[11px] font-semibold text-stone-500">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Two-Column Split: Most Borrowed Books + Recent Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Most Borrowed Books Ranking (6 cols) */}
        <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs sm:p-7 lg:col-span-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Most Borrowed Volumes
              </h3>
              <p className="text-xs text-stone-500">
                Highest circulation and community reading popularity
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("books")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#174B32] hover:underline"
            >
              <span>View Catalog</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-stone-100">
            {analytics.mostBorrowedBooks.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                No borrowing activity recorded yet.
              </div>
            ) : (
              analytics.mostBorrowedBooks.map((book, idx) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between py-3.5 hover:bg-stone-50/60 rounded-xl px-2 transition-colors cursor-pointer"
                  onClick={() => onSelectBook(book.id)}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">
                      {idx + 1}
                    </span>
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100 shadow-xs">
                      <Image
                        src={book.image_url}
                        alt={book.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif text-xs font-bold text-stone-900 truncate">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate">
                        By {book.author}
                      </p>
                      <span className="text-[10px] text-stone-400">
                        {book.category} • {book.available_quantity} available
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#174B32]">
                      {book.borrowCount} {book.borrowCount === 1 ? "loan" : "loans"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Overdue & Recent Activity (6 cols) */}
        <div className="space-y-6 lg:col-span-6">
          {/* Overdue Alert Section */}
          {analytics.overdueBorrows.length > 0 && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-rose-200/60">
                <div className="flex items-center gap-2 text-rose-800">
                  <AlertTriangle className="h-5 w-5 text-rose-600" />
                  <h3 className="font-serif text-base font-bold">
                    Overdue Loans Requiring Attention
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab("returns")}
                  className="text-xs font-bold text-rose-700 hover:underline"
                >
                  View All ({analytics.overdueBorrows.length})
                </button>
              </div>

              <div className="mt-3 space-y-2.5">
                {analytics.overdueBorrows.slice(0, 3).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-2xs"
                  >
                    <div className="min-w-0">
                      <p className="font-serif text-xs font-bold text-stone-900 truncate">
                        {record.bookTitle}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Borrower: <strong>{record.userName || record.userEmail}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReturn(record.id)}
                      disabled={returningId === record.id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 disabled:opacity-50"
                    >
                      {returningId === record.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      <span>Return</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity Stream */}
          <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs sm:p-7">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Recent Borrowing Activity
                </h3>
                <p className="text-xs text-stone-500">
                  Latest transactional circulation events
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("borrows")}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#174B32] hover:underline"
              >
                <span>All Loans</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {analytics.recentBorrows.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  No recent activities found.
                </div>
              ) : (
                analytics.recentBorrows.slice(0, 5).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between rounded-xl border border-stone-100 p-3 hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          record.status === "returned"
                            ? "bg-stone-100 text-stone-600"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {record.status === "returned" ? (
                          <RotateCcw className="h-4 w-4" />
                        ) : (
                          <BookmarkCheck className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-xs font-bold text-stone-900 truncate">
                          {record.bookTitle}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate">
                          {record.userName || record.userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-stone-400 shrink-0">
                      {new Date(record.borrowedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
