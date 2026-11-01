"use client";

import Image from "next/image";
import { DashboardStats, Book, BorrowRecord } from "@/types";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  BookmarkCheck,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";

interface AnalyticsTabProps {
  stats: DashboardStats;
  books: Book[];
  borrows: BorrowRecord[];
}

export default function AnalyticsTab({
  stats,
  books,
  borrows,
}: AnalyticsTabProps) {
  const totalCategoryBooks =
    stats.categoryCounts.story +
    stats.categoryCounts.tech +
    stats.categoryCounts.science;

  const storyPct = totalCategoryBooks
    ? Math.round((stats.categoryCounts.story / totalCategoryBooks) * 100)
    : 33;
  const techPct = totalCategoryBooks
    ? Math.round((stats.categoryCounts.tech / totalCategoryBooks) * 100)
    : 34;
  const sciencePct = totalCategoryBooks
    ? Math.round((stats.categoryCounts.science / totalCategoryBooks) * 100)
    : 33;

  // Circulation utilization: Active loans vs total physical copies
  const utilizationRate = stats.totalCopies
    ? Math.round((stats.currentlyBorrowed / stats.totalCopies) * 100)
    : 0;

  // Compute top authors by total books cataloged and loans
  const authorLoansMap: Record<string, { bookCount: number; loanCount: number }> = {};
  for (const b of books) {
    if (!authorLoansMap[b.author]) {
      authorLoansMap[b.author] = { bookCount: 0, loanCount: 0 };
    }
    authorLoansMap[b.author].bookCount += 1;
  }
  for (const l of borrows) {
    if (l.bookAuthor && authorLoansMap[l.bookAuthor]) {
      authorLoansMap[l.bookAuthor].loanCount += 1;
    }
  }

  const topAuthors = Object.entries(authorLoansMap)
    .sort((a, b) => b[1].loanCount - a[1].loanCount)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Return Success Rate
            </span>
            <RotateCcw className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-bold text-[#174B32]">
              {stats.returnRate}%
            </span>
            <span className="text-xs font-medium text-emerald-700">
              On-schedule resolution
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              style={{ width: `${stats.returnRate}%` }}
              className="h-full rounded-full bg-[#174B32]"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Catalog Circulation
            </span>
            <BookmarkCheck className="h-5 w-5 text-[#F4A623]" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-bold text-stone-900">
              {utilizationRate}%
            </span>
            <span className="text-xs font-medium text-stone-500">
              Inventory actively borrowed
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              style={{ width: `${utilizationRate}%` }}
              className="h-full rounded-full bg-[#F4A623]"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Physical Asset Volume
            </span>
            <Layers className="h-5 w-5 text-blue-600" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-4xl font-bold text-stone-900">
              {stats.totalCopies}
            </span>
            <span className="text-xs font-medium text-stone-500">
              Total physical copies across {stats.totalBooks} titles
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
            <span>{stats.availableBooks} Available</span>
            <span>{stats.currentlyBorrowed} Borrowed</span>
          </div>
        </div>
      </div>

      {/* Category Distribution Breakdown */}
      <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs sm:p-8">
        <h3 className="font-serif text-lg font-bold text-stone-900">
          Genre & Domain Catalog Distribution
        </h3>
        <p className="text-xs text-stone-500">
          Proportional allocation of volumes across literary, technology, and natural science collections
        </p>

        {/* Multi-Segment Bar */}
        <div className="mt-6 flex h-4 w-full overflow-hidden rounded-full bg-stone-100">
          <div
            style={{ width: `${techPct}%` }}
            className="h-full bg-emerald-600 transition-all"
            title={`Tech: ${techPct}%`}
          />
          <div
            style={{ width: `${storyPct}%` }}
            className="h-full bg-[#F4A623] transition-all"
            title={`Story: ${storyPct}%`}
          />
          <div
            style={{ width: `${sciencePct}%` }}
            className="h-full bg-blue-600 transition-all"
            title={`Science: ${sciencePct}%`}
          />
        </div>

        {/* Category Details Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">Tech & Computing</span>
              <span className="font-serif text-lg font-bold text-emerald-800">{techPct}%</span>
            </div>
            <p className="mt-1 text-xs text-emerald-700">
              {stats.categoryCounts.tech} volumes cataloged
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">Story & Literature</span>
              <span className="font-serif text-lg font-bold text-amber-800">{storyPct}%</span>
            </div>
            <p className="mt-1 text-xs text-amber-700">
              {stats.categoryCounts.story} volumes cataloged
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">Science & Cosmos</span>
              <span className="font-serif text-lg font-bold text-blue-800">{sciencePct}%</span>
            </div>
            <p className="mt-1 text-xs text-blue-700">
              {stats.categoryCounts.science} volumes cataloged
            </p>
          </div>
        </div>
      </div>

      {/* Top Authors Circulation Ranking */}
      <div className="rounded-3xl border border-[#E7E0D3] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Top Authors by Readership Engagement
            </h3>
            <p className="text-xs text-stone-500">
              Writers whose works have generated the highest borrowing frequency
            </p>
          </div>
          <Award className="h-5 w-5 text-[#F4A623]" />
        </div>

        <div className="mt-4 divide-y divide-stone-100">
          {topAuthors.map(([author, info], idx) => (
            <div
              key={author}
              className="flex items-center justify-between py-3.5 hover:bg-stone-50/50 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-100 font-serif text-xs font-bold text-stone-700">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-serif text-xs font-bold text-stone-900">
                    {author}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    {info.bookCount} {info.bookCount === 1 ? "work" : "works"} in library archive
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#174B32]">
                  {info.loanCount} total reader {info.loanCount === 1 ? "loan" : "loans"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
