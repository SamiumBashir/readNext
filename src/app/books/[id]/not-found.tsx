import Link from "next/link";
import { BookX, ArrowLeft } from "lucide-react";

export default function BookNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 text-center border border-[#E8E2D8] shadow-sm space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#C88A3B] flex items-center justify-center mx-auto border border-amber-200">
          <BookX className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#C88A3B]">
            Archival Record Missing
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#183D33]">
            Book Not Found
          </h2>
          <p className="text-xs sm:text-sm text-[#586860] leading-relaxed">
            The book ID you requested does not correspond to any active volume in our library catalogue. It may have been relocated or delisted.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold bg-[#183D33] text-[#FAF8F5] hover:bg-[#122E26] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to All Books</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
