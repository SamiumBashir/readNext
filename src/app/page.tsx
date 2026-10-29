import Link from "next/link";
import Image from "next/image";
import { getFeaturedBooks, getBooks } from "@/services/book.service";
import BookCard from "@/components/books/BookCard";
import CuratedSlider from "@/components/books/CuratedSlider";
import MarqueeBanner from "@/components/books/MarqueeBanner";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Compass,
  ShieldCheck,
  Clock,
  BookmarkCheck,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 60; // ISR cache revalidation every minute

export default async function HomePage() {
  const featuredBooks = await getFeaturedBooks(4);
  const allBooksResult = await getBooks({ limit: 8 });

  const latestBook = featuredBooks[0] || allBooksResult.books[0];

  const categories = [
    {
      name: "Story",
      slug: "Story",
      description:
        "Timeless literary fiction, Pulitzer prize-winners, and epic multi-generational family sagas.",
      count: "5 Volumes",
      accent: "from-amber-600/90 to-amber-900/90",
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
      tag: "Fiction & Classics",
    },
    {
      name: "Tech",
      slug: "Tech",
      description:
        "Distributed systems, software craftsmanship, pragmatic workflows, and artificial intelligence.",
      count: "5 Volumes",
      accent: "from-emerald-700/90 to-[#102720]/90",
      image:
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
      tag: "Engineering & AI",
    },
    {
      name: "Science",
      slug: "Science",
      description:
        "Cosmic history, quantum physics, human genetics, evolutionary biology, and ecological sciences.",
      count: "5 Volumes",
      accent: "from-sky-700/90 to-indigo-950/90",
      image:
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
      tag: "Cosmos & Life",
    },
  ];

  const pillars = [
    {
      icon: Compass,
      title: "Thoughtfully Curated Collections",
      description:
        "Every title in our catalogue is rigorously vetted for enduring depth, intellectual rigour, and literary excellence.",
    },
    {
      icon: ShieldCheck,
      title: "Atomic, Real-Time Inventory",
      description:
        "Zero guesswork. When you request a borrow, database concurrency guarantees your copy without double-booking.",
    },
    {
      icon: Clock,
      title: "Effortless Digital Borrowing",
      description:
        "Instantly secure copies for your reading queue with a single authenticated click, with seamless profile tracking.",
    },
    {
      icon: BookmarkCheck,
      title: "Unified Reader Dashboard",
      description:
        "Manage your borrowed books, renew active checkouts, and personalize your member credentials in one place.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE6]/50 to-[#FAF8F5] pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#E8E2D8]">
        {/* Subtle decorative background watermark */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#EBF1ED]/60 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#FDF6EC]/80 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#EBF1ED] text-[#183D33] border border-[#CBD9D0] shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#C88A3B]" />
                <span>Next-Generation Digital Library</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#183D33] leading-[1.15]">
                Find Your <span className="italic font-normal">Next Read</span>
              </h1>

              <p className="text-base sm:text-lg text-[#586860] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
                Welcome to ReadNest — an architectural digital library uniting
                profound literature, cutting-edge software engineering, and
                cosmic sciences. Browse verified catalogues, reserve physical &
                digital editions, and elevate your intellect.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/books"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-semibold text-sm bg-[#183D33] hover:bg-[#122E26] text-[#FAF8F5] shadow-md hover:shadow-lg transition-all group cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Browse Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#categories"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full font-medium text-sm text-[#183D33] bg-white hover:bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#183D33] transition-all shadow-xs"
                >
                  <span>Explore Collections</span>
                </a>
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-8 border-t border-[#E8E2D8] grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="font-serif text-2xl font-bold text-[#183D33]">15+</p>
                  <p className="text-xs text-[#839189]">Curated Works</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-[#183D33]">3</p>
                  <p className="text-xs text-[#839189]">Pillar Genres</p>
                </div>
                <div>
                  <p className="font-serif text-2xl font-bold text-[#183D33]">100%</p>
                  <p className="text-xs text-[#839189]">Free Membership</p>
                </div>
              </div>
            </div>

            {/* Right Column: Editorial Visual Showcase */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Background Shadow Box */}
                <div className="absolute inset-0 bg-[#183D33]/10 rounded-3xl transform rotate-3 scale-95 transition-transform" />

                {/* Main Visual Card */}
                <div className="relative bg-white rounded-3xl p-6 border border-[#E8E2D8] shadow-2xl space-y-5">
                  <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#F4EFE6]">
                    <Image
                      src="https://images.unsplash.com/photo-1507842229451-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200"
                      alt="ReadNest Library Showcase"
                      fill
                      priority
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C88A3B] text-[#FAF8F5] inline-block mb-1.5">
                        Archival Choice
                      </span>
                      <h4 className="font-serif text-lg font-bold">
                        Sapiens: A Brief History of Humankind
                      </h4>
                      <p className="text-xs text-white/80">By Yuval Noah Harari</p>
                    </div>
                  </div>

                  {/* Quick Feature Badges */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8]">
                      <div className="w-8 h-8 rounded-lg bg-[#EBF1ED] text-[#183D33] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-[#183D33] block">
                          Instant Borrow Status
                        </span>
                        <span className="text-[#839189]">
                          Live database concurrency guarantees copy hold
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8]">
                      <div className="w-8 h-8 rounded-lg bg-[#FDF6EC] text-[#C88A3B] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-[#183D33] block">
                          Zero Borrowing Fees
                        </span>
                        <span className="text-[#839189]">
                          Open access for verified readers and students
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. New Arrivals Marquee */}
      <MarqueeBanner
        latestBookTitle={latestBook?.title || "The Great Gatsby"}
        latestBookId={latestBook?.id || "story-great-gatsby"}
      />

      {/* 3. Featured Books Section (from MongoDB) */}
      <section className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBF1ED] text-[#183D33] border border-[#CBD9D0] mb-2">
                <BookOpen className="w-3.5 h-3.5 text-[#183D33]" />
                Server-Rendered Database Collection
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#183D33]">
                Featured Books
              </h2>
              <p className="text-sm text-[#586860] mt-1.5 max-w-xl">
                Four exceptional volumes selected from our persistent MongoDB collection, available for immediate borrowing.
              </p>
            </div>

            <Link
              href="/books"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#183D33] hover:text-[#C88A3B] transition-colors group self-start md:self-auto"
            >
              <span>View All 15 Books</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Cards Grid */}
          {featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} featured />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white border border-[#E8E2D8]">
              <BookOpen className="w-12 h-12 text-[#839189] mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-[#183D33]">
                Connecting to MongoDB Library...
              </h3>
              <p className="text-sm text-[#586860] mt-1 max-w-md mx-auto">
                No featured books returned. Run seed script or refresh once the database connection is established.
              </p>
              <Link
                href="/books"
                className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-[#183D33] text-white"
              >
                Browse Catalog
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. Interactive Swiper.js Showcase */}
      <section className="py-16 bg-[#F4EFE6]/60 border-y border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CuratedSlider books={allBooksResult.books} />
        </div>
      </section>

      {/* 5. Additional Section 1: Browse by Category */}
      <section id="categories" className="py-20 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C88A3B]">
              Disciplines & Genres
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#183D33]">
              Browse by Category
            </h2>
            <p className="text-sm text-[#586860]">
              Filter our library across three core domains: human stories, technological masteries, and natural sciences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/books?category=${cat.slug}`}
                className="group relative h-96 rounded-3xl overflow-hidden border border-[#E8E2D8] shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-end p-8"
              >
                {/* Background Image */}
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${cat.accent} transition-opacity duration-300 opacity-85 group-hover:opacity-95`}
                />

                {/* Content */}
                <div className="relative z-10 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider uppercase text-white/80">
                      {cat.tag}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs">
                      {cat.count}
                    </span>
                  </div>

                  <h3 className="font-serif text-3xl font-bold tracking-tight">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-white/80 leading-relaxed line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="pt-3 flex items-center gap-2 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                    <span>Explore {cat.name} Collection</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Additional Section 2: Why ReadNest? */}
      <section className="py-20 bg-white border-t border-[#E8E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#52796F]">
              The ReadNest Standard
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#183D33]">
              Why ReadNest?
            </h2>
            <p className="text-sm text-[#586860]">
              Built with purpose for scholars, software engineers, and avid readers who value deep substance over endless scrolling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E8E2D8] hover:border-[#183D33]/30 transition-all duration-300 hover:shadow-md flex flex-col"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#183D33] text-[#FAF8F5] flex items-center justify-center mb-6 shadow-sm">
                    <Icon className="w-6 h-6 text-[#C88A3B]" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#183D33] mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#586860] leading-relaxed flex-1">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Membership Invitation Banner */}
          <div className="mt-16 rounded-3xl bg-gradient-to-r from-[#183D33] to-[#102720] text-[#FAF8F5] p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#C88A3B]">
                Immediate Reader Enrollment
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                Ready to begin your next chapter?
              </h3>
              <p className="text-xs sm:text-sm text-[#CBD9D0] leading-relaxed">
                Create your reader account today to access all borrowing records, manage your digital bookshelf, and check out active copies.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-full text-xs font-bold bg-[#C88A3B] hover:bg-[#B4762A] text-white shadow-md transition-colors text-center"
              >
                Join ReadNest Free
              </Link>
              <Link
                href="/books"
                className="px-6 py-3.5 rounded-full text-xs font-semibold bg-[#245246] hover:bg-[#2e6859] text-[#FAF8F5] border border-[#52796F] transition-colors text-center"
              >
                Browse Books First
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
