"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Book } from "@/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard, A11y, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight, BookOpen, ArrowRight, Sparkles } from "lucide-react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface CuratedSliderProps {
  books: Book[];
}

export default function CuratedSlider({ books }: CuratedSliderProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <div className="relative py-6">
      {/* Slider Header with Custom Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF6EC] text-[#C88A3B] border border-[#F1D4A8] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Curator's Spotlight
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1D2622]">
            Interactive Collection Showcase
          </h2>
          <p className="text-sm text-[#586860] mt-1 max-w-xl">
            Swipe through handpicked literature and technical milestones selected by our archival team.
          </p>
        </div>

        {/* Custom Navigation Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            disabled={isBeginning}
            aria-label="Previous book"
            className="w-11 h-11 rounded-full bg-white border border-[#E8E2D8] text-[#183D33] hover:bg-[#183D33] hover:text-[#FAF8F5] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#183D33] flex items-center justify-center transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            disabled={isEnd}
            aria-label="Next book"
            className="w-11 h-11 rounded-full bg-white border border-[#E8E2D8] text-[#183D33] hover:bg-[#183D33] hover:text-[#FAF8F5] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#183D33] flex items-center justify-center transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Swiper Carousel */}
      <Swiper
        modules={[Navigation, Pagination, Keyboard, A11y, Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        onSlideChange={(swiper) => {
          setIsBeginning(swiper.isBeginning);
          setIsEnd(swiper.isEnd);
        }}
        spaceBetween={24}
        slidesPerView={1}
        keyboard={{ enabled: true }}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
        }}
        className="!pb-12"
      >
        {books.map((book) => (
          <SwiperSlide key={book.id} className="h-auto">
            <div className="h-full flex flex-col bg-white rounded-3xl border border-[#E8E2D8] p-5 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-[#F4EFE6] mb-4">
                <Image
                  src={book.image_url}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF8F5]/90 text-[#183D33] backdrop-blur-xs">
                  {book.category}
                </span>
                <span className="absolute bottom-3 right-3 text-xs font-medium text-white/90">
                  {book.available_quantity > 0
                    ? `${book.available_quantity} available`
                    : "Waitlist only"}
                </span>
              </div>

              <div className="flex-1 flex flex-col">
                <span className="text-xs text-[#839189] font-medium">
                  {book.author}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#1D2622] mt-1 line-clamp-1">
                  {book.title}
                </h3>
                <p className="text-xs text-[#586860] mt-2 line-clamp-2 leading-relaxed flex-1">
                  {book.description}
                </p>

                <div className="mt-5 pt-4 border-t border-[#F4EFE6] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#183D33] font-semibold">
                    <BookOpen className="w-4 h-4 text-[#C88A3B]" />
                    <span>In Library Collection</span>
                  </div>
                  <Link
                    href={`/books/${book.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#183D33] hover:text-[#C88A3B] transition-colors group"
                  >
                    <span>Borrow</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
