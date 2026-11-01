"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Book, BookCategory } from "@/types";
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  AlertCircle,
} from "lucide-react";

interface BooksTabProps {
  books: Book[];
  onOpenAddModal: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  onViewDetails: (book: Book) => void;
}

export default function BooksTab({
  books,
  onOpenAddModal,
  onEditBook,
  onDeleteBook,
  onViewDetails,
}: BooksTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [stockFilter, setStockFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter books in real-time
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === "All" || book.category === categoryFilter;

      const matchesStock =
        stockFilter === "All"
          ? true
          : stockFilter === "in_stock"
          ? book.available_quantity > 0
          : stockFilter === "low_stock"
          ? book.available_quantity > 0 && book.available_quantity <= 2
          : book.available_quantity === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [books, searchTerm, categoryFilter, stockFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
            placeholder="Search by title, author, or ISBN..."
            className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50/50 pl-10 pr-4 text-xs text-stone-800 placeholder-stone-400 focus:border-[#174B32] focus:bg-white focus:outline-hidden"
          />
        </div>

        {/* Filters & Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 shadow-2xs focus:border-[#174B32] focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="Story">Story</option>
            <option value="Tech">Tech</option>
            <option value="Science">Science</option>
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-10 rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-700 shadow-2xs focus:border-[#174B32] focus:outline-hidden"
          >
            <option value="All">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt;0)</option>
            <option value="low_stock">Low Stock (≤2)</option>
            <option value="out_of_stock">Depleted (0)</option>
          </select>

          {/* Add Book */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#174B32] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#103B29]"
          >
            <PlusCircle className="h-4 w-4 text-[#F4A623]" />
            <span>Add Volume</span>
          </button>
        </div>
      </div>

      {/* Books Table */}
      <div className="overflow-hidden rounded-3xl border border-[#E7E0D3] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th className="py-4 pl-6 pr-3">Volume</th>
                <th className="py-4 px-3">Category</th>
                <th className="py-4 px-3">Stock & Copies</th>
                <th className="py-4 px-3">Status</th>
                <th className="py-4 px-3">ISBN</th>
                <th className="py-4 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {paginatedBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No books found matching your current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedBooks.map((book) => {
                  const isAvailable = book.available_quantity > 0;
                  const isLow = book.available_quantity > 0 && book.available_quantity <= 2;

                  return (
                    <tr
                      key={book.id}
                      className="group transition-colors hover:bg-stone-50/60"
                    >
                      {/* Cover & Title */}
                      <td className="py-3.5 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg bg-stone-100 shadow-2xs">
                            <Image
                              src={book.image_url || "/images/hero-showcase.jpg"}
                              alt={book.title}
                              fill
                              className="object-cover"
                              unoptimized={book.image_url.startsWith("data:")}
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="font-serif text-sm font-bold text-stone-900 truncate">
                                {book.title}
                              </span>
                              {book.featured && (
                                <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#F4A623]" />
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 truncate">
                              By {book.author}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            book.category === "Story"
                              ? "bg-amber-100 text-amber-800"
                              : book.category === "Tech"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {book.category}
                        </span>
                      </td>

                      {/* Stock & Copies */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`font-serif text-base font-bold ${
                              isAvailable ? "text-[#174B32]" : "text-rose-600"
                            }`}
                          >
                            {book.available_quantity}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            / {book.total_copies || book.available_quantity} total
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {book.available_quantity === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                            Depleted
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            Available
                          </span>
                        )}
                      </td>

                      {/* ISBN */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-stone-500">
                        {book.isbn || "—"}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onViewDetails(book)}
                            title="View Book Details"
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditBook(book)}
                            title="Edit Book Information"
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-[#174B32]"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteBook(book)}
                            title="Delete Volume"
                            className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-white px-6 py-4 text-xs text-stone-500">
          <span>
            Showing{" "}
            <strong>
              {filteredBooks.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentPage * pageSize, filteredBooks.length)}
            </strong>{" "}
            of <strong>{filteredBooks.length}</strong> volumes
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
