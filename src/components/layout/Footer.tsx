"use client";

import Link from "next/link";
import { BookOpen, Mail, MapPin } from "lucide-react";

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
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter Profile"
                className="w-9 h-9 rounded-full bg-[#245246] hover:bg-[#C88A3B] text-[#FAF8F5] flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
                className="w-9 h-9 rounded-full bg-[#245246] hover:bg-[#C88A3B] text-[#FAF8F5] flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
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
