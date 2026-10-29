"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Book } from "@/types";
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Calendar,
  Barcode,
  Sparkles,
  ShieldCheck,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";

interface BookDetailClientProps {
  book: Book;
  initialHasActiveBorrow: boolean;
}

export default function BookDetailClient({
  book,
  initialHasActiveBorrow,
}: BookDetailClientProps) {
  const router = useRouter();
  const [availableQty, setAvailableQty] = useState(book.available_quantity);
  const [hasActiveBorrow, setHasActiveBorrow] = useState(initialHasActiveBorrow);
  const [isBorrowing, setIsBorrowing] = useState(false);

  const isOutOfStock = availableQty <= 0;

  const handleBorrow = async () => {
    if (hasActiveBorrow) {
      toast.info("You already have an active loan for this book in your profile.");
      return;
    }

    if (isOutOfStock) {
      toast.error("This volume has zero available copies remaining.");
      return;
    }

    setIsBorrowing(true);

    try {
      const response = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to borrow book. Please try again.");
        return;
      }

      toast.success(data.message || `Successfully borrowed “${book.title}”!`);
      if (typeof data.available_quantity === "number") {
        setAvailableQty(data.available_quantity);
      } else {
        setAvailableQty((prev) => Math.max(0, prev - 1));
      }
      setHasActiveBorrow(true);
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Network error during borrowing.";
      toast.error(message);
    } finally {
      setIsBorrowing(false);
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case "Story":
        return {
          badge: "bg-[#FEF3EB] text-[#C88A3B] border-[#F8D7BE]",
          accent: "text-[#C88A3B]",
        };
      case "Tech":
        return {
          badge: "bg-[#EBF1ED] text-[#183D33] border-[#CBD9D0]",
          accent: "text-[#183D33]",
        };
      case "Science":
        return {
          badge: "bg-[#EBF4FA] text-[#2C5D88] border-[#C4DCF2]",
          accent: "text-[#2C5D88]",
        };
      default:
        return {
          badge: "bg-[#F4EFE6] text-[#586860] border-[#E8E2D8]",
          accent: "text-[#183D33]",
        };
    }
  };

  const theme = getCategoryTheme(book.category);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb Navigation */}
      <div className="mb-8">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#586860] hover:text-[#183D33] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Universal Catalogue</span>
        </Link>
      </div>

      {/* Main Book Details Card */}
      <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10 lg:p-12 items-start">
          {/* Left Column: Large Book Cover & Meta Badges */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative aspect-[3/4] w-full max-w-sm rounded-2xl overflow-hidden bg-[#F4EFE6] shadow-xl border border-[#E8E2D8]">
              <Image
                src={book.image_url}
                alt={`Cover of ${book.title}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${theme.badge} shadow-xs backdrop-blur-xs`}
                >
                  {book.category}
                </span>
              </div>
            </div>

            {/* Quick Archival Metadata */}
            <div className="w-full max-w-sm mt-6 grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
                <Layers className="w-4 h-4 text-[#839189] mx-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-[#839189] block">
                  Length
                </span>
                <span className="text-xs font-semibold text-[#183D33]">
                  {book.pages || 320} Pages
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
                <Calendar className="w-4 h-4 text-[#839189] mx-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-[#839189] block">
                  Published
                </span>
                <span className="text-xs font-semibold text-[#183D33]">
                  {book.published_year || "Modern"}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8]">
                <Barcode className="w-4 h-4 text-[#839189] mx-auto mb-1" />
                <span className="text-[10px] uppercase font-bold text-[#839189] block">
                  ISBN Record
                </span>
                <span className="text-[11px] font-semibold text-[#183D33] truncate block">
                  {book.isbn ? book.isbn.slice(-6) : "Archival"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Author, Description, Inventory & Borrow Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#C88A3B] uppercase tracking-wider">
                  ReadNest Library Edition
                </span>
                <span className="text-[#839189]">•</span>
                <span className="text-xs text-[#839189]">ID: {book.id}</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#183D33] tracking-tight leading-tight">
                {book.title}
              </h1>

              <p className="text-base sm:text-lg font-medium text-[#52796F]">
                Authored by {book.author}
              </p>
            </div>

            {/* Inventory Status Pill */}
            <div className="flex flex-wrap items-center gap-3 py-3 border-y border-[#F4EFE6]">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                  availableQty > 0
                    ? "bg-[#EBF1ED] text-[#183D33] border border-[#CBD9D0]"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    availableQty > 0 ? "bg-[#183D33]" : "bg-red-500"
                  }`}
                />
                <span>
                  {availableQty > 0
                    ? `${availableQty} Physical & Digital Copies In Library`
                    : "Currently Out of Stock"}
                </span>
              </div>

              {hasActiveBorrow && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FDF6EC] text-[#C88A3B] border border-[#F1D4A8]">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Currently in your borrowed collection</span>
                </div>
              )}
            </div>

            {/* Book Description */}
            <div className="space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#1D2622]">
                Overview & Archival Synopsis
              </h3>
              <p className="text-sm sm:text-base text-[#586860] leading-relaxed font-sans">
                {book.description}
              </p>
            </div>

            {/* Borrow Action Area */}
            <div className="pt-4 space-y-4">
              {hasActiveBorrow ? (
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EBF1ED] text-[#183D33] flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#183D33]">
                        Active Loan Registered
                      </p>
                      <p className="text-[11px] text-[#586860]">
                        You can manage your loan or return this copy anytime in your profile.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#183D33] text-[#FAF8F5] hover:bg-[#122E26] shrink-0 transition-colors"
                  >
                    View in Profile
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleBorrow}
                    disabled={isOutOfStock || isBorrowing}
                    className={`w-full sm:w-auto min-w-[260px] py-4 px-8 rounded-full text-sm font-semibold flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
                      isOutOfStock
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300 shadow-none"
                        : "bg-[#183D33] hover:bg-[#122E26] text-[#FAF8F5] hover:shadow-lg"
                    }`}
                  >
                    {isBorrowing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F5]" />
                        <span>Reserving Copy...</span>
                      </>
                    ) : isOutOfStock ? (
                      <>
                        <AlertCircle className="w-4 h-4 text-gray-500" />
                        <span>Zero Copies Available</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 text-[#C88A3B]" />
                        <span>Borrow This Book</span>
                      </>
                    )}
                  </button>

                  {isOutOfStock && (
                    <p className="text-xs text-red-600 font-medium">
                      All copies of this volume have been borrowed by fellow readers. Check back soon for returns.
                    </p>
                  )}
                </div>
              )}

              {/* Guarantees Box */}
              <div className="mt-8 pt-6 border-t border-[#F4EFE6] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#839189]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#183D33]" />
                  <span>Atomic concurrency prevents double-booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C88A3B]" />
                  <span>No late penalty fees on digital loans</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
