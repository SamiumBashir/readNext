"use client";

import { useState } from "react";
import Image from "next/image";
import { Book } from "@/types";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";

interface DeleteBookModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookId: string) => Promise<void>;
}

export default function DeleteBookModal({
  book,
  isOpen,
  onClose,
  onConfirm,
}: DeleteBookModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !book) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(book.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Remove Volume from Archive?
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            This action will permanently delete this book from the catalog.
            Existing past borrow records will preserve historical snapshots.
          </p>
        </div>

        {/* Book Preview Card */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-3">
          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-stone-200">
            <Image
              src={book.image_url || "/images/hero-showcase.jpg"}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-serif text-xs font-bold text-stone-900 truncate">
              {book.title}
            </h4>
            <p className="text-[11px] text-stone-500 truncate">By {book.author}</p>
            <span className="text-[10px] font-semibold text-emerald-800">
              {book.available_quantity} copies currently recorded
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
