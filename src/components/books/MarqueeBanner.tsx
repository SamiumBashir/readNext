import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface MarqueeBannerProps {
  latestBookTitle?: string;
  latestBookId?: string;
}

export default function MarqueeBanner({
  latestBookTitle = "The Great Gatsby",
  latestBookId = "story-great-gatsby",
}: MarqueeBannerProps) {
  const marqueeItems = [
    `New Arrivals: ${latestBookTitle}`,
    "Discover Your Next Favorite",
    "Special Membership Privileges",
    "Story, Tech & Science Curated Archives",
    "Free Borrowing For Registered Readers",
  ];

  return (
    <div
      className="relative w-full bg-[#183D33] text-[#FAF8F5] py-2.5 overflow-hidden border-y border-[#102720]"
      aria-label="Library Announcements"
    >
      <div className="flex animate-marquee whitespace-nowrap">
        {/* Render twice for seamless continuous scroll loop */}
        {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
          <div key={index} className="inline-flex items-center mx-6 gap-3 text-xs tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
            <span className="font-medium text-[#FAF8F5]/90">{item}</span>
            <span className="text-[#52796F]">✦</span>
          </div>
        ))}
      </div>

      {/* Accessible subtle action overlay on desktop */}
      <div className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <Link
          href={`/books/${latestBookId}`}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#245246] hover:bg-[#C88A3B] text-[#FAF8F5] transition-colors shadow-xs"
        >
          <span>View Latest</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
