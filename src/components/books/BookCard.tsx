import Link from "next/link";
import Image from "next/image";
import { Book } from "@/types";
import { ArrowUpRight, BookOpen, Layers } from "lucide-react";

interface BookCardProps {
  book: Book;
  featured?: boolean;
}

export default function BookCard({ book, featured = false }: BookCardProps) {
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case "Story":
        return "bg-[#FEF3EB] text-[#C88A3B] border-[#F8D7BE]";
      case "Tech":
        return "bg-[#EBF1ED] text-[#183D33] border-[#CBD9D0]";
      case "Science":
        return "bg-[#EBF4FA] text-[#2C5D88] border-[#C4DCF2]";
      default:
        return "bg-[#F4EFE6] text-[#586860] border-[#E8E2D8]";
    }
  };

  const isAvailable = book.available_quantity > 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Book Cover Container */}
      <div className="relative aspect-[3/4] w-full bg-[#F4EFE6] overflow-hidden">
        <Image
          src={book.image_url}
          alt={`Cover of ${book.title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getCategoryStyles(
              book.category
            )} backdrop-blur-sm shadow-xs`}
          >
            {book.category}
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs ${
              isAvailable
                ? "bg-[#183D33]/90 text-[#FAF8F5] border border-[#245246]"
                : "bg-red-800/90 text-white border border-red-900"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? "bg-[#84A98C]" : "bg-red-400"
              }`}
            />
            {isAvailable ? `${book.available_quantity} Available` : "Borrowed Out"}
          </span>
        </div>
      </div>

      {/* Book Content */}
      <div className="flex-1 flex flex-col p-5">
        <div className="text-xs font-medium text-[#839189] mb-1">
          By {book.author}
        </div>

        <h3 className="font-serif text-lg font-bold text-[#1D2622] group-hover:text-[#183D33] line-clamp-1 transition-colors">
          {book.title}
        </h3>

        <p className="mt-2 text-xs text-[#586860] line-clamp-2 leading-relaxed flex-1">
          {book.description}
        </p>

        {book.pages && (
          <div className="mt-4 pt-3 border-t border-[#F4EFE6] flex items-center justify-between text-[11px] text-[#839189]">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {book.pages} pages
            </span>
            <span>{book.published_year || "Modern Edition"}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4">
          <Link
            href={`/books/${book.id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#FAF8F5] hover:bg-[#183D33] text-[#183D33] hover:text-[#FAF8F5] border border-[#E8E2D8] hover:border-[#183D33] transition-all duration-200 group/btn"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
