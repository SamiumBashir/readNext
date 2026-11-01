"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BorrowRecord } from "@/types";
import { isUserAdmin } from "@/lib/admin";
import {
  Mail,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  BookmarkCheck,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt?: Date | string;
  };
  initialRecords: BorrowRecord[];
}

export default function ProfileClient({
  user,
  initialRecords,
}: ProfileClientProps) {
  const router = useRouter();
  const [records, setRecords] = useState<BorrowRecord[]>(initialRecords);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const activeRecords = records.filter((r) => r.status === "active");
  const returnedRecords = records.filter((r) => r.status === "returned");

  const handleReturn = async (recordId: string, title?: string) => {
    setReturningId(recordId);

    try {
      const response = await fetch("/api/borrow", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to process return.");
        return;
      }

      toast.success(
        data.message || `“${title || "Book"}” has been returned to the library.`
      );

      // Update state locally
      setRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? { ...r, status: "returned", returnedAt: new Date() }
            : r
        )
      );
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error returning book.";
      toast.error(message);
    } finally {
      setReturningId(null);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D8] shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Avatar */}
          <div className="relative group shrink-0">
            {user.image && !avatarError ? (
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-[#183D33] shadow-md bg-[#F4EFE6]">
                <Image
                  src={user.image}
                  alt={user.name || "User Avatar"}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setAvatarError(true)}
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#183D33] text-[#FAF8F5] flex items-center justify-center text-3xl font-bold font-serif shadow-md border-2 border-[#122E26]">
                {getInitials(user.name)}
              </div>
            )}
            <Link
              href="/profile/edit"
              aria-label="Edit photo"
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-[#183D33] hover:bg-[#183D33] hover:text-[#FAF8F5] transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#C88A3B]" />
            </Link>
          </div>

          {/* User Details */}
          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF1ED] text-[#183D33] border border-[#CBD9D0] mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Reader
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#183D33]">
                  {user.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#586860] flex items-center justify-center sm:justify-start gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-[#839189]" />
                  <span>{user.email}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-center sm:self-start">
                {isUserAdmin(user) && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-[#174B32] text-white hover:bg-[#103B29] transition-all shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F4A623]" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <Link
                  href="/profile/edit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#FAF8F5] hover:bg-[#183D33] text-[#183D33] hover:text-[#FAF8F5] border border-[#E8E2D8] hover:border-[#183D33] transition-all shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
                  <span>Edit Profile</span>
                </Link>
              </div>
            </div>

            <div className="pt-2 text-xs text-[#839189] flex items-center justify-center sm:justify-start gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Member ID:{" "}
                <code className="bg-[#FAF8F5] px-1.5 py-0.5 rounded text-[11px] text-[#183D33]">
                  {user.id.slice(0, 10)}...
                </code>
              </span>
            </div>
          </div>
        </div>

        {/* Reader Statistics Bar */}
        <div className="mt-8 pt-8 border-t border-[#F4EFE6] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-center sm:text-left">
            <span className="text-[11px] font-semibold text-[#839189] uppercase tracking-wider block">
              Active Loans
            </span>
            <p className="font-serif text-2xl font-bold text-[#183D33] mt-1">
              {activeRecords.length}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-center sm:text-left">
            <span className="text-[11px] font-semibold text-[#839189] uppercase tracking-wider block">
              Returned Books
            </span>
            <p className="font-serif text-2xl font-bold text-[#52796F] mt-1">
              {returnedRecords.length}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-center sm:text-left">
            <span className="text-[11px] font-semibold text-[#839189] uppercase tracking-wider block">
              Total Borrow History
            </span>
            <p className="font-serif text-2xl font-bold text-[#C88A3B] mt-1">
              {records.length}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Active Borrowed Books Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#183D33] flex items-center gap-2">
              <BookmarkCheck className="w-6 h-6 text-[#C88A3B]" />
              <span>Current Borrowed Books</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#586860] mt-1">
              Active volumes currently reserved under your reader account.
            </p>
          </div>

          <Link
            href="/books"
            className="text-xs font-semibold text-[#183D33] hover:text-[#C88A3B] inline-flex items-center gap-1 transition-colors"
          >
            <span>Browse More Books</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeRecords.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-3xl p-5 border border-[#E8E2D8] shadow-sm flex gap-5 items-center hover:shadow-md transition-shadow"
              >
                {/* Book Thumbnail */}
                <div className="relative aspect-[3/4] w-20 sm:w-24 rounded-2xl overflow-hidden bg-[#F4EFE6] shrink-0 border border-[#E8E2D8]">
                  {record.bookImage ? (
                    <Image
                      src={record.bookImage}
                      alt={record.bookTitle || "Book"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#839189]">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Details & Actions */}
                <div className="flex-1 min-w-0 space-y-2">
                  {record.category && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBF1ED] text-[#183D33]">
                      {record.category}
                    </span>
                  )}
                  <h3 className="font-serif text-base font-bold text-[#1D2622] truncate">
                    {record.bookTitle || "Untitled Book"}
                  </h3>
                  <p className="text-xs text-[#839189] truncate">
                    By {record.bookAuthor || "Library Author"}
                  </p>

                  <div className="text-[11px] text-[#586860] flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-[#C88A3B]" />
                    <span>
                      Borrowed on{" "}
                      {new Date(record.borrowedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReturn(record.id, record.bookTitle)}
                      disabled={returningId === record.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#FAF8F5] hover:bg-[#183D33] text-[#183D33] hover:text-[#FAF8F5] border border-[#E8E2D8] hover:border-[#183D33] transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {returningId === record.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Returning...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5 text-[#C88A3B]" />
                          <span>Return Book</span>
                        </>
                      )}
                    </button>

                    <Link
                      href={`/books/${record.bookId}`}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium text-[#586860] hover:text-[#183D33] transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#E8E2D8] space-y-4">
            <BookOpen className="w-12 h-12 text-[#839189] mx-auto" />
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#183D33]">
                No Books Currently On Loan
              </h3>
              <p className="text-xs sm:text-sm text-[#586860] max-w-sm mx-auto">
                Your bookshelf is clear! Browse our collection across Story, Tech, and Science to check out your next volume.
              </p>
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#183D33] text-[#FAF8F5] hover:bg-[#122E26] transition-colors"
            >
              <span>Explore All Books</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* 3. Returned History Section */}
      {returnedRecords.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#E8E2D8]">
          <h2 className="font-serif text-xl font-bold text-[#183D33] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#52796F]" />
            <span>Past Returns & Archival History</span>
          </h2>

          <div className="bg-white rounded-3xl border border-[#E8E2D8] divide-y divide-[#F4EFE6] overflow-hidden">
            {returnedRecords.map((record) => (
              <div
                key={record.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF1ED] text-[#183D33] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#52796F]" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#1D2622]">
                      {record.bookTitle || "Archived Volume"}
                    </h4>
                    <p className="text-[#839189]">
                      Returned on{" "}
                      {record.returnedAt
                        ? new Date(record.returnedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Completed"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/books/${record.bookId}`}
                  className="text-xs font-semibold text-[#183D33] hover:text-[#C88A3B] transition-colors shrink-0"
                >
                  Borrow Again
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
