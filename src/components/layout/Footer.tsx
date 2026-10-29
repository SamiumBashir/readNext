import Link from "next/link";
import { BookOpen, Github, Twitter, Linkedin, Mail, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#183D33] text-[#FAF8F5] mt-auto border-t border-[#102720]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C88A3B] flex items-center justify-center text-[#183D33] font-bold shadow-sm">
                <BookOpen className="w-5 h-5 text-[#FAF8F5]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#FAF8F5]">
                ReadNest
              </span>
            </Link>
            <p className="text-sm text-[#CBD9D0] leading-relaxed">
              A curated digital sanctuary for passionate readers, thinkers, and explorers.
              Discover timeless stories, modern tech insights, and groundbreaking science.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-9 h-9 rounded-full bg-[#245246] hover:bg-[#C88A3B] text-[#FAF8F5] flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter Profile"
                className="w-9 h-9 rounded-full bg-[#245246] hover:bg-[#C88A3B] text-[#FAF8F5] flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="w-9 h-9 rounded-full bg-[#245246] hover:bg-[#C88A3B] text-[#FAF8F5] flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-[#FAF8F5] tracking-wide">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm text-[#CBD9D0]">
              <li>
                <Link href="/" className="hover:text-[#FAF8F5] transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-[#FAF8F5] transition-colors">
                  Explore All Books
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-[#FAF8F5] transition-colors">
                  Borrowing History
                </Link>
              </li>
              <li>
                <Link href="/books?category=Story" className="hover:text-[#FAF8F5] transition-colors">
                  Literary Stories
                </Link>
              </li>
              <li>
                <Link href="/books?category=Tech" className="hover:text-[#FAF8F5] transition-colors">
                  Software & Systems
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-[#FAF8F5] tracking-wide">
              Library Policies
            </h4>
            <ul className="space-y-2.5 text-sm text-[#CBD9D0]">
              <li>
                <span className="hover:text-[#FAF8F5] cursor-pointer">
                  Borrowing Guidelines
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF8F5] cursor-pointer">
                  Member Privileges
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF8F5] cursor-pointer">
                  Digital Collection Access
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF8F5] cursor-pointer">
                  Community Standards
                </span>
              </li>
              <li>
                <span className="hover:text-[#FAF8F5] cursor-pointer">
                  Open Source Library
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-semibold text-[#FAF8F5] tracking-wide">
              Library Desk
            </h4>
            <div className="space-y-3 text-sm text-[#CBD9D0]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C88A3B] shrink-0 mt-0.5" />
                <span>Editorial Library Archives, Open Community Edition</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C88A3B] shrink-0" />
                <span className="text-xs">support@readnest-library.internal</span>
              </div>
              <div className="p-3 rounded-xl bg-[#102720]/80 border border-[#245246] mt-4">
                <p className="text-xs text-[#84A98C]">
                  Borrowing privileges are open to registered members with atomic database tracking.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#245246] flex flex-col sm:flex-row items-center justify-between text-xs text-[#84A98C] gap-4">
          <p>© {currentYear} ReadNest Digital Library. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#FAF8F5] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#FAF8F5] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#FAF8F5] cursor-pointer">Security Practices</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
