"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Book, BookCategory } from "@/types";
import BookCard from "@/components/books/BookCard";
import {
  Search,
  Filter,
  X,
  BookOpen,
  Sparkles,
  Cpu,
  Atom,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

interface BookCatalogProps {
  initialBooks: Book[];
  total: number;
  currentPage: number;
  totalPages: number;
  currentCategory: string;
  currentSearch: string;
}

export default function BookCatalog({
  initialBooks,
  total,
  currentPage,
  totalPages,
  currentCategory,
  currentSearch,
}: BookCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const categories: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: "All Books", value: "All", icon: BookOpen },
    { label: "Story", value: "Story", icon: Sparkles },
    { label: "Tech", value: "Tech", icon: Cpu },
    { label: "Science", value: "Science", icon: Atom },
  ];

  const updateFilters = (newCategory?: string, newSearch?: string, newPage = 1) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newCategory !== undefined) {
      if (newCategory === "All" || newCategory === "") {
        params.delete("category");
      } else {
        params.set("category", newCategory);
      }
    }

    if (newSearch !== undefined) {
      if (newSearch.trim() === "") {
        params.delete("search");
      } else {
        params.set("search", newSearch.trim());
      }
    }

    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`/books?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(undefined, searchTerm, 1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    updateFilters(undefined, "", 1);
  };

  const handleResetAll = () => {
    setSearchTerm("");
    startTransition(() => {
      router.push("/books");
    });
  };

  const activeCategory = currentCategory || "All";
  const hasActiveFilters = activeCategory !== "All" || !!currentSearch;

  return (
    <div className="space-y-8">
      {/* Search Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D8] shadow-sm">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="text-center space-y-1.5">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#183D33]">
              The Universal Catalogue
            </h1>
            <p className="text-sm text-[#586860]">
              Filter books across literary fiction, computing systems, and cosmological sciences.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative mt-4">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-[#839189]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search books by title, keyword, or concept..."
                className="w-full pl-12 pr-28 py-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-sm text-[#1D2622] placeholder:text-[#839189] focus:outline-none focus:ring-2 focus:ring-[#183D33] focus:bg-white transition-all shadow-inner"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Clear search query"
                    className="p-2 text-[#839189] hover:text-[#183D33] transition-colors rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#183D33] hover:bg-[#122E26] text-[#FAF8F5] text-xs font-semibold transition-colors shadow-xs"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="text-xs font-semibold text-[#839189]">
                Active Filters:
              </span>

              {activeCategory !== "All" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF1ED] text-[#183D33] border border-[#CBD9D0]">
                  Category: {activeCategory}
                  <button
                    type="button"
                    onClick={() => updateFilters("All", undefined, 1)}
                    aria-label={`Remove ${activeCategory} filter`}
                    className="hover:text-red-700 ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {currentSearch && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF6EC] text-[#C88A3B] border border-[#F1D4A8]">
                  Title: &ldquo;{currentSearch}&rdquo;
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    aria-label="Remove title filter"
                    className="hover:text-red-700 ml-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#839189] hover:text-red-600 ml-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Reset All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category Sidebar - Desktop */}
        <aside className="hidden lg:block lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D8] sticky top-28 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F4EFE6]">
              <div className="flex items-center gap-2 text-sm font-bold text-[#183D33]">
                <Filter className="w-4 h-4 text-[#C88A3B]" />
                <span>Categories</span>
              </div>
              {activeCategory !== "All" && (
                <button
                  type="button"
                  onClick={() => updateFilters("All", undefined, 1)}
                  className="text-xs font-semibold text-[#839189] hover:text-[#183D33]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-1.5 mt-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory.toLowerCase() === cat.value.toLowerCase();

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => updateFilters(cat.value, undefined, 1)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#183D33] text-[#FAF8F5] shadow-sm"
                        : "text-[#586860] hover:bg-[#FAF8F5] hover:text-[#183D33]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isSelected ? "text-[#FAF8F5]" : "text-[#839189]"}`} />
                      <span>{cat.label}</span>
                    </div>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C88A3B]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Stats Helper */}
            <div className="mt-8 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs space-y-2">
              <span className="font-semibold text-[#183D33] block">
                Library Tip
              </span>
              <p className="text-[#586860] leading-relaxed text-[11px]">
                Search and category filters work concurrently. Filter by a discipline, then type a title to locate records.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-[#E8E2D8]">
          <div className="text-xs font-semibold text-[#183D33]">
            Category: <span className="font-bold text-[#C88A3B]">{activeCategory}</span>
          </div>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs font-semibold text-[#183D33]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{mobileFilterOpen ? "Close Filters" : "Filter Categories"}</span>
          </button>
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden bg-white p-4 rounded-2xl border border-[#E8E2D8] space-y-2 animate-in slide-in-from-top-2">
            <span className="text-xs font-bold text-[#183D33] block mb-2">
              Select Category:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory.toLowerCase() === cat.value.toLowerCase();

                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      updateFilters(cat.value, undefined, 1);
                      setMobileFilterOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#183D33] text-[#FAF8F5]"
                        : "bg-[#FAF8F5] text-[#586860] border border-[#E8E2D8]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Books Grid & Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between text-xs text-[#839189]">
            <span>
              Showing <strong className="text-[#183D33]">{initialBooks.length}</strong> of{" "}
              <strong className="text-[#183D33]">{total}</strong> books
              {isPending && <span className="ml-2 text-[#C88A3B] animate-pulse">(Updating...)</span>}
            </span>
            <span>
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {/* Book Cards Grid */}
          {initialBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {initialBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D8] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-[#839189] flex items-center justify-center mx-auto border border-[#E8E2D8]">
                <BookOpen className="w-8 h-8 text-[#839189]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#183D33]">
                  No matching books found
                </h3>
                <p className="text-xs sm:text-sm text-[#586860] max-w-md mx-auto">
                  We couldn&apos;t find any records matching your search query &ldquo;
                  {currentSearch}&rdquo; in category &ldquo;{activeCategory}&rdquo;.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#183D33] text-[#FAF8F5] hover:bg-[#122E26] transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear All Filters & Reset</span>
                </button>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => updateFilters(undefined, undefined, currentPage - 1)}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E2D8] text-[#183D33] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => updateFilters(undefined, undefined, pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      pageNum === currentPage
                        ? "bg-[#183D33] text-[#FAF8F5] shadow-xs"
                        : "bg-white text-[#586860] hover:bg-[#FAF8F5] border border-[#E8E2D8]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => updateFilters(undefined, undefined, currentPage + 1)}
                disabled={currentPage >= totalPages}
                aria-label="Next page"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E8E2D8] text-[#183D33] hover:bg-[#FAF8F5] disabled:opacity-40 disabled:hover:bg-white cursor-pointer disabled:cursor-not-allowed shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
