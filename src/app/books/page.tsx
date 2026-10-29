import { Suspense } from "react";
import type { Metadata } from "next";
import { getBooks } from "@/services/book.service";
import BookCatalog from "@/components/books/BookCatalog";

export const metadata: Metadata = {
  title: "All Books — ReadNest Digital Library",
  description:
    "Explore our complete catalog of books across Story, Tech, and Science with search and category filters.",
};

interface BooksPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const resolvedParams = await searchParams;
  const search = resolvedParams.search || "";
  const category = resolvedParams.category || "All";
  const page = parseInt(resolvedParams.page || "1", 10);

  const result = await getBooks({
    search,
    category,
    page,
    limit: 9,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <Suspense
        fallback={
          <div className="space-y-8 animate-pulse">
            <div className="h-44 bg-white rounded-3xl border border-[#E8E2D8]" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="hidden lg:block h-72 bg-white rounded-3xl border border-[#E8E2D8]" />
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 bg-white rounded-2xl border border-[#E8E2D8]" />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <BookCatalog
          initialBooks={result.books}
          total={result.total}
          currentPage={result.page}
          totalPages={result.totalPages}
          currentCategory={category}
          currentSearch={search}
        />
      </Suspense>
    </div>
  );
}
