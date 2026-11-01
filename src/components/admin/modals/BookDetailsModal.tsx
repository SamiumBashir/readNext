"use client";

import Image from "next/image";
import { Book } from "@/types";
import {
  X,
  BookOpen,
  Calendar,
  Layers,
  Hash,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface BookDetailsModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export default function BookDetailsModal({
  book,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: BookDetailsModalProps) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#E7E0D3] bg-[#FAF7F0] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                book.category === "Story"
                  ? "bg-amber-100 text-amber-800"
                  : book.category === "Tech"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {book.category}
            </span>
            {book.featured && (
              <span className="flex items-center gap-1 rounded-full bg-[#174B32] px-2.5 py-0.5 text-[11px] font-bold text-[#F4A623]">
                <Sparkles className="h-3 w-3" /> Featured
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
            {/* Book Cover */}
            <div className="sm:col-span-4">
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-stone-100 shadow-md">
                <Image
                  src={book.image_url || "/images/hero-showcase.jpg"}
                  alt={book.title}
                  fill
                  className="object-cover"
                  unoptimized={book.image_url.startsWith("data:")}
                />
              </div>

              {/* Stock Card */}
              <div className="mt-4 rounded-xl border border-stone-200 bg-white p-3.5 text-center">
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Availability
                </p>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span
                    className={`font-serif text-2xl font-bold ${
                      book.available_quantity > 0
                        ? "text-[#174B32]"
                        : "text-rose-600"
                    }`}
                  >
                    {book.available_quantity}
                  </span>
                  <span className="text-xs text-stone-500">
                    / {book.total_copies || book.available_quantity} copies
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-stone-500">
                  {book.available_quantity > 0
                    ? "Available for check-out"
                    : "Currently all copies borrowed"}
                </p>
              </div>
            </div>

            {/* Book Metadata & Synopsis */}
            <div className="space-y-4 sm:col-span-8">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 sm:text-3xl">
                  {book.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-stone-600">
                  By {book.author}
                </p>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-stone-200/80 bg-white p-2.5">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase">
                    ISBN
                  </span>
                  <p className="truncate text-xs font-bold text-stone-800">
                    {book.isbn || "Not Cataloged"}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/80 bg-white p-2.5">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase">
                    Pages
                  </span>
                  <p className="text-xs font-bold text-stone-800">
                    {book.pages ? `${book.pages} pages` : "Standard Volume"}
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/80 bg-white p-2.5">
                  <span className="text-[10px] font-semibold text-stone-400 uppercase">
                    Published
                  </span>
                  <p className="text-xs font-bold text-stone-800">
                    {book.published_year || "Unknown"}
                  </p>
                </div>
              </div>

              {/* Synopsis */}
              <div className="rounded-2xl border border-stone-200/80 bg-white p-4">
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Volume Synopsis
                </h4>
                <p className="text-xs leading-relaxed text-stone-700 whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              {/* System IDs */}
              <div className="rounded-xl bg-stone-100/70 p-3 text-[11px] text-stone-500 space-y-1">
                <p>
                  <strong className="text-stone-700">Internal ID:</strong> {book.id}
                </p>
                {book.created_at && (
                  <p>
                    <strong className="text-stone-700">Cataloged On:</strong>{" "}
                    {new Date(book.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-stone-200/80 bg-white px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(book);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete Volume</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(book);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#174B32] px-5 py-2 text-xs font-semibold text-white hover:bg-[#103B29]"
            >
              <Edit className="h-3.5 w-3.5 text-[#F4A623]" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
